import { bookingReducer } from "./slices/booking";
import { configureStore, type Middleware } from "@reduxjs/toolkit";
import { baseApi } from "./api/base-api";
import { api } from "./api/enhanced-api";
import {
  sessionAuthenticated,
  sessionEnded,
  sessionReducer,
} from "./slices/session";

const clearSessionCache: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  // Reset successful auth mutations after fulfillment, otherwise RTK Query
  // aborts the still-pending login/logout and unwrap() rejects a successful call.
  if (
    (sessionEnded.match(action) && action.payload === "expired") ||
    api.endpoints.authControllerLogin.matchFulfilled(action) ||
    api.endpoints.authControllerLogout.matchFulfilled(action)
  )
    store.dispatch(baseApi.util.resetApiState());
  if (api.endpoints.authControllerLogin.matchFulfilled(action)) {
    store.dispatch(sessionAuthenticated());
  }
  return result;
};

export function makeStore() {
  return configureStore({
    reducer: {
      session: sessionReducer,
      booking: bookingReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(clearSessionCache, baseApi.middleware),
    // Credentials only travel in requests; do not retain them in DevTools history.
    devTools: false,
  });
}
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
