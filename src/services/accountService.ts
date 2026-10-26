import { Capacitor } from "@capacitor/core";
import { useAccountStore } from "../store/useAccountStore";
import { useUserStore } from "../store/useUserStore";
import type { UserData } from "../store/useUserStore";
import { mergePersistedUser } from "../utils/persistedUser";
import { decodeCloudProfile, encodeCloudProfile } from "../utils/cloudProfile";
import { accountRetryDelay } from "../utils/accountRetry";

const ACTIVE = "louri-active-account";
const vaultKey = (owner: string) => `louri-account:${owner}`;
const defaults = structuredClone(useUserStore.getInitialState().dados);
interface Cache {
  data: UserData;
  revision: number;
  baseline: string;
}
interface Remote {
  payload: string;
  revision: number;
}
let cache: Cache = {
  data: useUserStore.getState().dados,
  revision: 0,
  baseline: "",
};
let started: Promise<void> | undefined;
let switching = false;
let syncing = false;
let deleting = false;
let currentSync: Promise<void> | undefined;
let generation = 0;
let retryAttempt = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let conflict: Remote | undefined;
let unsubscribeAuth: (() => void) | undefined;
const state = useAccountStore.getState;
const patch = useAccountStore.setState;
const client = () => import("./firebaseClient");

function readCache(owner: string): Cache | undefined {
  const raw = localStorage.getItem(vaultKey(owner));
  if (!raw) return;
  const value = JSON.parse(raw) as Cache;
  if (
    !value ||
    !value.data ||
    !Number.isSafeInteger(value.revision) ||
    value.revision < 0 ||
    typeof value.baseline !== "string"
  )
    throw new Error(
      "Não foi possível abrir os dados salvos da conta. Seus dados foram preservados.",
    );
  return {
    ...value,
    data: mergePersistedUser(value.data, structuredClone(defaults)),
  };
}
function saveCache(owner: string, value: Cache) {
  localStorage.setItem(vaultKey(owner), JSON.stringify(value));
}
function errorMessage(error: unknown): string {
  if ((error as { name?: string })?.name === "QuotaExceededError")
    return "O armazenamento deste aparelho está cheio. Libere espaço e abra o Louri novamente. Seus dados foram preservados.";
  const code = (error as { code?: string })?.code;
  if (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request"
  )
    return "Entrada cancelada. Você pode continuar sem conta.";
  if (code === "auth/popup-blocked")
    return "O navegador bloqueou a janela do Google. Permita a janela e tente novamente.";
  if (code === "auth/unauthorized-domain")
    return "Este endereço ainda precisa ser autorizado no Firebase.";
  if (code === "auth/operation-not-allowed")
    return "O login Google ainda precisa ser ativado no Firebase.";
  if (code === "permission-denied")
    return "O salvamento precisa das regras de acesso do Firebase. Seus dados continuam neste aparelho.";
  if (code === "resource-exhausted")
    return "A cota gratuita de hoje foi atingida. Seus dados continuam salvos aqui; tente sincronizar amanhã.";
  if (code === "unavailable" || code === "auth/network-request-failed")
    return "Sem conexão com sua conta. Seus dados continuam salvos neste aparelho.";
  return error instanceof Error && !code
    ? error.message
    : "Não foi possível conectar agora. Seus dados continuam neste aparelho. Tente novamente.";
}
function activate(owner: string, next: Cache, email = "") {
  // Persist both vault and owner before replacing the visible profile.
  saveCache(owner, next);
  localStorage.setItem(ACTIVE, owner);
  generation++;
  retryAttempt = 0;
  switching = true;
  cache = next;
  patch({ owner, email, ready: false });
  try {
    useUserStore.setState({
      dados: next.data,
      modalPesoAberto: false,
      mostrarNavbar: true,
    });
    patch({
      ready: true,
      message: "",
      status: owner === "local" ? "local" : "pending",
      lastSync: null,
    });
  } catch (error) {
    started = undefined;
    throw error;
  } finally {
    switching = false;
  }
}
async function remoteRead(uid: string): Promise<Remote | undefined> {
  const { database } = await client();
  const { doc, getDocFromServer } = await import("firebase/firestore");
  const snapshot = await getDocFromServer(
    doc(database, "users", uid, "state", "current"),
  );
  if (!snapshot.exists()) return;
  const value = snapshot.data();
  if (
    value.schema !== 1 ||
    typeof value.payload !== "string" ||
    !Number.isSafeInteger(value.revision) ||
    value.revision < 1
  )
    throw new Error(
      "A conta contém dados de uma versão incompatível do Louri.",
    );
  return { payload: value.payload, revision: value.revision };
}
function applyRemote(remote: Remote) {
  const data = decodeCloudProfile(remote.payload, defaults, cache.data);
  switching = true;
  cache = {
    data,
    revision: remote.revision,
    baseline: encodeCloudProfile(data),
  };
  try {
    saveCache(state().owner, cache);
    useUserStore.setState({ dados: data, modalPesoAberto: false });
  } finally {
    switching = false;
  }
}
function showConflict(remote: Remote) {
  conflict = remote;
  patch({
    status: "conflict",
    message:
      "Há dados diferentes nesta conta. Escolha qual versão continuar usando. A outra versão fica preservada neste aparelho.",
  });
}
async function attachUser(user: { uid: string; email: string | null }) {
  const owner = user.uid;
  const saved = readCache(owner);
  const previousOwner = state().owner;
  saveCache(previousOwner, { ...cache, data: useUserStore.getState().dados });
  // A new account may adopt the guest profile, never a different Google account.
  const guest =
    previousOwner === "local" ? useUserStore.getState().dados : undefined;
  const data = structuredClone(guest || defaults);
  const hasProfile = Boolean(
    data.nome ||
    data.peso ||
    Object.keys(data.historico).length ||
    data.alimentosPersonalizados?.length,
  );
  const next = saved || {
    data,
    revision: 0,
    baseline: hasProfile ? "" : encodeCloudProfile(data),
  };
  activate(owner, next, user.email || "Conta Google");
  await synchronizeAccount();
}

