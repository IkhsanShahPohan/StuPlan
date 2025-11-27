import { StyleSheet } from "react-native";

export const taskStyles = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 2,
  },
  filterBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#F2F2F7",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#C7C7CC",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },

  // Task Card
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "#F0F0F0",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  taskDesc: {
    fontSize: 15,
    color: "#8E8E93",
    lineHeight: 20,
    marginBottom: 12,
    paddingLeft: 20,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 20,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#F0F0F0",
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deadlineText: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 6,
    fontWeight: "500",
  },
  overdueText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#FFF5F5",
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
  },
});