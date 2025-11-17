import React from "react";
import { View, Text, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function SessionOverlay() {
  const isRefreshing = useSelector(
    (state: RootState) => state.auth.isRefreshing
  );

  if (!isRefreshing) return null;

  return (
    <Modal visible={isRefreshing} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.text}>Refreshing session...</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: 220,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#0052CC",
    fontWeight: "500",
  },
});
