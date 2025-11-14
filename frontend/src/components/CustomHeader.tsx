import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { customHeaderProps } from "../types/components";

const CustomHeader = ({
  title,
  rightIcon,
  onRightPress,
  leftIcon = "arrow-back",
  onLeftPress,
  style,
  showBack = true,
}: customHeaderProps) => {
  const router = useRouter();
  const defaultLeftPress = onLeftPress ?? (() => router.back());

  return (
    <View style={[styles.container, style]}>
      {showBack ? (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={defaultLeftPress}
          hitSlop={{
            top: 12,
            bottom: 12,
            left: 12,
            right: 12,
          }}
        >
          <Ionicons name={leftIcon} size={24} color="#0052CC" />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {rightIcon ? (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onRightPress}
          hitSlop={{
            top: 12,
            bottom: 12,
            left: 12,
            right: 12,
          }}
        >
          <Ionicons name={rightIcon} size={24} color="#0052CC" />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  iconBtn: { padding: 8 },
  title: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 20,
    fontWeight: "bold",
    color: "#0052CC",
    textAlign: "center",
  },
  spacer: { width: 40 },
});
