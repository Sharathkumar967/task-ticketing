import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import { secureStore } from "../utils/secureStore";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants/secureStoreKeys";
import {
  getUserProfileService,
  loginService,
  registerService,
} from "../services/authService";

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");

  const switchTab = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setName("");
    setEmail("");
    setPassword("");
    setSelectedRole("USER");
  };

  const saveTokensAndNavigate = async (
    accessToken: string,
    refreshToken: string
  ) => {
    await secureStore.setItem(ACCESS_TOKEN, accessToken);
    await secureStore.setItem(REFRESH_TOKEN, refreshToken);

    const userProfile = await getUserProfileService();
    dispatch(login({ user: userProfile.data }));

    router.replace("/(tabs)/Home");
  };

  const handleLogin = async () => {
    const payload = { email, password };

    try {
      const response = await loginService(payload);

      if (response.data.status === 200) {
        Alert.alert(response.data.message);

        const accessToken = response.data.accessToken;
        const refreshToken = response.data.refreshToken;

        if (accessToken && refreshToken) {
          await saveTokensAndNavigate(accessToken, refreshToken);
        }
      }
    } catch (error: any) {
      Alert.alert(error?.response?.data?.message || "Login failed");
      console.log(error);
    }
  };

  const handleRegister = async () => {
    const payload = { name, email, password, role: selectedRole };

    try {
      const response = await registerService(payload);

      if (response.data.status === 200) {
        Alert.alert(response.data.message);

        const accessToken = response.data.accessToken;
        const refreshToken = response.data.refreshToken;

        if (accessToken && refreshToken) {
          await saveTokensAndNavigate(accessToken, refreshToken); // 🔥 auto login
        }
      }
    } catch (error: any) {
      Alert.alert(error?.response?.data?.message || "Registration failed");
      console.log(error);
    }
  };

  return {
    isLogin,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    selectedRole,
    setSelectedRole,
    switchTab,
    handleLogin,
    handleRegister,
  };
};
