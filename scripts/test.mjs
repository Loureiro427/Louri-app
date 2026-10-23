import assert from "node:assert/strict";
import { createServer } from "vite";
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
};
globalThis.window = { localStorage: globalThis.localStorage };
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
let passed = 0;
try {
  const math = await server.ssrLoadModule("/src/utils/nutritionMath.ts");
  const food = await server.ssrLoadModule("/src/data/alimentos.ts");
  const { useUserStore: store } = await server.ssrLoadModule(
    "/src/store/useUserStore.ts"
  );
  const test = (name, run) => {
    run();
    passed++;
    console.log("✓ " + name);
  };
  const initial = structuredClone(store.getState().dados);
  const reset = () => store.setState({ dados: structuredClone(initial) });
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };
  test("Água mantém os mililitros, sem arredondar para litros", () => {
    assert.equal(math.calculateWaterGoal(70), 2450);
    assert.equal(math.calculateWaterGoal(150), 5250);
    assert.equal(math.calculateWaterGoal(-1), 0);
  });
  test("Metas usam a fórmula compartilhada e retornam números finitos", () => {
    assert.equal(math.calculateCaloricGoal(150, 193, 27, "M", "perder"), 2949);
    assert.equal(math.calculateCaloricGoal(0, 170, 25, "M", "manter"), 0);
  });
  test("Rotina que atravessa meia-noite mantém horários em ordem", () => {
    const data = {
      horaAcorda: "06:31",
      horaDorme: "00:34",
      refeicoesAtivas: ["janta", "cafeManha", "lancheTarde", "cafeTarde"],
    };
    const agenda = math.getCronograma(data);
    assert.equal(agenda[0].horario, "07:01");
    assert.equal(agenda.at(-1).horario, "19:30");
    assert.ok(
      agenda.every((r, i) => i === 0 || r.minutos >= agenda[i - 1].minutos)
    );
    assert.equal(
      math.getCronograma({ ...data, refeicoesAtivas: ["almoco"] }).length,
      1
    );
  });
  test("Jantar e ceia mantêm seus horários mesmo sem almoço", () => {
    const dados = {
      horaAcorda: "06:00",
      horaDorme: "22:00",
      refeicoesAtivas: ["cafeManha", "janta", "lancheNoite"],
    };
    const agenda = math.getCronograma(dados);
    assert.deepEqual(
      agenda.map((r) => r.horario),
      ["06:30", "19:30", "21:30"]
    );
    assert.equal(
      math.getCronograma({ ...dados, refeicoesAtivas: ["janta"] })[0].horario,
      "19:30"
    );
    const keys = Object.keys(math.CONFIG_REFEICOES);
    for (let mask = 1; mask < 2 ** keys.length; mask++) {
      const ativas = keys.filter((_, i) => mask & (1 << i));
      const plano = math.getCronograma({ ...dados, refeicoesAtivas: ativas });
      if (ativas.includes("janta"))
        assert.equal(plano.find((r) => r.key === "janta").horario, "19:30");
      if (ativas.includes("almoco"))
        assert.equal(plano.find((r) => r.key === "almoco").horario, "12:30");
    }
  });
  test("Horários personalizados são preservados e ordenados após meia-noite", () => {
    const dados = {
      horaAcorda: "06:00",
      horaDorme: "01:00",
      refeicoesAtivas: ["janta", "lancheNoite"],
      horariosRefeicoes: { janta: "20:00", lancheNoite: "00:30" },
    };
    const plano = math.getCronograma(dados);
    assert.deepEqual(
      plano.map((r) => r.horario),
      ["20:00", "00:30"]
    );
    assert.equal(plano[1].minutos, 1470);
    assert.equal(
      math
        .getCronograma({ ...dados, horariosRefeicoes: { janta: "99:99" } })
        .find((r) => r.key === "janta").horario,
      "19:30"
    );
  });
  test("Porções contam calorias e macros proporcionais", () => {
    const r = food.calcularPorcoes(
      { pao: 50, ovo: 50 },
      food.DICIONARIO_ALIMENTOS.cafeManha
    );
    assert.equal(r.calorias, 218);
    assert.equal(r.macros.proteina, 12);
  });
  test("Registro duplicado não soma calorias novamente e mantém preferências", () => {
    reset();
    store.getState().setDados({ alimentos: { cafeManha: ["pao"] } });
    for (let i = 0; i < 2; i++)
      store
        .getState()
        .registrarRefeicao(
          "cafeManha",
          "Café",
          "☕",
          140,
          ["Pão Francês"],
          { proteina: 5, carbo: 29, gordura: 2 },
          { pao: 50 }
        );
    assert.equal(store.getState().dados.caloriasConsumidas, 140);
    assert.deepEqual(store.getState().dados.alimentos.cafeManha, ["pao"]);
    assert.deepEqual(store.getState().dados.ultimasPorcoes.cafeManha, {
      pao: 50,
    });
    assert.equal(
      store.getState().dados.historico[today()].refeicoesDetalhadas.cafeManha
        .alimentos[0],
      "Pão Francês"
    );
  });
  test("Desfazer refeição reverte totais e preserva porções para repetir", () => {
    store.getState().desfazerRefeicao("cafeManha");
    assert.equal(store.getState().dados.caloriasConsumidas, 0);
    assert.equal(store.getState().dados.macrosConsumidos.proteina, 0);
    assert.equal(
      Object.keys(store.getState().dados.historico[today()].refeicoesDetalhadas)
        .length,
      0
    );
    assert.deepEqual(store.getState().dados.ultimasPorcoes.cafeManha, {
      pao: 50,
    });
  });
  test("Virada de dia antes de registrar água preserva o histórico anterior", () => {
    reset();
    store.getState().setDados({
      ultimaData: "2020-01-01",
      aguaConsumida: 1000,
      caloriasConsumidas: 500,
      historico: {
        "2020-01-01": {
          aguaConsumida: 1000,
          caloriasConsumidas: 500,
          refeicoesDetalhadas: {},
        },
      },
    });
    store.getState().adicionarAgua(250, 99999);
    assert.equal(store.getState().dados.aguaConsumida, 250);
    assert.equal(store.getState().dados.caloriasConsumidas, 0);
    assert.equal(
      store.getState().dados.historico["2020-01-01"].aguaConsumida,
      1000
    );
  });
  test("Virada de dia antes de registrar refeição não carrega totais antigos", () => {
    store
      .getState()
      .setDados({ ultimaData: "2020-01-01", caloriasConsumidas: 500 });
    store
      .getState()
      .registrarRefeicao(
        "refeicaoLivre_teste",
        "Livre",
        "🍔",
        140,
        ["Pão"],
        { proteina: 5, carbo: 29, gordura: 2 },
        { pao: 50 }
      );
    assert.equal(store.getState().dados.caloriasConsumidas, 140);
    assert.deepEqual(store.getState().dados.ultimasPorcoes.livre, { pao: 50 });
  });
  test("Favoritos persistem e sobrevivem à virada de dia", () => {
    store.getState().toggleFavorito("pao");
    store.getState().setDados({ ultimaData: "2020-01-01" });
    store.getState().verificarViradaDeDia();
    assert.ok(store.getState().dados.favoritos.includes("pao"));
    store.getState().toggleFavorito("pao");
    assert.ok(!store.getState().dados.favoritos.includes("pao"));
  });
  test("Dados antigos recebem os novos campos sem perder histórico", () => {
    const saved = JSON.parse(storage.get("nutri-app-storage"));
    delete saved.state.dados.favoritos;
    delete saved.state.dados.ultimasPorcoes;
    saved.state.dados.nome = "Teste legado";
    storage.set("nutri-app-storage", JSON.stringify(saved));
    store.persist.rehydrate();
    assert.equal(store.getState().dados.nome, "Teste legado");
    assert.deepEqual(store.getState().dados.favoritos, []);
  });
  console.log(`${passed} verificações passaram.`);
} finally {
  await server.close();
}
