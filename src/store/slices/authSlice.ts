import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "../../types";
import { authAPI } from "../../api/auth.api";
import { storage } from "../../utils/storage";
import { getFCMToken } from "../../utils/notifications";

/** Registers FCM token with the backend — fire-and-forget */
const syncFCMToken = async () => {
  try {
    const token = await getFCMToken();
    if (token) await authAPI.updateFCMToken(token);
  } catch {
    // Non-fatal — token will be updated on next login
  }
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async (
    credentials: { mobile: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await authAPI.adminLogin(credentials);
      const payload = res.data.data!;
      await storage.setTokens(payload.accessToken, payload.refreshToken);
      syncFCMToken(); // fire-and-forget
      return payload;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? "Login failed");
    }
  },
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (payload: { mobile: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await authAPI.verifyOTP(payload);
      const data = res.data.data!;
      await storage.setTokens(data.accessToken, data.refreshToken);
      syncFCMToken(); // fire-and-forget
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message ?? "OTP verification failed",
      );
    }
  },
);

export const restoreAuth = createAsyncThunk(
  "auth/restore",
  async (_, { rejectWithValue }) => {
    try {
      const tokens = await storage.getTokens();
      if (!tokens) return rejectWithValue("No stored tokens");
      const res = await authAPI.getMe();
      return { user: res.data.data!, ...tokens };
    } catch {
      await storage.clearTokens();
      return rejectWithValue("Session expired");
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await storage.clearTokens();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(adminLogin.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, initialState);
      });
  },
});

export const { setUser, setTokens } = authSlice.actions;
export default authSlice.reducer;
