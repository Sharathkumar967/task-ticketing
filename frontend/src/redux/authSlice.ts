import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { userResponse } from "../types/apiServices";

interface ViewAsUserState {
  isViewingAsUser: boolean;
  originalUser: userResponse | null;
  currentUser: userResponse | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: userResponse | null;
  isRefreshing: boolean;
  viewAsUser: ViewAsUserState;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isRefreshing: false,
  viewAsUser: {
    isViewingAsUser: false,
    originalUser: null,
    currentUser: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: userResponse | null }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;

      // Save original user if not already set (first login)
      if (!state.viewAsUser.originalUser) {
        state.viewAsUser.originalUser = action.payload.user;
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.viewAsUser = {
        isViewingAsUser: false,
        originalUser: null,
        currentUser: null,
      };
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    switchToUserView: (state, action: PayloadAction<userResponse>) => {
      if (state.user?.role === "ADMIN") {
        state.viewAsUser = {
          ...state.viewAsUser,
          isViewingAsUser: true,
          currentUser: action.payload,
        };
        state.user = action.payload;
      }
    },
    switchBackToAdmin: (state) => {
      if (state.viewAsUser.originalUser) {
        state.user = state.viewAsUser.originalUser;
        state.viewAsUser = {
          ...state.viewAsUser,
          isViewingAsUser: false,
          currentUser: null,
        };
      }
    },
  },
});

export const {
  login,
  logout,
  setRefreshing,
  switchToUserView,
  switchBackToAdmin,
} = authSlice.actions;
export default authSlice.reducer;
