import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { formatDate } from "../utils/generalUtils";
import { ticket } from "../types/apiServices";

const Ticket = ({
  item,
  hideStatus,
}: {
  item: ticket;
  hideStatus?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.card]}
    activeOpacity={0.8}
    onPress={() =>
      router.push({
        pathname: "/tickets/TicketDetails",
        params: { ticketId: item.id },
      })
    }
  >
    <View style={styles.ticketHeader}>
      <View style={styles.titleRow}>
        <Text style={[styles.title]} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </View>

    <Text style={[styles.description]} numberOfLines={2}>
      {item.description}
    </Text>

    {!hideStatus && item.dueDate && (
      <View style={styles.metadata}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color="#777" />
          <Text style={[styles.metaText]}>{formatDate(item.dueDate)}</Text>
        </View>

        {item.overallStatus && (
          <View style={styles.metaRow}>
            <View
              style={[styles.priorityDot, { backgroundColor: "#27ae60" }]}
            />
            <Text style={[styles.metaText]}>{item.overallStatus}</Text>
          </View>
        )}
      </View>
    )}
  </TouchableOpacity>
);

export default Ticket;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    color: "#222",
  },

  statusContainer: {
    marginLeft: 10,
  },

  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },

  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#777",
    marginLeft: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
