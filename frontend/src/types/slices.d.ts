export interface ViewAsUserState {
  isViewingAsUser: boolean;
  originalUser: userResponse | null;
  currentUser: userResponse | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: userResponse | null;
  isRefreshing: boolean;
  viewAsUser: ViewAsUserState;
}
