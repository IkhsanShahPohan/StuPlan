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
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState("1");
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesWordCount, setNotesWordCount] = useState(0);

  useEffect(() => {
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    setReminderTime(defaultTime);
  }, []);

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
    setDeadline(new Date());
    setSubtasks([]);
    setSubtaskInput("");
    setReminderEnabled(false);
    setReminderDaysBefore("1");
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
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
      Alert.alert(
        "Error",
        "Hari pengingat harus angka positif (0 untuk hari yang sama)"
      );
      return;
    }

    try {
      let notificationId = null;

      if (reminderEnabled) {
        const reminderDate = new Date(deadline);
        reminderDate.setDate(reminderDate.getDate() - daysBeforeNum);
        reminderDate.setHours(
          reminderTime.getHours(),
          reminderTime.getMinutes(),
          0,
          0
        );

        if (reminderDate > new Date()) {
          notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: "📋 Pengingat Tugas",
              body:
                daysBeforeNum === 0
                  ? `"${title}" jatuh tempo hari ini!`
                  : `"${title}" akan jatuh tempo dalam ${daysBeforeNum} hari!`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
              type: "date",
              date: reminderDate,
            },
          });
        } else {
          Alert.alert(
            "Peringatan",
            "Waktu pengingat sudah lewat, notifikasi tidak dijadwalkan"
          );
        }
      }

      const timeString = `${String(reminderTime.getHours()).padStart(2, "0")}:${String(reminderTime.getMinutes()).padStart(2, "0")}`;

      await onSubmit(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          deadline: deadline.toISOString(),
          reminderEnabled,
          reminderDaysBefore: daysBeforeNum,
          reminderTime: timeString,
        },
        subtasks
      );

      resetForm();
      onClose();
      Alert.alert(
        "Berhasil",
        "Tugas berhasil ditambahkan" +
          (reminderEnabled ? " dengan pengingat" : "")
      );
    } catch (error) {
      console.error("Error submitting task:", error);
      Alert.alert("Error", "Gagal menambahkan tugas");
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
            <Text style={modalStyles.modalTitle}>Tugas Baru</Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={modalStyles.modalDone}>Simpan</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={modalStyles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View style={formStyles.formGroup}>
              <Text style={formStyles.formLabel}>JUDUL *</Text>
              <TextInput
                style={formStyles.formInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Masukkan judul tugas"
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

            {/* Notes */}
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

            {/* Deadline */}
            <View style={formStyles.formGroup}>
              <Text style={formStyles.formLabel}>DEADLINE *</Text>
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
                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }
                  if (event.type === "set" && date) {
                    setDeadline(date);
                    if (Platform.OS === "ios") {
                      setShowDatePicker(false);
                    }
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

            {/* Subtasks */}
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
                  <Ionicons name="ellipse-outline" size={20} color="#8E8E93" />
                  <Text style={formStyles.subtaskPreviewText}>{subtask}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSubtask(index)}>
                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
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
                    Ingatkan saya
                  </Text>

                  <View style={formStyles.reminderDaysRow}>
                    {["0", "1", "3", "7"].map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          formStyles.reminderDayBtn,
                          reminderDaysBefore === day &&
                            formStyles.reminderDayBtnActive,
                        ]}
                        onPress={() => setReminderDaysBefore(day)}
                      >
                        <Text
                          style={[
                            formStyles.reminderDayText,
                            reminderDaysBefore === day &&
                              formStyles.reminderDayTextActive,
                          ]}
                        >
                          {day === "0" ? "Hari ini" : `${day} hari`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={formStyles.customDaysContainer}>
                    <Text style={formStyles.customDaysLabel}>
                      Atau masukkan jumlah hari:
                    </Text>
                    <TextInput
                      style={formStyles.customDaysInput}
                      value={reminderDaysBefore}
                      onChangeText={setReminderDaysBefore}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="#C7C7CC"
                      maxLength={3}
                    />
                    <Text style={formStyles.customDaysUnit}>
                      hari sebelumnya
                    </Text>
                  </View>

                  <Text
                    style={[formStyles.reminderSectionLabel, { marginTop: 16 }]}
                  >
                    Jam pengingat
                  </Text>
                  <TouchableOpacity
                    style={formStyles.timePickerBtn}
                    onPress={() => setShowTimePicker(true)}
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

                  {showTimePicker && (
                    <>
                      <DateTimePicker
                        value={reminderTime}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event, time) => {
                          if (Platform.OS === "android") {
                            setShowTimePicker(false);
                          }
                          if (event.type === "set" && time) {
                            setReminderTime(time);
                            if (Platform.OS === "ios") {
                              setShowTimePicker(false);
                            }
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

                  <Text style={formStyles.reminderHint}>
                    💡 Pengingat akan dikirim{" "}
                    {reminderDaysBefore === "0"
                      ? "pada hari yang sama"
                      : `${reminderDaysBefore} hari sebelum deadline`}{" "}
                    pada pukul{" "}
                    {reminderTime.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
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