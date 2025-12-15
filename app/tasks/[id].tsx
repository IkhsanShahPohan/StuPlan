import EditTaskModal from "@/components/tasks/EditTaskModal";
import { useTask } from "@/hooks/useTasks";
import { useAuth } from "@/lib/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const taskId = parseInt(id as string);
  const { user } = useAuth();
  const userId = user?.id || "";

  const {
    getTaskById,
    updateTask,
    deleteTask,
    batchUpdateSubtasks,
    updateTaskStatus,
    fetchTasks,
  } = useTask(userId);

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [isEditTaskModal, setIsEditTaskModal] = useState(false);

  // State untuk subtask yang dicentang (temporary)
  const [selectedSubtasks, setSelectedSubtasks] = useState<number[]>([]);
  const [confirmButtonScale] = useState(new Animated.Value(0));

  // Load task
  const loadTask = async () => {
    try {
      setLoading(true);
      const taskData = await getTaskById(taskId);
      if (taskData) {
        setTask(taskData);
        setEditingNotes(taskData.notes || "");
      } else {
        Alert.alert("Error", "Task tidak ditemukan");
        router.back();
      }
    } catch (error) {
      console.error("Error loading task:", error);
      Alert.alert("Error", "Gagal memuat task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  // Animate confirm button ketika ada perubahan
  useEffect(() => {
    if (selectedSubtasks.length > 0) {
      Animated.spring(confirmButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.spring(confirmButtonScale, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [selectedSubtasks.length]);

  // Handle toggle subtask (temporary - belum save)
  const handleToggleSubtask = (subtaskId: number, isCompleted: boolean) => {
    // Jika sudah completed, tidak bisa diubah
    if (isCompleted) {
      Alert.alert("Info", "Subtask yang sudah selesai tidak dapat diubah");
      return;
    }

    // Toggle selection
    setSelectedSubtasks((prev) => {
      if (prev.includes(subtaskId)) {
        return prev.filter((id) => id !== subtaskId);
      } else {
        return [...prev, subtaskId];
      }
    });
  };

  // Handle konfirmasi subtask
  const handleConfirmSubtasks = async () => {
    if (selectedSubtasks.length === 0) return;

    try {
      Alert.alert(
        "Konfirmasi",
        `Tandai ${selectedSubtasks.length} subtask sebagai selesai?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Ya, Selesai",
            style: "default",
            onPress: async () => {
              const success = await batchUpdateSubtasks(
                taskId,
                selectedSubtasks
              );
              if (success) {
                setSelectedSubtasks([]);
                await loadTask();
                Alert.alert("Berhasil", "Subtask berhasil diselesaikan");
              } else {
                Alert.alert("Error", "Gagal menyelesaikan subtask");
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Gagal menyelesaikan subtask");
    }
  };

  // Handle konfirmasi task selesai (untuk task tanpa subtask)
  const handleCompleteTask = async () => {
    Alert.alert("Selesaikan Task", `Tandai "${task?.title}" sebagai selesai?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya, Selesai",
        style: "default",
        onPress: async () => {
          try {
            const success = await updateTaskStatus(taskId, "completed");
            if (success) {
              await loadTask();
              Alert.alert("Berhasil", "Task berhasil diselesaikan");
            } else {
              Alert.alert("Error", "Gagal menyelesaikan task");
            }
          } catch (error) {
            Alert.alert("Error", "Gagal menyelesaikan task");
          }
        },
      },
    ]);
  };

  // Handle save notes
  const handleSaveNotes = async () => {
    try {
      await updateTask(taskId, { notes: editingNotes });
      setTask({ ...task, notes: editingNotes });
      setShowNotesModal(false);
      Alert.alert("Berhasil", "Catatan berhasil disimpan");
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan catatan");
    }
  };

  // Handle delete task
  const handleDeleteTask = () => {
    Alert.alert(
      "Hapus Task",
      `Yakin ingin menghapus "${task?.title}"?\n\nTindakan ini tidak dapat dibatalkan.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTask(taskId);
              Alert.alert("Berhasil", "Task berhasil dihapus");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Gagal menghapus task");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Memuat...</Text>
        </View>
      </View>
    );
  }

  if (!task) {
    return null;
  }

  // Calculations
  const deadline = new Date(task.deadline);
  const now = new Date();
  const isOverdue = deadline < now && task.status !== "completed";
  const isCompleted = task.status === "completed";

  const completedSubtasks =
    task.subtasks?.filter((s: any) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Time remaining
  const getTimeRemaining = () => {
    const diff = deadline.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days < 0) {
      return {
        text: `Terlambat ${Math.abs(days)} hari`,
        color: "#FF3B30",
        icon: "alert-circle",
      };
    } else if (days === 0 && hours > 0) {
      return { text: `${hours} jam lagi`, color: "#FF9500", icon: "time" };
    } else if (days === 0) {
      return { text: "Hari ini", color: "#FF9500", icon: "today" };
    } else if (days === 1) {
      return { text: "Besok", color: "#FF9500", icon: "calendar" };
    } else if (days <= 7) {
      return {
        text: `${days} hari lagi`,
        color: "#007AFF",
        icon: "calendar-outline",
      };
    } else {
      return {
        text: `${days} hari lagi`,
        color: "#34C759",
        icon: "calendar-outline",
      };
    }
  };

  const timeRemaining = getTimeRemaining();

  // Status config
  const statusConfig = {
    pending: {
      label: "Menunggu",
      color: "#FF9500",
      gradient: ["#FF9500", "#FF7A00"],
      icon: "time-outline",
    },
    in_progress: {
      label: "Sedang Dikerjakan",
      color: "#007AFF",
      gradient: ["#007AFF", "#0055D4"],
      icon: "play-circle-outline",
    },
    completed: {
      label: "Selesai",
      color: "#34C759",
      gradient: ["#34C759", "#28A745"],
      icon: "checkmark-circle",
    },
  };

  // Category config
  const categoryConfig = {
    tugas: {
      label: "Tugas",
      icon: "briefcase",
      color: "#1976D2",
      gradient: ["#1976D2", "#1565C0"],
      bg: "#E3F2FD",
    },
    jadwal: {
      label: "Jadwal",
      icon: "school",
      color: "#F57C00",
      gradient: ["#F57C00", "#E65100"],
      bg: "#FFF3E0",
    },
    kegiatan: {
      label: "Kegiatan",
      icon: "calendar",
      color: "#7B1FA2",
      gradient: ["#7B1FA2", "#6A1B9A"],
      bg: "#F3E5F5",
    },
  };

  const currentStatus = statusConfig[task.status as keyof typeof statusConfig];
  const currentCategory =
    categoryConfig[task.category as keyof typeof categoryConfig];

  // Notification count
  let notificationCount = 0;
  if (task.notificationIds) {
    try {
      const ids = JSON.parse(task.notificationIds);
      notificationCount = Array.isArray(ids) ? ids.length : 0;
    } catch (e) {
      notificationCount = 0;
    }
  }

  // Word count for notes
  const notesWordCount = task.notes
    ? task.notes
        .trim()
        .split(/\s+/)
        .filter((w: string) => w.length > 0).length
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detail {currentCategory.label}</Text>

        <View style={styles.headerSpacer} />
      </View>

      {isEditTaskModal && (
        <EditTaskModal
          visible={isEditTaskModal}
          task={task}
          onClose={() => setIsEditTaskModal(false)}
          onUpdateTask={updateTask}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section with Status */}
        <View style={styles.heroSection}>
          {/* Overdue/Completed Banner */}
          {isOverdue && !isCompleted && task.category === "tugas" && (
            <View style={[styles.alertBanner, { backgroundColor: "#FF3B30" }]}>
              <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
              <Text style={styles.alertBannerText}>Task Terlambat!</Text>
            </View>
          )}

          {isCompleted && (
            <View style={[styles.alertBanner, { backgroundColor: "#34C759" }]}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.alertBannerText}>Task Selesai</Text>
            </View>
          )}

          {/* Category & Status Badges */}
          <View style={styles.badgeRow}>
            <View
              style={[styles.badge, { backgroundColor: currentCategory.bg }]}
            >
              <Ionicons
                name={currentCategory.icon as any}
                size={16}
                color={currentCategory.color}
              />
              <Text
                style={[styles.badgeText, { color: currentCategory.color }]}
              >
                {currentCategory.label}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                { backgroundColor: currentStatus.color + "20" },
              ]}
            >
              <Ionicons
                name={currentStatus.icon as any}
                size={16}
                color={currentStatus.color}
              />
              <Text style={[styles.badgeText, { color: currentStatus.color }]}>
                {currentStatus.label}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, isCompleted && styles.completedTitle]}>
            {task.title}
          </Text>

          {/* Description */}
          {task.description && (
            <Text style={styles.description}>{task.description}</Text>
          )}
        </View>

        {/* Time Remaining Card - Only if not completed */}
        {!isCompleted && task.category === "tugas" && (
          <View
            style={[
              styles.card,
              styles.timeCard,
              { borderLeftColor: timeRemaining.color },
            ]}
          >
            <View style={styles.timeCardHeader}>
              <Ionicons
                name={timeRemaining.icon as any}
                size={24}
                color={timeRemaining.color}
              />
              <Text style={styles.timeCardLabel}>Sisa Waktu</Text>
            </View>
            <Text
              style={[styles.timeCardValue, { color: timeRemaining.color }]}
            >
              {timeRemaining.text}
            </Text>
          </View>
        )}

        {/* Deadline Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="calendar" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>
                {task.category === "tugas" ? "Deadline" : "Tanggal & Waktu"}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tanggal</Text>
              <Text
                style={[
                  styles.infoValue,
                  task.category === "tugas" &&
                    isOverdue &&
                    !isCompleted &&
                    styles.overdueText,
                ]}
              >
                {task.repeatMode === "yearly"
                  ? deadline.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                    })
                  : task.repeatMode === "monthly"
                    ? deadline.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                      })
                    : task.repeatMode === "weekly"
                      ? deadline.toLocaleDateString("id-ID", {
                          weekday: "long",
                        })
                      : task.repeatMode === "daily"
                        ? "Setiap hari!"
                        : deadline.toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Waktu</Text>
              <Text style={styles.infoValue}>
                {deadline.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Reminder Card */}
        {task.reminderEnabled && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="notifications" size={20} color="#FF9500" />
                <Text style={styles.cardTitle}>Pengingat</Text>
              </View>
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount} notifikasi
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.reminderContent}>
              <View style={styles.reminderRow}>
                <Ionicons name="time-outline" size={18} color="#8E8E93" />
                <Text style={styles.reminderText}>
                  Pengingat{" "}
                  {task.reminderDaysBefore === 0
                    ? "hari yang sama"
                    : `${task.reminderDaysBefore} hari sebelumnya`}
                </Text>
              </View>

              <View style={styles.reminderRow}>
                <Ionicons name="alarm-outline" size={18} color="#8E8E93" />
                <Text style={styles.reminderText}>
                  Pukul {task.reminderTime}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Repeat Card */}
        {task.repeatEnabled && task.repeatMode !== "none" && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="repeat" size={20} color="#F57C00" />
                <Text style={styles.cardTitle}>Pengulangan</Text>
              </View>
            </View>

            <View style={styles.repeatContent}>
              <View style={styles.repeatBadge}>
                <Ionicons name="sync" size={16} color="#F57C00" />
                <Text style={styles.repeatBadgeText}>
                  {task.repeatMode === "daily" && "Setiap Hari"}
                  {task.repeatMode === "weekly" && "Setiap Minggu"}
                  {task.repeatMode === "monthly" && "Setiap Bulan"}
                  {task.repeatMode === "yearly" && "Setiap Tahun"}
                  {task.repeatMode === "custom" &&
                    `Setiap ${task.customInterval} ${task.customUnit}`}
                </Text>
              </View>

              <Text style={styles.repeatEndText}>
                {task.endOption === "never"
                  ? "Berulang tanpa batas (sampai dihapus)"
                  : "Berulang sampai deadline"}
              </Text>
            </View>
          </View>
        )}

        {/* Notes Card - Only for Tugas */}
        {task.category === "tugas" && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="document-text" size={20} color="#7B1FA2" />
                <Text style={styles.cardTitle}>Catatan</Text>
              </View>
            </View>

            {task.notes ? (
              <TouchableOpacity
                style={styles.notesContent}
                onPress={() => setShowNotesModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.notesText} numberOfLines={5}>
                  {task.notes}
                </Text>
                <View style={styles.notesFooter}>
                  <Text style={styles.notesWordCount}>
                    {notesWordCount} kata
                  </Text>
                  <Ionicons name="pencil" size={16} color="#007AFF" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.notesEmpty}
                onPress={() => setShowNotesModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={32} color="#C7C7CC" />
                <Text style={styles.notesEmptyText}>
                  Tap untuk menambah catatan
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Subtasks Card - Only for Tugas */}
        {task.category === "tugas" && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="list" size={20} color="#1976D2" />
                <Text style={styles.cardTitle}>Subtask</Text>
              </View>
              {totalSubtasks > 0 && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    {completedSubtasks}/{totalSubtasks}
                  </Text>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${subtaskProgress}%` },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Subtask List */}
            {task.subtasks && task.subtasks.length > 0 ? (
              <>
                <View style={styles.subtaskList}>
                  {task.subtasks.map((subtask: any, index: number) => {
                    const isSelected = selectedSubtasks.includes(subtask.id);
                    const showAsChecked = subtask.completed || isSelected;

                    return (
                      <TouchableOpacity
                        key={subtask.id}
                        style={[
                          styles.subtaskItem,
                          index === task.subtasks.length - 1 &&
                            styles.subtaskItemLast,
                          isSelected && styles.subtaskItemSelected,
                        ]}
                        onPress={() =>
                          handleToggleSubtask(subtask.id, subtask.completed)
                        }
                        activeOpacity={0.7}
                        disabled={subtask.completed}
                      >
                        <Ionicons
                          name={
                            showAsChecked
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={24}
                          color={
                            showAsChecked
                              ? isSelected
                                ? "#007AFF"
                                : "#34C759"
                              : "#C7C7CC"
                          }
                        />
                        <Text
                          style={[
                            styles.subtaskText,
                            subtask.completed && styles.subtaskTextCompleted,
                            isSelected && styles.subtaskTextSelected,
                          ]}
                        >
                          {subtask.title}
                        </Text>
                        {isSelected && !subtask.completed && (
                          <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>Baru</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Confirm Button untuk Subtask */}
                {selectedSubtasks.length > 0 && (
                  <Animated.View
                    style={[
                      styles.confirmSubtaskContainer,
                      {
                        transform: [{ scale: confirmButtonScale }],
                        opacity: confirmButtonScale,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.confirmSubtaskButton}
                      onPress={handleConfirmSubtasks}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="checkmark-done-circle"
                        size={22}
                        color="#FFFFFF"
                      />
                      <Text style={styles.confirmSubtaskText}>
                        Konfirmasi {selectedSubtasks.length} Subtask Selesai
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </>
            ) : (
              <View style={styles.subtaskEmpty}>
                <Ionicons name="checkbox-outline" size={48} color="#C7C7CC" />
                <Text style={styles.subtaskEmptyText}>Belum ada subtask</Text>
              </View>
            )}
          </View>
        )}

        {/* Complete Task Button - untuk task tanpa subtask yang belum selesai */}
        {task.category === "tugas" && !isCompleted && totalSubtasks === 0 && (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.completeTaskButton}
              onPress={handleCompleteTask}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#34C759"
              />
              <Text style={styles.completeTaskButtonText}>
                Tandai Task Sebagai Selesai
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons - Edit & Delete */}
        {!isCompleted && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: "/tasks/edit",
                  params: {
                    id: task.id, // atau kirim object lain
                  },
                })
              }
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={20} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButtonBottom}
              onPress={handleDeleteTask}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Hapus Task</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete button untuk completed task */}
        {isCompleted && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.deleteButtonBottom, { flex: 1 }]}
              onPress={handleDeleteTask}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Hapus Task</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Notes Editor Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setShowNotesModal(false)}
            >
              <Ionicons name="chevron-back" size={28} color="#007AFF" />
              <Text style={styles.modalBackText}>Kembali</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveNotes}
            >
              <Text style={styles.modalSaveText}>Simpan</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalMeta}>
            <Text style={styles.modalWordCount}>
              {
                editingNotes
                  .trim()
                  .split(/\s+/)
                  .filter((w: string) => w.length > 0).length
              }{" "}
              kata
            </Text>
          </View>

          <ScrollView style={styles.modalBody}>
            <TextInput
              style={styles.modalInput}
              value={editingNotes}
              onChangeText={setEditingNotes}
              placeholder="Mulai menulis catatan Anda..."
              placeholderTextColor="#C7C7CC"
              multiline
              autoFocus
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingVertical: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    flex: 1,
    textAlign: "center",
  },

  headerSpacer: {
    width: 36,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // Hero Section
  heroSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },

  alertBannerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
    lineHeight: 34,
    marginBottom: 8,
  },

  completedTitle: {
    textDecorationLine: "line-through",
    color: "#8E8E93",
  },

  description: {
    fontSize: 16,
    color: "#6C757D",
    lineHeight: 24,
  },

  // Time Card
  timeCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  timeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  timeCardLabel: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  timeCardValue: {
    fontSize: 24,
    fontWeight: "bold",
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },

  // Info Grid
  infoGrid: {
    gap: 12,
  },

  infoItem: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 6,
  },

  infoValue: {
    fontSize: 15,
    color: "#1C1C1E",
    fontWeight: "600",
  },

  overdueText: {
    color: "#FF3B30",
  },

  // Reminder
  reminderContent: {
    gap: 12,
  },

  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
  },

  reminderText: {
    fontSize: 15,
    color: "#1C1C1E",
    flex: 1,
  },

  notificationBadge: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  notificationBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Repeat
  repeatContent: {
    gap: 12,
  },

  repeatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  repeatBadgeText: {
    fontSize: 14,
    color: "#F57C00",
    fontWeight: "600",
  },

  repeatEndText: {
    fontSize: 13,
    color: "#8E8E93",
    fontStyle: "italic",
  },

  // Notes
  notesContent: {
    backgroundColor: "#FAFAFA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },

  notesText: {
    fontSize: 15,
    color: "#1C1C1E",
    lineHeight: 22,
    marginBottom: 12,
  },

  notesFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },

  notesWordCount: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },

  notesEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E5E5EA",
    gap: 12,
  },

  notesEmptyText: {
    fontSize: 14,
    color: "#8E8E93",
  },

  // Subtasks
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },

  progressBarBg: {
    width: 60,
    height: 6,
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },

  subtaskList: {
    gap: 2,
  },

  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    borderRadius: 8,
  },

  subtaskItemLast: {
    borderBottomWidth: 0,
  },

  subtaskItemSelected: {
    backgroundColor: "#F0F8FF",
  },

  subtaskText: {
    flex: 1,
    fontSize: 15,
    color: "#1C1C1E",
    lineHeight: 20,
  },

  subtaskTextCompleted: {
    textDecorationLine: "line-through",
    color: "#8E8E93",
  },

  subtaskTextSelected: {
    fontWeight: "600",
    color: "#007AFF",
  },

  newBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  newBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  subtaskEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },

  subtaskEmptyText: {
    fontSize: 14,
    color: "#8E8E93",
  },

  // Confirm Subtask Button
  confirmSubtaskContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },

  confirmSubtaskButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  confirmSubtaskText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Complete Task Button
  completeTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#34C759",
    borderStyle: "dashed",
    backgroundColor: "#F0FFF4",
  },

  completeTaskButtonText: {
    fontSize: 16,
    color: "#34C759",
    fontWeight: "600",
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
  },

  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  editButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  deleteButtonBottom: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  deleteButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  modalBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  modalBackText: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "500",
  },

  modalSaveButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },

  modalSaveText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  modalMeta: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  modalWordCount: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },

  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  modalInput: {
    fontSize: 16,
    color: "#1C1C1E",
    lineHeight: 24,
    minHeight: 400,
  },
});