/** Starts without importing Firebase at all for people who use only local mode. */
export function initializeAccount(): Promise<void> {
  if (started) return started;
  started = Promise.resolve().then(async () => {
    try {
      const owner = localStorage.getItem(ACTIVE) || "local";
      cache = readCache(owner) || {
        data:
          owner === "local"
            ? useUserStore.getState().dados
            : structuredClone(defaults),
        revision: 0,
        baseline: "",
      };
      if (owner === "local") {
        activate("local", cache);
      } else {
        const { auth } = await client();
        await auth.authStateReady();
        if (auth.currentUser?.uid === owner) {
          activate(owner, cache, auth.currentUser.email || "Conta Google");
          void synchronizeAccount();
        } else {
          activate(
            "local",
            readCache("local") || {
              data: structuredClone(defaults),
              revision: 0,
              baseline: "",
            },
          );
        }
        await watchAuth();
      }
    } catch (error) {
      // Do not expose the previous user's profile if restoration fails.
      patch({
        ready: false,
        busy: false,
        status: "error",
        message: errorMessage(error),
      });
      started = undefined;
    }
  });
  return started;
}
async function watchAuth() {
  if (unsubscribeAuth) return;
  const { auth } = await client();
  const { onAuthStateChanged } = await import("firebase/auth");
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (
      state().owner !== "local" &&
      !state().busy &&
      user?.uid !== state().owner
    ) {
      void leaveAccount();
    }
  });
}
async function googleCredential() {
  const { GoogleAuthProvider } = await import("firebase/auth");
  if (!Capacitor.isNativePlatform()) return;
  const { FirebaseAuthentication } =
    await import("@capacitor-firebase/authentication");
  const result = await FirebaseAuthentication.signInWithGoogle({
    skipNativeAuth: true,
  });
  if (!result.credential?.idToken)
    throw new Error("O Google não concluiu a entrada. Tente novamente.");
  return GoogleAuthProvider.credential(result.credential.idToken);
}
export async function enterGoogle() {
  if (state().busy) return;
  patch({ busy: true, message: "" });
  try {
    const { auth } = await client();
    const { GoogleAuthProvider, signInWithCredential, signInWithPopup } =
      await import("firebase/auth");
    const credential = await googleCredential();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = credential
      ? await signInWithCredential(auth, credential)
      : await signInWithPopup(auth, provider);
    await attachUser(result.user);
    await watchAuth();
  } catch (error) {
    patch({
      message: errorMessage(error),
      status: state().owner === "local" ? "local" : "error",
    });
  } finally {
    patch({ busy: false });
  }
}

