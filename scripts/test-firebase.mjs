import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { createServer } from "vite";

// Emulator only: no production access and no real user or health data.
const env = await initializeTestEnvironment({
  projectId: "demo-louri-test",
  firestore: {
    host: "127.0.0.1",
    port: 8089,
    rules: await readFile("firestore.rules", "utf8"),
  },
});
const storage = new Map();
let failProfileWrite = false;
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => {
    if (failProfileWrite && k === "nutri-app-storage")
      throw new DOMException("Full", "QuotaExceededError");
    storage.set(k, v);
  },
  removeItem: (k) => storage.delete(k),
};
globalThis.window = { localStorage: globalThis.localStorage };
Object.defineProperty(globalThis, "navigator", {
  value: { onLine: true },
  configurable: true,
});
const firebase = {
  auth: { currentUser: null, authStateReady: async () => {} },
  database: null,
  nextUser: null,
};
globalThis.__louriTestFirebase = firebase;
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  plugins: [
    {
      name: "account-test-transport",
      enforce: "pre",
      resolveId(source, importer) {
        if (source === "virtual:louri-auth") return "\0test-firebase-auth";
        if (!importer?.endsWith("/services/accountService.ts")) return;
        if (source === "./firebaseClient") return "\0test-firebase-client";
        if (source === "firebase/auth") return "\0test-firebase-auth";
      },
      transform(code, id) {
        if (id.endsWith("/services/accountService.ts"))
          return code.replaceAll(
            'import("firebase/auth")',
            'import("virtual:louri-auth")',
          );
      },
      load(id) {
        if (id === "\0test-firebase-client")
          return "export const auth = globalThis.__louriTestFirebase.auth; export let database = globalThis.__louriTestFirebase.database; export function changeDatabase(db) { database = db; }";
        if (id === "\0test-firebase-auth")
          return `
      export class GoogleAuthProvider { setCustomParameters() {} }
      export async function signInWithPopup(auth) { auth.currentUser = globalThis.__louriTestFirebase.nextUser; return { user: auth.currentUser }; }
      export async function signOut(auth) { auth.currentUser = null; }
      export function onAuthStateChanged() { return () => {}; }
      export async function reauthenticateWithPopup(user) { if (user.uid !== globalThis.__louriTestFirebase.nextUser.uid) throw new Error('Conta diferente'); }
      export async function deleteUser(user) { globalThis.__louriTestFirebase.deleted = user.uid; globalThis.__louriTestFirebase.auth.currentUser = null; }
    `;
      },
    },
  ],
});
let passed = 0;
async function test(name, fn) {
  await fn();
  passed++;
  console.log("✓ " + name);
}
const ownerDb = (uid) =>
  env
    .authenticatedContext(uid, { firebase: { sign_in_provider: "google.com" } })
    .firestore();
