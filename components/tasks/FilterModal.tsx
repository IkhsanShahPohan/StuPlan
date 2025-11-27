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
}

export default function FilterModal({
  visible,
  onClose,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: FilterModalProps) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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
            <Text style={modalStyles.filterTitle}>Filter Tugas</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.filterBody}>
            <Text style={modalStyles.filterLabel}>Tanggal Mulai</Text>
            <TouchableOpacity
              style={modalStyles.filterDateBtn}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={modalStyles.filterDateText}>
                {startDate
                  ? startDate.toLocaleDateString("id-ID")
                  : "Pilih tanggal mulai"}
              </Text>
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

            <Text style={modalStyles.filterLabel}>Tanggal Akhir</Text>
            <TouchableOpacity
              style={modalStyles.filterDateBtn}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={modalStyles.filterDateText}>
                {endDate
                  ? endDate.toLocaleDateString("id-ID")
                  : "Pilih tanggal akhir"}
              </Text>
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

            <View style={modalStyles.filterActionsRow}>
              <TouchableOpacity
                style={modalStyles.filterResetBtn}
                onPress={() => {
                  onStartDateChange(null);
                  onEndDateChange(null);
                }}
              >
                <Ionicons name="refresh-outline" size={20} color="#FF3B30" />
                <Text style={modalStyles.filterResetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyles.filterApplyBtn}
                onPress={onApply}
              >
                <Text style={modalStyles.filterApplyText}>Terapkan Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}