import React from "react";
import { View, Text } from "react-native";
import styles from "../app/home/homeScreen.styles";

const StatsOverview = ({
  tickets,
  totalTickets,
}: {
  tickets: any;
  totalTickets: number;
}) => (
  <View style={styles.statsContainer}>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{totalTickets}</Text>
      <Text style={styles.statLabel}>Total Tickets</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{tickets.IN_PROGRESS.length}</Text>
      <Text style={styles.statLabel}>Active</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{tickets.COMPLETED.length}</Text>
      <Text style={styles.statLabel}>Completed</Text>
    </View>
  </View>
);

export default StatsOverview;
