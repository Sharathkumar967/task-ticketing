// import React, { useState } from "react";
// import { View, Text, FlatList, ScrollView, StyleSheet, RefreshControl } from "react-native";
// import { Draggable, Droppable } from "react-native-reanimated-dnd";

// // ✅ Define allowed statuses
// type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED";

// interface Ticket {
//   id: number;
//   title: string;
// }

// type StatusTickets = Record<Status, Ticket[]>;

// const UserHomeScreen = () => {
//   const [selectedDate] = useState("11 Nov 2025");
//   const [refreshing, setRefreshing] = useState(false);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     // Simulate network request
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     setRefreshing(false);
//   };

//   // ✅ Typed state
//   const [statusTickets, setStatusTickets] = useState<StatusTickets>({
//     PENDING: [
//       { id: 1, title: "Fix login bug" },
//       { id: 2, title: "Update UI colors" },
//     ],
//     IN_PROGRESS: [
//       { id: 3, title: "Add payment gateway" },
//       { id: 4, title: "Improve performance" },
//     ],
//     COMPLETED: [{ id: 5, title: "Setup CI/CD pipeline" }],
//   });

//   // ✅ Properly typed status change handler
//   const handleStatusChange = (data: Ticket, newStatus: Status) => {
//     const movedTicket = data;

//     const updated: StatusTickets = {
//       PENDING: [],
//       IN_PROGRESS: [],
//       COMPLETED: [],
//     };

//     // Remove ticket from all lists
//     (Object.keys(statusTickets) as Status[]).forEach((key) => {
//       updated[key] = statusTickets[key].filter((t) => t.id !== movedTicket.id);
//     });

//     // Add ticket to new status
//     updated[newStatus] = [...updated[newStatus], movedTicket];
//     setStatusTickets(updated);
//   };

//   const allStatuses: Status[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Tickets on {selectedDate}</Text>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#0000ff']} // Customize the loading indicator color if needed
//           />
//         }>
//         {allStatuses.map((status) => (
//           <View key={status} style={styles.statusRow}>
//             <Text style={styles.statusLabel}>{status}</Text>

//             <Droppable onDrop={(data: any) => handleStatusChange(data, status)}>
//               <FlatList
//                 horizontal
//                 data={statusTickets[status]}
//                 keyExtractor={(item) => item.id.toString()}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ paddingHorizontal: 6 }}
//                 renderItem={({ item }) => (
//                   <Draggable data={item}>
//                     <View style={styles.ticketChip}>
//                       <Text style={styles.chipText}>{item.title}</Text>
//                     </View>
//                   </Draggable>
//                 )}
//                 ListEmptyComponent={
//                   <Text style={styles.noTickets}>No tickets</Text>
//                 }
//               />
//             </Droppable>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingHorizontal: 12,
//     paddingTop: 16,
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   statusRow: {
//     marginBottom: 24,
//   },
//   statusLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 8,
//   },
//   ticketChip: {
//     backgroundColor: "#eee",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 12,
//     marginRight: 8,
//   },
//   chipText: {
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   noTickets: {
//     color: "#999",
//     fontStyle: "italic",
//     marginHorizontal: 8,
//   },
// });

// export default UserHomeScreen;

import { View, Text } from "react-native";
import React from "react";

const userHomeScreen = () => {
  return (
    <View>
      <Text>userHomeScreen</Text>
    </View>
  );
};

export default userHomeScreen;
