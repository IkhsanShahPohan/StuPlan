import TaskCompletionModal from "@/components/TaskModalCompletion";
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
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type StatusFilter = "in_progress" | "completed";
type CategoryFilter = "all" | "tugas" | "jadwal" | "kegiatan";
type SortOption = "created_at" | "deadline";

export default function TaskListScreen() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("in_progress");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("deadline");
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  const isTaskOverdue = (task: TaskWithSubtasks) => {
    // Overdue hanya untuk non-repeat tasks
    const isNonRepeat = !task.repeatEnabled || task.repeatOption === "none";
    if (!isNonRepeat) return false;

    const deadline = new Date(task.deadline);
    const now = new Date();
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

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((task) => task.category === selectedCategory);
    }

    // Filter by status
    result = result.filter((task) => task.status === selectedStatus);

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Date range filter
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

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "deadline") {
        // Sort by deadline (nearest first)
        const aOverdue = isTaskOverdue(a);
        const bOverdue = isTaskOverdue(b);

        // Overdue tasks first
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Then by deadline
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else {
        // Sort by created_at (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

    return result;
  }, [
    tasks,
    selectedCategory,
    selectedStatus,
    searchQuery,
    filterStartDate,
    filterEndDate,
    sortBy,
  ]);

  const handleConfirmTask = (taskId: number, taskTitle: string) => {
    setSelectedTaskForCompletion({ id: taskId, title: taskTitle });
    setCompletionModalVisible(true);
  };

  const handleCompleteTask = async () => {
    if (!selectedTaskForCompletion) return;

    try {
      await cancelTaskNotifications(selectedTaskForCompletion.id);
      const success = await updateTaskStatus(
        selectedTaskForCompletion.id,
        "completed"
      );

      if (success) {
        // Modal akan menampilkan celebration, lalu close otomatis
        setTimeout(() => {
          setCompletionModalVisible(false);
          setSelectedTaskForCompletion(null);
        }, 2500);
      } else {
        setCompletionModalVisible(false);
        Alert.alert("Error", "Gagal memperbarui status");
      }
    } catch (error) {
      console.error("Error confirming task:", error);
      setCompletionModalVisible(false);
      Alert.alert("Error", "Gagal memperbarui status");
    }
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

  const getCategoryCounts = () => {
    const filtered = tasks.filter((task) => task.status === selectedStatus);

    return {
      all: filtered.length,
      tugas: filtered.filter((t) => t.category === "tugas").length,
      jadwal: filtered.filter((t) => t.category === "jadwal").length,
      kegiatan: filtered.filter((t) => t.category === "kegiatan").length,
    };
  };

  const categoryCounts = getCategoryCounts();

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#8E8E93"
          style={styles.searchIcon}
        />
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

      {/* Status Tabs */}
      <View style={styles.statusTabs}>
        <TouchableOpacity
          style={[
            styles.statusTab,
            selectedStatus === "in_progress" && styles.statusTabActive,
          ]}
          onPress={() => setSelectedStatus("in_progress")}
        >
          <Ionicons
            name="time"
            size={16}
            color={selectedStatus === "in_progress" ? "#007AFF" : "#8E8E93"}
          />
          <Text
            style={[
              styles.statusTabText,
              selectedStatus === "in_progress" && styles.statusTabTextActive,
            ]}
          >
            Berjalan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusTab,
            selectedStatus === "completed" && styles.statusTabActive,
          ]}
          onPress={() => setSelectedStatus("completed")}
        >
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={selectedStatus === "completed" ? "#34C759" : "#8E8E93"}
          />
          <Text
            style={[
              styles.statusTabText,
              selectedStatus === "completed" && styles.statusTabTextActive,
            ]}
          >
            Selesai
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter + Sort */}
      <View style={styles.controlsRow}>
        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === "all" && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory("all")}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === "all" && styles.categoryPillTextActive,
              ]}
            >
              Semua ({categoryCounts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === "tugas" && styles.categoryPillActive,
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
                styles.categoryPillText,
                selectedCategory === "tugas" && styles.categoryPillTextActive,
              ]}
            >
              Tugas ({categoryCounts.tugas})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === "jadwal" && styles.categoryPillActive,
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
                styles.categoryPillText,
                selectedCategory === "jadwal" && styles.categoryPillTextActive,
              ]}
            >
              Jadwal ({categoryCounts.jadwal})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === "kegiatan" && styles.categoryPillActive,
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
                styles.categoryPillText,
                selectedCategory === "kegiatan" &&
                  styles.categoryPillTextActive,
              ]}
            >
              Kegiatan ({categoryCounts.kegiatan})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Sort Dropdown */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            Alert.alert("Urutkan", "Pilih urutan tampilan", [
              {
                text: "Tenggat Terdekat",
                onPress: () => setSortBy("deadline"),
                style: sortBy === "deadline" ? "default" : "cancel",
              },
              {
                text: "Terbaru Dibuat",
                onPress: () => setSortBy("created_at"),
                style: sortBy === "created_at" ? "default" : "cancel",
              },
              { text: "Batal", style: "cancel" },
            ]);
          }}
        >
          <Ionicons name="swap-vertical" size={18} color="#007AFF" />
          <Text style={styles.sortButtonText}>
            {sortBy === "deadline" ? "Tenggat" : "Terbaru"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Filter Badge */}
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

      {/* Task List with Pull to Refresh */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                selectedStatus === "completed"
                  ? "checkmark-circle-outline"
                  : "file-tray-outline"
              }
              size={70}
              color="#C7C7CC"
            />
            <Text style={styles.emptyText}>Tidak ada task</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterStartDate || filterEndDate
                ? "Coba ubah filter"
                : selectedStatus === "completed"
                  ? "Belum ada task yang selesai"
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
                        isOverdue &&
                          !isCompleted &&
                          styles.statusIndicatorOverdue,
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
                          isOverdue &&
                            !isCompleted &&
                            styles.metaChipTextOverdue,
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
                          {deadline.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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

                  {/* <View style={styles.taskActions}>
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
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                  </View> */}
              </View>

                {/* {isCompleted && (
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
                )} */}

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

      <TaskCompletionModal
        visible={completionModalVisible}
        taskTitle={selectedTaskForCompletion?.title || ""}
        onConfirm={handleCompleteTask}
        onCancel={() => {
          setCompletionModalVisible(false);
          setSelectedTaskForCompletion(null);
        }}
      />
    </View>
  );
}
