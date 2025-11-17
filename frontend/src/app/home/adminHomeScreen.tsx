import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllTicketsService } from "../../services/ticketsService";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../../components/CustomHeader";
import TicketCard from "../../components/TicketCard";
import { ticket } from "../../types/apiServices";

const AdminHomeScreen = ({ refresh }: { refresh?: string }) => {
  const [tickets, setTickets] = useState<ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getAllTickets = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllTicketsService();
      const { tickets: ticketList } = response.data.data;
      setTickets(ticketList || []);
    } catch (error: any) {
      console.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllTickets();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (refresh === "true") {
        getAllTickets();
        router.setParams({ refresh: undefined });
      }
    }, [refresh, getAllTickets])
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Dashboard"
        rightIcon="person-circle-outline"
        onRightPress={() => router.push("/(tabs)/Profile")}
        showBack={false}
      />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0052CC" />
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="documents-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No tickets available</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TicketCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/tickets/CreateTicketScreen")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#777",
    marginTop: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 100,
    marginTop: 20,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#0052CC",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
});
