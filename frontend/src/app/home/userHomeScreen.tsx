// import React, { useEffect, useState, useRef } from "react";
// import {
//   Text,
//   View,
//   ActivityIndicator,
//   ScrollView,
//   Animated,
//   TouchableOpacity,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import {
//   Draggable,
//   Droppable,
//   DropProvider,
// } from "react-native-reanimated-dnd";
// import { Calendar } from "react-native-calendars";
// import { useSelector } from "react-redux";
// import CustomHeader from "../../components/CustomHeader";
// import TicketCard from "../../components/TicketCard";
// import {
//   getMyTicketsService,
//   updateTicketStatusService,
// } from "../../services/ticketsService";
// import { ticket as TicketType } from "../../types/apiServices";
// import styles from "./homeScreen.styles";
// import { router } from "expo-router";
// import { formatDateForApi } from "../../utils/generalUtils";

// type ColumnKey = "PENDING" | "IN_PROGRESS" | "COMPLETED";

// const columnConfig = {
//   PENDING: {
//     title: "Pending",
//     color: "#FFF4E6",
//     iconColor: "#FF9500",
//     borderColor: "#FFB84D",
//   },
//   IN_PROGRESS: {
//     title: "In Progress",
//     color: "#E6F3FF",
//     iconColor: "#007AFF",
//     borderColor: "#4DA6FF",
//   },
//   COMPLETED: {
//     title: "Completed",
//     color: "#E8F5E9",
//     iconColor: "#34C759",
//     borderColor: "#66D97C",
//   },
// };

// const UserHomeScreen = () => {
//   const userRole = useSelector((state: any) => state.auth.user?.role);
//   const userId = useSelector((state: any) => state.auth.user?.id);

//   const [tickets, setTickets] = useState<Record<ColumnKey, TicketType[]>>({
//     PENDING: [],
//     IN_PROGRESS: [],
//     COMPLETED: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState<string>("");
//   const [showCalendar, setShowCalendar] = useState(true);

//   const scrollViewRef = useRef<ScrollView>(null);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     fetchTickets();
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 600,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   /** FETCH TICKETS */
//   const fetchTickets = async () => {
//     setLoading(true);
//     try {
//       const res = await getMyTicketsService();
//       const ticketsData = res?.data?.data?.tickets || [];

//       const grouped: Record<ColumnKey, TicketType[]> = {
//         PENDING: [],
//         IN_PROGRESS: [],
//         COMPLETED: [],
//       };

//       for (const t of ticketsData) {
//         const rawStatus =
//           t.overallStatus || t.assignments?.[0]?.status || "PENDING";
//         const s = rawStatus.toUpperCase() as ColumnKey;
//         if (!["PENDING", "IN_PROGRESS", "COMPLETED"].includes(s)) {
//           grouped["PENDING"].push(t);
//         } else {
//           grouped[s].push(t);
//         }
//       }
//       setTickets(grouped);
//     } catch (err) {
//       console.error("[fetchTickets] Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /** UPDATE TICKET STATUS */
//   const updateTicketStatus = async (ticketId: string, newStatus: ColumnKey) => {
//     try {
//       if (!userId) {
//         console.warn("User ID not available");
//         return;
//       }

//       const payload = { ticketId, status: newStatus, userRole, userId };
//       console.log("Updating ticket status with payload:", payload);

//       const response = await updateTicketStatusService(payload);
//       console.log("Update API response:", response?.data);

//       if (!response?.data?.data) {
//         console.warn("Update may not have succeeded:", response?.data?.message);
//       }
//     } catch (err) {
//       console.error("[updateTicketStatus] API error:", err);
//       throw err;
//     }
//   };

//   const handleDrop = async (
//     ticket: TicketType,
//     from: ColumnKey,
//     to: ColumnKey
//   ) => {
//     if (from === to) return;

//     const previousTickets = { ...tickets };

//     setTickets((prev) => {
//       const updated = { ...prev };
//       updated[from] = updated[from].filter((t) => t.id !== ticket.id);
//       updated[to] = [
//         ...updated[to],
//         {
//           ...ticket,
//           overallStatus: to,
//           assignments: [
//             {
//               ...ticket.assignments![0],
//               status: to,
//               updatedAt: new Date().toISOString(),
//             },
//           ],
//         },
//       ];
//       return updated;
//     });

//     try {
//       await updateTicketStatus(ticket.id, to);
//     } catch (err) {
//       console.warn("Reverting UI due to API failure");
//       setTickets(previousTickets);
//     }
//   };

