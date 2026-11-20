import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type SessionState = {
  status: "unknown" | "authenticated" | "anonymous";
  reason: "expired" | "logout" | null;
};
const initialState: SessionState = { status: "unknown", reason: null };
const slice = createSlice({
  name: "session",
  initialState,
  reducers: {
    sessionAuthenticated(state) {
      state.status = "authenticated";
      state.reason = null;
    },
    sessionEnded(state, action: PayloadAction<"expired" | "logout">) {
      const wasAuthenticated = state.status === "authenticated";
      state.status = "anonymous";
      state.reason =
        action.payload === "expired" && !wasAuthenticated
          ? null
          : action.payload;
    },
  },
});
export const { sessionAuthenticated, sessionEnded } = slice.actions;
export const sessionReducer = slice.reducer;
