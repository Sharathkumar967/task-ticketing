import { Provider } from "react-redux";
import { store } from "../redux/store";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import SessionOverlay from "../components/SessionOverlay";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
          <SessionOverlay />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