//   const allTickets = Object.values(tickets).flat();
//   const totalTickets = allTickets.length;

//   const markedDates = allTickets.reduce((acc, ticket) => {
//     const formattedDate = formatDateForApi(ticket.dueDate);
//     if (formattedDate) {
//       acc[formattedDate] = {
//         marked: true,
//         dotColor: "#007AFF",
//         ...(selectedDate === formattedDate && {
//           selected: true,
//           selectedColor: "#007AFF",
//         }),
//       };
//     }
//     return acc;
//   }, {} as Record<string, any>);

//   const renderTicket = (ticket: TicketType, status: ColumnKey) => (
//     <View
//       style={[styles.card, { borderLeftColor: columnConfig[status].iconColor }]}
//     >
//       <View style={styles.cardHeader}>
//         <View
//           style={[
//             styles.statusDot,
//             { backgroundColor: columnConfig[status].iconColor },
//           ]}
//         />
//         <Text style={styles.cardTitle} numberOfLines={2}>
//           {ticket.title}
//         </Text>
//       </View>
//       <Text style={styles.cardDescription} numberOfLines={3}>
//         {ticket.description}
//       </Text>
//       <View style={styles.cardFooter}>
//         <View style={styles.assigneeContainer}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>
//               {(ticket.assignments?.[0]?.user?.name?.[0] || "U").toUpperCase()}
//             </Text>
//           </View>
//           <Text style={styles.assigneeText} numberOfLines={1}>
//             {ticket.assignments?.[0]?.user?.name ?? "Unassigned"}
//           </Text>
//         </View>
//         {ticket.dueDate && (
//           <Text style={styles.dueDateText}>
//             {new Date(ticket.dueDate).toLocaleDateString("en-US", {
//               month: "short",
//               day: "numeric",
//             })}
//           </Text>
//         )}
//       </View>
//       <View style={styles.dragHint}>
//         <Text style={styles.dragHintText}>⋮⋮ Hold & drag to move</Text>
//       </View>
//     </View>
//   );

//   const renderColumn = (status: ColumnKey) => (
//     <View key={status} style={styles.columnWrapper}>
//       <View
//         style={[
//           styles.columnHeader,
//           { backgroundColor: columnConfig[status].color },
//         ]}
//       >
//         <View
//           style={[
//             styles.columnIcon,
//             { backgroundColor: columnConfig[status].iconColor },
//           ]}
//         >
//           <Text style={styles.columnCount}>{tickets[status]?.length}</Text>
//         </View>
//         <Text style={styles.columnTitle}>{columnConfig[status].title}</Text>
//       </View>

//       <Droppable
//         droppableId={status}
//         onDrop={(data: unknown) => {
//           const t = data as TicketType;
//           const from = (Object.keys(tickets) as ColumnKey[]).find((k) =>
//             tickets[k].some((x) => x.id === t.id)
//           ) as ColumnKey;
//           handleDrop(t, from, status);
//         }}
//       >
//         <View
//           style={[
//             styles.dropZone,
//             { backgroundColor: columnConfig[status].color },
//           ]}
//         >
//           <ScrollView
//             style={styles.columnScroll}
//             contentContainerStyle={styles.columnContent}
//             showsVerticalScrollIndicator={false}
//             nestedScrollEnabled={true}
//           >
//             {tickets[status]?.map((t) => (
//               <Draggable key={t.id} draggableId={t.id} data={t}>
//                 {renderTicket(t, status)}
//               </Draggable>
//             ))}
//             {tickets[status]?.length === 0 && (
//               <View style={styles.emptyContainer}>
//                 <Text style={styles.emptyText}>No tickets yet</Text>
//                 <Text style={styles.emptySubtext}>Drop tickets here</Text>
//               </View>
//             )}
//           </ScrollView>
//         </View>
//       </Droppable>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={styles.loadingText}>Loading your dashboard...</Text>
//       </View>
//     );
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <DropProvider>
//         <SafeAreaView style={styles.container}>
//           <CustomHeader
//             title="Dashboard"
//             rightIcon="person-circle-outline"
//             onRightPress={() => router.push("/(tabs)/Profile")}
//             showBack={false}
//           />

