import AddTaskModal from "@/components/tasks/AddTaskModal";
import FilterModal from "@/components/tasks/FilterModal";
import { TaskWithSubtasks, useTask } from "@/hooks/useTasks";
import { useAuth } from "@/lib/AuthContext";
import { styles } from "@/styles/taskStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type StatusFilter = "all" | "in_progress" | "completed" | "overdue";

export default function TaskListScreen() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "tugas" | "jadwal" | "kegiatan"
  >("all");

  const { user } = useAuth();
  const userId = user?.id || "";

  const {
    tasks,
    loading,
    createTask,
    deleteTask,
    updateTaskStatus,
    cancelTaskNotifications,
    refreshTasks,
  } = useTask(userId);

  const isTaskOverdue = (task: TaskWithSubtasks) => {
    const deadline = new Date(task.deadline);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return deadline < now && task.status !== "completed";
  };

  const canBeConfirmed = (task: TaskWithSubtasks) => {
    const isNonRepeat = !task.repeatEnabled || task.repeatOption === "none";
    const isConfirmableCategory = ["tugas", "jadwal", "kegiatan"].includes(
      task.category
    );
    return isNonRepeat && isConfirmableCategory && task.status !== "completed";
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (selectedCategory !== "all") {
      result = result.filter((task) => task.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      result = result.filter((task) => {
        if (selectedStatus === "overdue") {
          return isTaskOverdue(task);
        }
        return task.status === selectedStatus;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    if (filterStartDate || filterEndDate) {
      result = result.filter((task) => {
        const taskDate = new Date(task.deadline);
        taskDate.setHours(0, 0, 0, 0);

        if (filterStartDate && filterEndDate) {
          const start = new Date(filterStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(filterEndDate);
          end.setHours(23, 59, 59, 999);
          return taskDate >= start && taskDate <= end;
        } else if (filterStartDate) {
          const start = new Date(filterStartDate);
          start.setHours(0, 0, 0, 0);
          return taskDate >= start;
        } else if (filterEndDate) {
          const end = new Date(filterEndDate);
          end.setHours(23, 59, 59, 999);
          return taskDate <= end;
        }
        return true;
      });
    }

    return result.sort((a, b) => {
      const aOverdue = isTaskOverdue(a);
      const bOverdue = isTaskOverdue(b);

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [
    tasks,
    selectedCategory,
    selectedStatus,
    searchQuery,
    filterStartDate,
    filterEndDate,
  ]);

  const handleConfirmTask = async (taskId: number, taskTitle: string) => {
    Alert.alert(
      "Konfirmasi Selesai",
      `Tandai "${taskTitle}" sebagai selesai?\n\nSemua notifikasi terkait akan dibatalkan.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Selesai",
          style: "default",
          onPress: async () => {
            try {
              await cancelTaskNotifications(taskId);
              const success = await updateTaskStatus(taskId, "completed");

              if (success) {
                Alert.alert("Berhasil", "Task ditandai selesai");
              } else {
                Alert.alert("Error", "Gagal memperbarui status");
              }
            } catch (error) {
              console.error("Error confirming task:", error);
              Alert.alert("Error", "Gagal memperbarui status");
            }
          },
        },
      ]
    );
  };

  const handleDeleteTask = (taskId: number, taskTitle: string) => {
    Alert.alert("Hapus Item", `Yakin hapus "${taskTitle}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const success = await deleteTask(taskId);
            if (success) {
              Alert.alert("Berhasil", "Item dihapus");
            } else {
              Alert.alert("Error", "Gagal menghapus item");
            }
          } catch (error) {
            console.error("Error deleting task:", error);
            Alert.alert("Error", "Gagal menghapus item");
          }
        },
      },
    ]);
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "tugas":
        return {
          label: "Tugas",
          icon: "briefcase" as const,
          color: "#1976D2",
          bg: "#E3F2FD",
        };
      case "jadwal":
        return {
          label: "Jadwal",
          icon: "school" as const,
          color: "#F57C00",
          bg: "#FFF3E0",
        };
      case "kegiatan":
        return {
          label: "Kegiatan",
          icon: "calendar" as const,
          color: "#7B1FA2",
          bg: "#F3E5F5",
        };
      default:
        return {
          label: "",
          icon: "document" as const,
          color: "",
          bg: "",
        };
    }
  };

  const getStatusCounts = () => {
    return {
      all: tasks.length,
      in_progress: tasks.filter(
        (t) => t.status === "in_progress" || t.status === "pending"
      ).length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter((t) => isTaskOverdue(t)).length,
    };
  };

  const getCategoryCounts = () => {
    const filtered = selectedStatus === "all" 
      ? tasks 
      : tasks.filter(task => {
          if (selectedStatus === "overdue") return isTaskOverdue(task);
          return task.status === selectedStatus;
        });
    
    return {
      all: filtered.length,
      tugas: filtered.filter((t) => t.category === "tugas").length,
      jadwal: filtered.filter((t) => t.category === "jadwal").length,
      kegiatan: filtered.filter((t) => t.category === "kegiatan").length,
    };
  };

  const statusCounts = getStatusCounts();
  const categoryCounts = getCategoryCounts();

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>Kelola tugas Anda</Text>
        </View>
        <TouchableOpacity
          style={styles.filterIconButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={22} color="#007AFF" />
          {(filterStartDate || filterEndDate) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Compact Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari tasks..."
          placeholderTextColor="#8E8E93"
          returnKeyType="search"
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Compact Combined Filters - Single Row */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {/* Status Filters */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedStatus === "all" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus("all")}
          >
            <Ionicons
              name="apps"
              size={14}
              color={selectedStatus === "all" ? "#FFFFFF" : "#8E8E93"}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === "all" && styles.filterChipTextActive,
              ]}
            >
              Semua ({statusCounts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedStatus === "in_progress" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus("in_progress")}
          >
            <Ionicons
              name="time"
              size={14}
              color={selectedStatus === "in_progress" ? "#FFFFFF" : "#007AFF"}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === "in_progress" && styles.filterChipTextActive,
              ]}
            >
              Berjalan ({statusCounts.in_progress})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedStatus === "completed" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus("completed")}
          >
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={selectedStatus === "completed" ? "#FFFFFF" : "#34C759"}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === "completed" && styles.filterChipTextActive,
              ]}
            >
              Selesai ({statusCounts.completed})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedStatus === "overdue" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus("overdue")}
          >
            <Ionicons
              name="alert-circle"
              size={14}
              color={selectedStatus === "overdue" ? "#FFFFFF" : "#FF3B30"}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === "overdue" && styles.filterChipTextActive,
              ]}
            >
              Terlambat ({statusCounts.overdue})
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ width: 1, height: 28, backgroundColor: "#E5E5EA", marginHorizontal: 8 }} />

          {/* Category Filters */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === "all" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory("all")}
          >
            <Ionicons
              name="grid"
              size={14}
              color={selectedCategory === "all" ? "#FFFFFF" : "#8E8E93"}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === "all" && styles.filterChipTextActive,
              ]}
            >
              Semua ({categoryCounts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === "tugas" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory("tugas")}
          >
            <Ionicons
              name="briefcase"
              size={14}
              color={selectedCategory === "tugas" ? "#FFFFFF" : "#1976D2"}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === "tugas" && styles.filterChipTextActive,
              ]}
            >
              Tugas ({categoryCounts.tugas})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === "jadwal" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory("jadwal")}
          >
            <Ionicons
              name="school"
              size={14}
              color={selectedCategory === "jadwal" ? "#FFFFFF" : "#F57C00"}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === "jadwal" && styles.filterChipTextActive,
              ]}
            >
              Jadwal ({categoryCounts.jadwal})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === "kegiatan" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory("kegiatan")}
          >
            <Ionicons
              name="calendar"
              size={14}
              color={selectedCategory === "kegiatan" ? "#FFFFFF" : "#7B1FA2"}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === "kegiatan" && styles.filterChipTextActive,
              ]}
            >
              Kegiatan ({categoryCounts.kegiatan})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Date Filter Info - Only if active */}
      {(filterStartDate || filterEndDate) && (
        <View style={styles.activeDateFilter}>
          <Ionicons name="calendar" size={12} color="#007AFF" />
          <Text style={styles.activeDateFilterText}>
            {filterStartDate?.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}{" "}
            -{" "}
            {filterEndDate?.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setFilterStartDate(null);
              setFilterEndDate(null);
            }}
            style={{ marginLeft: "auto" }}
          >
            <Ionicons name="close-circle" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Task List - PRIORITY SPACE */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                selectedStatus === "completed"
                  ? "checkmark-circle-outline"
                  : selectedStatus === "overdue"
                    ? "alert-circle-outline"
                    : "file-tray-outline"
              }
              size={70}
              color="#C7C7CC"
            />
            <Text style={styles.emptyText}>Tidak ada task</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterStartDate || filterEndDate
                ? "Coba ubah filter"
                : "Tap tombol + untuk buat baru"}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const deadline = new Date(task.deadline);
            const isOverdue = isTaskOverdue(task);
            const isCompleted = task.status === "completed";
            const categoryInfo = getCategoryInfo(task.category);
            const showConfirmButton = canBeConfirmed(task);

            return (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  isCompleted && styles.taskCardCompleted,
                  isOverdue && !isCompleted && styles.taskCardOverdue,
                ]}
                onPress={() => router.push(`/tasks/${task.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.taskCardHeader}>
                  <View style={styles.taskTitleRow}>
                    <View
                      style={[
                        styles.statusIndicator,
                        isCompleted && styles.statusIndicatorCompleted,
                        isOverdue && !isCompleted && styles.statusIndicatorOverdue,
                      ]}
                    />
                    <Text
                      style={[
                        styles.taskTitle,
                        isCompleted && styles.taskTitleCompleted,
                      ]}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: categoryInfo.bg },
                    ]}
                  >
                    <Ionicons
                      name={categoryInfo.icon}
                      size={11}
                      color={categoryInfo.color}
                    />
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        { color: categoryInfo.color },
                      ]}
                    >
                      {categoryInfo.label}
                    </Text>
                  </View>
                </View>

                {task.description && (
                  <Text
                    style={[
                      styles.taskDescription,
                      isCompleted && styles.taskDescriptionCompleted,
                    ]}
                    numberOfLines={2}
                  >
                    {task.description}
                  </Text>
                )}

                <View style={styles.taskMeta}>
                  <View style={styles.taskMetaLeft}>
                    <View
                      style={[
                        styles.metaChip,
                        isOverdue && !isCompleted && styles.metaChipOverdue,
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color={
                          isOverdue && !isCompleted
                            ? "#FF3B30"
                            : isCompleted
                              ? "#8E8E93"
                              : "#64748B"
                        }
                      />
                      <Text
                        style={[
                          styles.metaChipText,
                          isOverdue && !isCompleted && styles.metaChipTextOverdue,
                          isCompleted && styles.metaChipTextCompleted,
                        ]}
                      >
                        {deadline.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Text>
                    </View>

                    {task.reminderEnabled && !isCompleted && (
                      <View style={[styles.metaChip, styles.metaChipReminder]}>
                        <Ionicons
                          name="notifications-outline"
                          size={12}
                          color="#007AFF"
                        />
                        <Text style={styles.metaChipTextReminder}>
                          {task.reminderTime}
                        </Text>
                      </View>
                    )}

                    {task.repeatEnabled && task.repeatOption !== "none" && (
                      <View style={[styles.metaChip, styles.metaChipRepeat]}>
                        <Ionicons name="repeat" size={12} color="#F57C00" />
                        <Text style={styles.metaChipTextRepeat}>
                          {task.repeatOption === "daily"
                            ? "Harian"
                            : task.repeatOption === "weekly"
                              ? "Mingguan"
                              : task.repeatOption === "monthly"
                                ? "Bulanan"
                                : "Tahunan"}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.taskActions}>
                    {showConfirmButton && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleConfirmTask(task.id, task.title);
                        }}
                        style={styles.confirmButton}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#34C759"
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id, task.title);
                      }}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>

                {isCompleted && (
                  <View style={styles.completedOverlay}>
                    <View style={styles.completedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#34C759"
                      />
                      <Text style={styles.completedBadgeText}>Selesai</Text>
                    </View>
                  </View>
                )}

                {isOverdue && !isCompleted && (
                  <View style={styles.overdueBadge}>
                    <Ionicons name="alert-circle" size={11} color="#FFFFFF" />
                    <Text style={styles.overdueBadgeText}>Terlambat</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <AddTaskModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onCreateTask={createTask}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        startDate={filterStartDate}
        endDate={filterEndDate}
        onStartDateChange={setFilterStartDate}
        onEndDateChange={setFilterEndDate}
        onApply={() => setFilterModalVisible(false)}
        onReset={() => {
          setFilterStartDate(null);
          setFilterEndDate(null);
        }}
      />
    </View>
  );
}