const path = (db, uid = "alice") => doc(db, "users", uid, "state", "current");
const write = (revision = 1, extra = {}) => ({
  schema: 1,
  revision,
  payload: '{"nome":"Teste"}',
  updatedAt: serverTimestamp(),
  ...extra,
});
try {
  const alice = ownerDb("alice");
  const bob = ownerDb("bob");
  await test("Regras: usuário sem login não lê nem cria dados", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(path(db)));
    await assertFails(setDoc(path(db), write()));
  });
  await test("Regras: dono cria e lê seu próprio perfil", async () => {
    await assertSucceeds(setDoc(path(alice), write()));
    await assertSucceeds(getDoc(path(alice)));
  });
  await test("Regras: outra conta não lê, altera nem apaga perfil", async () => {
    await assertFails(getDoc(path(bob)));
    await assertFails(setDoc(path(bob), write(2)));
    await assertFails(deleteDoc(path(bob)));
    await assertFails(getDocs(collection(alice, "users")));
  });
  await test("Regras: rejeita campos extras, revisão antiga e tamanho excessivo", async () => {
    await assertFails(setDoc(path(alice), write(2, { extra: true })));
    await assertFails(setDoc(path(alice), write(1)));
    await assertFails(
      setDoc(path(alice), write(2, { payload: "x".repeat(800001) })),
    );
    await assertSucceeds(setDoc(path(alice), write(2)));
  });
  await test("Regras: exige login Google e recusa outros caminhos", async () => {
    const db = env
      .authenticatedContext("alice", {
        firebase: { sign_in_provider: "anonymous" },
      })
      .firestore();
    await assertFails(getDoc(path(db)));
    await assertFails(
      setDoc(doc(alice, "users", "alice", "other", "anything"), write()),
    );
    await assertSucceeds(deleteDoc(path(alice)));
  });
  const { useUserStore: user } = await server.ssrLoadModule(
    "/src/store/useUserStore.ts",
  );
  const initial = structuredClone(user.getState().dados);
  const cloud = await server.ssrLoadModule("/src/utils/cloudProfile.ts");
  await test("Serialização não envia fotos nem permissões, preserva histórico e medidas", async () => {
    const data = {
      ...initial,
      nome: "Perfil local",
      notificacoes: false,
      alimentosPersonalizados: [
        {
          id: "custom_test",
          nome: "Teste",
          imagem: "data:image/jpeg;base64,LOCAL",
          nested: { imagem: "LOCAL" },
        },
      ],
      historicoPeso: { "2026-10-25": "70" },
    };
    const encoded = cloud.encodeCloudProfile(data);
    assert.ok(!encoded.includes("LOCAL"));
    assert.ok(!encoded.includes("notificacoes"));
    const decoded = cloud.decodeCloudProfile(encoded, initial, data);
    assert.equal(
      decoded.alimentosPersonalizados[0].imagem,
      data.alimentosPersonalizados[0].imagem,
    );
    assert.equal(decoded.notificacoes, false);
    assert.deepEqual(decoded.historicoPeso, data.historicoPeso);
    assert.equal(
      cloud.decodeCloudProfile(encoded, initial).alimentosPersonalizados[0]
        .imagem,
      undefined,
    );
    assert.throws(() =>
      cloud.encodeCloudProfile({ ...initial, nome: "x".repeat(800001) }),
    );
    assert.throws(() => cloud.decodeCloudProfile("[]", initial));
  });
  firebase.database = alice;
  const service = await server.ssrLoadModule("/src/services/accountService.ts");
  const { useAccountStore: account } = await server.ssrLoadModule(
    "/src/store/useAccountStore.ts",
  );
  await service.initializeAccount();
  await test("Perfil legado continua local sem autenticação", async () => {
    user.getState().setDados({ nome: "Visitante teste", peso: "70" });
    assert.equal(account.getState().owner, "local");
    assert.equal(firebase.auth.currentUser, null);
  });
  await test("Primeira conta adota perfil local e salva com revisão", async () => {
    firebase.nextUser = { uid: "alice", email: "alice@example.test" };
    await service.enterGoogle();
    assert.equal(account.getState().owner, "alice", account.getState().message);
    assert.equal(account.getState().status, "saved");
    assert.equal(
      JSON.parse((await getDoc(path(alice))).data().payload).nome,
      "Visitante teste",
    );
  });
  await test("Sem internet, edições ficam locais e são sincronizadas ao reconectar", async () => {
    navigator.onLine = false;
    user.getState().setDados({ peso: "71" });
    await service.synchronizeAccount();
    assert.equal(account.getState().status, "offline");
    assert.equal(
      JSON.parse((await getDoc(path(alice))).data().payload).peso,
      "70",
    );
    navigator.onLine = true;
    await service.synchronizeAccount();
    assert.equal(
      JSON.parse((await getDoc(path(alice))).data().payload).peso,
      "71",
    );
  });
  await test("Alterações são enviadas automaticamente sem botão ou chamada manual", async () => {
    user.getState().setDados({ peso: "71.5" });
    await new Promise((resolve) => setTimeout(resolve, 5500));
    assert.equal(
      JSON.parse((await getDoc(path(alice))).data().payload).peso,
      "71.5",
    );
    assert.equal(account.getState().status, "saved");
  });
  await test("Retentativas respeitam intervalo e não repetem erros de cota ou permissão", async () => {
    const { accountRetryDelay } = await server.ssrLoadModule(
      "/src/utils/accountRetry.ts",
    );
    assert.equal(accountRetryDelay("unavailable", 0), 15000);
    assert.equal(accountRetryDelay("unavailable", 3), 120000);
    assert.equal(accountRetryDelay("unavailable", 4), null);
    assert.equal(accountRetryDelay("permission-denied", 0), null);
    assert.equal(accountRetryDelay("resource-exhausted", 0), null);
    assert.equal(accountRetryDelay("louri/revision-changed", 0), 750);
  });
  await test("Alteração em outro aparelho pede escolha sem sobrescrever dados", async () => {
    const remote = (await getDoc(path(alice))).data();
    await setDoc(path(alice), {
      ...remote,
      payload: JSON.stringify({ ...JSON.parse(remote.payload), peso: "72" }),
      revision: remote.revision + 1,
      updatedAt: serverTimestamp(),
    });
    user.getState().setDados({ peso: "73" });
    await service.synchronizeAccount();
    assert.equal(account.getState().status, "conflict");
    assert.equal(user.getState().dados.peso, "73");
    await service.resolveAccountConflict("cloud");
    assert.equal(user.getState().dados.peso, "72");
    assert.equal(account.getState().status, "saved");
  });
  await test("Sair restaura o visitante e conserva o cache da conta", async () => {
    await service.leaveAccount();
    assert.equal(account.getState().owner, "local");
    assert.equal(user.getState().dados.nome, "Visitante teste");
    assert.equal(user.getState().dados.peso, "70");
    assert.equal(
      JSON.parse(storage.get("louri-account:alice")).data.peso,
      "72",
    );
  });
  await test("Edição não sincronizada sobrevive a sair e entrar na mesma conta", async () => {
    await service.enterGoogle();
    navigator.onLine = false;
    user.getState().setDados({
      peso: "74",
      alimentosPersonalizados: [
        {
          id: "custom_alice",
          nome: "Só Alice",
          emoji: "🍎",
          kcal100g: 10,
          prot: 0,
          carbo: 1,
          gord: 0,
          imagem: "data:image/jpeg;base64,ALICE",
        },
      ],
    });
    await service.leaveAccount();
    assert.equal(user.getState().dados.peso, "70");
    await service.enterGoogle();
    assert.equal(user.getState().dados.peso, "74");
    navigator.onLine = true;
    await service.synchronizeAccount();
    assert.equal(
      JSON.parse((await getDoc(path(alice))).data().payload).peso,
      "74",
    );
    await service.leaveAccount();
  });
  await test("Trocar conta não copia histórico nem fotos da conta anterior", async () => {
    const fixture = await server.ssrLoadModule("\0test-firebase-client");
    fixture.changeDatabase(bob);
    firebase.nextUser = { uid: "bob", email: "bob@example.test" };
    await service.enterGoogle();
    assert.equal(account.getState().owner, "bob");
    assert.equal(account.getState().status, "saved");
    assert.equal(user.getState().dados.peso, "70");
    assert.equal(user.getState().dados.alimentosPersonalizados?.length || 0, 0);
    assert.ok(!storage.get("louri-account:bob").includes("ALICE"));
  });
  await test("Excluir conta remove somente o documento e cache próprios e restaura visitante", async () => {
    firebase.nextUser = { uid: "alice", email: "alice@example.test" };
    await service.deleteLouriAccount();
    assert.equal(account.getState().owner, "bob");
    assert.equal((await getDoc(path(bob, "bob"))).exists(), true);
    firebase.nextUser = { uid: "bob", email: "bob@example.test" };
    await service.deleteLouriAccount();
    assert.equal(firebase.deleted, "bob");
    assert.equal(account.getState().owner, "local");
    assert.equal(storage.has("louri-account:bob"), false);
    assert.equal((await getDoc(path(bob, "bob"))).exists(), false);
    assert.equal((await getDoc(path(alice))).exists(), true);
    assert.equal(user.getState().dados.peso, "70");
  });
  await test("Aparelho sem perfil recupera conta existente sem exigir escolha inacessível", async () => {
    const fixture = await server.ssrLoadModule("\0test-firebase-client");
    fixture.changeDatabase(alice);
    storage.delete("louri-account:alice");
    user.setState({ dados: structuredClone(initial) });
    firebase.nextUser = { uid: "alice", email: "alice@example.test" };
    await service.enterGoogle();
    assert.equal(account.getState().status, "saved");
    assert.equal(user.getState().dados.peso, "74");
    assert.equal(
      user.getState().dados.alimentosPersonalizados[0].imagem,
      undefined,
    );
  });
  await test("Documento removido não é recriado silenciosamente por sessão antiga", async () => {
    await deleteDoc(path(alice));
    user.getState().setDados({ peso: "75" });
    await service.synchronizeAccount();
    assert.equal(account.getState().status, "error");
    assert.equal((await getDoc(path(alice))).exists(), false);
    await service.leaveAccount();
  });
  await test("Falha de espaço ao trocar de conta bloqueia a tela e não mistura proprietários", async () => {
    firebase.nextUser = { uid: "charlie", email: "charlie@example.test" };
    failProfileWrite = true;
    await service.enterGoogle();
    assert.equal(account.getState().ready, false);
    assert.equal(account.getState().owner, "charlie");
    assert.equal(storage.get("louri-active-account"), "charlie");
    assert.match(account.getState().message, /armazenamento/);
    failProfileWrite = false;
    await service.leaveAccount();
    assert.equal(account.getState().owner, "local");
    assert.equal(account.getState().ready, true);
  });
  console.log(`${passed} verificações Firebase passaram.`);
} finally {
  await server.close();
  await env.cleanup();
}
