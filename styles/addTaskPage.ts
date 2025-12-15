import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
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
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 16,
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

  // Option Card
  optionCard: {
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
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  optionValue: {
    fontSize: 14,
    color: "#8E8E93",
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
});

// Modal Styles
export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  modalSubLabel: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 8,
  },

  // Reminder Options
  reminderOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F9FB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  reminderOptionActive: {
    backgroundColor: "#E8F4FF",
    borderColor: "#007AFF",
  },
  reminderOptionText: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "500",
  },
  reminderOptionTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },

  // Custom Input
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9FB",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    gap: 12,
  },
  customInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    textAlign: "center",
  },
  customInputUnit: {
    fontSize: 15,
    color: "#8E8E93",
    fontWeight: "500",
  },

  // Repeat Mode Buttons
  repeatModeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  repeatModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F9F9FB",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
  },
  repeatModeButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  repeatModeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  repeatModeTextActive: {
    color: "#FFFFFF",
  },

  // Day Selector
  daySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F9F9FB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
  },
  dayButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C3C43",
  },
  dayButtonTextActive: {
    color: "#FFFFFF",
  },

  // Interval Selector
  intervalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  intervalInput: {
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
  intervalLabel: {
    fontSize: 15,
    color: "#3C3C43",
  },

  // End Options
  endOptionContainer: {
    gap: 8,
  },
  endOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F9FB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  endOptionButtonActive: {
    backgroundColor: "#E8F4FF",
    borderColor: "#007AFF",
  },
  endOptionText: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "500",
  },
  endOptionTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },

  // Info Box
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: "#E8F4FD",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#3C3C43",
    lineHeight: 18,
  },

  // Save Button
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    margin: 20,
    marginTop: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Month Picker for End Option
  monthPickerContainer: {
    marginTop: 12,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  monthButton: {
    width: "30%",
    paddingVertical: 12,
    backgroundColor: "#F9F9FB",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  monthButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  monthButtonTextActive: {
    color: "#FFFFFF",
  },
});