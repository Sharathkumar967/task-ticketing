import { useEffect, useState, useMemo, useCallback } from "react";
import { Alert } from "react-native";
import {
  createTicketService,
  editTicketService,
} from "../services/ticketsService";
import { UseCreateTicketParams } from "../types/hooks";
import { userResponse } from "../types/apiServices";
import { getAllUsersService } from "../services/usersService";
import { formatShortDate } from "../utils/generalUtils";

export const useCreateTicket = ({
  mode,
  ticketData,
  onSuccess,
}: UseCreateTicketParams) => {
  const isEditMode = mode === "edit";

  const existingTicket = useMemo(() => {
    if (!isEditMode || !ticketData) return null;
    try {
      return JSON.parse(ticketData);
    } catch (e) {
      console.error("Failed to parse ticketData:", e);
      return null;
    }
  }, [isEditMode, ticketData]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [users, setUsers] = useState<userResponse[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await getAllUsersService();
      if (res.data?.data) setUsers(res.data.data);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (isEditMode && existingTicket) {
      setTitle(existingTicket.title ?? "");
      setDescription(existingTicket.description ?? "");
      setDueDate(
        existingTicket.dueDate ? new Date(existingTicket.dueDate) : null
      );
      setSelectedUserIds(
        existingTicket.assignments?.map((a: any) => a.user.id) ?? []
      );
    } else {
      setTitle("");
      setDescription("");
      setDueDate(null);
      setSelectedUserIds([]);
    }
  }, [isEditMode, existingTicket]);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [users, searchQuery]
  );

  const toggleUser = useCallback((id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleDatePicker = useCallback(() => {
    setShowDatePicker((v) => !v);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return Alert.alert("Required", "Title is required.");
    if (selectedUserIds.length === 0)
      return Alert.alert("Required", "Assign at least one user.");

    setSubmitting(true);
    try {
      const commonPayload = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate ? dueDate.toISOString().split("T")[0] : undefined,
        assignedToIds: selectedUserIds,
      };

      if (isEditMode) {
        if (!existingTicket?.id) {
          throw new Error("Ticket ID is missing for edit operation.");
        }

        await editTicketService({
          ...commonPayload,
          id: existingTicket.id,
        });

        Alert.alert("Success", "Ticket updated successfully!", [
          { text: "OK", onPress: onSuccess },
        ]);
      } else {
        await createTicketService(commonPayload);

        Alert.alert("Success", "Ticket created successfully!", [
          { text: "OK", onPress: onSuccess },
        ]);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    title,
    selectedUserIds,
    dueDate,
    description,
    isEditMode,
    existingTicket,
    onSuccess,
  ]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    showDatePicker,
    toggleDatePicker,
    formatShortDate,
    users,
    filteredUsers,
    selectedUserIds,
    toggleUser,
    searchQuery,
    setSearchQuery,
    loadingUsers,
    submitting,
    handleSubmit,
    isEditMode,
  };
};