//           <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
//             {/* Stats Overview */}
//             <View style={styles.statsContainer}>
//               <View style={styles.statCard}>
//                 <Text style={styles.statNumber}>{totalTickets}</Text>
//                 <Text style={styles.statLabel}>Total Tickets</Text>
//               </View>
//               <View style={styles.statCard}>
//                 <Text style={styles.statNumber}>
//                   {tickets.IN_PROGRESS.length}
//                 </Text>
//                 <Text style={styles.statLabel}>Active</Text>
//               </View>
//               <View style={styles.statCard}>
//                 <Text style={styles.statNumber}>
//                   {tickets.COMPLETED.length}
//                 </Text>
//                 <Text style={styles.statLabel}>Completed</Text>
//               </View>
//             </View>

//             <ScrollView
//               ref={scrollViewRef}
//               style={styles.scrollView}
//               contentContainerStyle={styles.scrollContent}
//               showsVerticalScrollIndicator={false}
//             >
//               {/* Calendar Section */}
//               <View style={styles.calendarSection}>
//                 <TouchableOpacity
//                   style={styles.sectionHeader}
//                   onPress={() => setShowCalendar(!showCalendar)}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={styles.sectionTitle}>Calendar</Text>
//                   <Text style={styles.toggleIcon}>
//                     {showCalendar ? "▼" : "▶"}
//                   </Text>
//                 </TouchableOpacity>

//                 {showCalendar && (
//                   <View style={styles.calendarWrapper}>
//                     <Calendar
//                       markedDates={markedDates}
//                       onDayPress={(day) => {
//                         setSelectedDate(day.dateString);
//                         setTimeout(() => {
//                           scrollViewRef.current?.scrollTo({
//                             y: 400,
//                             animated: true,
//                           });
//                         }, 100);
//                       }}
//                       theme={{
//                         selectedDayBackgroundColor: "#007AFF",
//                         todayTextColor: "#007AFF",
//                         arrowColor: "#007AFF",
//                         dotColor: "#007AFF",
//                         textDayFontWeight: "500",
//                         textMonthFontWeight: "bold",
//                         textMonthFontSize: 18,
//                         monthTextColor: "#1C1C1E",
//                       }}
//                       style={styles.calendar}
//                     />
//                   </View>
//                 )}
//               </View>

//               {/* Selected Date Tickets */}
//               {selectedDate && (
//                 <View style={styles.selectedDateSection}>
//                   <View style={styles.selectedDateHeader}>
//                     <Text style={styles.selectedDateTitle}>
//                       Tickets due on{" "}
//                       {new Date(selectedDate).toLocaleDateString("en-US", {
//                         month: "long",
//                         day: "numeric",
//                         year: "numeric",
//                       })}
//                     </Text>
//                     <TouchableOpacity onPress={() => setSelectedDate("")}>
//                       <Text style={styles.clearButton}>Clear</Text>
//                     </TouchableOpacity>
//                   </View>
//                   {allTickets.filter(
//                     (t) => formatDateForApi(t.dueDate) === selectedDate
//                   ).length > 0 ? (
//                     <View style={styles.selectedTicketsList}>
//                       {allTickets
//                         .filter(
//                           (t) => formatDateForApi(t.dueDate) === selectedDate
//                         )
//                         .map((t) => (
//                           <TicketCard key={t.id} item={t} />
//                         ))}
//                     </View>
//                   ) : (
//                     <View style={styles.noTicketsContainer}>
//                       <Text style={styles.noTicketsText}>
//                         No tickets due on this day
//                       </Text>
//                     </View>
//                   )}
//                 </View>
//               )}

//               {/* Kanban Board - Vertical Layout for Mobile */}
//               <View style={styles.kanbanSection}>
//                 <Text style={styles.sectionTitle}>Workflow Board</Text>
//                 <Text style={styles.dragInstructions}>
//                   Hold and drag tickets between columns to update status
//                 </Text>
//                 <View style={styles.kanbanContainer}>
//                   {(Object.keys(columnConfig) as ColumnKey[]).map((status) =>
//                     renderColumn(status)
//                   )}
//                 </View>
//               </View>
//             </ScrollView>
//           </Animated.View>
//         </SafeAreaView>
//       </DropProvider>
//     </GestureHandlerRootView>
//   );
// };

// export default UserHomeScreen;

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
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
import { formatDateForApi } from "../../utils/generalUtils";

export type ColumnKey = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export const columnConfig = {
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
      ticketsData.forEach((t: TicketType) => {
        const rawStatus =
          t.overallStatus || t.assignments?.[0]?.status || "PENDING";
        const s = rawStatus.toUpperCase() as ColumnKey;
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
