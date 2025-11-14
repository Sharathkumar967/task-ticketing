import { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DropProvider } from "react-native-reanimated-dnd";
import { useSelector } from "react-redux";
import CustomHeader from "../../components/CustomHeader";
import StatsOverview from "../../components/StatsOverview";
import CalendarSection from "../../components/CalendarSection";
import SelectedDateTickets from "../../components/SelectedDateTickets";
import KanbanBoard from "../../components/KanbanBoard";
import {
  getMyTicketsService,
  updateTicketStatusService,
} from "../../services/ticketsService";
import { ticket as TicketType } from "../../types/apiServices";
import styles from "./homeScreen.styles";
import { router } from "expo-router";

import { ColumnKey } from "../../types/components";

const UserHomeScreen = () => {
  const userRole = useSelector((state: any) => state.auth.user?.role);
  const userId = useSelector((state: any) => state.auth.user?.id);

  const [tickets, setTickets] = useState<Record<ColumnKey, TicketType[]>>({
    PENDING: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    CLOSED: [],
  });

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTickets();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getMyTicketsService();
      const ticketsData = res?.data?.data?.tickets || [];

      const grouped: Record<ColumnKey, TicketType[]> = {
        PENDING: [],
        IN_PROGRESS: [],
        COMPLETED: [],
        CLOSED: [], // added closed column
      };

      ticketsData.forEach((t: TicketType) => {
        const rawStatus =
          t.overallStatus || t.assignments?.[0]?.status || "PENDING";
        const s = rawStatus.toUpperCase() as ColumnKey;
        // If the status exists in grouped, push, else fallback to PENDING
        grouped[s in grouped ? s : "PENDING"].push(t);
      });

      setTickets(grouped);
    } catch (err) {
      console.error("[fetchTickets] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: ColumnKey) => {
    try {
      if (!userId) return console.warn("User ID not available");
      await updateTicketStatusService({
        ticketId,
        status: newStatus,
        userRole,
        userId,
      });
    } catch (err) {
      console.error("[updateTicketStatus] API error:", err);
      throw err;
    }
  };

  const handleDrop = async (
    ticket: TicketType,
    from: ColumnKey,
    to: ColumnKey
  ) => {
    if (from === to) return;
    const previousTickets = { ...tickets };
    setTickets((prev) => {
      const updated = { ...prev };
      updated[from] = updated[from].filter((t) => t.id !== ticket.id);
      updated[to] = [...updated[to], { ...ticket, overallStatus: to }];
      return updated;
    });
    try {
      await updateTicketStatus(ticket.id, to);
    } catch {
      setTickets(previousTickets);
    }
  };

  const allTickets = Object.values(tickets).flat();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DropProvider>
        <SafeAreaView style={styles.container}>
          <CustomHeader
            title="Dashboard"
            rightIcon="person-circle-outline"
            onRightPress={() => router.push("/(tabs)/Profile")}
            showBack={false}
          />
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <StatsOverview tickets={tickets} totalTickets={allTickets.length} />
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              <CalendarSection
                showCalendar={showCalendar}
                setShowCalendar={setShowCalendar}
                tickets={allTickets}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                scrollRef={scrollViewRef}
              />
              {selectedDate && (
                <SelectedDateTickets
                  tickets={allTickets}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              )}
              <KanbanBoard tickets={tickets} handleDrop={handleDrop} />
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </DropProvider>
    </GestureHandlerRootView>
  );
};

export default UserHomeScreen;
