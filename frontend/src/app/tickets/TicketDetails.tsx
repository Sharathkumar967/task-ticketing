import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import styles from "./tickets.styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatDateTime } from "../../utils/generalUtils";
import { ticket } from "../../types/apiServices";
import {
  updateTicketStatusService,
  getTicketDetailsByIdService,
} from "../../services/ticketsService";
import { useSelector } from "react-redux";
import CustomHeader from "../../components/CustomHeader";
import { RootState } from "../../redux/store";

const TicketDetailsScreen = () => {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const router = useRouter();

  const [ticket, setTicket] = useState<ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isAdmin = useSelector(
    (state: RootState) => state.auth.user?.role === "ADMIN"
  );

  const getTicketDetails = useCallback(async () => {
    if (!ticketId) {
      Alert.alert("Error", "Ticket ID missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getTicketDetailsByIdService(ticketId);
      if (res?.data?.status === 200) {
        setTicket(res.data.data);
      } else {
        Alert.alert("Error", "Unexpected response format");
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useFocusEffect(
    useCallback(() => {
      getTicketDetails();
    }, [getTicketDetails])
  );

  const updateStatus = async (newStatus: string) => {
    if (!ticketId || !ticket) return;

    setUpdating(true);
    try {
      const res = await updateTicketStatusService({
        ticketId,
        status: newStatus,
        userRole: "ADMIN",
      });

      if (res.data.data && res.data.message) {
        setTicket({ ...ticket, overallStatus: res.data.data.overallStatus });

        Alert.alert("Success", res.data.message);
      } else {
        Alert.alert("Error", "Unexpected response format");
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Ticket not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Ticket Details"
        {...(isAdmin && {
          rightIcon: "create-outline",
          onRightPress: () =>
            router.push({
              pathname: "/tickets/CreateTicketScreen",
              params: { mode: "edit", ticketData: JSON.stringify(ticket) },
            }),
        })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isAdmin && (
          <TouchableOpacity
            style={[
              styles.statusButton,
              ticket.overallStatus === "CLOSED"
                ? styles.statusButtonClosed
                : styles.statusButtonOpen,
            ]}
            onPress={() =>
              updateStatus(
                ticket.overallStatus === "CLOSED" ? "OPEN" : "CLOSED"
              )
            }
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.statusButtonText}>
                {ticket.overallStatus === "CLOSED" ? "Reopen" : "Close"} Ticket
              </Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.title}>{ticket.title}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{ticket.overallStatus}</Text>
          </View>
        </View>

        {ticket.description && (
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.description}>{ticket.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.value}>{formatDateTime(ticket.dueDate)}</Text>

          <Text style={[styles.label, { marginTop: 12 }]}>Created</Text>
          <Text style={styles.value}>{formatDateTime(ticket.createdAt)}</Text>

          <Text style={[styles.label, { marginTop: 12 }]}>Last Updated</Text>
          <Text style={styles.value}>{formatDateTime(ticket.updatedAt)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Created by</Text>
          <View style={styles.userRow}>
            <Ionicons name="person-circle-outline" size={20} color="#555" />
            <Text style={styles.userName}>{ticket.creator?.name}</Text>
          </View>
          <Text style={styles.userEmail}>{ticket.creator?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Assignees ({ticket.assignments?.length})
          </Text>
          {ticket.assignments?.map((a) => (
            <View key={a.id} style={styles.assigneeCard}>
              <View style={styles.assigneeHeader}>
                <Ionicons name="person-outline" size={18} color="#0052CC" />
                <Text style={styles.assigneeName}>{a.user.name}</Text>
                <View style={styles.assigneeStatus}>
                  <Text style={styles.assigneeStatusText}>{a.status}</Text>
                </View>
              </View>
              <Text style={styles.assigneeEmail}>{a.user.email}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TicketDetailsScreen;
