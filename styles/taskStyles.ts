import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Header - COMPACT VERSION
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
    fontWeight: "500",
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  // Search - COMPACT
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1C1C1E",
    padding: 0,
    fontWeight: "400",
  },

  // Filter Section - COMPACT
  filterSection: {
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8E8E93",
    marginLeft: 20,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    marginRight: 6,
    gap: 5,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },

  // Active Date Filter - COMPACT
  activeDateFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#BBDEFB",
  },
  activeDateFilterText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },

  // Task Card - SLIGHTLY SMALLER
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  taskCardCompleted: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E0E0E0",
    opacity: 0.75,
  },
  taskCardOverdue: {
    borderColor: "#FFE5E5",
    borderWidth: 1.5,
    backgroundColor: "#FFFBFB",
  },

  // Task Card Header
  taskCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#007AFF",
    marginRight: 8,
    flexShrink: 0,
  },
  statusIndicatorCompleted: {
    backgroundColor: "#34C759",
  },
  statusIndicatorOverdue: {
    backgroundColor: "#FF3B30",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    flex: 1,
    lineHeight: 20,
  },
  taskTitleCompleted: {
    color: "#8E8E93",
    textDecorationLine: "line-through",
  },

  // Category Badge
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 3,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Task Description
  taskDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 8,
    fontWeight: "400",
  },
  taskDescriptionCompleted: {
    color: "#A0A0A0",
  },

  // Task Meta
  taskMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  taskMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
    gap: 5,
  },

  // Meta Chips - SMALLER
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#F2F2F7",
    gap: 3,
  },
  metaChipOverdue: {
    backgroundColor: "#FFE5E5",
  },
  metaChipReminder: {
    backgroundColor: "#E3F2FD",
  },
  metaChipRepeat: {
    backgroundColor: "#FFF3E0",
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  metaChipTextOverdue: {
    color: "#FF3B30",
  },
  metaChipTextCompleted: {
    color: "#A0A0A0",
  },
  metaChipTextReminder: {
    fontSize: 11,
    fontWeight: "600",
    color: "#007AFF",
  },
  metaChipTextRepeat: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F57C00",
  },

  // Task Actions - SMALLER
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 6,
  },
  confirmButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
  },

  // Completed Overlay - SMALLER
  completedOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#34C759",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Overdue Badge - SMALLER
  overdueBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 10,
    gap: 3,
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#A0A0A0",
    textAlign: "center",
    lineHeight: 18,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 80,
  },
});