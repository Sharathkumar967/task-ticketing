import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  switchToUserView,
  switchBackToAdmin,
} from "../../redux/authSlice";
import { secureStore } from "../../utils/secureStore";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants/secureStoreKeys";
import { useRouter } from "expo-router";
import CustomHeader from "../../components/CustomHeader";
import { RootState } from "../../redux/store";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const viewAsUser = useSelector((state: RootState) => state.auth.viewAsUser);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await secureStore.removeItem(ACCESS_TOKEN);
          await secureStore.removeItem(REFRESH_TOKEN);
          dispatch(logout());
          router.replace("/(auth)");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  const handleRoleSwitch = () => {
    if (viewAsUser.isViewingAsUser) {
      dispatch(switchBackToAdmin());
    } else {
      const userView = { ...user, role: "USER" };
      dispatch(switchToUserView(userView));
    }
  };

  const firstLoginRole = viewAsUser.originalUser?.role || user.role;
  const showRoleSwitchToggle = firstLoginRole === "ADMIN";

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Profile" />

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user.role}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Joined On</Text>
            <Text style={styles.value}>
              {new Date(user?.createdAt).toLocaleDateString("en-GB")}
            </Text>
          </View>

          {showRoleSwitchToggle && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>Switch Role</Text>
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={handleRoleSwitch}
                >
                  <Text style={styles.switchButtonText}>
                    {viewAsUser.isViewingAsUser ? "Admin View" : "User View"}
                  </Text>
                </TouchableOpacity>
              </View>
              {viewAsUser.isViewingAsUser && (
                <Text style={styles.badge}>Viewing as USER</Text>
              )}
            </>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F6FF",
  },
  loadingText: { color: "#777", fontSize: 18 },
  profileCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginTop: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarContainer: { marginBottom: 20 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E6EEFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0052CC",
    shadowColor: "#0052CC",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    color: "#0052CC",
    fontWeight: "800",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
    marginBottom: 20,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#F7FAFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: {
    color: "#777",
    fontSize: 16,
    fontWeight: "500",
  },
  value: {
    color: "#0052CC",
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E9F2",
    marginVertical: 5,
  },
  switchButton: {
    backgroundColor: "#0052CC",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 8,
  },
  switchButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  badge: {
    marginTop: 5,
    color: "#FF0000",
    fontWeight: "600",
    alignSelf: "center",
  },
  logoutButton: {
    width: "90%",
    marginTop: 40,
    backgroundColor: "#0052CC",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#0052CC",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
