import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDJgE7MWVoAmbPARI1TMtrNnfwATxyfj74",
  authDomain: "freedip-27d92.firebaseapp.com",
  projectId: "freedip-27d92",
  storageBucket: "freedip-27d92.firebasestorage.app",
  messagingSenderId: "2527270256",
  appId: "1:2527270256:web:61f43055f0907cd792abb5"
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;
let authInitialized = false;
let authInitPromise: Promise<Auth> | null = null;

// Функция для безопасной инициализации Firebase Auth
export const initializeAuth = async (): Promise<Auth> => {
  if (typeof window === "undefined") {
    throw new Error('Firebase Auth can only be initialized in the browser');
  }

  // Если уже инициализирован, возвращаем существующий
  if (auth && authInitialized) {
    return auth;
  }

  // Если уже идет инициализация, ждем ее
  if (authInitPromise) {
    return authInitPromise;
  }

  // Начинаем новую инициализацию
  authInitPromise = (async () => {
    try {
      // Инициализируем app если нужно
      if (!app) {
        if (!getApps().length) {
          app = initializeApp(firebaseConfig);
          console.log('[Firebase] App initialized');
        } else {
          app = getApps()[0];
          console.log('[Firebase] Using existing app');
        }
      }

      // Инициализируем auth
      if (!auth) {
        auth = getAuth(app);
        console.log('[Firebase] Auth initialized');
      }

      // Настраиваем persistence асинхронно, но не ждем завершения
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error('[Firebase] Error setting auth persistence:', error);
      });

      // Инициализируем другие сервисы
      if (!db) {
        db = getFirestore(app);
      }
      if (!storage) {
        storage = getStorage(app);
      }

      authInitialized = true;
      console.log('[Firebase] All services initialized');
      return auth;
    } catch (error) {
      console.error('[Firebase] Error initializing:', error);
      authInitPromise = null;
      throw error;
    }
  })();

  return authInitPromise;
};

// Инициализация при загрузке модуля (только на клиенте)
if (typeof window !== "undefined") {
  // Не инициализируем сразу, а только при первом использовании
  // Это предотвращает проблемы с SSR
}

export { app, db, auth, storage };

// Геттеры для обратной совместимости
export const getDb = () => {
  if (!db) {
    throw new Error('Firestore not initialized')
  }
  return db
}

export const getAuthInstance = () => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized')
  }
  return auth
}

export const getStorageInstance = () => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized')
  }
  return storage
}
