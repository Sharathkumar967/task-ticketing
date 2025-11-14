import { ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
