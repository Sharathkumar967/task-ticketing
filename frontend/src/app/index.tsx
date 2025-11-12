import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { secureStore } from "../utils/secureStore";
import { getUserProfileService } from "../services/authService";
import { login, logout } from "../redux/authSlice";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants/secureStoreKeys";

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await secureStore.getItem(ACCESS_TOKEN);

        if (!token) {
          router.replace("/(auth)");
          return;
        }

        const response = await getUserProfileService();

        if (response?.data) {
          dispatch(login({ user: response.data }));
          router.replace("/(tabs)/Home");
        } else {
          throw new Error("Invalid user data");
        }
      } catch (error: any) {
        console.log(
          "Splash Auth Check Failed:",
          error?.response?.data || error
        );

        await secureStore.removeItem(ACCESS_TOKEN);
        await secureStore.removeItem(REFRESH_TOKEN);
        dispatch(logout());
        router.replace("/(auth)");
      }
    };

    const timer = setTimeout(checkAuth, 2000);
    return () => clearTimeout(timer);
  }, [dispatch, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>TaskFlow</Text>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0052CC",
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
});
