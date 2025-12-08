import { useAuth } from "@/lib/AuthContext";
import { editTaskModalStyles as styles } from "@/styles/editTaskModal";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Task {
  id: number;
  title: string;
  description?: string;
  notes?: string;
  category: "tugas" | "jadwal" | "kegiatan";
  deadline: string;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  reminderTime: string;
  repeatEnabled: boolean;
  repeatOption: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  customInterval?: number;
  customUnit?: "days" | "weeks" | "months" | "years";
  endOption?: string;
  status: string;
  subtasks?: Array<{ id: number; title: string; completed: boolean }>;
}

interface EditTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (taskId: number, taskData: any) => Promise<boolean>;
}

export default function EditTaskModal({
  visible,
  task,
  onClose,
  onUpdateTask,
}: EditTaskModalProps) {
  // States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<"tugas" | "jadwal" | "kegiatan">("tugas");
  const [deadline, setDeadline] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [repeatOption, setRepeatOption] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly" | "custom">("none");
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [subtasks, setSubtasks] = useState<Array<{ id?: number; title: string; completed?: boolean }>>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState("0");
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [customInterval, setCustomInterval] = useState(1);
  const [customUnit, setCustomUnit] = useState<"days" | "weeks" | "months" | "years">("days");
  const [endOption, setEndOption] = useState("never");
  const [repeatEndDate, setRepeatEndDate] = useState(new Date());

  // UI States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRepeatEndDatePicker, setShowRepeatEndDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesWordCount, setNotesWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  // Load task data when modal opens
  useEffect(() => {
    if (task && visible) {
      loadTaskData(task);
    }
  }, [task, visible]);

  useEffect(() => {
    const words = notes.trim().split(/\s+/).filter((w) => w.length > 0);
    setNotesWordCount(words.length);
  }, [notes]);

  const loadTaskData = (taskData: Task) => {
    setTitle(taskData.title);
    setDescription(taskData.description || "");
    setNotes(taskData.notes || "");
    setCategory(taskData.category);
    
    // Parse deadline
    const deadlineDate = new Date(taskData.deadline);
    setDeadline(deadlineDate);
    setTime(deadlineDate);

    // Parse reminder time
    if (taskData.reminderTime) {
      const [hours, minutes] = taskData.reminderTime.split(':').map(Number);
      const remTime = new Date();
      remTime.setHours(hours, minutes, 0, 0);
      setReminderTime(remTime);
    }

    setReminderEnabled(taskData.reminderEnabled);
    setReminderDaysBefore(taskData.reminderDaysBefore.toString());
    
    // Check if custom days
    const standardDays = ["0", "1", "3", "7"];
    setIsCustomDays(!standardDays.includes(taskData.reminderDaysBefore.toString()));

    setRepeatEnabled(taskData.repeatEnabled);
    setRepeatOption(taskData.repeatOption);
    
    if (taskData.customInterval) setCustomInterval(taskData.customInterval);
    if (taskData.customUnit) setCustomUnit(taskData.customUnit);
    if (taskData.endOption) setEndOption(taskData.endOption);

    // Load subtasks
    if (taskData.subtasks) {
      setSubtasks(taskData.subtasks);
    }
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, { title: subtaskInput.trim(), completed: false }]);
      setSubtaskInput("");
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleCustomDaysChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned === "") {
      setReminderDaysBefore("0");
      return;
    }
    const numValue = parseInt(cleaned, 10);
    const MAX_DAYS = 365;
    if (numValue >= 0 && numValue <= MAX_DAYS) {
      setReminderDaysBefore(numValue.toString());
    } else if (numValue > MAX_DAYS) {
      setReminderDaysBefore(MAX_DAYS.toString());
    }
  };

  const handleSubmit = async () => {
    if (!task) return;

    if (!title.trim()) {
      Alert.alert("Error", "Judul harus diisi");
      return;
    }

    const daysBeforeNum = parseInt(reminderDaysBefore);
    if (reminderEnabled && (isNaN(daysBeforeNum) || daysBeforeNum < 0)) {
      Alert.alert("Error", "Hari pengingat harus angka positif");
      return;
    }

    if (isSubmitting) return;

    try {
      const combinedDeadline = new Date(deadline);
      combinedDeadline.setHours(time.getHours());
      combinedDeadline.setMinutes(time.getMinutes());
      combinedDeadline.setSeconds(0);
      combinedDeadline.setMilliseconds(0);
      
      const finalEndOption = category === "tugas" ? "deadline" : endOption;

      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        notes: category === "tugas" ? notes.trim() || undefined : undefined,
        category: category,
        deadline: combinedDeadline,
        reminderEnabled,
        reminderDaysBefore: daysBeforeNum,
        reminderTime: reminderTime,
        repeatEnabled: repeatEnabled,
        repeatOption: repeatEnabled ? repeatOption : "none",
        customInterval: repeatOption === "custom" ? customInterval : undefined,
        customUnit: repeatOption === "custom" ? customUnit : undefined,
        endOption: finalEndOption,
        subtasks: category === "tugas" && subtasks.length > 0 
          ? subtasks.map(st => st.title) 
          : undefined,
        status: task.status,
      };

      setIsSubmitting(true);
      const result = await onUpdateTask(task.id, taskData);
      setIsSubmitting(false);

      if (result) {
        onClose();
        Alert.alert("Berhasil", `${getCategoryLabel(category)} berhasil diperbarui`);
      } else {
        Alert.alert("Error", "Gagal memperbarui tugas");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Gagal memperbarui tugas");
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "tugas": return "Tugas";
      case "jadwal": return "Jadwal";
      case "kegiatan": return "Kegiatan";
      default: return "Item";
    }
  };

  const categoryOptions = [
    { value: "tugas", label: "Tugas", icon: "briefcase", color: "#1976D2" },
    { value: "jadwal", label: "Jadwal", icon: "school", color: "#F57C00" },
    { value: "kegiatan", label: "Kegiatan", icon: "calendar", color: "#7B1FA2" },
  ];

  const repeatOptions = [
    { value: "daily", label: "Harian", icon: "today" },
    { value: "weekly", label: "Mingguan", icon: "calendar" },
    { value: "monthly", label: "Bulanan", icon: "calendar-outline" },
    { value: "yearly", label: "Tahunan", icon: "calendar-number" },
    { value: "custom", label: "Kustom", icon: "settings-outline" },
  ];

  const filteredRepeatOptions = category !== "tugas" 
    ? repeatOptions.filter((o) => o.value !== "custom") 
    : repeatOptions;

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Ionicons name="close" size={28} color="#8E8E93" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit {getCategoryLabel(category)}</Text>
            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={isSubmitting}
              style={[styles.headerButton, isSubmitting && styles.headerButtonDisabled]}
            >
              <Ionicons name="checkmark" size={28} color={isSubmitting ? "#C7C7CC" : "#007AFF"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                    <View style={[styles.categoryIcon, { backgroundColor: `${option.color}15` }]}>
                      <Ionicons name={option.icon as any} size={24} color={option.color} />
                    </View>
                    <Text style={[
                      styles.categoryLabel,
                      category === option.value && styles.categoryLabelActive
                    ]}>
                      {option.label}
                    </Text>
                    {category === option.value && (
                      <View style={styles.categoryCheckmark}>
                        <Ionicons name="checkmark-circle" size={20} color={option.color} />
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

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Catatan</Text>
              <TouchableOpacity
                style={styles.notesCard}
                onPress={() => setShowNotesModal(true)}
                activeOpacity={0.7}
              >
                {notes ? (
                  <View>
                    <Text style={styles.notesPreview} numberOfLines={3}>
                      {notes}
                    </Text>
                    <View style={styles.notesFooter}>
                      <Text style={styles.notesMeta}>{notesWordCount} kata</Text>
                      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.notesEmpty}>
                    <Ionicons name="document-text-outline" size={40} color="#E5E5EA" />
                    <Text style={styles.notesEmptyText}>Tap untuk menulis catatan</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

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
                    {deadline.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
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
                    {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reminder Toggle */}
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <View style={styles.toggleIcon}>
                    <Ionicons name="notifications" size={20} color="#FF9500" />
                  </View>
                  <Text style={styles.toggleLabel}>Pengingat</Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {reminderEnabled && (
                <View style={styles.expandedContent}>
                  <Text style={styles.subLabel}>Ingatkan berapa hari sebelumnya?</Text>
                  <View style={styles.chipRow}>
                    {["0", "1", "3", "7"].map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.chip,
                          reminderDaysBefore === day && !isCustomDays && styles.chipActive,
                        ]}
                        onPress={() => {
                          setReminderDaysBefore(day);
                          setIsCustomDays(false);
                        }}
                      >
                        <Text style={[
                          styles.chipText,
                          reminderDaysBefore === day && !isCustomDays && styles.chipTextActive
                        ]}>
                          {day === "0" ? "Hari ini" : `${day}h`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[styles.chip, isCustomDays && styles.chipActive]}
                      onPress={() => {
                        setIsCustomDays(true);
                        if (!["0", "1", "3", "7"].includes(reminderDaysBefore)) {
                          // Keep current value if it's already custom
                        } else {
                          setReminderDaysBefore("5");
                        }
                      }}
                    >
                      <Text style={[styles.chipText, isCustomDays && styles.chipTextActive]}>
                        Custom
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isCustomDays && (
                    <View style={styles.customInput}>
                      <TextInput
                        style={styles.customInputField}
                        value={reminderDaysBefore}
                        onChangeText={handleCustomDaysChange}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#C7C7CC"
                        maxLength={3}
                      />
                      <Text style={styles.customInputUnit}>hari</Text>
                    </View>
                  )}

                  <Text style={[styles.subLabel, { marginTop: 16 }]}>Jam pengingat</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowReminderTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={20} color="#007AFF" />
                    <Text style={styles.pickerText}>
                      {reminderTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={16} color="#007AFF" />
                    <Text style={styles.infoText}>
                      Pengingat akan dikirim{" "}
                      {reminderDaysBefore === "0" ? "hari ini" : `${reminderDaysBefore} hari sebelumnya`}{" "}
                      pada {reminderTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Repeat Toggle */}
            {reminderEnabled && (
              <View style={styles.section}>
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <View style={styles.toggleIcon}>
                      <Ionicons name="repeat" size={20} color="#5856D6" />
                    </View>
                    <Text style={styles.toggleLabel}>Pengulangan</Text>
                  </View>
                  <Switch
                    value={repeatEnabled}
                    onValueChange={setRepeatEnabled}
                    trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {repeatEnabled && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.subLabel}>Ulangi setiap</Text>
                    <View style={styles.chipRow}>
                      {filteredRepeatOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.chip,
                            repeatOption === option.value && styles.chipActive,
                          ]}
                          onPress={() => setRepeatOption(option.value as any)}
                        >
                          <Ionicons
                            name={option.icon as any}
                            size={14}
                            color={repeatOption === option.value ? "#FFF" : "#007AFF"}
                          />
                          <Text style={[
                            styles.chipText,
                            repeatOption === option.value && styles.chipTextActive
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {repeatOption === "custom" && (
                      <View style={styles.customRepeat}>
                        <Text style={styles.subLabel}>Setiap:</Text>
                        <View style={styles.customRepeatRow}>
                          <TextInput
                            style={styles.customRepeatInput}
                            value={String(customInterval)}
                            onChangeText={(text) => setCustomInterval(Number(text) || 1)}
                            keyboardType="number-pad"
                          />
                          <View style={styles.unitSelector}>
                            {[
                              { value: "days", label: "Hari" },
                              { value: "weeks", label: "Minggu" },
                              { value: "months", label: "Bulan" },
                            ].map((unit) => (
                              <TouchableOpacity
                                key={unit.value}
                                style={[
                                  styles.unitButton,
                                  customUnit === unit.value && styles.unitButtonActive,
                                ]}
                                onPress={() => setCustomUnit(unit.value as any)}
                              >
                                <Text style={[
                                  styles.unitButtonText,
                                  customUnit === unit.value && styles.unitButtonTextActive
                                ]}>
                                  {unit.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>
                    )}

                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle" size={16} color="#5856D6" />
                      <Text style={styles.infoText}>
                        {category === "jadwal" ? "Jadwal" : "Kegiatan"} akan diulang{" "}
                        {endOption === "never" ? "selamanya" : `sampai ${repeatEndDate.toLocaleDateString("id-ID")}`}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Subtasks */}
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
                  <TouchableOpacity style={styles.addButton} onPress={handleAddSubtask}>
                    <Ionicons name="add-circle" size={28} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                {subtasks.map((subtask, index) => (
                  <View key={index} style={styles.subtaskItem}>
                    <Ionicons 
                      name={subtask.completed ? "checkmark-circle" : "ellipse-outline"} 
                      size={18} 
                      color={subtask.completed ? "#34C759" : "#8E8E93"} 
                    />
                    <Text style={[
                      styles.subtaskText,
                      subtask.completed && styles.subtaskTextCompleted
                    ]}>
                      {subtask.title}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveSubtask(index)}>
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>

        {/* Date Pickers */}
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

        {showReminderTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            is24Hour={true}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedTime) => {
              if (Platform.OS === "android") setShowReminderTimePicker(false);
              if (event.type === "set" && selectedTime) {
                setReminderTime(selectedTime);
                if (Platform.OS === "ios") setShowReminderTimePicker(false);
              }
            }}
          />
        )}
      </KeyboardAvoidingView>

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.notesModal}>
          <View style={styles.notesHeader}>
            <TouchableOpacity onPress={() => setShowNotesModal(false)} style={styles.notesBack}>
              <Ionicons name="chevron-back" size={28} color="#007AFF" />
              <Text style={styles.notesBackText}>Kembali</Text>
            </TouchableOpacity>
            <Text style={styles.notesCount}>{notesWordCount} kata</Text>
          </View>

          <ScrollView style={styles.notesBody}>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Tulis catatan Anda di sini..."
              placeholderTextColor="#C7C7CC"
              multiline
              autoFocus
            />
          </ScrollView>

          <View style={styles.notesToolbar}>
            <TouchableOpacity onPress={() => { setNotes(""); setNotesWordCount(0); }}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={styles.notesDate}>
              {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}