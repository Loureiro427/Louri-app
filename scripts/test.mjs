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

  const { normalizeMealPreferences } = await server.ssrLoadModule(
    "/src/utils/mealPreferences.ts"
  );
  test("Cadastro aceita uma preferência antiga como texto sem falhar em values.map", () => {
    assert.deepEqual(normalizeMealPreferences({ cafeManha: "pao" }), {
      cafeManha: ["pao"],
    });
    assert.deepEqual(normalizeMealPreferences({ cafeManha: "Pão Francês" }), {
      cafeManha: ["pao"],
    });
  });
  test("Cadastro aceita mapas de seleção e descarta valores inválidos sem apagar a origem", () => {
    const legado = {
      cafeManha: { pao: true, ovo: 50, banana: false },
      almoco: null,
      janta: 42,
    };
    const original = structuredClone(legado);
    assert.deepEqual(normalizeMealPreferences(legado), {
      cafeManha: ["pao", "ovo"],
      almoco: [],
      janta: [],
    });
    assert.deepEqual(legado, original);
  });
  test("Preferências atuais mantêm IDs válidos e não repetem alimentos", () => {
    assert.deepEqual(
      normalizeMealPreferences({
        cafeManha: ["pao", "pao", "Ovo", null, "desconhecido"],
      }),
      { cafeManha: ["pao", "ovo"] }
    );
    assert.deepEqual(normalizeMealPreferences(undefined), {});
    assert.deepEqual(normalizeMealPreferences(null), {});
  });
  test("Lista global legada é distribuída pelos catálogos das refeições", () => {
    const result = normalizeMealPreferences(["pao", "frango", "iogurte_noite"]);
    assert.deepEqual(result.cafeManha, ["pao"]);
    assert.deepEqual(result.almoco, ["frango"]);
    assert.deepEqual(result.lancheNoite, ["iogurte_noite"]);
  });

  const streakMath = await server.ssrLoadModule("/src/utils/dailyStreak.ts");
  const streakDay = (day) => new Date(2026, 9, day, 12);
  const completeDay = {
    ...initial,
    peso: "70",
    ultimaData: "2026-10-23",
    refeicoesAtivas: ["cafeManha", "janta"],
    refeicoesConcluidas: ["cafeManha", "janta"],
    aguaConsumida: 2450,
  };
  test("Sequência soma apenas uma vez e persiste ao reabrir", () => {
    const earned = streakMath.reconcileDailyStreak(completeDay, streakDay(23));
    assert.equal(earned.streak, 1);
    assert.equal(earned.ultimoDiaPontuado, "2026-10-23");
    assert.equal(
      streakMath.reconcileDailyStreak(earned, streakDay(23)),
      earned
    );
    const restored = JSON.parse(JSON.stringify(earned));
    assert.equal(
      streakMath.reconcileDailyStreak(restored, streakDay(23)).streak,
      1
    );
  });
  test("Água ou refeições incompletas e refeição livre não pontuam", () => {
    assert.equal(
      streakMath.reconcileDailyStreak(
        { ...completeDay, aguaConsumida: 2449 },
        streakDay(23)
      ).streak,
      0
    );
    assert.equal(
      streakMath.reconcileDailyStreak(
        {
          ...completeDay,
          refeicoesConcluidas: ["cafeManha", "refeicaoLivre_1"],
        },
        streakDay(23)
      ).streak,
      0
    );
    assert.equal(
      streakMath.reconcileDailyStreak(
        { ...completeDay, refeicoesAtivas: [] },
        streakDay(23)
      ).streak,
      0
    );
  });
  test("Dias consecutivos somam e um dia perdido reinicia sem apagar histórico", () => {
    const day1 = streakMath.reconcileDailyStreak(completeDay, streakDay(23));
    const nextMorning = {
      ...day1,
      ultimaData: "2026-10-24",
      aguaConsumida: 0,
      refeicoesConcluidas: [],
    };
    assert.equal(
      streakMath.reconcileDailyStreak(nextMorning, streakDay(24)).streak,
      1
    );
    const day2 = streakMath.reconcileDailyStreak(
      { ...day1, ultimaData: "2026-10-24" },
      streakDay(24)
    );
    assert.equal(day2.streak, 2);
    const missed = streakMath.reconcileDailyStreak(
      {
        ...day2,
        ultimaData: "2026-10-26",
        aguaConsumida: 0,
        refeicoesConcluidas: [],
      },
      streakDay(26)
    );
    assert.equal(missed.streak, 0);
    assert.equal(missed.diasMetasConcluidas["2026-10-23"], true);
    assert.equal(
      streakMath.reconcileDailyStreak(
        { ...missed, ...completeDay, ultimaData: "2026-10-26" },
        streakDay(26)
      ).streak,
      1
    );
  });
  test("Desfazer o dia retira apenas o ponto de hoje e recompletar o devolve", () => {
    const earned = streakMath.reconcileDailyStreak(
      { ...completeDay, diasMetasConcluidas: { "2026-10-22": true } },
      streakDay(23)
    );
    assert.equal(earned.streak, 2);
    const undone = streakMath.reconcileDailyStreak(
      { ...earned, aguaConsumida: 0 },
      streakDay(23)
    );
    assert.equal(undone.streak, 1);
    assert.equal(undone.ultimoDiaPontuado, "2026-10-22");
    assert.equal(undone.diasMetasConcluidas["2026-10-23"], undefined);
    assert.equal(
      streakMath.reconcileDailyStreak(
        { ...undone, aguaConsumida: 2450 },
        streakDay(23)
      ).streak,
      2
    );
  });
  test("Datas antigas em pt-BR são migradas e metas atuais não alteram dias anteriores", () => {
    const migrated = streakMath.reconcileDailyStreak(
      {
        ...completeDay,
        aguaConsumida: 0,
        streak: 3,
        ultimoDiaPontuado: "22/10/2026",
      },
      streakDay(23)
    );
    assert.equal(migrated.streak, 3);
    assert.equal(migrated.diasMetasConcluidas["2026-10-20"], true);
    assert.equal(migrated.ultimoDiaPontuado, "2026-10-22");
    assert.equal(
      streakMath.reconcileDailyStreak(
        { ...migrated, peso: "100" },
        streakDay(23)
      ).streak,
      3
    );
    assert.equal(streakMath.previousDay("2026-01-01"), "2025-12-31");
    assert.equal(streakMath.previousDay("2024-03-01"), "2024-02-29");
  });
  test("Ações reais da loja recalculam sequência ao registrar, desfazer e zerar", () => {
    reset();
    store.getState().setDados({ peso: "70", refeicoesAtivas: ["cafeManha"] });
    store.getState().adicionarAgua(2450, 99999);
    store
      .getState()
      .registrarRefeicao("cafeManha", "Café", "☕", 100, ["Pão"], {
        proteina: 2,
        carbo: 20,
        gordura: 1,
      });
    assert.equal(store.getState().dados.streak, 1);
    store.getState().desfazerRefeicao("cafeManha");
    assert.equal(store.getState().dados.streak, 0);
    store
      .getState()
      .registrarRefeicao("cafeManha", "Café", "☕", 100, ["Pão"], {
        proteina: 2,
        carbo: 20,
        gordura: 1,
      });
    assert.equal(store.getState().dados.streak, 1);
    store.getState().zerarAgua();
    assert.equal(store.getState().dados.streak, 0);
    store.getState().adicionarAgua(2450, 99999);
    assert.equal(store.getState().dados.streak, 1);
    store.getState().zerarDieta();
    assert.equal(store.getState().dados.streak, 0);
  });

  test("Virada real da loja preserva sequência ontem e zera após um dia perdido", () => {
    const NativeDate = globalThis.Date;
    let timestamp = new NativeDate(2026, 9, 23, 23, 59).getTime();
    class ClockDate extends NativeDate {
      constructor(...args) {
        if (args.length) super(...args);
        else super(timestamp);
      }
      static now() {
        return timestamp;
      }
    }
    try {
      globalThis.Date = ClockDate;
      reset();
      store.getState().setDados({ peso: "70", refeicoesAtivas: ["cafeManha"] });
      store
        .getState()
        .registrarRefeicao("cafeManha", "Café", "☕", 100, ["Pão"], {
          proteina: 2,
          carbo: 20,
          gordura: 1,
        });
      store.getState().adicionarAgua(2450, 99999);
      assert.equal(store.getState().dados.streak, 1);
      timestamp = new NativeDate(2026, 9, 24, 0, 1).getTime();
      store.getState().verificarViradaDeDia();
      assert.equal(store.getState().dados.streak, 1);
      assert.equal(store.getState().dados.aguaConsumida, 0);
      assert.equal(store.getState().dados.ultimaData, "2026-10-24");
      store.getState().verificarStreak();
      assert.equal(store.getState().dados.streak, 1);
      assert.equal(
        store.getState().dados.diasMetasConcluidas["2026-10-24"],
        undefined
      );
      timestamp = new NativeDate(2026, 9, 25, 0, 1).getTime();
      store.getState().adicionarAgua(200, 99999);
      assert.equal(store.getState().dados.streak, 0);
      assert.equal(
        store.getState().dados.diasMetasConcluidas["2026-10-23"],
        true
      );
    } finally {
      globalThis.Date = NativeDate;
      reset();
    }
  });

  const features = await server.ssrLoadModule("/src/utils/appFeatures.ts");
  const reminders = await server.ssrLoadModule("/src/utils/reminders.ts");
  test("Editar refeição substitui calorias e macros sem duplicar registro nem sequência", () => {
    reset();
    store.getState().setDados({ peso: "70", refeicoesAtivas: ["cafeManha"] });
    store.getState().adicionarAgua(2450, 99999);
    store
      .getState()
      .registrarRefeicao(
        "cafeManha",
        "Café",
        "☕",
        100,
        ["Pão"],
        { proteina: 2, carbo: 20, gordura: 1 },
        { pao: 50 }
      );
    store
      .getState()
      .registrarRefeicao(
        "cafeManha",
        "Café",
        "☕",
        200,
        ["Pão"],
        { proteina: 4, carbo: 40, gordura: 2 },
        { pao: 100 },
        true
      );
    const d = store.getState().dados;
    assert.equal(d.caloriasConsumidas, 200);
    assert.deepEqual(d.macrosConsumidos, {
      proteina: 4,
      carbo: 40,
      gordura: 2,
    });
    assert.equal(d.refeicoesConcluidas.length, 1);
    assert.equal(d.streak, 1);
    assert.equal(
      d.historico[today()].refeicoesDetalhadas.cafeManha.porcoes.pao,
      100
    );
    store
      .getState()
      .registrarRefeicao(
        "cafeManha",
        "Café",
        "☕",
        150,
        ["Pão"],
        { proteina: 3, carbo: 30, gordura: 1 },
        { pao: 75 },
        true
      );
    assert.equal(store.getState().dados.caloriasConsumidas, 150);
  });
  test("Desfazer último copo mantém água legada, ordem e histórico", () => {
    reset();
    store.getState().setDados({ aguaConsumida: 300 });
    store.getState().adicionarAgua(200, 99999);
    store.getState().adicionarAgua(500, 99999);
    store.getState().desfazerUltimaAgua();
    assert.equal(store.getState().dados.aguaConsumida, 500);
    assert.equal(store.getState().dados.registrosAgua.length, 1);
    store.getState().desfazerUltimaAgua();
    assert.equal(store.getState().dados.aguaConsumida, 300);
    store.getState().desfazerUltimaAgua();
    assert.equal(store.getState().dados.aguaConsumida, 300);
    assert.equal(store.getState().dados.historico[today()].aguaConsumida, 300);
    store.getState().zerarAgua();
    assert.equal(store.getState().dados.registrosAgua.length, 0);
  });
  test("Catálogo personalizado calcula porções e combinações aceitam alimentos de outra refeição", () => {
    const custom = {
      id: "custom_test",
      nome: "Alimento teste",
      emoji: "🍽️",
      kcal100g: 200,
      prot: 10,
      carbo: 30,
      gord: 5,
    };
    const d = { ...initial, alimentosPersonalizados: [custom] };
    assert.equal(
      food.calcularPorcoes({ custom_test: 50 }, features.mealCatalog(d))
        .calorias,
      100
    );
    assert.deepEqual(
      features.recipeForCatalog(d, { custom_test: 50, desconhecido: 100 }),
      { custom_test: 50 }
    );
    const dinner = food.DICIONARIO_ALIMENTOS.janta[0];
    const mapped = features.recipeForCatalog(
      d,
      { [dinner.id]: 80 },
      "cafeManha"
    );
    assert.ok(Object.values(mapped).includes(80));
    assert.equal(
      food.calcularPorcoes(
        mapped,
        features.mealCatalog(d, "cafeManha", Object.keys(mapped))
      ).calorias,
      Math.round(dinner.kcal100g * 0.8)
    );
    assert.ok(
      features
        .mealCatalog(d, "cafeManha", Object.keys(mapped))
        .some((f) => f.id === Object.keys(mapped)[0])
    );
  });
  test("Compras usa apenas plano ativo, inclui IDs legados e não altera consumo", () => {
    const d = {
      ...initial,
      refeicoesAtivas: ["janta"],
      alimentos: {
        janta: [food.DICIONARIO_ALIMENTOS.janta[0].id],
        cafeManha: ["pao"],
      },
      porcoesPlano: { janta: { [food.DICIONARIO_ALIMENTOS.janta[0].id]: 150 } },
    };
    const list = features.shoppingItems(d);
    assert.equal(list.length, 1);
    assert.equal(list[0].grams, 150);
    assert.equal(d.caloriasConsumidas, 0);
  });
  test("Resumo semanal considera sete dias e preserva zeros sem duplicar hoje", () => {
    const d = {
      ...initial,
      ultimaData: "2026-10-23",
      aguaConsumida: 300,
      caloriasConsumidas: 100,
      refeicoesConcluidas: ["cafeManha"],
      historico: {
        "2026-10-22": {
          aguaConsumida: 200,
          caloriasConsumidas: 80,
          refeicoesDetalhadas: { a: {} },
        },
        "2026-10-23": {
          aguaConsumida: 999,
          caloriasConsumidas: 999,
          refeicoesDetalhadas: {},
        },
      },
      diasMetasConcluidas: { "2026-10-22": true },
    };
    const week = features.weeklySummary(d, "2026-10-23");
    assert.equal(week.length, 7);
    assert.equal(
      week.reduce((n, d) => n + d.water, 0),
      500
    );
    assert.equal(
      week.reduce((n, d) => n + d.meals, 0),
      2
    );
    assert.equal(week.filter((d) => d.complete).length, 1);
  });
  test("Lembretes respeitam refeições escolhidas, intervalo e silêncio através da meia-noite", () => {
    const d = {
      ...initial,
      horaAcorda: "06:00",
      horaDorme: "23:00",
      refeicoesAtivas: ["cafeManha", "janta"],
      horariosRefeicoes: { cafeManha: "08:00", janta: "23:00" },
      lembretes: {
        refeicoes: ["janta"],
        motivacao: false,
        aguaIntervalo: 120,
        silencioInicio: "22:00",
        silencioFim: "07:00",
      },
    };
    const slots = reminders.reminderSlots(d);
    assert.ok(slots.length > 0);
    assert.ok(slots.every((s) => s.minute >= 420 && s.minute < 1320));
    assert.ok(slots.every((s) => s.title.includes("água")));
    const none = reminders.reminderSlots({
      ...d,
      lembretes: { ...d.lembretes, refeicoes: [], aguaIntervalo: 0 },
    });
    assert.equal(none.length, 0);
    const meals = reminders.reminderSlots({
      ...d,
      lembretes: { ...d.lembretes, refeicoes: ["cafeManha"], aguaIntervalo: 0 },
    });
    assert.equal(meals.length, 1);
    assert.equal(meals[0].minute, 480);
  });

  test("Catálogo evita opções repetidas e preserva IDs de porções antigas na edição", () => {
    const catalog = features.mealCatalog(initial, "janta");
    assert.equal(new Set(catalog.map((f) => f.nome)).size, catalog.length);
    const alias = food.DICIONARIO_ALIMENTOS.janta.find(
      (f) => f.nome === "Arroz"
    );
    const original = food.todosAlimentos.find((f) => f.nome === "Arroz");
    const editing = features.mealCatalog(initial, "janta", [original.id]);
    assert.ok(editing.some((f) => f.id === original.id));
    assert.equal(
      food.calcularPorcoes({ [original.id]: 100 }, editing).calorias,
      original.kcal100g
    );
    assert.ok(alias);
  });
  test("Refazer configuração preserva alimento personalizado e substituição de outra refeição", () => {
    const custom = {
      id: "custom_kept",
      nome: "Meu alimento",
      emoji: "🍽️",
      kcal100g: 200,
      prot: 10,
      carbo: 30,
      gord: 5,
    };
    const d = { ...initial, alimentosPersonalizados: [custom] };
    const normalized = normalizeMealPreferences(
      { cafeManha: ["custom_kept", "frango"] },
      features.fullCatalog(d)
    );
    assert.deepEqual(normalized.cafeManha, ["custom_kept", "frango"]);
  });

  const shopping = await server.ssrLoadModule("/src/utils/shoppingList.ts");
  test("Lista de compras multiplica porções pelo período sem inventar quantidades ausentes", () => {
    const data = {
      ...initial,
      refeicoesAtivas: ["cafeManha"],
      alimentos: { cafeManha: ["pao", "banana"] },
      porcoesPlano: { cafeManha: { pao: 50 } },
    };
    const items = shopping.buildShoppingList(data, 7);
    assert.equal(items.find((i) => i.nome === "Pão Francês").quantidade, "350");
    assert.equal(items.find((i) => i.nome === "Banana").quantidade, "");
    const bulk = shopping.buildShoppingList(data, 30);
    assert.equal(bulk.find((i) => i.nome === "Pão Francês").quantidade, "1.5");
    assert.equal(bulk.find((i) => i.nome === "Pão Francês").unidade, "kg");
  });
  test("Atualizar compras mantém quantidades editadas, despensa, comprados e itens manuais", () => {
    const data = {
      ...initial,
      refeicoesAtivas: ["cafeManha"],
      alimentos: { cafeManha: ["pao"] },
      porcoesPlano: { cafeManha: { pao: 50 } },
    };
    const items = shopping.buildShoppingList(data, 7);
    items[0] = {
      ...items[0],
      quantidade: "2",
      unidade: "un",
      quantidadeEditada: true,
      emCasa: true,
    };
    const manual = {
      ...items[0],
      id: "manual:1",
      nome: "Detergente",
      emCasa: false,
      comprado: true,
      manual: true,
    };
    const updated = shopping.buildShoppingList(data, 14, [...items, manual]);
    assert.equal(updated.find((i) => i.id === items[0].id).quantidade, "2");
    assert.equal(updated.find((i) => i.id === items[0].id).unidade, "un");
    assert.equal(updated.find((i) => i.id === "manual:1").comprado, true);
    assert.deepEqual(shopping.shoppingProgress(updated), {
      bought: 1,
      pantry: 1,
      pending: 0,
      missing: 0,
    });
    assert.equal(new Set(updated.map((i) => i.id)).size, updated.length);
  });
  test("Notificações variam mensagens, permitem desligar humor e evitam alarmes colados", () => {
    const data = {
      ...initial,
      nome: "Teste",
      horaAcorda: "07:00",
      horaDorme: "23:00",
      refeicoesAtivas: ["cafeManha", "janta"],
      horariosRefeicoes: { cafeManha: "07:00", janta: "20:30" },
    };
    const slots = reminders.reminderSlots(data);
    assert.ok(slots.every((s) => s.messages.length >= 3));
    for (let i = 0; i < slots.length; i++)
      for (let j = i + 1; j < slots.length; j++)
        assert.ok(
          Math.min(
            Math.abs(slots[i].minute - slots[j].minute),
            1440 - Math.abs(slots[i].minute - slots[j].minute)
          ) >= 10
        );
    assert.equal(slots.filter((s) => s.minute === 420).length, 1);
    assert.equal(slots.find((s) => s.minute === 420).kind, "meal");
    const plain = reminders.reminderSlots({
      ...data,
      lembretes: {
        ...reminders.defaultReminders,
        refeicoes: ["cafeManha"],
        humor: false,
        motivacao: false,
      },
    });
    assert.ok(
      plain.every(
        (s) => s.messages.length === 1 && s.messages[0].body === s.body
      )
    );
  });
  test("Plano nativo usa metas atuais sem carregar consumo de ontem para os avisos de hoje", () => {
    const current = {
      ...initial,
      nome: "Teste",
      ultimaData: today(),
      peso: "70",
      aguaConsumida: 2450,
      refeicoesAtivas: ["cafeManha"],
      refeicoesConcluidas: ["cafeManha"],
    };
    const plan = reminders.nativeReminderPlan(current);
    assert.equal(plan.waterDone, true);
    assert.equal(plan.complete, true);
    assert.deepEqual(plan.doneMeals, ["cafeManha"]);
    const stale = reminders.nativeReminderPlan({
      ...current,
      ultimaData: "2020-01-01",
    });
    assert.equal(stale.waterDone, false);
    assert.equal(stale.complete, false);
    assert.deepEqual(stale.doneMeals, []);
    assert.equal(
      reminders.nativeReminderPlan({ ...current, notificacoes: false }).enabled,
      false
    );
    assert.equal(
      reminders.nativeReminderPlan({ ...current, nome: "" }).enabled,
      false
    );
  });

  const diagnostics = await server.ssrLoadModule(
    "/src/utils/notificationDiagnostics.ts"
  );
  test("Teste imediato não confirma agendamento e teste futuro continua aguardando", () => {
    assert.equal(
      diagnostics.notificationTestResult({ lastShown: 999 }, 1000).state,
      "none"
    );
    assert.equal(
      diagnostics.notificationTestResult(
        { testAt: 2000, testReceivedAt: 0 },
        1000
      ).state,
      "waiting"
    );
  });
  test("Diagnóstico separa atraso do Android, restrição de exibição e entrega real", () => {
    assert.equal(
      diagnostics.notificationTestResult({ testAt: 2000, exact: false }, 3000)
        .state,
      "approximate"
    );
    assert.equal(
      diagnostics.notificationTestResult({ testAt: 2000, exact: true }, 3000)
        .state,
      "overdue"
    );
    assert.equal(
      diagnostics.notificationTestResult(
        { testAt: 2000, testReceivedAt: 3000, testShown: false },
        3000
      ).state,
      "blocked"
    );
    assert.equal(
      diagnostics.notificationTestResult(
        { testAt: 2000, testReceivedAt: 3000, testShown: true },
        3000
      ).state,
      "received"
    );
    assert.equal(
      diagnostics.notificationTestResult(
        { testAt: 20000, testReceivedAt: 3000, testShown: true },
        10000
      ).state,
      "waiting"
    );
  });
  console.log(`${passed} verificações passaram.`);
} finally {
  await server.close();
}
