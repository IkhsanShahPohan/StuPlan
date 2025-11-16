// import Overview from "@/organism/Overview";
// import PomodoroSection from "@/organism/PomodoroContent";
// import TaskContent from "@/organism/TaskContent";
// import { useState } from "react";
// import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

// export default function Index() {
//   const [activeFilter, setActiveFilter] = useState("All");
//   const userName = "Budi";
//   const taskProgress = 75;

//   const filters = ["All", "Task", "Pomodoro"];

//   // Dummy data untuk pomodoro history
//   const pomodoroHistory = [
//     {
//       id: 1,
//       task: "Belajar React Native",
//       duration: "25 min",
//       completedAt: "Hari ini, 14:30",
//     },
//     {
//       id: 2,
//       task: "Mengerjakan Tugas Kalkulus",
//       duration: "25 min",
//       completedAt: "Hari ini, 10:15",
//     },
//     {
//       id: 3,
//       task: "Membaca Jurnal",
//       duration: "25 min",
//       completedAt: "Kemarin, 16:45",
//     },
//   ];

//   // Data dipindahkan ke sini
//   const upcomingTasks = [
//     {
//       id: 1,
//       title: "Tugas Matematika Diskrit",
//       subject: "Matematika",
//       dueDate: "2 hari lagi",
//       priority: "High",
//     },
//     {
//       id: 2,
//       title: "Essay Bahasa Indonesia",
//       subject: "Bahasa",
//       dueDate: "4 hari lagi",
//       priority: "Medium",
//     },
//     {
//       id: 3,
//       title: "Presentasi Proyek Akhir",
//       subject: "Pemrograman",
//       dueDate: "6 hari lagi",
//       priority: "High",
//     },
//   ];

//   const handleSeeMorePomodoro = () => {
//     console.log("See more pressed!");
//   };

//   const renderAllContent = () => (
//     <View className="flex gap-4">
//       <TaskContent tasks={upcomingTasks} />
//       <PomodoroSection
//         sessions={pomodoroHistory}
//         onSeeMore={handleSeeMorePomodoro}
//       />
//       {/* <Overview /> */}
//     </View>
//   );

//   const renderPomodoroContent = () => (
//     <PomodoroSection
//       sessions={pomodoroHistory}
//       onSeeMore={handleSeeMorePomodoro}
//     />
//   );

//   const renderTaskContent = () => <TaskContent tasks={upcomingTasks} />;

//   return (
//     <View className="flex-1 bg-gray-50">
//       <ScrollView
//         className="flex-1 bg-gray-50"
//         contentContainerStyle={{ paddingBottom: 80 }}
//       >
//         {/* Header Section */}
//         <View className="px-5 pt-12 pb-6 bg-white">
//           <View className="flex-row justify-between items-center">
//             <View>
//               <Text className="text-2xl font-bold text-gray-800">
//                 Hello, {userName}
//               </Text>
//             </View>
//             <View className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
//               <Image
//                 source={{
//                   uri:
//                     "https://ui-avatars.com/api/?name=" +
//                     userName +
//                     "&background=6366f1&color=fff",
//                 }}
//                 className="w-full h-full"
//               />
//             </View>
//           </View>
//         </View>

//         {/* Progress Card */}
//         <View className="px-5 mb-2 bg-white pb-6">
//           <View
//             className="rounded-3xl p-8 flex-row justify-between items-center"
//             style={{ backgroundColor: "#BADFDB" }}
//           >
//             <View className="flex-1 pr-4 gap-2">
//               <Text className="text-xl font-bold text-[#3b4544] mb-3 max-w-40">
//                 Your today task's is almost done
//               </Text>
//               <TouchableOpacity className="bg-white rounded-full px-5 py-2.5 self-start">
//                 <Text className="text-sm font-semibold text-gray-800">
//                   View tasks
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             <View className="items-center justify-center">
//               <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
//                 <Text className="text-2xl font-bold text-gray-800">
//                   {taskProgress}%
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Filter Section */}
//         <View className="px-5 mb-4">
//           <View className="flex-row gap-3">
//             {filters.map((filter) => (
//               <TouchableOpacity
//                 key={filter}
//                 onPress={() => setActiveFilter(filter)}
//                 className={`px-6 py-2.5 rounded-full ${
//                   activeFilter === filter
//                     ? "bg-indigo-500"
//                     : "bg-white border border-gray-200"
//                 }`}
//               >
//                 <Text
//                   className={`text-sm font-semibold ${
//                     activeFilter === filter ? "text-white" : "text-gray-600"
//                   }`}
//                 >
//                   {filter}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* Content Section */}
//         <View className="px-5 py-6">
//           {activeFilter === "All" && renderAllContent()}
//           {activeFilter === "Task" && renderTaskContent()}
//           {activeFilter === "Pomodoro" && renderPomodoroContent()}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

