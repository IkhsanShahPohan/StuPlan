import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { modalStyles } from "@/styles/modalStyles";

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
      <View style={modalStyles.filterOverlay}>
        <View style={modalStyles.filterContent}>
          <View style={modalStyles.filterHeader}>
            <Text style={modalStyles.filterTitle}>Filter Berdasarkan Tanggal</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.filterBody}>
            {/* Info Text */}
            <View style={{
              backgroundColor: "#F0F7FF",
              padding: 12,
              borderRadius: 10,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
            }}>
              <Ionicons name="information-circle" size={20} color="#007AFF" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 13, color: "#007AFF", flex: 1 }}>
                Pilih rentang tanggal untuk memfilter tugas, jadwal, dan kegiatan
              </Text>
            </View>

            {/* Start Date */}
            <Text style={modalStyles.filterLabel}>Tanggal Mulai</Text>
            <TouchableOpacity
              style={[
                modalStyles.filterDateBtn,
                startDate && { borderColor: "#007AFF", borderWidth: 2 }
              ]}
              onPress={() => setShowStartPicker(true)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Ionicons 
                  name="calendar" 
                  size={20} 
                  color={startDate ? "#007AFF" : "#8E8E93"} 
                  style={{ marginRight: 10 }}
                />
                <Text style={[
                  modalStyles.filterDateText,
                  startDate && { color: "#000000", fontWeight: "600" }
                ]}>
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
                >
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {showStartPicker && (
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
            )}

            {Platform.OS === "ios" && showStartPicker && (
              <View style={modalStyles.datePickerActions}>
                <TouchableOpacity
                  style={modalStyles.datePickerDoneBtn}
                  onPress={() => setShowStartPicker(false)}
                >
                  <Text style={modalStyles.datePickerDoneText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* End Date */}
            <Text style={modalStyles.filterLabel}>Tanggal Akhir</Text>
            <TouchableOpacity
              style={[
                modalStyles.filterDateBtn,
                endDate && { borderColor: "#007AFF", borderWidth: 2 }
              ]}
              onPress={() => setShowEndPicker(true)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Ionicons 
                  name="calendar" 
                  size={20} 
                  color={endDate ? "#007AFF" : "#8E8E93"} 
                  style={{ marginRight: 10 }}
                />
                <Text style={[
                  modalStyles.filterDateText,
                  endDate && { color: "#000000", fontWeight: "600" }
                ]}>
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
                >
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {showEndPicker && (
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
            )}

            {Platform.OS === "ios" && showEndPicker && (
              <View style={modalStyles.datePickerActions}>
                <TouchableOpacity
                  style={modalStyles.datePickerDoneBtn}
                  onPress={() => setShowEndPicker(false)}
                >
                  <Text style={modalStyles.datePickerDoneText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Action Buttons */}
            <View style={modalStyles.filterActionsRow}>
              <TouchableOpacity
                style={[
                  modalStyles.filterResetBtn,
                  !hasFilters && { opacity: 0.5 }
                ]}
                onPress={handleReset}
                disabled={!hasFilters}
              >
                <Ionicons name="refresh-outline" size={20} color="#FF3B30" />
                <Text style={modalStyles.filterResetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  modalStyles.filterApplyBtn,
                  !hasFilters && { opacity: 0.5 }
                ]}
                onPress={() => {
                  if (hasFilters) {
                    onApply();
                  }
                }}
                disabled={!hasFilters}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={modalStyles.filterApplyText}>Terapkan Filter</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Filters */}
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#8E8E93", marginBottom: 12 }}>
                QUICK FILTERS
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: "#F2F2F7",
                    borderWidth: 1,
                    borderColor: "#E5E5EA",
                  }}
                  onPress={() => {
                    const today = new Date();
                    onStartDateChange(today);
                    onEndDateChange(today);
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#007AFF" }}>
                    Hari Ini
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: "#F2F2F7",
                    borderWidth: 1,
                    borderColor: "#E5E5EA",
                  }}
                  onPress={() => {
                    const today = new Date();
                    const weekLater = new Date();
                    weekLater.setDate(today.getDate() + 7);
                    onStartDateChange(today);
                    onEndDateChange(weekLater);
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#007AFF" }}>
                    Minggu Ini
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: "#F2F2F7",
                    borderWidth: 1,
                    borderColor: "#E5E5EA",
                  }}
                  onPress={() => {
                    const today = new Date();
                    const monthLater = new Date();
                    monthLater.setMonth(today.getMonth() + 1);
                    onStartDateChange(today);
                    onEndDateChange(monthLater);
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#007AFF" }}>
                    Bulan Ini
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}