import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";

// Firebase client configuration is public. Access is controlled by Auth + Firestore rules.
const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: "AIzaSyDX4OkNjhVXvVCl1mQNndz5Z86YO8E_wqY",
      authDomain: "louri-fit-auth.firebaseapp.com",
      projectId: "louri-fit-auth",
      appId: "1:545572517246:web:72c1aff06e3f5d7f476f2f",
      messagingSenderId: "545572517246",
    });

export const auth = Capacitor.isNativePlatform()
  ? initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    })
  : getAuth(app);
export const database = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});
