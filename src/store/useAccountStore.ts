import { create } from "zustand";

export type SyncStatus =
  | "local"
  | "loading"
  | "saved"
  | "pending"
  | "offline"
  | "error"
  | "conflict";
interface AccountState {
  ready: boolean;
  busy: boolean;
  owner: string;
  email: string;
  status: SyncStatus;
  message: string;
  lastSync: number | null;
}
export const useAccountStore = create<AccountState>(() => ({
  ready: false,
  busy: false,
  owner: "local",
  email: "",
  status: "local",
  message: "",
  lastSync: null,
}));
