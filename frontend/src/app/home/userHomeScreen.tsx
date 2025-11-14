import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Draggable,
  Droppable,
  DropProvider,
} from "react-native-reanimated-dnd";
import { Calendar } from "react-native-calendars";
import { useSelector } from "react-redux";
import CustomHeader from "../../components/CustomHeader";
import TicketCard from "../../components/TicketCard";
import {
  getMyTicketsService,
  updateTicketStatusService,
} from "../../services/ticketsService";
import { ticket as TicketType } from "../../types/apiServices";

type ColumnKey = "PENDING" | "IN_PROGRESS" | "COMPLETED";

const { width } = Dimensions.get("window");

const columnConfig = {
  PENDING: {
    title: "Pending",
    color: "#FFF4E6",
    iconColor: "#FF9500",
    borderColor: "#FFB84D",
  },
  IN_PROGRESS: {
    title: "In Progress",
    color: "#E6F3FF",
    iconColor: "#007AFF",
    borderColor: "#4DA6FF",
  },
  COMPLETED: {
    title: "Completed",
    color: "#E8F5E9",
    iconColor: "#34C759",
    borderColor: "#66D97C",
  },
};

const UserHomeScreen = () => {
  const userRole = useSelector((state: any) => state.auth.user?.role);
  const userId = useSelector((state: any) => state.auth.user?.id);

  const [tickets, setTickets] = useState<Record<ColumnKey, TicketType[]>>({
    PENDING: [],
    IN_PROGRESS: [],
    COMPLETED: [],
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
      };

      for (const t of ticketsData) {
        const rawStatus =
          t.overallStatus || t.assignments?.[0]?.status || "PENDING";
        const s = rawStatus.toUpperCase() as ColumnKey;
        if (!["PENDING", "IN_PROGRESS", "COMPLETED"].includes(s)) {
          grouped["PENDING"].push(t);
        } else {
          grouped[s].push(t);
        }
      }
      setTickets(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: ColumnKey) => {
    try {
      const payload = { ticketId, status: newStatus, userRole, userId };
      await updateTicketStatusService(payload);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrop = async (
    ticket: TicketType,
    from: ColumnKey,
    to: ColumnKey
  ) => {
    if (from === to) return;

    setTickets((prev) => {
      const updated = { ...prev };
      updated[from] = updated[from].filter((t) => t.id !== ticket.id);
      updated[to] = [
        ...updated[to],
        {
          ...ticket,
          overallStatus: to,
          assignments: [
            {
              ...ticket.assignments![0],
              status: to,
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      ];
      return updated;
    });

    await updateTicketStatus(ticket.id, to);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  };

  const allTickets = Object.values(tickets).flat();
  const totalTickets = allTickets.length;

  const markedDates = allTickets.reduce((acc, ticket) => {
    const formattedDate = formatDate(ticket.dueDate);
    if (formattedDate) {
      acc[formattedDate] = {
        marked: true,
        dotColor: "#007AFF",
        ...(selectedDate === formattedDate && {
          selected: true,
          selectedColor: "#007AFF",
        }),
      };
    }
    return acc;
  }, {} as Record<string, any>);

  const renderTicket = (ticket: TicketType, status: ColumnKey) => (
    <View
      style={[styles.card, { borderLeftColor: columnConfig[status].iconColor }]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: columnConfig[status].iconColor },
          ]}
        />
        <Text style={styles.cardTitle} numberOfLines={2}>
          {ticket.title}
        </Text>
      </View>
      <Text style={styles.cardDescription} numberOfLines={3}>
        {ticket.description}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.assigneeContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(ticket.assignments?.[0]?.user?.name?.[0] || "U").toUpperCase()}
            </Text>
          </View>
          <Text style={styles.assigneeText} numberOfLines={1}>
            {ticket.assignments?.[0]?.user?.name ?? "Unassigned"}
          </Text>
        </View>
        {ticket.dueDate && (
          <Text style={styles.dueDateText}>
            {new Date(ticket.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        )}
      </View>
      <View style={styles.dragHint}>
        <Text style={styles.dragHintText}>⋮⋮ Hold & drag to move</Text>
      </View>
    </View>
  );

  const renderColumn = (status: ColumnKey) => (
    <View key={status} style={styles.columnWrapper}>
      <View
        style={[
          styles.columnHeader,
          { backgroundColor: columnConfig[status].color },
        ]}
      >
        <View
          style={[
            styles.columnIcon,
            { backgroundColor: columnConfig[status].iconColor },
          ]}
        >
          <Text style={styles.columnCount}>{tickets[status]?.length}</Text>
        </View>
        <Text style={styles.columnTitle}>{columnConfig[status].title}</Text>
      </View>

      <Droppable
        droppableId={status}
        onDrop={(data: unknown) => {
          const t = data as TicketType;
          const from = (Object.keys(tickets) as ColumnKey[]).find((k) =>
            tickets[k].some((x) => x.id === t.id)
          ) as ColumnKey;
          handleDrop(t, from, status);
        }}
      >
        <View
          style={[
            styles.dropZone,
            { backgroundColor: columnConfig[status].color },
          ]}
        >
          <ScrollView
            style={styles.columnScroll}
            contentContainerStyle={styles.columnContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {tickets[status]?.map((t) => (
              <Draggable key={t.id} draggableId={t.id} data={t}>
                {renderTicket(t, status)}
              </Draggable>
            ))}
            {tickets[status]?.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tickets yet</Text>
                <Text style={styles.emptySubtext}>Drop tickets here</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Droppable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DropProvider>
        <SafeAreaView style={styles.container}>
          <CustomHeader title="Dashboard" />

          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Stats Overview */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalTickets}</Text>
                <Text style={styles.statLabel}>Total Tickets</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {tickets.IN_PROGRESS.length}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {tickets.COMPLETED.length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Calendar Section */}
              <View style={styles.calendarSection}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => setShowCalendar(!showCalendar)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionTitle}>📅 Calendar</Text>
                  <Text style={styles.toggleIcon}>
                    {showCalendar ? "▼" : "▶"}
                  </Text>
                </TouchableOpacity>

                {showCalendar && (
                  <View style={styles.calendarWrapper}>
                    <Calendar
                      markedDates={markedDates}
                      onDayPress={(day) => {
                        setSelectedDate(day.dateString);
                        setTimeout(() => {
                          scrollViewRef.current?.scrollTo({
                            y: 400,
                            animated: true,
                          });
                        }, 100);
                      }}
                      theme={{
                        selectedDayBackgroundColor: "#007AFF",
                        todayTextColor: "#007AFF",
                        arrowColor: "#007AFF",
                        dotColor: "#007AFF",
                        textDayFontWeight: "500",
                        textMonthFontWeight: "bold",
                        textMonthFontSize: 18,
                        monthTextColor: "#1C1C1E",
                      }}
                      style={styles.calendar}
                    />
                  </View>
                )}
              </View>

              {/* Selected Date Tickets */}
              {selectedDate && (
                <View style={styles.selectedDateSection}>
                  <View style={styles.selectedDateHeader}>
                    <Text style={styles.selectedDateTitle}>
                      📍 Tickets due on{" "}
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedDate("")}>
                      <Text style={styles.clearButton}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  {allTickets.filter(
                    (t) => formatDate(t.dueDate) === selectedDate
                  ).length > 0 ? (
                    <View style={styles.selectedTicketsList}>
                      {allTickets
                        .filter((t) => formatDate(t.dueDate) === selectedDate)
                        .map((t) => (
                          <TicketCard key={t.id} item={t} />
                        ))}
                    </View>
                  ) : (
                    <View style={styles.noTicketsContainer}>
                      <Text style={styles.noTicketsText}>
                        No tickets due on this day
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Kanban Board - Vertical Layout for Mobile */}
              <View style={styles.kanbanSection}>
                <Text style={styles.sectionTitle}>🎯 Workflow Board</Text>
                <Text style={styles.dragInstructions}>
                  Hold and drag tickets between columns to update status
                </Text>
                <View style={styles.kanbanContainer}>
                  {(Object.keys(columnConfig) as ColumnKey[]).map((status) =>
                    renderColumn(status)
                  )}
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </DropProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  calendarSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  toggleIcon: {
    fontSize: 16,
    color: "#8E8E93",
  },
  calendarWrapper: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  calendar: {
    borderRadius: 12,
  },
  selectedDateSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedDateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    flex: 1,
  },
  clearButton: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  selectedTicketsList: {
    gap: 12,
  },
  noTicketsContainer: {
    padding: 32,
    alignItems: "center",
  },
  noTicketsText: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
  },
  kanbanSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  dragInstructions: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  kanbanContainer: {
    gap: 16,
  },
  columnWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  columnHeader: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  columnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  columnCount: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    flex: 1,
  },
  dropZone: {
    minHeight: 120,
    paddingVertical: 8,
  },
  columnScroll: {
    maxHeight: 400,
  },
  columnContent: {
    padding: 12,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
    flex: 1,
  },
  cardDescription: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  assigneeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  assigneeText: {
    fontSize: 13,
    color: "#1C1C1E",
    fontWeight: "500",
    flex: 1,
  },
  dueDateText: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  dragHint: {
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  dragHintText: {
    fontSize: 11,
    color: "#C7C7CC",
    fontStyle: "italic",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#C7C7CC",
    textAlign: "center",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#E5E5EA",
    textAlign: "center",
    marginTop: 4,
  },
});

export default UserHomeScreen;
