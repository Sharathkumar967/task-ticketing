import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { getMyTicketsService } from "../../services/ticketsService";
import CustomHeader from "../../components/CustomHeader";
import { ticket } from "../../types/apiServices";
import Ticket from "../../components/TicketCard";

const CalendarView = () => {
  const [tickets, setTickets] = useState<ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    setLoading(true);
    try {
      const response = await getMyTicketsService();
      if (response.data.status === 200) {
        const ticketList = response.data.data.tickets || [];
        setTickets(ticketList);
      }
    } catch (error: any) {
      console.log("error", error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  };

  const markedDates = tickets.reduce((acc, ticket) => {
    const formattedDate = formatDate(ticket.dueDate);
    if (formattedDate) {
      acc[formattedDate] = {
        marked: true,
        dotColor: "#0052CC",
        ...(selectedDate === formattedDate && {
          selected: true,
          selectedColor: "#0052CC",
        }),
      };
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="CalendarView" />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0052CC" />
        </View>
      ) : (
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              selectedDayBackgroundColor: "#0052CC",
              todayTextColor: "#0052CC",
              arrowColor: "#0052CC",
            }}
          />

          {selectedDate ? (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedText}>
                Tickets due on {selectedDate}:
              </Text>

              <ScrollView
                contentContainerStyle={styles.ticketList}
                showsVerticalScrollIndicator={false}
              >
                {tickets.filter((t) => formatDate(t.dueDate) === selectedDate)
                  .length > 0 ? (
                  tickets
                    .filter((t) => formatDate(t.dueDate) === selectedDate)
                    .map((t) => <Ticket key={t.id} item={t} />)
                ) : (
                  <Text style={styles.noTickets}>No tickets due this day.</Text>
                )}
              </ScrollView>
            </View>
          ) : (
            <Text style={styles.infoText}>
              Tap on a date to view your deadlines.
            </Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default CalendarView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    flex: 1,
  },
  selectedInfo: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  ticketList: {
    paddingBottom: 80,
  },
  noTickets: {
    fontSize: 15,
    color: "#888",
  },
  infoText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 15,
  },
});
