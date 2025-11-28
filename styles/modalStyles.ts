import { StyleSheet, Platform } from "react-native";

export const modalStyles = StyleSheet.create({
  // Modal Container
  modalContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  modalSafe: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#C6C6C8",
  },
  modalCancel: {
    fontSize: 17,
    color: "#007AFF",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  modalDone: {
    fontSize: 17,
    fontWeight: "600",
    color: "#007AFF",
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Filter Modal
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  filterContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#C6C6C8",
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  filterBody: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    marginTop: 16,
  },
  filterDateBtn: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  filterDateText: {
    fontSize: 17,
    color: "#007AFF",
  },
  filterActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  filterResetBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  filterResetText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  filterApplyBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterApplyText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Notes Editor (Fullscreen)
  notesEditorContainer: {
    flex: 1,
    backgroundColor: "#FFFEF7",
  },
  notesEditorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFEF7",
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDD4",
  },
  notesEditorBackBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  notesEditorBackText: {
    fontSize: 17,
    color: "#007AFF",
    marginLeft: 4,
  },
  notesEditorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notesEditorWordCount: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  notesEditorBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  notesEditorInput: {
    fontSize: 17,
    color: "#3C3C3C",
    lineHeight: 26,
    minHeight: 400,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  notesEditorToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFEF7",
    borderTopWidth: 1,
    borderTopColor: "#F0EDD4",
  },
  notesToolbarBtn: {
    padding: 8,
  },
  notesToolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 12,
  },
  notesToolbarDate: {
    fontSize: 13,
    color: "#8E8E93",
  },

  // Date Picker Actions
  datePickerActions: {
    alignItems: "flex-end",
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  datePickerDoneBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  datePickerDoneText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});