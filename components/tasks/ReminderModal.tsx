import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import { modalStyles as styles } from "@/styles/addTaskPage";

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  deadline: Date;
  time: Date;
  reminderEnabled: boolean;
  reminderMinutes: number;
  onSave: (enabled: boolean, minutes: number) => void;
}

export default function ReminderModal({
  visible,
  onClose,
  deadline,
  time,
  reminderEnabled,
  reminderMinutes,
  onSave,
}: ReminderModalProps) {
  const [enabled, setEnabled] = useState(reminderEnabled);
  const [selectedMinutes, setSelectedMinutes] = useState(reminderMinutes);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("1");
  const [customUnit, setCustomUnit] = useState<"minutes" | "hours" | "days">("hours");

  useEffect(() => {
    setEnabled(reminderEnabled);
    setSelectedMinutes(reminderMinutes);

    // Check if current value is custom
    const presetValues = [-10, -30, -60, -180, -720, -1440, -2880, -10080];
    if (!presetValues.includes(reminderMinutes)) {
      setIsCustom(true);
      calculateCustomFromMinutes(reminderMinutes);
    }
  }, [reminderEnabled, reminderMinutes]);

  const calculateCustomFromMinutes = (minutes: number) => {
    const absMinutes = Math.abs(minutes);
    
    if (absMinutes < 60) {
      setCustomValue(absMinutes.toString());
      setCustomUnit("minutes");
    } else if (absMinutes < 1440) {
      setCustomValue(Math.floor(absMinutes / 60).toString());
      setCustomUnit("hours");
    } else {
      setCustomValue(Math.floor(absMinutes / 1440).toString());
      setCustomUnit("days");
    }
  };

  const calculateMaxDays = () => {
    const now = new Date();
    const combinedDeadline = new Date(deadline);
    combinedDeadline.setHours(time.getHours());
    combinedDeadline.setMinutes(time.getMinutes());
    
    const diffMs = combinedDeadline.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return Math.min(diffDays, 30); // Max 30 hari
  };

  const reminderOptions = [
    { label: "10 menit sebelumnya", value: -10 },
    { label: "30 menit sebelumnya", value: -30 },
    { label: "1 jam sebelumnya", value: -60 },
    { label: "3 jam sebelumnya", value: -180 },
    { label: "12 jam sebelumnya", value: -720 },
    { label: "1 hari sebelumnya", value: -1440 },
    { label: "2 hari sebelumnya", value: -2880 },
    { label: "1 minggu sebelumnya", value: -10080 },
  ];

  const handleCustomValueChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned === "") {
      setCustomValue("0");
      return;
    }

    const numValue = parseInt(cleaned, 10);
    const maxDays = calculateMaxDays();

    if (customUnit === "minutes") {
      if (numValue >= 0 && numValue <= 59) {
        setCustomValue(numValue.toString());
      }
    } else if (customUnit === "hours") {
      if (numValue >= 0 && numValue <= 23) {
        setCustomValue(numValue.toString());
      }
    } else if (customUnit === "days") {
      if (numValue >= 0 && numValue <= maxDays) {
        setCustomValue(numValue.toString());
      } else if (numValue > maxDays) {
        setCustomValue(maxDays.toString());
      }
    }
  };

  const handleSave = () => {
    if (!enabled) {
      onSave(false, 0);
      return;
    }

    let finalMinutes = selectedMinutes;

    if (isCustom) {
      const value = parseInt(customValue) || 0;
      if (customUnit === "minutes") {
        finalMinutes = -value;
      } else if (customUnit === "hours") {
        finalMinutes = -value * 60;
      } else if (customUnit === "days") {
        finalMinutes = -value * 1440;
      }
    }

    // Validasi: reminder time tidak boleh melewati deadline
    const now = new Date();
    const combinedDeadline = new Date(deadline);
    combinedDeadline.setHours(time.getHours());
    combinedDeadline.setMinutes(time.getMinutes());
    
    const reminderTime = new Date(combinedDeadline.getTime() + finalMinutes * 60000);
    
    if (reminderTime < now) {
      alert("Waktu pengingat sudah lewat. Pilih waktu yang lebih dekat dengan deadline.");
      return;
    }

    onSave(true, finalMinutes);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pengingat</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Enable Toggle */}
            <View style={[styles.modalSection, { marginBottom: 16 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.modalLabel}>Aktifkan Pengingat</Text>
                <Switch
                  value={enabled}
                  onValueChange={setEnabled}
                  trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {enabled && (
              <>
                {/* Preset Options */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Pilih Waktu</Text>
                  {reminderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.reminderOption,
                        !isCustom && selectedMinutes === option.value && styles.reminderOptionActive,
                      ]}
                      onPress={() => {
                        setIsCustom(false);
                        setSelectedMinutes(option.value);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.reminderOptionText,
                          !isCustom && selectedMinutes === option.value && styles.reminderOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {!isCustom && selectedMinutes === option.value && (
                        <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  ))}

                  {/* Custom Option */}
                  <TouchableOpacity
                    style={[
                      styles.reminderOption,
                      isCustom && styles.reminderOptionActive,
                    ]}
                    onPress={() => setIsCustom(true)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.reminderOptionText,
                        isCustom && styles.reminderOptionTextActive,
                      ]}
                    >
                      Custom
                    </Text>
                    {isCustom && (
                      <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Custom Input */}
                {isCustom && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSubLabel}>Atur waktu custom (maks. {calculateMaxDays()} hari)</Text>
                    <View style={styles.customInputContainer}>
                      <TextInput
                        style={styles.customInput}
                        value={customValue}
                        onChangeText={handleCustomValueChange}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#C7C7CC"
                      />
                      <View style={styles.repeatModeContainer}>
                        {[
                          { value: "minutes", label: "Menit", max: 59 },
                          { value: "hours", label: "Jam", max: 23 },
                          { value: "days", label: "Hari", max: calculateMaxDays() },
                        ].map((unit) => (
                          <TouchableOpacity
                            key={unit.value}
                            style={[
                              styles.repeatModeButton,
                              customUnit === unit.value && styles.repeatModeButtonActive,
                            ]}
                            onPress={() => setCustomUnit(unit.value as any)}
                          >
                            <Text
                              style={[
                                styles.repeatModeText,
                                customUnit === unit.value && styles.repeatModeTextActive,
                              ]}
                            >
                              {unit.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* Info */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={16} color="#007AFF" />
                  <Text style={styles.infoText}>
                    Pengingat akan dikirim sebelum deadline. Pastikan waktu yang dipilih tidak melewati deadline.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}