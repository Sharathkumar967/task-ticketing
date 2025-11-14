import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { UserItemProps } from "../types/components";

const UserItem = ({ user, onPress }: UserItemProps) => {
  const isAdmin = user.role === "ADMIN";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.name?.trim()?.charAt(0)?.toUpperCase() || "?"}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{user.name.trim()}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View
        style={[
          styles.roleBadge,
          isAdmin ? styles.adminBadge : styles.userBadge,
        ]}
      >
        <Text style={[styles.roleText, isAdmin && styles.adminText]}>
          {isAdmin ? "ADMIN" : "USER"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default UserItem;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  userBadge: {
    backgroundColor: "#e0e0e0",
  },
  adminBadge: {
    backgroundColor: "#ff3b30",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#555",
  },
  adminText: {
    color: "#fff",
  },
});