export function synchronizeAccount(): Promise<void> {
  if (currentSync) return currentSync;
  currentSync = performSync().finally(() => {
    currentSync = undefined;
  });
  return currentSync;
}
async function performSync() {
  const uid = state().owner;
  if (
    uid === "local" ||
    switching ||
    syncing ||
    deleting ||
    state().status === "conflict"
  )
    return;
  if (!navigator.onLine) {
    patch({ status: "offline" });
    return;
  }
  const token = generation;
  syncing = true;
  patch({ status: "loading", message: "" });
  try {
    const { auth, database } = await client();
    if (auth.currentUser?.uid !== uid)
      throw new Error("Entre novamente para sincronizar esta conta.");
    const remote = await remoteRead(uid);
    if (token !== generation) return;
    const current = encodeCloudProfile(useUserStore.getState().dados);
    if (remote && remote.revision !== cache.revision) {
      if (current !== cache.baseline && current !== remote.payload) {
        showConflict(remote);
        return;
      }
      applyRemote(remote);
    } else if (!remote && cache.revision !== 0) {
      throw new Error(
        "Os dados da conta não estão disponíveis. Não vamos recriá-los automaticamente; entre novamente.",
      );
    }
    const payload = encodeCloudProfile(useUserStore.getState().dados);
    if (payload !== cache.baseline || !remote) {
      const { doc, runTransaction, serverTimestamp } =
        await import("firebase/firestore");
      const expected = cache.revision;
      const reference = doc(database, "users", uid, "state", "current");
      const revision = await runTransaction(database, async (transaction) => {
        const latest = await transaction.get(reference);
        if (token !== generation || auth.currentUser?.uid !== uid)
          throw new Error("A conta mudou durante o salvamento.");
        const actual = latest.exists() ? latest.data().revision : 0;
        if (actual !== expected)
          throw Object.assign(
            new Error("A conta foi atualizada em outro aparelho."),
            { code: "louri/revision-changed" },
          );
        transaction.set(reference, {
          schema: 1,
          revision: expected + 1,
          payload,
          updatedAt: serverTimestamp(),
        });
        return expected + 1;
      });
      if (token !== generation) return;
      cache = {
        data: useUserStore.getState().dados,
        revision,
        baseline: payload,
      };
      saveCache(uid, cache);
    }
    if (token !== generation) return;
    const pending =
      encodeCloudProfile(useUserStore.getState().dados) !== cache.baseline;
    patch({
      status: pending ? "pending" : "saved",
      lastSync: Date.now(),
      message: "",
    });
    retryAttempt = 0;
    if (pending) scheduleSync();
  } catch (error) {
    if (token === generation) {
      patch({
        status: navigator.onLine ? "error" : "offline",
        message: errorMessage(error),
      });
      const delay = accountRetryDelay(
        (error as { code?: string })?.code,
        retryAttempt,
      );
      if (navigator.onLine && delay !== null) {
        retryAttempt++;
        patch({
          status: "pending",
          message:
            "Seus dados estão salvos aqui. O Louri tentará enviar novamente sozinho.",
        });
        scheduleSync(delay);
      }
    }
  } finally {
    syncing = false;
    if (token !== generation && state().owner !== "local" && !deleting)
      scheduleSync();
  }
}
function scheduleSync(delay = 5000) {
  clearTimeout(timer);
  timer = setTimeout(() => void synchronizeAccount(), delay);
}
useUserStore.subscribe((next, previous) => {
  if (switching || next.dados === previous.dados || !state().ready) return;
  try {
    cache = { ...cache, data: next.dados };
    saveCache(state().owner, cache);
    if (state().owner !== "local" && state().status !== "conflict") {
      patch({ status: navigator.onLine ? "pending" : "offline" });
      scheduleSync();
    }
  } catch {
    patch({
      status: "error",
      message:
        "O armazenamento deste aparelho está cheio. Libere espaço antes de trocar de conta.",
    });
  }
});

