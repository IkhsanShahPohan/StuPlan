import { formStyles } from "@/styles/formStyles";
import { modalStyles } from "@/styles/modalStyles";
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
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [category, setCategory] = useState<"tugas" | "jadwal" | "kegiatan">(
    "tugas"
  );
  const [deadline, setDeadline] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [repeatOption, setRepeatOption] = useState<
    "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom"
  >("none");
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState("0");
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());

  const [customInterval, setCustomInterval] = useState(1);
  const [customUnit, setCustomUnit] = useState("days"); // "days", "weeks", "months"
  const [endOption, setEndOption] = useState("never"); // "never" atau "date"
  const [repeatEndDate, setRepeatEndDate] = useState(new Date());

  // Not data state -> bukan state yang menginterpretasikan data
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRepeatEndDatePicker, setShowRepeatEndDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesWordCount, setNotesWordCount] = useState(0);
  const [reminderFrequencyNotData, setReminderFrequencyNotData] = useState<
    "once" | "daily" | "every_2_days" | "every_3_days" | "weekly"
  >("once");

  useEffect(() => {
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    const reminderTimeMinus3 = new Date(defaultTime);
    reminderTimeMinus3.setHours(reminderTimeMinus3.getHours() - 3);

    setReminderTime(reminderTimeMinus3);
    setTime(defaultTime);

    // Set repeat end date to 3 months from now as default
    // const threeMonthsLater = new Date();
    // threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    setRepeatEndDate(new Date());
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
    setRepeatEndDate(new Date());
    setSubtasks([]);
    setSubtaskInput("");
    setReminderEnabled(false);
    setReminderDaysBefore("1");
    setReminderFrequencyNotData("once");
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

  const handleCustomDaysChange = (text) => {
    // Hapus semua karakter non-digit
    const cleaned = text.replace(/[^0-9]/g, "");

    // Jika kosong, kembalikan ke '0'
    if (cleaned === "") {
      setReminderDaysBefore("0");
      return;
    }

    // Convert ke number
    const numValue = parseInt(cleaned, 10);
    const MAX_DAYS = 365;

    // Validasi dengan batas
    if (numValue >= 0 && numValue <= MAX_DAYS) {
      setReminderDaysBefore(numValue.toString());
    } else if (numValue > MAX_DAYS) {
      // Jika melebihi batas, set ke maksimal
      setReminderDaysBefore(MAX_DAYS.toString());
    }
  };

  const repeatOptionsList = [
    { value: "daily", label: "Harian", icon: "today" },
    { value: "weekly", label: "Mingguan", icon: "calendar" },
    { value: "monthly", label: "Bulanan", icon: "calendar-outline" },
    { value: "yearly", label: "Tahunan", icon: "calendar-number" },
    { value: "custom", label: "Kustom", icon: "settings-outline" },
  ];

  const filteredOptions =
    category !== "tugas"
      ? repeatOptionsList.filter((o) => o.value !== "custom")
      : repeatOptionsList;

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
      const combinedDeadline = new Date(deadline);

      // Ambil jam dan menit dari state time
      combinedDeadline.setHours(time.getHours());
      combinedDeadline.setMinutes(time.getMinutes());
      combinedDeadline.setSeconds(0);
      combinedDeadline.setMilliseconds(0);

      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        notes: category === "tugas" ? notes.trim() || undefined : undefined,
        category: category,
        deadline: combinedDeadline.toISOString(),
        repeatOption: repeatEnabled ? repeatOption : "none",
        repeatEndDate:
          repeatEnabled && repeatOption !== "none" && endOption === "date"
            ? repeatEndDate.toISOString()
            : undefined,
        reminderEnabled,
        reminderDaysBefore: parseInt(reminderDaysBefore, 10),
        reminderTime: reminderTime.toISOString(), // sebelumnya reminderTimeString
        // reminderFrequencyNotData:
        //   category === "tugas" ? reminderFrequencyNotData : "once",
        customInterval: repeatOption === "custom" ? customInterval : undefined,
        customUnit: repeatOption === "custom" ? customUnit : undefined,
        endOption, // "never" atau "date"
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        // time: time.toISOString(), // sebelumnya timeString
      };

      // await onSubmit(
      //   {
      //     title: title.trim(),
      //     description: description.trim() || undefined,
      //     notes: category === "tugas" ? notes.trim() || undefined : undefined,
      //     category: category,
      //     deadline: deadline.toISOString(),
      //     time: category !== "tugas" ? timeString : undefined,
      //     repeatOption:
      //       category !== "tugas" && repeatEnabled ? repeatOption : "none",
      //     repeatEndDate:
      //       category !== "tugas" && repeatEnabled && repeatOption !== "none"
      //         ? repeatEndDate.toISOString()
      //         : undefined,
      //     reminderEnabled,
      //     reminderDaysBefore: daysBeforeNum,
      //     reminderTime: reminderTimeString,
      //     reminderFrequencyNotData: category === "tugas" ? reminderFrequencyNotData : "once",
      //   },
      //   category === "tugas" ? subtasks : []
      // );

      console.log("Data Submit:\n", JSON.stringify(data, null, 2));
      resetForm();
      onClose();
      Alert.alert(
        "Berhasil",
        `${getCategoryLabel(category)} berhasil ditambahkan`
      );
    } catch (error) {
      console.error("Error submitting task:", error);
      Alert.alert("Error", "Gagal menambahkan");
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
                      category === "tugas" &&
                        formStyles.categoryOptionTextActive,
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
                      category === "jadwal" &&
                        formStyles.categoryOptionTextActive,
                    ]}
                  >
                    Jadwal
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    formStyles.categoryOptionBtn,
                    category === "kegiatan" &&
                      formStyles.categoryOptionBtnActive,
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
                      category === "kegiatan" &&
                        formStyles.categoryOptionTextActive,
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
              <Text style={formStyles.formLabel}>DESKRIPSI SINGKAT</Text>
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
                      <Text
                        style={formStyles.notesPreviewText}
                        numberOfLines={3}
                      >
                        {notes}
                      </Text>
                      <View style={formStyles.notesPreviewFooter}>
                        <Text style={formStyles.notesPreviewMeta}>
                          {notesWordCount} kata ·{" "}
                          {new Date().toLocaleDateString("id-ID")}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#C7C7CC"
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={formStyles.notesEmptyState}>
                      <Ionicons
                        name="document-text-outline"
                        size={32}
                        color="#C7C7CC"
                      />
                      <Text style={formStyles.notesEmptyText}>
                        Tap untuk menulis catatan...
                      </Text>
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
                    <Text style={modalStyles.notesEditorWordCount}>
                      {notesWordCount} kata
                    </Text>
                  </View>
                </View>

                <ScrollView
                  style={modalStyles.notesEditorBody}
                  keyboardShouldPersistTaps="handled"
                >
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

            {/* {showTimePicker && (
              <DateTimePicker
                value={deadline}
                mode="time"
                display="default"
                onChange={(event, date) => {
                  if (event.type === "set" && date) {
                    // merge jam ke tanggal yang sudah dipilih
                    const merged = new Date(deadline);
                    merged.setHours(date.getHours());
                    merged.setMinutes(date.getMinutes());
                    setDeadline(merged);
                  }
                  setShowTimePicker(false);
                }}
              />
            )} */}

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
            <View style={formStyles.formGroup}>
              <Text style={formStyles.formLabel}>PUKUL *</Text>
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
                        <Text style={modalStyles.datePickerDoneText}>
                          Selesai
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Reminder Section */}
            <View style={formStyles.formGroup}>
              <View style={formStyles.reminderHeader}>
                <View style={formStyles.reminderLabelRow}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#007AFF"
                  />
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
                  <Text style={formStyles.reminderSectionLabel}>
                    Waktu Pengingat
                  </Text>
                  <Text style={formStyles.reminderSectionCaption}>
                    Angka di bawah menunjukkan pengingat berapa hari sebelum
                    tenggat.
                  </Text>

                  <View style={formStyles.reminderDaysRow}>
                    {["0", "1", "3", "7"].map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          formStyles.reminderDayBtn,
                          reminderDaysBefore === day &&
                            !isCustomDays &&
                            formStyles.reminderDayBtnActive,
                        ]}
                        onPress={() => {
                          setReminderDaysBefore(day);
                          setIsCustomDays(false);
                        }}
                      >
                        <Text
                          style={[
                            formStyles.reminderDayText,
                            reminderDaysBefore === day &&
                              !isCustomDays &&
                              formStyles.reminderDayTextActive,
                          ]}
                        >
                          {day === "0" ? "Hari" : `${day} hari`}
                        </Text>
                      </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                      style={[
                        formStyles.reminderDayBtn,
                        isCustomDays && formStyles.reminderDayBtnActive,
                      ]}
                      onPress={() => {
                        setIsCustomDays(true);
                        setReminderDaysBefore("5");
                      }}
                    >
                      <Text
                        style={[
                          formStyles.reminderDayText,
                          isCustomDays && formStyles.reminderDayTextActive,
                        ]}
                      >
                        Custom
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isCustomDays && (
                    <View style={formStyles.customDaysContainer}>
                      <Text style={formStyles.customDaysLabel}>
                        Atau masukkan jumlah hari:
                      </Text>
                      <View style={formStyles.inputWrapper}>
                        <TextInput
                          style={formStyles.customDaysInput}
                          value={reminderDaysBefore}
                          onChangeText={handleCustomDaysChange}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor="#9CA3AF"
                          maxLength={3}
                        />
                        <Text style={formStyles.customDaysUnit}>hari</Text>
                      </View>
                    </View>
                  )}

                  <Text
                    style={[formStyles.reminderSectionLabel, { marginTop: 16 }]}
                  >
                    Jam pengingat
                  </Text>
                  <Text style={formStyles.reminderSectionCaption}>
                    Pada pukul berapa kamu ingin diingatkan
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
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#C7C7CC"
                      />
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
                          if (Platform.OS === "android")
                            setShowReminderTimePicker(false);
                          if (event.type === "set" && selectedTime) {
                            setReminderTime(selectedTime);
                            if (Platform.OS === "ios")
                              setShowReminderTimePicker(false);
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
                            <Text style={modalStyles.datePickerDoneText}>
                              Selesai
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}

                  {/* Reminder Frequency - Only for Tugas
                  {category === "tugas" && (
                    <>
                      <Text
                        style={[
                          formStyles.reminderSectionLabel,
                          { marginTop: 16 },
                        ]}
                      >
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
                              reminderFrequencyNotData === freq.value &&
                                formStyles.reminderFrequencyBtnActive,
                            ]}
                            onPress={() =>
                              setReminderFrequencyNotData(freq.value as any)
                            }
                          >
                            <Text
                              style={[
                                formStyles.reminderFrequencyText,
                                reminderFrequencyNotData === freq.value &&
                                  formStyles.reminderFrequencyTextActive,
                              ]}
                            >
                              {freq.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )} */}

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
                    {category === "tugas" &&
                      reminderFrequencyNotData !== "once" &&
                      ` dengan frekuensi ${
                        reminderFrequencyNotData === "daily"
                          ? "setiap hari"
                          : reminderFrequencyNotData === "every_2_days"
                            ? "2 hari sekali"
                            : reminderFrequencyNotData === "every_3_days"
                              ? "3 hari sekali"
                              : "mingguan"
                      }`}
                  </Text>
                </View>
              )}
            </View>

            {/* Repeat Option */}
            {reminderEnabled && (
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
                      console.log("Value: ", value);
                      console.log("Repeat option ", repeatOption);
                    }}
                    trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#E5E5EA"
                  />
                </View>

                {repeatEnabled && (
                  <View style={formStyles.reminderSettings}>
                    <Text style={formStyles.reminderSectionLabel}>
                      Ulangi setiap
                    </Text>
                    {/* // Tombol repeat options (tambahkan "custom" di array) */}
                    <View style={formStyles.repeatOptionsRow}>
                      {filteredOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[  
                            formStyles.repeatOptionBtn,
                            repeatOption === option.value &&
                              formStyles.repeatOptionBtnActive,
                          ]}
                          onPress={() => {
                            setRepeatOption(option.value as any);
                            console.log(repeatOption);
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={option.icon as any}
                            size={16}
                            color={
                              repeatOption === option.value
                                ? "#FFFFFF"
                                : "#007AFF"
                            }
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={[
                              formStyles.repeatOptionText,
                              repeatOption === option.value &&
                                formStyles.repeatOptionTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {/* Custom interval input - tampil jika repeatOption === "custom" */}
                    {repeatOption === "custom" && (
                      <View style={formStyles.customIntervalContainer}>
                        <Text style={formStyles.label}>Setiap:</Text>
                        <View style={formStyles.customIntervalRow}>
                          <TextInput
                            style={formStyles.customIntervalInput}
                            value={String(customInterval)}
                            onChangeText={(text) =>
                              setCustomInterval(Number(text) || 1)
                            }
                            keyboardType="number-pad"
                            placeholder="1"
                          />
                          <View style={formStyles.customUnitPicker}>
                            {[
                              { value: "days", label: "Hari" },
                              { value: "weeks", label: "Minggu" },
                              { value: "months", label: "Bulan" },
                            ].map((unit) => (
                              <TouchableOpacity
                                key={unit.value}
                                style={[
                                  formStyles.unitBtn,
                                  customUnit === unit.value &&
                                    formStyles.unitBtnActive,
                                ]}
                                onPress={() => setCustomUnit(unit.value)}
                              >
                                <Text
                                  style={[
                                    formStyles.unitBtnText,
                                    customUnit === unit.value &&
                                      formStyles.unitBtnTextActive,
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
                    {/* End options - tampil untuk semua repeat option kecuali "none" */}
                    {/* {repeatOption !== "none" && category !== "tugas" && (
                      <View style={formStyles.endOptionsContainer}>
                        <Text style={formStyles.label}>Ulang sampai:</Text>
                        <View style={formStyles.endOptionsRow}>
                          <TouchableOpacity
                            style={[
                              formStyles.endOptionBtn,
                              endOption === "never" &&
                                formStyles.endOptionBtnActive,
                            ]}
                            onPress={() => setEndOption("never")}
                          >
                            <Text
                              style={[
                                formStyles.endOptionText,
                                endOption === "never" &&
                                  formStyles.endOptionTextActive,
                              ]}
                            >
                              Tak hingga
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              formStyles.endOptionBtn,
                              endOption === "date" &&
                                formStyles.endOptionBtnActive,
                            ]}
                            onPress={() => setEndOption("date")}
                          >
                            <Text
                              style={[
                                formStyles.endOptionText,
                                endOption === "date" &&
                                  formStyles.endOptionTextActive,
                              ]}
                            >
                              Pada tanggal
                            </Text>
                          </TouchableOpacity>
                        </View> */}

                    {/* Date picker untuk end date - tampil jika endOption === "date" */}
                    {/* {endOption === "date" && (
                          <View style={formStyles.endDateContainer}>
                            <TouchableOpacity
                              style={formStyles.datePickerBtn}
                              onPress={() => {
                                setShowRepeatEndDatePicker(true);
                              }}
                            >
                              <Ionicons
                                name="calendar-outline"
                                size={20}
                                color="#007AFF"
                              />
                              <Text style={formStyles.datePickerText}>
                                {repeatEndDate.toLocaleDateString("id-ID", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )} */}

                    {/* === */}
                    {showRepeatEndDatePicker && (
                      <>
                        <DateTimePicker
                          value={repeatEndDate}
                          mode="date"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={(event, date) => {
                            if (Platform.OS === "android")
                              setShowRepeatEndDatePicker(false);
                            if (event.type === "set" && date) {
                              setRepeatEndDate(date);
                              if (Platform.OS === "ios")
                                setShowRepeatEndDatePicker(false);
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
                              <Text style={modalStyles.datePickerDoneText}>
                                Selesai
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}

                    <Text style={formStyles.reminderHint}>
                      💡 {category === "jadwal" ? "Jadwal" : "Kegiatan"} akan
                      diulang{" "}
                      {endOption === "never"
                        ? `selamanya hingga anda menghapusnya!`
                        : (() => {
                            const repeatText =
                              repeatOption === "custom"
                                ? "sesuai interval"
                                : repeatOption === "daily"
                                  ? "setiap hari"
                                  : repeatOption === "weekly"
                                    ? "setiap minggu"
                                    : repeatOption === "monthly"
                                      ? "setiap bulan"
                                      : repeatOption === "yearly"
                                        ? "setiap tahun"
                                        : "";

                            return `${repeatText} sampai ${repeatEndDate.toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}`;
                          })()}
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
                  <TouchableOpacity
                    style={formStyles.addSubtaskBtn}
                    onPress={handleAddSubtask}
                  >
                    <Ionicons name="add-circle" size={28} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                {subtasks.map((subtask, index) => (
                  <View key={index} style={formStyles.subtaskPreview}>
                    <Ionicons
                      name="ellipse-outline"
                      size={20}
                      color="#8E8E93"
                    />
                    <Text style={formStyles.subtaskPreviewText}>{subtask}</Text>
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
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
