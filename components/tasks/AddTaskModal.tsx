import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { formStyles } from "@/styles/formStyles";
import { modalStyles } from "@/styles/modalStyles";

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (taskData: any, subtasks: string[]) => Promise<void>;
}

export default function AddTaskModal({
  visible,
  onClose,
  onSubmit,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<"tugas" | "jadwal" | "kegiatan">("tugas");
  const [deadline, setDeadline] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [repeatOption, setRepeatOption] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("none");
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatEndDate, setRepeatEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRepeatEndDatePicker, setShowRepeatEndDatePicker] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState("1");
  const [reminderTime, setReminderTime] = useState(new Date());
  const [reminderFrequency, setReminderFrequency] = useState<"once" | "daily" | "every_2_days" | "every_3_days" | "weekly">("once");
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesWordCount, setNotesWordCount] = useState(0);

  useEffect(() => {
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    setReminderTime(defaultTime);
    setTime(defaultTime);
    
    // Set repeat end date to 3 months from now as default
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    setRepeatEndDate(threeMonthsLater);
  }, []);

  // Smart reminder time: Update when deadline or time changes
  useEffect(() => {
    if (reminderEnabled && category !== "tugas") {
      // For jadwal & kegiatan: 3 hours before the time
      const smartTime = new Date(time);
      smartTime.setHours(smartTime.getHours() - 3);
      if (smartTime.getHours() >= 0) {
        setReminderTime(smartTime);
      }
    }
  }, [time, deadline, reminderEnabled]);

  useEffect(() => {
    const words = notes
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    setNotesWordCount(words.length);
  }, [notes]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setNotes("");
    setCategory("tugas");
    setDeadline(new Date());
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    setTime(defaultTime);
    setRepeatOption("none");
    setRepeatEnabled(false);
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    setRepeatEndDate(threeMonthsLater);
    setSubtasks([]);
    setSubtaskInput("");
    setReminderEnabled(false);
    setReminderDaysBefore("1");
    setReminderFrequency("once");
    setReminderTime(defaultTime);
    setNotesWordCount(0);
  };

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
      Alert.alert("Error", "Judul harus diisi");
      return;
    }

    const daysBeforeNum = parseInt(reminderDaysBefore);
    if (reminderEnabled && (isNaN(daysBeforeNum) || daysBeforeNum < 0)) {
      Alert.alert("Error", "Hari pengingat harus angka positif");
      return;
    }

    try {
      const timeString = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
      const reminderTimeString = `${String(reminderTime.getHours()).padStart(2, "0")}:${String(reminderTime.getMinutes()).padStart(2, "0")}`;

      await onSubmit(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          notes: category === "tugas" ? (notes.trim() || undefined) : undefined,
          category: category,
          deadline: deadline.toISOString(),
          time: category !== "tugas" ? timeString : undefined,
          repeatOption: category !== "tugas" && repeatEnabled ? repeatOption : "none",
          repeatEndDate: category !== "tugas" && repeatEnabled && repeatOption !== "none" ? repeatEndDate.toISOString() : undefined,
          reminderEnabled,
          reminderDaysBefore: daysBeforeNum,
          reminderTime: reminderTimeString,
          reminderFrequency: category === "tugas" ? reminderFrequency : "once",
        },
        category === "tugas" ? subtasks : []
      );

      resetForm();
      onClose();
      Alert.alert("Berhasil", `${getCategoryLabel(category)} berhasil ditambahkan`);
    } catch (error) {
      console.error("Error submitting task:", error);
      Alert.alert("Error", "Gagal menambahkan");
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case "tugas": return "Tugas";
      case "jadwal": return "Jadwal";
      case "kegiatan": return "Kegiatan";
      default: return "Item";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={modalStyles.modalContainer}
      >
        <SafeAreaView style={modalStyles.modalSafe}>
          <View style={modalStyles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={modalStyles.modalCancel}>Batal</Text>
            </TouchableOpacity>
            <Text style={modalStyles.modalTitle}>Tambah Baru</Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={modalStyles.modalDone}>Simpan</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={modalStyles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Selector */}
            <View style={formStyles.formGroup}>
              <Text style={formStyles.formLabel}>KATEGORI *</Text>
              <View style={formStyles.categorySelectorRow}>
                <TouchableOpacity
                  style={[
                    formStyles.categoryOptionBtn,
                    category === "tugas" && formStyles.categoryOptionBtnActive,
                  ]}
                  onPress={() => setCategory("tugas")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      formStyles.categoryOptionIconContainer,
                      formStyles.categoryOptionIconTugas,
                    ]}
                  >
                    <Ionicons name="briefcase" size={20} color="#1976D2" />
                  </View>
                  <Text
                    style={[
                      formStyles.categoryOptionText,
                      category === "tugas" && formStyles.categoryOptionTextActive,
                    ]}
                  >
                    Tugas
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    formStyles.categoryOptionBtn,
                    category === "jadwal" && formStyles.categoryOptionBtnActive,
                  ]}
                  onPress={() => setCategory("jadwal")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      formStyles.categoryOptionIconContainer,
                      formStyles.categoryOptionIconJadwal,
                    ]}
                  >
                    <Ionicons name="school" size={20} color="#F57C00" />
                  </View>
                  <Text
                    style={[
                      formStyles.categoryOptionText,
                      category === "jadwal" && formStyles.categoryOptionTextActive,
                    ]}
                  >
                    Jadwal
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    formStyles.categoryOptionBtn,
                    category === "kegiatan" && formStyles.categoryOptionBtnActive,
                  ]}
                  onPress={() => setCategory("kegiatan")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      formStyles.categoryOptionIconContainer,
                      formStyles.categoryOptionIconKegiatan,
                    ]}
                  >
                    <Ionicons name="calendar" size={20} color="#7B1FA2" />
                  </View>
                  <Text
                    style={[
                      formStyles.categoryOptionText,
                      category === "kegiatan" && formStyles.categoryOptionTextActive,
                    ]}
                  >
                    Kegiatan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Title */}
            <View style={formStyles.formGroup}>
              <Text style={formStyles.formLabel}>JUDUL *</Text>
              <TextInput
                style={formStyles.formInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Masukkan judul"
                placeholderTextColor="#C7C7CC"
              />
            </View>

            {/* Description */}
            <View style={formStyles.formGroup}>
              <Text style={formStyles.formLabel}>DESKRIPSI</Text>
              <TextInput
                style={[formStyles.formInput, formStyles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Tambahkan deskripsi..."
                placeholderTextColor="#C7C7CC"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Notes - Only for Tugas */}
            {category === "tugas" && (
              <View style={formStyles.formGroup}>
                <Text style={formStyles.formLabel}>CATATAN</Text>
                <TouchableOpacity
                  style={formStyles.notesPreviewCard}
                  onPress={() => setShowNotesModal(true)}
                >
                  {notes ? (
                    <View style={formStyles.notesPreviewContent}>
                      <Text style={formStyles.notesPreviewText} numberOfLines={3}>
                        {notes}
                      </Text>
                      <View style={formStyles.notesPreviewFooter}>
                        <Text style={formStyles.notesPreviewMeta}>
                          {notesWordCount} kata · {new Date().toLocaleDateString("id-ID")}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                      </View>
                    </View>
                  ) : (
                    <View style={formStyles.notesEmptyState}>
                      <Ionicons name="document-text-outline" size={32} color="#C7C7CC" />
                      <Text style={formStyles.notesEmptyText}>Tap untuk menulis catatan...</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Notes Editor Modal */}
            <Modal
              visible={showNotesModal}
              animationType="slide"
              presentationStyle="fullScreen"
              onRequestClose={() => setShowNotesModal(false)}
            >
              <SafeAreaView style={modalStyles.notesEditorContainer}>
                <View style={modalStyles.notesEditorHeader}>
                  <TouchableOpacity
                    style={modalStyles.notesEditorBackBtn}
                    onPress={() => setShowNotesModal(false)}
                  >
                    <Ionicons name="chevron-back" size={28} color="#007AFF" />
                    <Text style={modalStyles.notesEditorBackText}>Kembali</Text>
                  </TouchableOpacity>
                  <View style={modalStyles.notesEditorInfo}>
                    <Text style={modalStyles.notesEditorWordCount}>{notesWordCount} kata</Text>
                  </View>
                </View>

                <ScrollView style={modalStyles.notesEditorBody} keyboardShouldPersistTaps="handled">
                  <TextInput
                    style={modalStyles.notesEditorInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Mulai menulis catatan Anda..."
                    placeholderTextColor="#C7C7CC"
                    multiline
                    autoFocus
                    textAlignVertical="top"
                  />
                </ScrollView>

                <View style={modalStyles.notesEditorToolbar}>
                  <TouchableOpacity
                    style={modalStyles.notesToolbarBtn}
                    onPress={() => {
                      setNotes("");
                      setNotesWordCount(0);
                    }}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                  <View style={modalStyles.notesToolbarDivider} />
                  <Text style={modalStyles.notesToolbarDate}>
                    {new Date().toLocaleString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </SafeAreaView>
            </Modal>

            {/* Date */}
            <View style={formStyles.formGroup}>
              <Text style={formStyles.formLabel}>
                {category === "tugas" ? "DEADLINE *" : "TANGGAL *"}
              </Text>
              <TouchableOpacity
                style={formStyles.datePickerBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                <Text style={formStyles.datePickerText}>
                  {deadline.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

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
                  } else if (event.type === "dismissed") {
                    setShowDatePicker(false);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            {Platform.OS === "ios" && showDatePicker && (
              <View style={modalStyles.datePickerActions}>
                <TouchableOpacity
                  style={modalStyles.datePickerDoneBtn}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={modalStyles.datePickerDoneText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Time - Only for Jadwal & Kegiatan */}
            {category !== "tugas" && (
              <View style={formStyles.formGroup}>
                <Text style={formStyles.formLabel}>WAKTU *</Text>
                <TouchableOpacity
                  style={formStyles.timePickerBtn}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={24} color="#007AFF" />
                  <Text style={formStyles.timePickerText}>
                    {time.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Text>
                  <View style={formStyles.timePickerChevron}>
                    <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                  </View>
                </TouchableOpacity>

                {showTimePicker && (
                  <>
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
                        } else if (event.type === "dismissed") {
                          setShowTimePicker(false);
                        }
                      }}
                    />
                    {Platform.OS === "ios" && (
                      <View style={modalStyles.datePickerActions}>
                        <TouchableOpacity
                          style={modalStyles.datePickerDoneBtn}
                          onPress={() => setShowTimePicker(false)}
                        >
                          <Text style={modalStyles.datePickerDoneText}>Selesai</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Repeat Option - Only for Jadwal & Kegiatan */}
            {category !== "tugas" && (
              <View style={formStyles.formGroup}>
                <View style={formStyles.reminderHeader}>
                  <View style={formStyles.reminderLabelRow}>
                    <Ionicons name="repeat" size={20} color="#007AFF" />
                    <Text style={formStyles.formLabelInline}>PENGULANGAN</Text>
                  </View>
                  <Switch
                    value={repeatEnabled}
                    onValueChange={(value) => {
                      setRepeatEnabled(value);
                      if (!value) {
                        setRepeatOption("none");
                      } else {
                        setRepeatOption("weekly");
                      }
                    }}
                    trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#E5E5EA"
                  />
                </View>

                {repeatEnabled && (
                  <View style={formStyles.reminderSettings}>
                    <Text style={formStyles.reminderSectionLabel}>Ulangi setiap</Text>
                    <View style={formStyles.repeatOptionsRow}>
                      {[
                        { value: "daily", label: "Harian", icon: "today" },
                        { value: "weekly", label: "Mingguan", icon: "calendar" },
                        { value: "monthly", label: "Bulanan", icon: "calendar-outline" },
                        { value: "yearly", label: "Tahunan", icon: "calendar-number" },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            formStyles.repeatOptionBtn,
                            repeatOption === option.value && formStyles.repeatOptionBtnActive,
                          ]}
                          onPress={() => setRepeatOption(option.value as any)}
                          activeOpacity={0.7}
                        >
                          <Ionicons 
                            name={option.icon as any} 
                            size={16} 
                            color={repeatOption === option.value ? "#FFFFFF" : "#007AFF"}
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={[
                              formStyles.repeatOptionText,
                              repeatOption === option.value && formStyles.repeatOptionTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[formStyles.reminderSectionLabel, { marginTop: 16 }]}>
                      Ulangi sampai
                    </Text>
                    <TouchableOpacity
                      style={formStyles.datePickerBtn}
                      onPress={() => setShowRepeatEndDatePicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                      <Text style={formStyles.datePickerText}>
                        {repeatEndDate.toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                    </TouchableOpacity>

                    {showRepeatEndDatePicker && (
                      <>
                        <DateTimePicker
                          value={repeatEndDate}
                          mode="date"
                          display={Platform.OS === "ios" ? "spinner" : "default"}
                          onChange={(event, date) => {
                            if (Platform.OS === "android") setShowRepeatEndDatePicker(false);
                            if (event.type === "set" && date) {
                              setRepeatEndDate(date);
                              if (Platform.OS === "ios") setShowRepeatEndDatePicker(false);
                            } else if (event.type === "dismissed") {
                              setShowRepeatEndDatePicker(false);
                            }
                          }}
                          minimumDate={deadline}
                        />
                        {Platform.OS === "ios" && (
                          <View style={modalStyles.datePickerActions}>
                            <TouchableOpacity
                              style={modalStyles.datePickerDoneBtn}
                              onPress={() => setShowRepeatEndDatePicker(false)}
                            >
                              <Text style={modalStyles.datePickerDoneText}>Selesai</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}

                    <Text style={formStyles.reminderHint}>
                      💡 {category === "jadwal" ? "Jadwal" : "Kegiatan"} akan diulang{" "}
                      {repeatOption === "daily" ? "setiap hari" :
                       repeatOption === "weekly" ? "setiap minggu" :
                       repeatOption === "monthly" ? "setiap bulan" : "setiap tahun"}{" "}
                      sampai {repeatEndDate.toLocaleDateString("id-ID")}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Subtasks - Only for Tugas */}
            {category === "tugas" && (
              <View style={formStyles.formGroup}>
                <Text style={formStyles.formLabel}>SUBTASK</Text>
                <View style={formStyles.subtaskInputRow}>
                  <TextInput
                    style={formStyles.subtaskInput}
                    value={subtaskInput}
                    onChangeText={setSubtaskInput}
                    placeholder="Tambahkan subtask..."
                    placeholderTextColor="#C7C7CC"
                    onSubmitEditing={handleAddSubtask}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={formStyles.addSubtaskBtn} onPress={handleAddSubtask}>
                    <Ionicons name="add-circle" size={28} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                {subtasks.map((subtask, index) => (
                  <View key={index} style={formStyles.subtaskPreview}>
                    <Ionicons name="ellipse-outline" size={20} color="#8E8E93" />
                    <Text style={formStyles.subtaskPreviewText}>{subtask}</Text>
                    <TouchableOpacity onPress={() => handleRemoveSubtask(index)}>
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Reminder Section */}
            <View style={formStyles.formGroup}>
              <View style={formStyles.reminderHeader}>
                <View style={formStyles.reminderLabelRow}>
                  <Ionicons name="notifications-outline" size={20} color="#007AFF" />
                  <Text style={formStyles.formLabelInline}>PENGINGAT</Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E5E5EA"
                />
              </View>

              {reminderEnabled && (
                <View style={formStyles.reminderSettings}>
                  <Text style={formStyles.reminderSectionLabel}>Ingatkan saya</Text>

                  <View style={formStyles.reminderDaysRow}>
                    {["0", "1", "3", "7"].map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          formStyles.reminderDayBtn,
                          reminderDaysBefore === day && formStyles.reminderDayBtnActive,
                        ]}
                        onPress={() => setReminderDaysBefore(day)}
                      >
                        <Text
                          style={[
                            formStyles.reminderDayText,
                            reminderDaysBefore === day && formStyles.reminderDayTextActive,
                          ]}
                        >
                          {day === "0" ? "Hari ini" : `${day} hari`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={formStyles.customDaysContainer}>
                    <Text style={formStyles.customDaysLabel}>Atau masukkan jumlah hari:</Text>
                    <TextInput
                      style={formStyles.customDaysInput}
                      value={reminderDaysBefore}
                      onChangeText={setReminderDaysBefore}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="#C7C7CC"
                      maxLength={3}
                    />
                    <Text style={formStyles.customDaysUnit}>hari sebelumnya</Text>
                  </View>

                  <Text style={[formStyles.reminderSectionLabel, { marginTop: 16 }]}>
                    Jam pengingat
                  </Text>
                  <TouchableOpacity
                    style={formStyles.timePickerBtn}
                    onPress={() => setShowReminderTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={24} color="#007AFF" />
                    <Text style={formStyles.timePickerText}>
                      {reminderTime.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </Text>
                    <View style={formStyles.timePickerChevron}>
                      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                    </View>
                  </TouchableOpacity>

                  {showReminderTimePicker && (
                    <>
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
                          } else if (event.type === "dismissed") {
                            setShowReminderTimePicker(false);
                          }
                        }}
                      />
                      {Platform.OS === "ios" && (
                        <View style={modalStyles.datePickerActions}>
                          <TouchableOpacity
                            style={modalStyles.datePickerDoneBtn}
                            onPress={() => setShowReminderTimePicker(false)}
                          >
                            <Text style={modalStyles.datePickerDoneText}>Selesai</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}

                  {/* Reminder Frequency - Only for Tugas */}
                  {category === "tugas" && (
                    <>
                      <Text style={[formStyles.reminderSectionLabel, { marginTop: 16 }]}>
                        Frekuensi pengingat
                      </Text>
                      <View style={formStyles.reminderFrequencyRow}>
                        {[
                          { value: "once", label: "Sekali" },
                          { value: "daily", label: "Setiap Hari" },
                          { value: "every_2_days", label: "2 Hari Sekali" },
                          { value: "every_3_days", label: "3 Hari Sekali" },
                          { value: "weekly", label: "Mingguan" },
                        ].map((freq) => (
                          <TouchableOpacity
                            key={freq.value}
                            style={[
                              formStyles.reminderFrequencyBtn,
                              reminderFrequency === freq.value &&
                                formStyles.reminderFrequencyBtnActive,
                            ]}
                            onPress={() => setReminderFrequency(freq.value as any)}
                          >
                            <Text
                              style={[
                                formStyles.reminderFrequencyText,
                                reminderFrequency === freq.value &&
                                  formStyles.reminderFrequencyTextActive,
                              ]}
                            >
                              {freq.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}

                  <Text style={formStyles.reminderHint}>
                    💡 Pengingat akan dikirim{" "}
                    {reminderDaysBefore === "0"
                      ? "pada hari yang sama"
                      : `${reminderDaysBefore} hari sebelum ${category === "tugas" ? "deadline" : "tanggal"}`}{" "}
                    pada pukul{" "}
                    {reminderTime.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                    {category === "tugas" && reminderFrequency !== "once" && 
                      ` dengan frekuensi ${reminderFrequency === "daily" ? "setiap hari" : 
                        reminderFrequency === "every_2_days" ? "2 hari sekali" :
                        reminderFrequency === "every_3_days" ? "3 hari sekali" : "mingguan"}`}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}