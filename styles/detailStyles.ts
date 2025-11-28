import { StyleSheet } from "react-native";

export const detailStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#C6C6C8",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 8,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    flexDirection: "row", // 🔥 ini bikin anak-anaknya sebaris
    alignItems: "center", // opsional: biar rapih vertikal
    gap: 6, // opsional: jarak antar child (RN 0.71+)
  },

  editBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Body
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Status Badge
  statusBadge: {
    // borderWidth: 1,
    // borderColor: "#C8C8C8",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,

    // ❌ JANGAN ada marginTop di sini
    // marginTop: 16,
  },
  statusBadgeText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Title
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginTop: 16,
    lineHeight: 34,
  },

  // Section
  section: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 17,
    color: "#000000",
    lineHeight: 24,
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 17,
    color: "#000000",
    marginLeft: 12,
  },

  // Notes Card
  notesCard: {
    backgroundColor: "#FFFEF7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0EDD4",
    padding: 16,
  },
  notesText: {
    fontSize: 16,
    color: "#3C3C3C",
    lineHeight: 24,
    marginBottom: 12,
  },
  notesFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0EDD4",
  },
  notesMeta: {
    fontSize: 12,
    color: "#8E8E93",
  },

  // Subtasks
  subtaskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
    marginRight: 8,
  },
  progressBarContainer: {
    width: 60,
    height: 6,
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  addSubtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addSubtaskInput: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 12,
    fontSize: 17,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginRight: 8,
  },
  addSubtaskIconBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  subtaskCheckbox: {
    marginRight: 12,
  },
  subtaskText: {
    flex: 1,
    fontSize: 17,
    color: "#000000",
  },
  subtaskCompleted: {
    textDecorationLine: "line-through",
    color: "#8E8E93",
  },
  emptySubtasks: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptySubtasksText: {
    fontSize: 15,
    color: "#C7C7CC",
    marginTop: 12,
  },

  // Reminder Info
  reminderInfo: {
    backgroundColor: "#F0F7FF",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  reminderInfoText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 8,
    flex: 1,
  },

  // Category Badge Large
  categoryBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  categoryBadgeTugas: {
    backgroundColor: "#E3F2FD",
  },
  categoryBadgeJadwal: {
    backgroundColor: "#FFF3E0",
  },
  categoryBadgeKegiatan: {
    backgroundColor: "#F3E5F5",
  },
  categoryBadgeTextLarge: {
    fontSize: 15,
    fontWeight: "600",
  },
  categoryBadgeTextTugas: {
    color: "#1976D2",
  },
  categoryBadgeTextJadwal: {
    color: "#F57C00",
  },
  categoryBadgeTextKegiatan: {
    color: "#7B1FA2",
  },

  // Time & Repeat Display
  timeRepeatContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  timeRepeatBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  timeBadge: {
    backgroundColor: "#F0F7FF",
  },
  repeatBadge: {
    backgroundColor: "#FFF3E0",
  },
  timeRepeatText: {
    fontSize: 14,
    fontWeight: "600",
  },
  timeText: {
    color: "#007AFF",
  },
  repeatText: {
    color: "#F57C00",
  },
});
