import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import postSlice from "./postSlice";
import notificationSlice from "./notificationSlice";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' 
  ? createWebStorage('local')
  : createNoopStorage();

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth", "notifications"],
};

const rootReducer = combineReducers({
  auth: authSlice,
  posts: postSlice,
  notifications: notificationSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
});

  export type RootState = ReturnType<typeof store.getState>;
  export type AppDispatch = typeof store.dispatch;

  export default store;
