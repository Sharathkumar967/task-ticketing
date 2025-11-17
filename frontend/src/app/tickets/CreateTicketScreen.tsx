import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import styles from "./tickets.styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomHeader from "../../components/CustomHeader";
import { useCreateTicket } from "../../hooks/useCreateTicket";

const CreateTicketScreen = () => {
  const router = useRouter();

  const params = useLocalSearchParams<{
    mode?: string;
    ticketData?: string;
  }>();

  const {
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    showDatePicker,
    toggleDatePicker,
    formatShortDate,
    filteredUsers,
    selectedUserIds,
    toggleUser,
    searchQuery,
    setSearchQuery,
    loadingUsers,
    submitting,
    handleSubmit,
    isEditMode,
  } = useCreateTicket({
    mode: params.mode,
    ticketData: params.ticketData,
    onSuccess: () =>
      params.mode === "edit"
        ? router.back()
        : router.push("/(tabs)/Home?refresh=true"),
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <CustomHeader title={isEditMode ? "Edit Ticket" : "Create Ticket"} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter ticket title"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              autoFocus={!isEditMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the task (optional)"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              onPress={toggleDatePicker}
              style={styles.dateButton}
            >
              <Text
                style={[styles.dateText, !dueDate && styles.placeholderText]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {dueDate ? formatShortDate(dueDate) : "Select due date"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#0052CC" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                minimumDate={new Date()}
                onChange={(_, selected) => {
                  if (Platform.OS === "android") toggleDatePicker();
                  if (selected) setDueDate(selected);
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Assign To * ({selectedUserIds.length} selected)
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search users by name or email..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <ScrollView
              style={styles.usersListScroll}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {loadingUsers ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0052CC" />
                </View>
              ) : filteredUsers.length === 0 ? (
                <Text style={styles.noUsers}>No users found</Text>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.userItem,
                        isSelected && styles.userItemSelected,
                      ]}
                      onPress={() => toggleUser(user.id)}
                    >
                      <View style={styles.userLeft}>
                        <View
                          style={[
                            styles.avatar,
                            isSelected && styles.avatarSelected,
                          ]}
                        >
                          <Text style={styles.avatarText}>
                            {user.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.userName}>{user.name}</Text>
                          <Text style={styles.userEmail}>{user.email}</Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#0052CC" />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!title.trim() || selectedUserIds.length === 0 || submitting) &&
                styles.submitButtonDisabled,
            ]}
            disabled={
              !title.trim() || selectedUserIds.length === 0 || submitting
            }
            onPress={handleSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? "Update Ticket" : "Create Ticket"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateTicketScreen;
