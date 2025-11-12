import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateText: {
    fontSize: 16,
    color: "#222",
    flex: 1,
    marginRight: 8,
  },
  placeholderText: { color: "#999" },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  usersList: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },

  usersListScroll: {
    maxHeight: 300,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userItemSelected: {
    backgroundColor: "#e6f0ff",
  },
  userLeft: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0052CC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarSelected: {
    backgroundColor: "#0040a3",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  userEmail: {
    fontSize: 12,
    color: "#777",
  },
  noUsers: {
    textAlign: "center",
    padding: 20,
    color: "#999",
    fontStyle: "italic",
  },
  footer: {
    padding: 16,
    paddingBottom: 20,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  submitButton: {
    backgroundColor: "#0052CC",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: "flex-end",
    minWidth: 100,
  },
  statusButtonOpen: {
    backgroundColor: "#FF5630",
  },
  statusButtonClosed: {
    backgroundColor: "#36B37E",
  },
  statusButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0052CC",
  },

  scrollContent: { padding: 16 },

  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: "#0052CC",
    fontWeight: "600",
    fontSize: 13,
  },

  description: { fontSize: 15, color: "#555", lineHeight: 22 },
  value: { fontSize: 15, color: "#222" },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  assigneeCard: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  assigneeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  assigneeName: {
    marginLeft: 6,
    fontWeight: "600",
    color: "#222",
  },
  assigneeStatus: {
    marginLeft: "auto",
    backgroundColor: "#fff3e0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  assigneeStatusText: {
    fontSize: 12,
    color: "#e65100",
    fontWeight: "600",
  },
  assigneeEmail: {
    marginLeft: 24,
    color: "#777",
    fontSize: 13,
    marginTop: 2,
  },

  error: {
    fontSize: 18,
    color: "#e74c3c",
  },

  userStatusSection: { marginVertical: 16, alignItems: "center" },
  userStatusBtn: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  completeBtn: { backgroundColor: "#45B649" },
  userStatusBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  completedBadge: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  completedText: {
    marginLeft: 8,
    color: "#45B649",
    fontWeight: "600",
    fontSize: 16,
  },
});
export default styles;
