import ReminderModal from "@/components/tasks/ReminderModal";
import RepeatModal from "@/components/tasks/RepeatModal";
import { useAlert } from "@/components/useAlert";
import { useTask } from "@/hooks/useTasks";
import { useAuth } from "@/lib/AuthContext";
import { styles } from "@/styles/addTaskPage";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function AddTaskPage() {
  const router = useRouter();
  const alert = useAlert();
  const { user } = useAuth();
  const { createTask } = useTask(user?.id || "");

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<"tugas" | "jadwal" | "kegiatan">(
    "tugas"
  );
  const [deadline, setDeadline] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");

  // Reminder States
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(0); // dalam menit negatif dari deadline
  const [reminderTime, setReminderTime] = useState(new Date());

  // Repeat States
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0=Sunday, 1=Monday, etc
  const [repeatEndOption, setRepeatEndOption] = useState<"never" | "months">(
    "never"
  );
  const [repeatEndMonths, setRepeatEndMonths] = useState(1); // 1-6 bulan

  // UI States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = [
    { value: "tugas", label: "Tugas", icon: "briefcase", color: "#1976D2" },
    { value: "jadwal", label: "Jadwal", icon: "school", color: "#F57C00" },
    {
      value: "kegiatan",
      label: "Kegiatan",
      icon: "calendar",
      color: "#7B1FA2",
    },
  ];

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput("");
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert.warning("Error", "Judul harus diisi");
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Combine date & time
      const combinedDeadline = new Date(deadline);
      combinedDeadline.setHours(time.getHours());
      combinedDeadline.setMinutes(time.getMinutes());
      combinedDeadline.setSeconds(0);

      // Calculate actual reminder time
      let actualReminderTime = new Date(combinedDeadline);
      if (reminderEnabled && reminderMinutes !== 0) {
        actualReminderTime = new Date(
          combinedDeadline.getTime() + reminderMinutes * 60000
        );
      }

      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        notes: category === "tugas" ? notes.trim() || undefined : undefined,
        category,
        deadline: combinedDeadline,
        reminderEnabled,
        reminderMinutes,
        reminderTime: actualReminderTime,
        repeatEnabled,
        repeatMode: repeatEnabled ? repeatMode : undefined,
        repeatInterval: repeatEnabled ? repeatInterval : undefined,
        selectedDays:
          repeatEnabled && repeatMode === "weekly" ? selectedDays : undefined,
        repeatEndOption:
          category !== "tugas" && repeatEnabled ? repeatEndOption : undefined,
        repeatEndMonths:
          category !== "tugas" && repeatEnabled && repeatEndOption === "months"
            ? repeatEndMonths
            : undefined,
        subtasks:
          category === "tugas" && subtasks.length > 0 ? subtasks : undefined,
        status: "in_progress" as const,
      };
      // console.log("Tasks:", JSON.stringify(taskData, null, 2));
      // return;
      const result = await createTask(taskData as any);

      if (result) {
        alert.success(
          "Berhasil",
          `${getCategoryLabel(category)} berhasil ditambahkan`
        );
        router.back();
      } else {
        alert.error("Error", "Gagal menambahkan tugas");
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      alert.error("Error", "Gagal menambahkan tugas");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "tugas":
        return "Tugas";
      case "jadwal":
        return "Jadwal";
      case "kegiatan":
        return "Kegiatan";
      default:
        return "Item";
    }
  };

  const getReminderText = () => {
    if (!reminderEnabled) return "Tidak ada";

    const absMinutes = Math.abs(reminderMinutes);
    if (absMinutes === 0) return "Saat deadline";
    if (absMinutes < 60) return `${absMinutes} menit sebelumnya`;
    if (absMinutes < 1440)
      return `${Math.floor(absMinutes / 60)} jam sebelumnya`;
    return `${Math.floor(absMinutes / 1440)} hari sebelumnya`;
  };

  const getRepeatText = () => {
    if (!repeatEnabled) return "Tidak ada";

    let text = "";
    if (repeatMode === "daily") {
      text =
        repeatInterval === 1 ? "Setiap hari" : `Setiap ${repeatInterval} hari`;
    } else if (repeatMode === "weekly") {
      text =
        repeatInterval === 1
          ? "Setiap minggu"
          : `Setiap ${repeatInterval} minggu`;
      if (selectedDays.length > 0) {
        const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        const days = selectedDays.map((d) => dayNames[d]).join(", ");
        text += ` (${days})`;
      }
    } else if (repeatMode === "monthly") {
      text = "Setiap bulan";
    } else if (repeatMode === "yearly") {
      text = "Setiap tahun";
    }

    if (category !== "tugas" && repeatEndOption === "months") {
      text += ` - ${repeatEndMonths} bulan`;
    }

    return text;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="close" size={28} color="#8E8E93" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Buat Baru</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[
                styles.headerButton,
                isSubmitting && styles.headerButtonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons name="checkmark" size={28} color="#007AFF" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Category Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Kategori</Text>
              <View style={styles.categoryGrid}>
                {categoryOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.categoryCard,
                      category === option.value && styles.categoryCardActive,
                    ]}
                    onPress={() => setCategory(option.value as any)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: `${option.color}15` },
                      ]}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={option.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        category === option.value && styles.categoryLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {category === option.value && (
                      <View style={styles.categoryCheckmark}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={option.color}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Judul</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Masukkan judul..."
                  placeholderTextColor="#C7C7CC"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Deskripsi</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Tambahkan deskripsi singkat..."
                  placeholderTextColor="#C7C7CC"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Notes - Only for Tugas */}
            {category === "tugas" && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Catatan</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Tambahkan catatan..."
                    placeholderTextColor="#C7C7CC"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
            )}

            {/* Date & Time */}
            <View style={styles.dateTimeRow}>
              <View style={[styles.section, styles.dateTimeSection]}>
                <Text style={styles.sectionLabel}>
                  {category === "tugas" ? "Deadline" : "Tanggal"}
                </Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                  <Text style={styles.pickerText}>
                    {deadline.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.section, styles.dateTimeSection]}>
                <Text style={styles.sectionLabel}>Waktu</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color="#007AFF" />
                  <Text style={styles.pickerText}>
                    {time.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reminder */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => setShowReminderModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.optionIcon,
                      { backgroundColor: "#FF950015" },
                    ]}
                  >
                    <Ionicons name="notifications" size={20} color="#FF9500" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>Pengingat</Text>
                    <Text style={styles.optionValue}>{getReminderText()}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            </View>

            {/* Repeat */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => setShowRepeatModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.optionIcon,
                      { backgroundColor: "#5856D615" },
                    ]}
                  >
                    <Ionicons name="repeat" size={20} color="#5856D6" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>Pengulangan</Text>
                    <Text style={styles.optionValue}>{getRepeatText()}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            </View>

            {/* Subtasks - Only for Tugas */}
            {category === "tugas" && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Subtask</Text>
                <View style={styles.subtaskInput}>
                  <TextInput
                    style={styles.input}
                    value={subtaskInput}
                    onChangeText={setSubtaskInput}
                    placeholder="Tambah subtask..."
                    placeholderTextColor="#C7C7CC"
                    onSubmitEditing={handleAddSubtask}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddSubtask}
                  >
                    <Ionicons name="add-circle" size={28} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                {subtasks.map((subtask, index) => (
                  <View key={index} style={styles.subtaskItem}>
                    <Ionicons
                      name="ellipse-outline"
                      size={18}
                      color="#8E8E93"
                    />
                    <Text style={styles.subtaskText}>{subtask}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSubtask(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            if (Platform.OS === "android") setShowDatePicker(false);
            if (event.type === "set" && date) {
              setDeadline(date);
              if (Platform.OS === "ios") setShowDatePicker(false);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedTime) => {
            if (Platform.OS === "android") setShowTimePicker(false);
            if (event.type === "set" && selectedTime) {
              setTime(selectedTime);
              if (Platform.OS === "ios") setShowTimePicker(false);
            }
          }}
        />
      )}

      {/* Reminder Modal */}
      <ReminderModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        deadline={deadline}
        time={time}
        reminderEnabled={reminderEnabled}
        reminderMinutes={reminderMinutes}
        onSave={(enabled, minutes) => {
          setReminderEnabled(enabled);
          setReminderMinutes(minutes);
          setShowReminderModal(false);
        }}
      />

      {/* Repeat Modal */}
      <RepeatModal
        visible={showRepeatModal}
        onClose={() => setShowRepeatModal(false)}
        category={category}
        deadline={deadline}
        repeatEnabled={repeatEnabled}
        repeatMode={repeatMode}
        repeatInterval={repeatInterval}
        selectedDays={selectedDays}
        repeatEndOption={repeatEndOption}
        repeatEndMonths={repeatEndMonths}
        onSave={(enabled, mode, interval, days, endOption, endMonths) => {
          setRepeatEnabled(enabled);
          setRepeatMode(mode);
          setRepeatInterval(interval);
          setSelectedDays(days);
          setRepeatEndOption(endOption);
          setRepeatEndMonths(endMonths);
          setShowRepeatModal(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}
