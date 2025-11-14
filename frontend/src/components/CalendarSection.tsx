import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { formatDateForApi } from "../utils/generalUtils";
import styles from "../app/home/homeScreen.styles";

const CalendarSection = ({
  showCalendar,
  setShowCalendar,
  tickets,
  selectedDate,
  setSelectedDate,
  scrollRef,
}: any) => {
  const markedDates = tickets.reduce((acc: any, ticket: any) => {
    const formattedDate = formatDateForApi(ticket.dueDate);
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
  }, {});

  return (
    <View style={styles.calendarSection}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setShowCalendar(!showCalendar)}
      >
        <Text style={styles.sectionTitle}>Calendar</Text>
        <Text style={styles.toggleIcon}>{showCalendar ? "▼" : "▶"}</Text>
      </TouchableOpacity>
      {showCalendar && (
        <Calendar
          markedDates={markedDates}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setTimeout(
              () => scrollRef.current?.scrollTo({ y: 400, animated: true }),
              100
            );
          }}
          theme={{
            selectedDayBackgroundColor: "#007AFF",
            todayTextColor: "#007AFF",
            arrowColor: "#007AFF",
            dotColor: "#007AFF",
          }}
          style={styles.calendar}
        />
      )}
    </View>
  );
};

export default CalendarSection;