export async function resolveAccountConflict(choice: "cloud" | "device") {
  if (!conflict || state().busy) return;
  patch({ busy: true });
  try {
    // Preserve both versions locally before the explicit replacement.
    localStorage.setItem(
      `${vaultKey(state().owner)}:before-conflict`,
      JSON.stringify({ cache, remote: conflict }),
    );
    if (choice === "cloud") applyRemote(conflict);
    else {
      cache = {
        ...cache,
        revision: conflict.revision,
        baseline: conflict.payload,
      };
      saveCache(state().owner, cache);
    }
    conflict = undefined;
    patch({ status: "pending", message: "" });
    await synchronizeAccount();
  } catch (error) {
    patch({ message: errorMessage(error) });
  } finally {
    patch({ busy: false });
  }
}
export async function leaveAccount() {
  if (state().busy) return;
  patch({ busy: true });
  try {
    saveCache(state().owner, { ...cache, data: useUserStore.getState().dados });
    if (state().owner !== "local") {
      const { auth } = await client();
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      if (Capacitor.isNativePlatform()) {
        const { FirebaseAuthentication } =
          await import("@capacitor-firebase/authentication");
        await FirebaseAuthentication.signOut().catch(() => {});
      }
    }
    conflict = undefined;
    clearTimeout(timer);
    activate(
      "local",
      readCache("local") || {
        data: structuredClone(defaults),
        revision: 0,
        baseline: "",
      },
    );
  } catch (error) {
    patch({ message: errorMessage(error), status: "error" });
  } finally {
    patch({ busy: false });
  }
}

/** User-triggered only, after the confirmation in AccountPanel. */
export async function deleteLouriAccount() {
  if (state().busy || state().owner === "local") return;
  patch({ busy: true, message: "" });
  const uid = state().owner;
  deleting = true;
  generation++;
  clearTimeout(timer);
  try {
    await currentSync;
    const { auth, database } = await client();
    const {
      GoogleAuthProvider,
      reauthenticateWithCredential,
      reauthenticateWithPopup,
      deleteUser,
    } = await import("firebase/auth");
    const user = auth.currentUser;
    if (!user || user.uid !== uid)
      throw new Error("Entre novamente na sua conta para excluí-la.");
    const credential = await googleCredential();
    if (credential) await reauthenticateWithCredential(user, credential);
    else await reauthenticateWithPopup(user, new GoogleAuthProvider());
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(database, "users", uid, "state", "current"));
    await deleteUser(user);
    localStorage.removeItem(vaultKey(uid));
    localStorage.removeItem(`${vaultKey(uid)}:before-conflict`);
    conflict = undefined;
    activate(
      "local",
      readCache("local") || {
        data: structuredClone(defaults),
        revision: 0,
        baseline: "",
      },
    );
    if (Capacitor.isNativePlatform()) {
      const { FirebaseAuthentication } =
        await import("@capacitor-firebase/authentication");
      await FirebaseAuthentication.signOut().catch(() => {});
    }
  } catch (error) {
    patch({ status: "error", message: errorMessage(error) });
  } finally {
    deleting = false;
    patch({ busy: false });
  }
}

export function watchAccountConnection() {
  const refresh = () => {
    if (document.visibilityState === "visible") {
      retryAttempt = 0;
      void synchronizeAccount();
    }
  };
  window.addEventListener("online", refresh);
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  // Two tabs must never write different owners into the shared active-profile storage.
  const changed = (event: StorageEvent) => {
    if (event.key === ACTIVE && event.newValue !== state().owner)
      window.location.reload();
  };
  window.addEventListener("storage", changed);
  return () => {
    window.removeEventListener("online", refresh);
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refresh);
    window.removeEventListener("storage", changed);
  };
}
