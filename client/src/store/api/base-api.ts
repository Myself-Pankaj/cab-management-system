import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type BaseQueryApi,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { sessionAuthenticated, sessionEnded } from "../slices/session";
import { notifyApiResult } from "./notifications";

const fetchQuery = fetchBaseQuery({
  baseUrl: "/",
  credentials: "include",
  timeout: 15000,
});
const rawQuery: typeof fetchQuery = async (args, api, options) => {
  const result = await fetchQuery(args, api, options);
  if (!api.signal.aborted) {
    const path = (typeof args === "string" ? args : args.url).split(/[?#]/)[0];
    // Session recovery handles protected-request 401s without a toast.
    if (result.error?.status !== 401 || publicAuthPaths.has(path)) {
      notifyApiResult(
        result,
        path === "/api/v1/auth/refresh" ? "authControllerRefresh" : api.endpoint,
      );
    }
  }
  return result;
};
const publicAuthPaths = new Set([
  "/api/v1/auth/register",
  "/api/v1/auth/login",
  "/api/v1/auth/verify-otp",
  "/api/v1/auth/resend-otp",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
]);
type RefreshOutcome =
  | { kind: "success" }
  | { kind: "terminal" | "temporary"; error: FetchBaseQueryError };
type Coordination = {
  version: number;
  epoch: number;
  ended: boolean;
  refresh?: Promise<RefreshOutcome>;
  last?: RefreshOutcome;
  logout?: Promise<void>;
};
// A provider owns its coordinator; requests from another server render never share it.
const coordinators = new WeakMap<BaseQueryApi["dispatch"], Coordination>();
function coordinator(api: BaseQueryApi) {
  let value = coordinators.get(api.dispatch);
  if (!value) {
    value = { version: 0, epoch: 0, ended: false };
    coordinators.set(api.dispatch, value);
  }
  return value;
}
const unauthorized = (): FetchBaseQueryError => ({
  status: 401,
  data: { message: "Please log in to continue." },
});
function endSession(
  api: BaseQueryApi,
  state: Coordination,
  reason: "expired" | "logout",
) {
  state.ended = true;
  state.epoch++;
  state.version++;
  state.last = undefined;
  api.dispatch(sessionEnded(reason));
}

const baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, options) => {
  const path = (typeof args === "string" ? args : args.url).split(/[?#]/)[0];
  const state = coordinator(api);

  if (path === "/api/v1/auth/logout") {
    let release!: () => void;
    const previousLogout = state.logout;
    const completion = new Promise<void>((resolve) => {
      release = resolve;
    });
    state.logout = completion;
    state.epoch++;
    try {
      await previousLogout;
      await state.refresh;
      const result = await rawQuery(args, api, options);
      if (!result.error) endSession(api, state, "logout");
      return result;
    } finally {
      release();
      if (state.logout === completion) state.logout = undefined;
    }
  }

  if (
    publicAuthPaths.has(path) ||
    path === "/api/v1/auth/refresh" ||
    path === "/api/v1/health" ||
    path === "/api/v1/health/ready" ||
    path === "/api/v1/webhooks/razorpay"
  ) {
    if (path === "/api/v1/auth/login") {
      await state.logout;
      await state.refresh;
    }
    const result = await rawQuery(args, api, options);
    if (path === "/api/v1/auth/login" && !result.error) {
      state.epoch++;
      state.version++;
      state.ended = false;
      state.last = undefined;
    }
    return result;
  }

  if (state.logout || state.ended) return { error: unauthorized() };
  if (state.refresh) {
    const pending = await state.refresh;
    if (pending.kind !== "success") return { error: pending.error };
  }
  if (state.logout || state.ended) return { error: unauthorized() };
  const version = state.version;
  const epoch = state.epoch;
  let result = await rawQuery(args, api, options);
  // Never cache a response from a session which has since logged out or changed.
  if (epoch !== state.epoch) return { error: unauthorized() };
  if (result.error?.status === 401) {
    let outcome: RefreshOutcome;
    if (version !== state.version) {
      outcome = state.last ?? { kind: "terminal", error: unauthorized() };
    } else {
      if (!state.refresh) {
        state.refresh = (async (): Promise<RefreshOutcome> => {
          // One cancelled subscriber must not abort recovery for every request.
          const refresh = await rawQuery(
            { url: "/api/v1/auth/refresh", method: "POST" },
            { ...api, signal: new AbortController().signal },
            options,
          );
          if (state.epoch !== epoch)
            return { kind: "terminal", error: unauthorized() };
          if (!refresh.error) return { kind: "success" };
          if ([401, 403, 404].includes(Number(refresh.error.status))) {
            endSession(api, state, "expired");
            return { kind: "terminal", error: refresh.error };
          }
          return { kind: "temporary", error: refresh.error };
        })()
          .then((outcome) => {
            state.version++;
            state.last = outcome;
            return outcome;
          })
          .finally(() => {
            state.refresh = undefined;
          });
      }
      outcome = await state.refresh;
    }
    if (outcome.kind !== "success") return { error: outcome.error };
    if (state.logout || state.ended || epoch !== state.epoch)
      return { error: unauthorized() };
    result = await rawQuery(args, api, options);
    if (epoch !== state.epoch) return { error: unauthorized() };
    if (result.error?.status === 401) endSession(api, state, "expired");
  }
  if (!result.error && path === "/api/v1/auth/profile")
    api.dispatch(sessionAuthenticated());
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  endpoints: () => ({}),
});
