import { View, Text, ScrollView } from "react-native";
import { Droppable, Draggable } from "react-native-reanimated-dnd";
import TicketCard from "./TicketCard";
import { ColumnKey } from "../types/components";
import { columnConfig } from "../constants/generals";
import styles from "../app/home/homeScreen.styles";

const KanbanBoard = ({ tickets, handleDrop }: any) => {
  const renderColumn = (status: ColumnKey) => (
    <View key={status} style={styles.columnWrapper}>
      <View
        style={[
          styles.columnHeader,
          { backgroundColor: columnConfig[status].color },
        ]}
      >
        <View
          style={[
            styles.columnIcon,
            { backgroundColor: columnConfig[status].iconColor },
          ]}
        >
          <Text style={styles.columnCount}>{tickets[status]?.length}</Text>
        </View>
        <Text style={styles.columnTitle}>{columnConfig[status].title}</Text>
      </View>
      <Droppable
        droppableId={status}
        onDrop={(data: any) => {
          const t = data;
          const from = (Object.keys(tickets) as ColumnKey[]).find((k) =>
            tickets[k].some((x: { id: string }) => x.id === t.id)
          );
          handleDrop(t, from, status);
        }}
      >
        <View
          style={[
            styles.dropZone,
            { backgroundColor: columnConfig[status].color },
          ]}
        >
          <ScrollView
            style={styles.columnScroll}
            contentContainerStyle={styles.columnContent}
            showsVerticalScrollIndicator={false}
          >
            {tickets[status]?.map((t: any) => {
              if (status === "CLOSED") {
                // Read-only view for CLOSED tickets
                return (
                  <View key={t.id}>
                    <TicketCard item={t} hideStatus={true} readOnly={true} />
                  </View>
                );
              }

              return (
                <Draggable key={t.id} draggableId={t.id} data={t}>
                  <TicketCard item={t} hideStatus={true} />
                </Draggable>
              );
            })}
            {tickets[status]?.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tickets yet</Text>
                <Text style={styles.emptySubtext}>Drop tickets here</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Droppable>
    </View>
  );

  return (
    <View style={styles.kanbanSection}>
      <Text style={styles.sectionTitle}>Workflow Board</Text>
      <Text style={styles.dragInstructions}>
        Hold and drag tickets between columns to update status
      </Text>
      <View style={styles.kanbanContainer}>
        {(Object.keys(columnConfig) as ColumnKey[]).map((status) =>
          renderColumn(status)
        )}
      </View>
    </View>
  );
};

export default KanbanBoard;