import { useSubtasks, useTasks } from "@/app/hooks/useCrud";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react"; 
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Form state untuk tambah tugas
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Judul tugas harus diisi");
      return;
    }
    if (!deadline.trim()) {
      Alert.alert("Error", "Deadline harus diisi");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(deadline)) {
      Alert.alert("Error", "Format deadline: YYYY-MM-DD (contoh: 2025-12-31)");
      return;
    }

    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: new Date(deadline).toISOString(),
      });
      setTitle("");
      setDescription("");
      setDeadline("");
      setModalVisible(false);
      Alert.alert("Berhasil", "Tugas berhasil ditambahkan");
    } catch (error) {
      Alert.alert("Error", "Gagal menambahkan tugas");
    }
  };

  const handleDeleteTask = (taskId: number, taskTitle: string) => {
    Alert.alert("Konfirmasi Hapus", `Yakin ingin menghapus "${taskTitle}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(taskId);
            Alert.alert("Berhasil", "Tugas berhasil dihapus");
          } catch (error) {
            Alert.alert("Error", "Gagal menghapus tugas");
          }
        },
      },
    ]);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTask) return;
    try {
      await updateTask(selectedTask.id, { status });
      Alert.alert("Berhasil", "Status tugas diperbarui");
    } catch (error) {
      Alert.alert("Error", "Gagal memperbarui status");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Memuat aplikasi...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Task Manager</Text>
        <Text style={styles.headerSubtitle}>{tasks.length} Tugas</Text>
      </View>

      {/* Task List */}
      <ScrollView style={styles.content}>
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Belum ada tugas</Text>
            <Text style={styles.emptySubtext}>
              Tap tombol + untuk menambah tugas baru
            </Text>
          </View>
        ) : (
          tasks.map((task) => {
            const deadline = new Date(task.deadline);
            const isOverdue =
              deadline < new Date() && task.status !== "completed";

            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => {
                  setSelectedTask(task);
                  setDetailVisible(true);
                }}
              >
                <View style={styles.taskHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          task.status === "completed"
                            ? "#10b981"
                            : task.status === "in_progress"
                              ? "#3b82f6"
                              : "#6b7280",
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {task.status === "completed"
                        ? "Selesai"
                        : task.status === "in_progress"
                          ? "Berjalan"
                          : "Pending"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteTask(task.id, task.title)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.taskTitle}>{task.title}</Text>

                {task.description && (
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}

                <View style={styles.taskFooter}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={isOverdue ? "#ef4444" : "#6b7280"}
                  />
                  <Text
                    style={[styles.taskDeadline, isOverdue && styles.overdue]}
                  >
                    {deadline.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal Tambah Tugas */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Tugas Baru</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Judul Tugas *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Masukkan judul tugas"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.label}>Deskripsi</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Masukkan deskripsi (opsional)"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Deadline *</Text>
              <TextInput
                style={styles.input}
                value={deadline}
                onChangeText={setDeadline}
                placeholder="YYYY-MM-DD (contoh: 2025-12-31)"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleAddTask}
              >
                <Text style={styles.submitButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Detail Tugas */}
      {selectedTask && (
        <TaskDetailModal
          visible={detailVisible}
          task={selectedTask}
          onClose={() => {
            setDetailVisible(false);
            setSelectedTask(null);
          }}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </SafeAreaView>
  );
}

// Component untuk Detail Modal dengan Subtasks
function TaskDetailModal({ visible, task, onClose, onUpdateStatus }: any) {
  const [newSubtask, setNewSubtask] = useState("");
  const { subtasks, createSubtask, toggleSubtask, deleteSubtask } = useSubtasks(
    task?.id || 0
  );

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) {
      Alert.alert("Error", "Subtask tidak boleh kosong");
      return;
    }
    try {
      await createSubtask(newSubtask.trim());
      setNewSubtask("");
    } catch (error) {
      Alert.alert("Error", "Gagal menambah subtask");
    }
  };

  const completedCount = subtasks.filter((s: any) => s.completed).length;
  const progress =
    subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Tugas</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.detailTitle}>{task.title}</Text>

            {task.description && (
              <Text style={styles.detailDescription}>{task.description}</Text>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#8B0000" />
              <Text style={styles.infoText}>
                {new Date(task.deadline).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>

            {/* Status Buttons */}
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>Status Tugas</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusBtn,
                    task.status === "pending" && styles.statusBtnActive,
                  ]}
                  onPress={() => onUpdateStatus("pending")}
                >
                  <Text style={styles.statusBtnText}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusBtn,
                    task.status === "in_progress" && styles.statusBtnActive,
                  ]}
                  onPress={() => onUpdateStatus("in_progress")}
                >
                  <Text style={styles.statusBtnText}>Berjalan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusBtn,
                    task.status === "completed" && styles.statusBtnActive,
                  ]}
                  onPress={() => onUpdateStatus("completed")}
                >
                  <Text style={styles.statusBtnText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Subtasks */}
            <View style={styles.subtaskSection}>
              <View style={styles.subtaskHeader}>
                <Text style={styles.sectionTitle}>Subtask</Text>
                <Text style={styles.progress}>
                  {completedCount}/{subtasks.length} ({Math.round(progress)}%)
                </Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.subtaskInput}
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  placeholder="Tambah subtask..."
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={handleAddSubtask}
                >
                  <Ionicons name="add" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {subtasks.map((subtask: any) => (
                <View key={subtask.id} style={styles.subtaskItem}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() =>
                      toggleSubtask(subtask.id, subtask.completed ? 0 : 1)
                    }
                  >
                    <Ionicons
                      name={
                        subtask.completed
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={24}
                      color={subtask.completed ? "#10b981" : "#9ca3af"}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.subtaskTitle,
                      subtask.completed && styles.subtaskCompleted,
                    ]}
                  >
                    {subtask.title}
                  </Text>
                  <TouchableOpacity onPress={() => deleteSubtask(subtask.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    backgroundColor: "#3b82f6",
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#dbeafe",
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  taskCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskDeadline: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 6,
  },
  overdue: {
    color: "#ef4444",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 24,
  },
  infoRow: {  
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 15,
    color: "#8B0000",
    marginLeft: 8,
  },
  statusSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: "row",
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    alignItems: "center",
  },
  statusBtnActive: {
    backgroundColor: "#3b82f6",
  },
  statusBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  subtaskSection: {
    marginTop: 8,
  },
  subtaskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progress: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
  },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  subtaskCompleted: {
    textDecorationLine: "line-through",
    color: "#9ca3af",
  },
});
