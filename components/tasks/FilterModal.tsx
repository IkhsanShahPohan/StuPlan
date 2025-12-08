import { modalStyles } from "@/styles/modalStyles";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function FilterModal({
  visible,
  onClose,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onReset,
}: FilterModalProps) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleReset = () => {
    onReset();
    onStartDateChange(null);
    onEndDateChange(null);
  };

  const hasFilters = startDate || endDate;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="filter" size={20} color="#007AFF" />
              </View>
              <Text style={styles.title}>Filter Tanggal</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={18} color="#007AFF" />
              <Text style={styles.infoText}>
                Pilih rentang tanggal untuk memfilter data Anda
              </Text>
            </View>

            {/* Start Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tanggal Mulai</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  startDate && styles.dateButtonActive,
                ]}
                onPress={() => setShowStartPicker(true)}
                activeOpacity={0.7}
              >
                <View style={styles.dateButtonContent}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={startDate ? "#007AFF" : "#8E8E93"}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      startDate && styles.dateTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {startDate
                      ? startDate.toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Pilih tanggal mulai"}
                  </Text>
                </View>
                {startDate && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onStartDateChange(null);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.clearBtn}
                  >
                    <Ionicons name="close-circle" size={20} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            {showStartPicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, date) => {
                    if (Platform.OS === "android") {
                      setShowStartPicker(false);
                    }
                    if (event.type === "set" && date) {
                      onStartDateChange(date);
                      if (Platform.OS === "ios") {
                        setShowStartPicker(false);
                      }
                    } else if (event.type === "dismissed") {
                      setShowStartPicker(false);
                    }
                  }}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.pickerDoneBtn}
                    onPress={() => setShowStartPicker(false)}
                  >
                    <Text style={styles.pickerDoneText}>Selesai</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* End Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tanggal Akhir</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  endDate && styles.dateButtonActive,
                ]}
                onPress={() => setShowEndPicker(true)}
                activeOpacity={0.7}
              >
                <View style={styles.dateButtonContent}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={endDate ? "#007AFF" : "#8E8E93"}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      endDate && styles.dateTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {endDate
                      ? endDate.toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Pilih tanggal akhir"}
                  </Text>
                </View>
                {endDate && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onEndDateChange(null);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.clearBtn}
                  >
                    <Ionicons name="close-circle" size={20} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            {showEndPicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, date) => {
                    if (Platform.OS === "android") {
                      setShowEndPicker(false);
                    }
                    if (event.type === "set" && date) {
                      onEndDateChange(date);
                      if (Platform.OS === "ios") {
                        setShowEndPicker(false);
                      }
                    } else if (event.type === "dismissed") {
                      setShowEndPicker(false);
                    }
                  }}
                  minimumDate={startDate || undefined}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.pickerDoneBtn}
                    onPress={() => setShowEndPicker(false)}
                  >
                    <Text style={styles.pickerDoneText}>Selesai</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Quick Filters */}
            <View style={styles.quickFilters}>
              <Text style={styles.quickFiltersLabel}>FILTER CEPAT</Text>
              <View style={styles.quickFiltersRow}>
                <TouchableOpacity
                  style={styles.quickFilterBtn}
                  onPress={() => {
                    const today = new Date();
                    onStartDateChange(today);
                    onEndDateChange(today);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="today-outline" size={16} color="#007AFF" />
                  <Text style={styles.quickFilterText}>Hari Ini</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickFilterBtn}
                  onPress={() => {
                    const today = new Date();
                    const weekLater = new Date();
                    weekLater.setDate(today.getDate() + 7);
                    onStartDateChange(today);
                    onEndDateChange(weekLater);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={16} color="#007AFF" />
                  <Text style={styles.quickFilterText}>7 Hari</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickFilterBtn}
                  onPress={() => {
                    const today = new Date();
                    const monthLater = new Date();
                    monthLater.setMonth(today.getMonth() + 1);
                    onStartDateChange(today);
                    onEndDateChange(monthLater);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={16} color="#007AFF" />
                  <Text style={styles.quickFilterText}>30 Hari</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.resetBtn, !hasFilters && styles.btnDisabled]}
              onPress={handleReset}
              disabled={!hasFilters}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color={hasFilters ? "#FF3B30" : "#C7C7CC"} />
              <Text style={[styles.resetText, !hasFilters && styles.btnTextDisabled]}>
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.applyBtn, !hasFilters && styles.btnDisabled]}
              onPress={() => {
                if (hasFilters) {
                  onApply();
                }
              }}
              disabled={!hasFilters}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.applyText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 20,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#007AFF",
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  dateButtonActive: {
    backgroundColor: "#F0F7FF",
    borderColor: "#007AFF",
  },
  dateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  dateText: {
    fontSize: 15,
    color: "#8E8E93",
    flex: 1,
  },
  dateTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  clearBtn: {
    marginLeft: 8,
    padding: 4,
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  pickerDoneBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  pickerDoneText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  quickFilters: {
    marginTop: 8,
  },
  quickFiltersLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  quickFiltersRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickFilterBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  resetBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    borderWidth: 1.5,
    borderColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  applyBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  resetText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF3B30",
  },
  applyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  btnTextDisabled: {
    color: "#C7C7CC",
  },
});