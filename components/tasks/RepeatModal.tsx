import { modalStyles as styles } from "@/styles/addTaskPage";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RepeatModalProps {
  visible: boolean;
  onClose: () => void;
  category: "tugas" | "jadwal" | "kegiatan";
  deadline: Date;
  repeatEnabled: boolean;
  repeatMode: "daily" | "weekly" | "monthly" | "yearly";
  repeatInterval: number;
  selectedDays: number[];
  repeatEndOption: "never" | "months";
  repeatEndMonths: number;
  onSave: (
    enabled: boolean,
    mode: "daily" | "weekly" | "monthly" | "yearly",
    interval: number,
    days: number[],
    endOption: "never" | "months",
    endMonths: number
  ) => void;
}

export default function RepeatModal({
  visible,
  onClose,
  category,
  deadline,
  repeatEnabled,
  repeatMode,
  repeatInterval,
  selectedDays,
  repeatEndOption,
  repeatEndMonths,
  onSave,
}: RepeatModalProps) {
  const [enabled, setEnabled] = useState(repeatEnabled);
  const [mode, setMode] = useState(repeatMode);
  const [interval, setInterval] = useState(repeatInterval);
  const [days, setDays] = useState<number[]>(selectedDays);
  const [endOption, setEndOption] = useState(repeatEndOption);
  const [endMonths, setEndMonths] = useState(repeatEndMonths);

  useEffect(() => {
    setEnabled(repeatEnabled);
    setMode(repeatMode);
    setInterval(repeatInterval);
    setDays(selectedDays);
    setEndOption(repeatEndOption);
    setEndMonths(repeatEndMonths);
  }, [
    repeatEnabled,
    repeatMode,
    repeatInterval,
    selectedDays,
    repeatEndOption,
    repeatEndMonths,
  ]);

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const today = new Date().getDay();

  const toggleDay = (dayIndex: number) => {
    // Validasi: tidak boleh pilih hari sebelum hari ini (untuk tugas)
    if (category === "tugas") {
      const deadlineDay = new Date(deadline).getDay();

      // Hitung jumlah hari dari today ke dayIndex
      let daysUntilSelected = dayIndex - today;
      if (daysUntilSelected < 0) daysUntilSelected += 7;

      // Hitung jumlah hari dari today ke deadline
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const daysUntilDeadline = Math.floor(
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Jika hari yang dipilih lebih jauh dari deadline, tolak
      if (daysUntilSelected > daysUntilDeadline) {
        alert("Tidak boleh memilih hari setelah deadline");
        return;
      }
    }

    if (days.includes(dayIndex)) {
      setDays(days.filter((d) => d !== dayIndex));
    } else {
      setDays([...days, dayIndex].sort());
    }
  };

  const handleIntervalChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned === "") {
      setInterval(1);
      return;
    }
    const numValue = parseInt(cleaned, 10);
    if (numValue >= 1 && numValue <= 6) {
      setInterval(numValue);
    }
  };

  const handleEndMonthsChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned === "") {
      setEndMonths(1);
      return;
    }
    const numValue = parseInt(cleaned, 10);
    if (numValue >= 1 && numValue <= 6) {
      setEndMonths(numValue);
    }
  };

  const handleSave = () => {
    if (!enabled) {
      onSave(false, mode, interval, [], endOption, endMonths);
      return;
    }

    // Validasi untuk weekly mode
    if (mode === "weekly" && days.length === 0) {
      alert("Pilih minimal 1 hari untuk pengulangan mingguan");
      return;
    }

    // Validasi interval
    if (interval < 1 || interval > 6) {
      alert("Interval harus antara 1-6");
      return;
    }

    // Validasi end months
    if (
      category !== "tugas" &&
      endOption === "months" &&
      (endMonths < 1 || endMonths > 6)
    ) {
      alert("Batas repeat harus antara 1-6 bulan");
      return;
    }

    onSave(enabled, mode, interval, days, endOption, endMonths);
  };

  const getAvailableModes = () => {
    if (category === "tugas") {
      return [
        { value: "daily", label: "Harian", icon: "today" },
        { value: "weekly", label: "Mingguan", icon: "calendar" },
      ];
    } else if (category === "jadwal") {
      return [
        { value: "daily", label: "Harian", icon: "today" },
        { value: "weekly", label: "Mingguan", icon: "calendar" },
      ];
    } else {
      // kegiatan
      return [
        { value: "daily", label: "Harian", icon: "today" },
        { value: "weekly", label: "Mingguan", icon: "calendar" },
        { value: "monthly", label: "Bulanan", icon: "calendar-outline" },
        { value: "yearly", label: "Tahunan", icon: "calendar-number" },
      ];
    }
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
            <Text style={styles.modalTitle}>Pengulangan</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Enable Toggle */}
            <View style={[styles.modalSection, { marginBottom: 16 }]}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.modalLabel}>Aktifkan Pengulangan</Text>
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
                {/* Repeat Mode */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Mode Pengulangan</Text>
                  <View style={styles.repeatModeContainer}>
                    {getAvailableModes().map((modeOption) => (
                      <TouchableOpacity
                        key={modeOption.value}
                        style={[
                          styles.repeatModeButton,
                          mode === modeOption.value &&
                            styles.repeatModeButtonActive,
                        ]}
                        onPress={() => setMode(modeOption.value as any)}
                      >
                        <Text
                          style={[
                            styles.repeatModeText,
                            mode === modeOption.value &&
                              styles.repeatModeTextActive,
                          ]}
                        >
                          {modeOption.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Interval for Daily/Weekly */}
                {/* {(mode === "daily" || mode === "weekly") && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Interval (1-6)</Text>
                    <View style={styles.intervalContainer}>
                      <Text style={styles.intervalLabel}>Setiap</Text>
                      <TextInput
                        style={styles.intervalInput}
                        value={String(interval)}
                        onChangeText={handleIntervalChange}
                        keyboardType="number-pad"
                        maxLength={1}
                      />
                      <Text style={styles.intervalLabel}>
                        {mode === "daily" ? "hari" : "minggu"}
                      </Text>
                    </View>
                  </View>
                )} */}

                {/* Day Selector for Weekly */}
                {mode === "weekly" && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Pilih Hari</Text>
                    <Text style={styles.modalSubLabel}>
                      {category === "tugas"
                        ? "Pilih hari yang tidak melewati deadline"
                        : "Pilih hari yang ingin diulang"}
                    </Text>
                    <View style={styles.daySelector}>
                      {dayNames.map((dayName, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dayButton,
                            days.includes(index) && styles.dayButtonActive,
                          ]}
                          onPress={() => toggleDay(index)}
                        >
                          <Text
                            style={[
                              styles.dayButtonText,
                              days.includes(index) &&
                                styles.dayButtonTextActive,
                            ]}
                          >
                            {dayName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* End Options - Only for Jadwal & Kegiatan */}
                {category !== "tugas" && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Batas Pengulangan</Text>
                    <View style={styles.endOptionContainer}>
                      {category === "jadwal" && (
                        <>
                          <TouchableOpacity
                            style={[
                              styles.endOptionButton,
                              endOption === "months" &&
                                styles.endOptionButtonActive,
                            ]}
                            onPress={() => setEndOption("months")}
                          >
                            <Text
                              style={[
                                styles.endOptionText,
                                endOption === "months" &&
                                  styles.endOptionTextActive,
                              ]}
                            >
                              1-6 Bulan
                            </Text>
                            {endOption === "months" && (
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color="#007AFF"
                              />
                            )}
                          </TouchableOpacity>

                          {endOption === "months" && (
                            <View style={styles.monthPickerContainer}>
                              <Text style={styles.modalSubLabel}>
                                Pilih durasi:
                              </Text>
                              <View style={styles.monthGrid}>
                                {[1, 2, 3, 4, 5, 6].map((month) => (
                                  <TouchableOpacity
                                    key={month}
                                    style={[
                                      styles.monthButton,
                                      endMonths === month &&
                                        styles.monthButtonActive,
                                    ]}
                                    onPress={() => setEndMonths(month)}
                                  >
                                    <Text
                                      style={[
                                        styles.monthButtonText,
                                        endMonths === month &&
                                          styles.monthButtonTextActive,
                                      ]}
                                    >
                                      {month}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                              <View style={styles.infoBox}>
                                <Ionicons
                                  name="information-circle"
                                  size={16}
                                  color="#007AFF"
                                />
                                <Text style={styles.infoText}>
                                  Pengulangan akan berlangsung selama{" "}
                                  {endMonths} bulan dari sekarang
                                </Text>
                              </View>
                            </View>
                          )}
                        </>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.endOptionButton,
                          endOption === "never" && styles.endOptionButtonActive,
                        ]}
                        onPress={() => setEndOption("never")}
                      >
                        <Text
                          style={[
                            styles.endOptionText,
                            endOption === "never" && styles.endOptionTextActive,
                          ]}
                        >
                          Tanpa Batas (Never)
                        </Text>
                        {endOption === "never" && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#007AFF"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Info */}
                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#5856D6"
                  />
                  <Text style={styles.infoText}>
                    {category === "tugas"
                      ? "Pengulangan hanya sampai deadline. Notifikasi akan dibuat untuk setiap pengulangan."
                      : endOption === "never"
                        ? "Pengulangan tanpa batas akan menggunakan recurring notification."
                        : `Pengulangan akan dibuat hingga ${endMonths} bulan ke depan.`}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
