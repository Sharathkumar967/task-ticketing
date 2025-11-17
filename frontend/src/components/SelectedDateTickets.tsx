import { View, Text, TouchableOpacity } from "react-native";
import TicketCard from "./TicketCard";
import { formatDateForApi } from "../utils/generalUtils";
import styles from "../app/home/homeScreen.styles";
import { SelectedDateTicketsProps } from "../types/components";
import { ticket } from "../types/apiServices";

const SelectedDateTickets = ({
  tickets,
  selectedDate,
  setSelectedDate,
}: SelectedDateTicketsProps) => {
  const filteredTickets = tickets.filter(
    (ticket: ticket) => formatDateForApi(ticket.dueDate) === selectedDate
  );

  return (
    <View style={styles.selectedDateSection}>
      <View style={styles.selectedDateHeader}>
        <Text style={styles.selectedDateTitle}>
          Tickets due on{" "}
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
      {filteredTickets.length > 0 ? (
        <View style={styles.selectedTicketsList}>
          {filteredTickets.map((ticket: ticket) => (
            <TicketCard key={ticket.id} item={ticket} />
          ))}
        </View>
      ) : (
        <View style={styles.noTicketsContainer}>
          <Text style={styles.noTicketsText}>No tickets due on this day</Text>
        </View>
      )}
    </View>
  );
};

export default SelectedDateTickets;
