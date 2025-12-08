import { Platform, StyleSheet } from "react-native";

export const editTaskModalStyles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonDisabled: {
    opacity: 0.4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: -0.3,
  },

  // Section
  section: {
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3C3C43",
    marginBottom: 8,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: "row",
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E5EA",
    minHeight: 100,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  categoryCardActive: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C3C43",
    textAlign: "center",
  },
  categoryLabelActive: {
    color: "#007AFF",
  },
  categoryCheckmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  // Input Container
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    fontSize: 16,
    color: "#000000",
    padding: 16,
    minHeight: 52,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 16,
  },

  // Notes Card
  notesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    minHeight: 120,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  notesPreview: {
    fontSize: 15,
    color: "#3C3C43",
    lineHeight: 22,
    marginBottom: 12,
  },
  notesFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  notesMeta: {
    fontSize: 13,
    color: "#8E8E93",
  },
  notesEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  notesEmptyText: {
    fontSize: 15,
    color: "#C7C7CC",
    marginTop: 12,
  },

  // Date Time Row
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  dateTimeSection: {
    flex: 1,
    marginTop: 0,
  },

  // Picker Button
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  pickerText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
    flex: 1,
  },

  // Toggle Row
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },

  // Expanded Content
  expandedContent: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F9F9FB",
    borderRadius: 12,
  },

  // Chip Row
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
  },
  chipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },

  // Custom Input
  customInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  customInputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    paddingVertical: 8,
  },
  customInputUnit: {
    fontSize: 15,
    color: "#8E8E93",
    fontWeight: "500",
  },

  // Info Box
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#E8F4FD",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#3C3C43",
    lineHeight: 18,
  },

  // Custom Repeat
  customRepeat: {
    marginTop: 16,
  },
  customRepeatRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 8,
  },
  customRepeatInput: {
    width: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  unitSelector: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  unitButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  unitButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
  },
  unitButtonTextActive: {
    color: "#FFFFFF",
  },

  // Subtask
  subtaskInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  addButton: {
    padding: 4,
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  subtaskText: {
    flex: 1,
    fontSize: 15,
    color: "#3C3C43",
  },
  subtaskTextCompleted: {
    textDecorationLine: "line-through",
    color: "#8E8E93",
  },

  // Notes Modal
  notesModal: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  notesBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  notesBackText: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "500",
  },
  notesCount: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  notesBody: {
    flex: 1,
    padding: 20,
  },
  notesInput: {
    fontSize: 17,
    color: "#000000",
    lineHeight: 26,
    textAlignVertical: "top",
    minHeight: 500,
  },
  notesToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F9F9FB",
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5EA",
  },
  notesDate: {
    fontSize: 13,
    color: "#8E8E93",
  },
});
