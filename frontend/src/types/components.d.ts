import { ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, ticket } from "../apiServices";

export type customHeaderProps = {
  title: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  style?: ViewStyle;
  showBack?: boolean;
};

export type UserItemProps = {
  user: userResponse;
  onPress: () => void;
};

export type ColumnKey = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";

export type SelectedDateTicketsProps = {
  tickets: ticket[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

export type CalendarSectionProps = {
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  tickets: ticket[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  scrollRef: React.RefObject<ScrollView>;
};

export type KanbanBoardProps = {
  tickets: Record<ColumnKey, ticket[]>;
  handleDrop: (ticket: ticket, from: ColumnKey, to: ColumnKey) => void;
};

export type ticketCardProps = {
  item: ticket;
  hideStatus?: boolean;
  readOnly?: boolean;
};
