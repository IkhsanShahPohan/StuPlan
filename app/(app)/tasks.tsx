import { tasks } from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as Notifications from "expo-notifications";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSubtasks, useTasks } from "../../hooks/useTasks";

export default function TaskManagerApp() {
  const [isReady, setIsReady] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const { tasks, loading, createTask, deleteTask, refreshTasks, searchTasks } =
    useTasks();

  // Refresh when detail modal closes
  useEffect(() => {
    if (!detailModalVisible && isReady) {
      refreshTasks();
    }
  }, [detailModalVisible]);

  const handleSearch = () => {
    searchTasks(
      searchQuery,
      filterStartDate || undefined,
      filterEndDate || undefined
    );
  };

  const handleClearFilter = () => {
    setSearchQuery("");
    setFilterStartDate(null);
    setFilterEndDate(null);
    refreshTasks();
  };

  const handleDeleteTask = (taskId: number, taskTitle: string) => {
    Alert.alert("Hapus Tugas", `Yakin hapus "${taskTitle}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(taskId);
            Alert.alert("Berhasil", "Tugas dihapus");
          } catch {
            Alert.alert("Error", "Gagal menghapus tugas");
          }
        },
      },
    ]);
  };

  // if (!isReady || loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //       <Text style={styles.loadingText}>Memuat...</Text>
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>{tasks.length} tugas</Text>
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari tugas..."
          placeholderTextColor="#8E8E93"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {(searchQuery || filterStartDate) && (
          <TouchableOpacity onPress={handleClearFilter}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Task List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-circle-outline"
              size={80}
              color="#C7C7CC"
            />
            <Text style={styles.emptyText}>Belum ada tugas</Text>
            <Text style={styles.emptySubtext}>
              Tap tombol + untuk membuat tugas baru
            </Text>
          </View>
        ) : (
          tasks.map((task) => {
            const deadline = new Date(task.deadline);
            const isOverdue =
              deadline < new Date() && task.status !== "completed";
            const statusColors = {
              pending: "#FF9500",
              in_progress: "#007AFF",
              completed: "#34C759",
            };

            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => {
                  setSelectedTask(task);
                  setDetailModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.taskHeader}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusColors[task.status] },
                    ]}
                  />
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                </View>

                {task.description && (
                  <Text style={styles.taskDesc} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}

                <View style={styles.taskFooter}>
                  <View style={styles.deadlineRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={isOverdue ? "#FF3B30" : "#8E8E93"}
                    />
                    <Text
                      style={[
                        styles.deadlineText,
                        isOverdue && styles.overdueText,
                      ]}
                    >
                      {deadline.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id, task.title);
                    }}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={createTask}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        startDate={filterStartDate}
        endDate={filterEndDate}
        onStartDateChange={setFilterStartDate}
        onEndDateChange={setFilterEndDate}
        onApply={() => {
          handleSearch();
          setFilterModalVisible(false);
        }}
      />

      {/* Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          visible={detailModalVisible}
          task={selectedTask}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedTask(null);
          }}
          onUpdate={refreshTasks}
        />
      )}
    </SafeAreaView>
  );
}

// ======================================================================================================== //
function AddTaskModal({ visible, onClose, onSubmit }: any) {
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

  // Set default time to 9 AM
  useEffect(() => {
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    setReminderTime(defaultTime);
  }, []);

  // Update word count
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

    // Validate reminder days
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

      // Schedule notification if enabled
      if (reminderEnabled) {
        // Create reminder date in local timezone
        const reminderDate = new Date(deadline);
        reminderDate.setDate(reminderDate.getDate() - daysBeforeNum);

        // Set hours and minutes from time picker
        reminderDate.setHours(
          reminderTime.getHours(),
          reminderTime.getMinutes(),
          0,
          0
        );

        // Get timezone offset and adjust
        const localReminderDate = reminderDate;   

        console.log("Deadline:", deadline);
        console.log("Reminder Days Before:", daysBeforeNum);
        console.log("Reminder Time:", reminderTime.toLocaleTimeString("id-ID"));
        console.log(
          "Calculated Reminder Date (Local):",
          localReminderDate.toLocaleString("id-ID")
        );

        if (localReminderDate > new Date()) {
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
              date: localReminderDate,
            },
          });

          console.log("Notification scheduled with ID:", notificationId);
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
        style={styles.modalContainer}
      >
        <SafeAreaView style={styles.modalSafe}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancel}>Batal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tugas Baru</Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.modalDone}>Simpan</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>JUDUL *</Text>
              <TextInput
                style={styles.formInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Masukkan judul tugas"
                placeholderTextColor="#C7C7CC"
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>DESKRIPSI</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Tambahkan deskripsi..."
                placeholderTextColor="#C7C7CC"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Notes - iOS/Google Notes Style */}
            <></>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>CATATAN</Text>
              <TouchableOpacity
                style={styles.notesPreviewCard}
                onPress={() => setShowNotesModal(true)}
              >
                {notes ? (
                  <View style={styles.notesPreviewContent}>
                    <Text style={styles.notesPreviewText} numberOfLines={3}>
                      {notes}
                    </Text>
                    <View style={styles.notesPreviewFooter}>
                      <Text style={styles.notesPreviewMeta}>
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
                  <View style={styles.notesEmptyState}>
                    <Ionicons
                      name="document-text-outline"
                      size={32}
                      color="#C7C7CC"
                    />
                    <Text style={styles.notesEmptyText}>
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
              <SafeAreaView style={styles.notesEditorContainer}>
                {/* Notes Editor Header */}
                <View style={styles.notesEditorHeader}>
                  <TouchableOpacity
                    style={styles.notesEditorBackBtn}
                    onPress={() => setShowNotesModal(false)}
                  >
                    <Ionicons name="chevron-back" size={28} color="#007AFF" />
                    <Text style={styles.notesEditorBackText}>Kembali</Text>
                  </TouchableOpacity>
                  <View style={styles.notesEditorInfo}>
                    <Text style={styles.notesEditorWordCount}>
                      {notesWordCount} kata
                    </Text>
                  </View>
                </View>

                {/* Notes Editor Body */}
                <ScrollView
                  style={styles.notesEditorBody}
                  keyboardShouldPersistTaps="handled"
                >
                  <TextInput
                    style={styles.notesEditorInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Mulai menulis catatan Anda..."
                    placeholderTextColor="#C7C7CC"
                    multiline
                    autoFocus
                    textAlignVertical="top"
                  />
                </ScrollView>

                {/* Notes Editor Toolbar */}
                <View style={styles.notesEditorToolbar}>
                  <TouchableOpacity
                    style={styles.notesToolbarBtn}
                    onPress={() => {
                      setNotes("");
                      setNotesWordCount(0);
                    }}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                  <View style={styles.notesToolbarDivider} />
                  <Text style={styles.notesToolbarDate}>
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
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>DEADLINE *</Text>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                <Text style={styles.datePickerText}>
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
              <View style={styles.datePickerActions}>
                <TouchableOpacity
                  style={styles.datePickerDoneBtn}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerDoneText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Subtasks */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>SUBTASK</Text>
              <View style={styles.subtaskInputRow}>
                <TextInput
                  style={styles.subtaskInput}
                  value={subtaskInput}
                  onChangeText={setSubtaskInput}
                  placeholder="Tambahkan subtask..."
                  placeholderTextColor="#C7C7CC"
                  onSubmitEditing={handleAddSubtask}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.addSubtaskBtn}
                  onPress={handleAddSubtask}
                >
                  <Ionicons name="add-circle" size={28} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {subtasks.map((subtask, index) => (
                <View key={index} style={styles.subtaskPreview}>
                  <Ionicons name="ellipse-outline" size={20} color="#8E8E93" />
                  <Text style={styles.subtaskPreviewText}>{subtask}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSubtask(index)}>
                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Reminder Section */}
            <View style={styles.formGroup}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderLabelRow}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.formLabelInline}>PENGINGAT</Text>
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
                <View style={styles.reminderSettings}>
                  {/* Days Selection - Flexible Input */}
                  <Text style={styles.reminderSectionLabel}>Ingatkan saya</Text>

                  {/* Quick Select Buttons */}
                  <View style={styles.reminderDaysRow}>
                    <TouchableOpacity
                      style={[
                        styles.reminderDayBtn,
                        reminderDaysBefore === "0" &&
                          styles.reminderDayBtnActive,
                      ]}
                      onPress={() => setReminderDaysBefore("0")}
                    >
                      <Text
                        style={[
                          styles.reminderDayText,
                          reminderDaysBefore === "0" &&
                            styles.reminderDayTextActive,
                        ]}
                      >
                        Hari ini
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.reminderDayBtn,
                        reminderDaysBefore === "1" &&
                          styles.reminderDayBtnActive,
                      ]}
                      onPress={() => setReminderDaysBefore("1")}
                    >
                      <Text
                        style={[
                          styles.reminderDayText,
                          reminderDaysBefore === "1" &&
                            styles.reminderDayTextActive,
                        ]}
                      >
                        1 hari
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.reminderDayBtn,
                        reminderDaysBefore === "3" &&
                          styles.reminderDayBtnActive,
                      ]}
                      onPress={() => setReminderDaysBefore("3")}
                    >
                      <Text
                        style={[
                          styles.reminderDayText,
                          reminderDaysBefore === "3" &&
                            styles.reminderDayTextActive,
                        ]}
                      >
                        3 hari
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.reminderDayBtn,
                        reminderDaysBefore === "7" &&
                          styles.reminderDayBtnActive,
                      ]}
                      onPress={() => setReminderDaysBefore("7")}
                    >
                      <Text
                        style={[
                          styles.reminderDayText,
                          reminderDaysBefore === "7" &&
                            styles.reminderDayTextActive,
                        ]}
                      >
                        7 hari
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Custom Days Input */}
                  <View style={styles.customDaysContainer}>
                    <Text style={styles.customDaysLabel}>
                      Atau masukkan jumlah hari:
                    </Text>
                    <TextInput
                      style={styles.customDaysInput}
                      value={reminderDaysBefore}
                      onChangeText={setReminderDaysBefore}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="#C7C7CC"
                      maxLength={3}
                    />
                    <Text style={styles.customDaysUnit}>hari sebelumnya</Text>
                  </View>

                  {/* Time Selection */}
                  <Text
                    style={[styles.reminderSectionLabel, { marginTop: 16 }]}
                  >
                    Jam pengingat
                  </Text>
                  <TouchableOpacity
                    style={styles.timePickerBtn}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={24} color="#007AFF" />
                    <Text style={styles.timePickerText}>
                      {reminderTime.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </Text>
                    <View style={styles.timePickerChevron}>
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
                        <View style={styles.datePickerActions}>
                          <TouchableOpacity
                            style={styles.datePickerDoneBtn}
                            onPress={() => setShowTimePicker(false)}
                          >
                            <Text style={styles.datePickerDoneText}>
                              Selesai
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}

                  <Text style={styles.reminderHint}>
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

// =============================================================================================== //

function FilterModal({
  visible,
  onClose,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: any) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.filterOverlay}>
        <View style={styles.filterContent}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Tugas</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterBody}>
            <Text style={styles.filterLabel}>Tanggal Mulai</Text>
            <TouchableOpacity
              style={styles.filterDateBtn}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.filterDateText}>
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
              <View style={styles.datePickerActions}>
                <TouchableOpacity
                  style={styles.datePickerDoneBtn}
                  onPress={() => setShowStartPicker(false)}
                >
                  <Text style={styles.datePickerDoneText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.filterLabel}>Tanggal Akhir</Text>
            <TouchableOpacity
              style={styles.filterDateBtn}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.filterDateText}>
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
              <View style={styles.datePickerActions}>
                <TouchableOpacity
                  style={styles.datePickerDoneBtn}
                  onPress={() => setShowEndPicker(false)}
                >
                  <Text style={styles.datePickerDoneText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.filterApplyBtn} onPress={onApply}>
              <Text style={styles.filterApplyText}>Terapkan Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ==========================================
// BAGIAN 8: TASK DETAIL MODAL
// ==========================================

function TaskDetailModal({ visible, task, onClose, onUpdate }: any) {
  const [newSubtask, setNewSubtask] = useState("");
  const [localTask, setLocalTask] = useState(task);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesWordCount, setNotesWordCount] = useState(0);
  const {
    subtasks,
    createSubtask,
    toggleSubtask,
    deleteSubtask,
    refreshSubtasks,
  } = useSubtasks(task?.id || 0);
  const x = useSQLiteContext(); // ← kamu tetap pakai hook
  const db = drizzle(x);

  // Update word count
  useEffect(() => {
    if (localTask.notes) {
      const words = localTask.notes
        .trim()
        .split(/\s+/)
        .filter((w: string) => w.length > 0);
      setNotesWordCount(words.length);
    }
  }, [localTask.notes]);

  // Auto-update status based on subtasks
  useEffect(() => {
    const updateStatus = async () => {
      if (subtasks.length === 0) return;

      const completedCount = subtasks.filter((s: any) => s.completed).length;
      let newStatus = "pending";

      if (completedCount === subtasks.length) {
        newStatus = "completed";
      } else if (completedCount > 0) {
        newStatus = "in_progress";
      }

      if (newStatus !== localTask.status) {
        try {
          await db
            .update(tasks)
            .set({ status: newStatus, updatedAt: new Date().toISOString() })
            .where(eq(tasks.id, task.id));

          setLocalTask({ ...localTask, status: newStatus });
          onUpdate();
        } catch (error) {
          console.error("Error updating status:", error);
        }
      }
    };

    updateStatus();
  }, [subtasks]);

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) {
      Alert.alert("Error", "Subtask tidak boleh kosong");
      return;
    }
    try {
      await createSubtask(newSubtask.trim());
      setNewSubtask("");
      await refreshSubtasks();
    } catch {
      Alert.alert("Error", "Gagal menambah subtask");
    }
  };

  const handleToggleSubtask = async (id: number, completed: boolean) => {
    try {
      await toggleSubtask(id, completed);
      await refreshSubtasks();
    } catch {
      Alert.alert("Error", "Gagal mengubah status");
    }
  };

  const handleDeleteSubtask = async (id: number) => {
    try {
      await deleteSubtask(id);
      await refreshSubtasks();
    } catch {
      Alert.alert("Error", "Gagal menghapus subtask");
    }
  };

  const completedCount = subtasks.filter((s: any) => s.completed).length;
  const progress =
    subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  const statusConfig = {
    pending: { label: "Pending", color: "#FF9500", icon: "time-outline" },
    in_progress: {
      label: "Berjalan",
      color: "#007AFF",
      icon: "play-circle-outline",
    },
    completed: {
      label: "Selesai",
      color: "#34C759",
      icon: "checkmark-circle-outline",
    },
  };

  const currentStatus =
    statusConfig[localTask.status as keyof typeof statusConfig];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Detail Tugas</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.detailBody}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: currentStatus.color + "20" },
            ]}
          >
            <Ionicons
              name={currentStatus.icon as any}
              size={20}
              color={currentStatus.color}
            />
            <Text
              style={[styles.statusBadgeText, { color: currentStatus.color }]}
            >
              {currentStatus.label}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.detailTitle}>{localTask.title}</Text>

          {/* Description */}
          {localTask.description && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>DESKRIPSI</Text>
              <Text style={styles.detailText}>{localTask.description}</Text>
            </View>
          )}

          {/* Notes */}
          {localTask.notes && (
            <View style={styles.detailSection}>
              <View style={styles.detailSectionHeader}>
                <Text style={styles.detailSectionTitle}>CATATAN</Text>
                <TouchableOpacity onPress={() => setShowNotesModal(true)}>
                  <Ionicons name="pencil" size={18} color="#007AFF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.notesDetailCard}
                onPress={() => setShowNotesModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.notesDetailText}>{localTask.notes}</Text>
                <View style={styles.notesDetailFooter}>
                  <Text style={styles.notesDetailMeta}>
                    {notesWordCount} kata
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Notes Editor Modal in Detail */}
          <Modal
            visible={showNotesModal}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => setShowNotesModal(false)}
          >
            <SafeAreaView style={styles.notesEditorContainer}>
              <View style={styles.notesEditorHeader}>
                <TouchableOpacity
                  style={styles.notesEditorBackBtn}
                  onPress={() => setShowNotesModal(false)}
                >
                  <Ionicons name="chevron-back" size={28} color="#007AFF" />
                  <Text style={styles.notesEditorBackText}>Kembali</Text>
                </TouchableOpacity>
                <View style={styles.notesEditorInfo}>
                  <Text style={styles.notesEditorWordCount}>
                    {notesWordCount} kata
                  </Text>
                </View>
              </View>

              <ScrollView
                style={styles.notesEditorBody}
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  style={styles.notesEditorInput}
                  value={localTask.notes || ""}
                  onChangeText={(text) => {
                    setLocalTask({ ...localTask, notes: text });
                    // Save to database
                    db.update(tasks)
                      .set({ notes: text })
                      .where(eq(tasks.id, task.id))
                      .then(() => onUpdate());
                  }}
                  placeholder="Mulai menulis catatan Anda..."
                  placeholderTextColor="#C7C7CC"
                  multiline
                  autoFocus
                  textAlignVertical="top"
                />
              </ScrollView>

              <View style={styles.notesEditorToolbar}>
                <TouchableOpacity
                  style={styles.notesToolbarBtn}
                  onPress={() => {
                    setLocalTask({ ...localTask, notes: "" });
                    db.update(tasks)
                      .set({ notes: null })
                      .where(eq(tasks.id, task.id))
                      .then(() => onUpdate());
                  }}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
                <View style={styles.notesToolbarDivider} />
                <Text style={styles.notesToolbarDate}>
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
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>DEADLINE</Text>
            <View style={styles.detailInfoRow}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.detailInfoText}>
                {new Date(localTask.deadline).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          {/* Subtasks */}
          <View style={styles.detailSection}>
            <View style={styles.subtaskHeader}>
              <Text style={styles.detailSectionTitle}>SUBTASK</Text>
              {subtasks.length > 0 && (
                <View style={styles.progressBadge}>
                  <Text style={styles.progressText}>
                    {completedCount}/{subtasks.length}
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[styles.progressBar, { width: `${progress}%` }]}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Add Subtask */}
            <View style={styles.addSubtaskRow}>
              <TextInput
                style={styles.addSubtaskInput}
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder="Tambah subtask baru..."
                placeholderTextColor="#C7C7CC"
                onSubmitEditing={handleAddSubtask}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addSubtaskIconBtn}
                onPress={handleAddSubtask}
              >
                <Ionicons name="add-circle" size={32} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* Subtask List */}
            {subtasks.map((subtask: any) => (
              <View key={subtask.id} style={styles.subtaskItem}>
                <TouchableOpacity
                  style={styles.subtaskCheckbox}
                  onPress={() =>
                    handleToggleSubtask(subtask.id, subtask.completed ? 0 : 1)
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      subtask.completed ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={24}
                    color={subtask.completed ? "#34C759" : "#C7C7CC"}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.subtaskText,
                    subtask.completed && styles.subtaskCompleted,
                  ]}
                >
                  {subtask.title}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteSubtask(subtask.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}

            {subtasks.length === 0 && (
              <View style={styles.emptySubtasks}>
                <Ionicons name="list-outline" size={48} color="#C7C7CC" />
                <Text style={styles.emptySubtasksText}>Belum ada subtask</Text>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
  },

  // Container
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000000",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 2,
  },
  filterBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#F2F2F7",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#C7C7CC",
    marginTop: 8,
    textAlign: "center",
  },

  // Task Card
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  taskDesc: {
    fontSize: 15,
    color: "#8E8E93",
    lineHeight: 20,
    marginBottom: 12,
    paddingLeft: 20,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 20,
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deadlineText: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 6,
  },
  overdueText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#FFF5F5",
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  modalSafe: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#C6C6C8",
  },
  modalCancel: {
    fontSize: 17,
    color: "#007AFF",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  modalDone: {
    fontSize: 17,
    fontWeight: "600",
    color: "#007AFF",
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Form
  formGroup: {
    marginTop: 24,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    fontSize: 17,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  // Date Picker
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  datePickerText: {
    fontSize: 17,
    color: "#000000",
    marginLeft: 12,
  },

  // Subtask Input
  subtaskInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingLeft: 16,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  subtaskInput: {
    flex: 1,
    fontSize: 17,
    color: "#000000",
    paddingVertical: 12,
  },
  addSubtaskBtn: {
    padding: 4,
  },

  // Subtask Preview
  subtaskPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  subtaskPreviewText: {
    flex: 1,
    fontSize: 15,
    color: "#000000",
    marginLeft: 12,
  },

  // Filter Modal
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  filterContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#C6C6C8",
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  filterBody: {
    padding: 20,
  },
  filterMainLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    marginTop: 16,
  },
  dateRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  dateRangeBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateRangeBtnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateRangeBtnText: {
    marginLeft: 8,
    flex: 1,
  },
  dateRangeLabel: {
    fontSize: 11,
    color: "#8E8E93",
    marginBottom: 2,
  },
  dateRangeValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  dateRangeSeparator: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  filterActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  filterResetBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  filterResetText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  filterDateBtn: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 16,
  },
  filterDateText: {
    fontSize: 17,
    color: "#007AFF",
  },
  filterApplyBtn: {
    flex: 2,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  filterApplyText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Detail Modal
  detailBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  statusBadgeText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginTop: 16,
    lineHeight: 34,
  },
  detailSection: {
    marginTop: 24,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  detailSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 17,
    color: "#000000",
    lineHeight: 24,
  },

  // Notes Preview Card in Form
  notesPreviewCard: {
    backgroundColor: "#FFFEF7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0EDD4",
    padding: 16,
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notesPreviewContent: {
    flex: 1,
  },
  notesPreviewText: {
    fontSize: 15,
    color: "#3C3C3C",
    lineHeight: 22,
    marginBottom: 12,
  },
  notesPreviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0EDD4",
  },
  notesPreviewMeta: {
    fontSize: 12,
    color: "#8E8E93",
  },
  notesEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  notesEmptyText: {
    fontSize: 15,
    color: "#C7C7CC",
    marginTop: 8,
  },

  // Notes Detail Card
  notesDetailCard: {
    backgroundColor: "#FFFEF7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0EDD4",
    padding: 16,
  },
  notesDetailText: {
    fontSize: 16,
    color: "#3C3C3C",
    lineHeight: 24,
    marginBottom: 12,
  },
  notesDetailFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0EDD4",
  },
  notesDetailMeta: {
    fontSize: 12,
    color: "#8E8E93",
  },

  // Notes Editor (Fullscreen)
  notesEditorContainer: {
    flex: 1,
    backgroundColor: "#FFFEF7",
  },
  notesEditorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFEF7",
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDD4",
  },
  notesEditorBackBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  notesEditorBackText: {
    fontSize: 17,
    color: "#007AFF",
    marginLeft: 4,
  },
  notesEditorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notesEditorWordCount: {
    fontSize: 14,
    color: "#8E8E93",
  },
  notesEditorBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  notesEditorInput: {
    fontSize: 17,
    color: "#3C3C3C",
    lineHeight: 26,
    minHeight: 400,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  notesEditorToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFEF7",
    borderTopWidth: 1,
    borderTopColor: "#F0EDD4",
  },
  notesToolbarBtn: {
    padding: 8,
  },
  notesToolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 12,
  },
  notesToolbarDate: {
    fontSize: 13,
    color: "#8E8E93",
  },

  detailInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailInfoText: {
    fontSize: 17,
    color: "#000000",
    marginLeft: 12,
  },

  // Subtask Section
  subtaskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
    marginRight: 8,
  },
  progressBarContainer: {
    width: 60,
    height: 6,
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  addSubtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addSubtaskInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    fontSize: 17,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginRight: 8,
  },
  addSubtaskIconBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  subtaskCheckbox: {
    marginRight: 12,
  },
  subtaskText: {
    flex: 1,
    fontSize: 17,
    color: "#000000",
  },
  subtaskCompleted: {
    textDecorationLine: "line-through",
    color: "#8E8E93",
  },
  emptySubtasks: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptySubtasksText: {
    fontSize: 15,
    color: "#C7C7CC",
    marginTop: 12,
  },

  // Reminder Styles
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  reminderLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  formLabelInline: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  reminderSettings: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
  },
  reminderSectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  reminderText: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 12,
  },
  reminderDaysRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  reminderDayBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  reminderDayBtnActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  reminderDayText: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "500",
  },
  reminderDayTextActive: {
    color: "#FFFFFF",
  },
  customDaysContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginTop: 8,
  },
  customDaysLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginRight: 8,
  },
  customDaysInput: {
    width: 60,
    height: 40,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginHorizontal: 8,
  },
  customDaysUnit: {
    fontSize: 14,
    color: "#000000",
  },
  reminderHint: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 12,
    lineHeight: 18,
  },
  timePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  timePickerText: {
    flex: 1,
    fontSize: 17,
    color: "#000000",
    marginLeft: 12,
    fontWeight: "600",
  },
  timePickerChevron: {
    marginLeft: 8,
  },

  // Date Picker Actions
  datePickerActions: {
    alignItems: "flex-end",
    paddingTop: 8,
  },
  datePickerDoneBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  datePickerDoneText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
