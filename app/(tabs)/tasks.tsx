import AddTaskModal from "@/components/tasks/AddTaskModal";
import FilterModal from "@/components/tasks/FilterModal";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTasks } from "../../hooks/useTasks";
import { taskStyles } from "../../styles/taskStyles";

export default function TaskListScreen() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "tugas" | "jadwal" | "kegiatan"
  >("all");

  const {
    tasks,
    loading,
    createTask,
    deleteTask,
    refreshTasks,
    searchTasks,
    filterByCategory,
  } = useTasks();

  const handleSearch = () => {
    searchTasks(
      searchQuery,
      filterStartDate || undefined,
      filterEndDate || undefined,
      selectedCategory
    );
  };

  const handleCategoryFilter = (
    category: "all" | "tugas" | "jadwal" | "kegiatan"
  ) => {
    setSelectedCategory(category);

    // Reset search when changing category
    if (searchQuery || filterStartDate || filterEndDate) {
      setSearchQuery("");
      setFilterStartDate(null);
      setFilterEndDate(null);
    }

    filterByCategory(category);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setFilterStartDate(null);
    setFilterEndDate(null);
    setSelectedCategory("all");
    refreshTasks();
  };

  const handleDeleteTask = (taskId: number, taskTitle: string) => {
    Alert.alert("Hapus Item", `Yakin hapus "${taskTitle}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(taskId);
            Alert.alert("Berhasil", "Item dihapus");
          } catch {
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
          icon: "briefcase",
          color: "#1976D2",
          bg: "#E3F2FD",
        };
      case "jadwal":
        return {
          label: "Jadwal",
          icon: "school",
          color: "#F57C00",
          bg: "#FFF3E0",
        };
      case "kegiatan":
        return {
          label: "Kegiatan",
          icon: "calendar",
          color: "#7B1FA2",
          bg: "#F3E5F5",
        };
      default:
        return { label: "", icon: "", color: "", bg: "" };
    }
  };

  // Get filtered tasks count per category
  const getCategoryCounts = () => {
    return {
      all: tasks.length,
      tugas: tasks.filter((t) => t.category === "tugas").length,
      jadwal: tasks.filter((t) => t.category === "jadwal").length,
      kegiatan: tasks.filter((t) => t.category === "kegiatan").length,
    };
  };

  const counts = getCategoryCounts();
  const hasActiveFilters =
    searchQuery ||
    filterStartDate ||
    filterEndDate ||
    selectedCategory !== "all";

  return (
    <SafeAreaView style={taskStyles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>
            Kelola jadwal dan tugas Anda
          </Text>
        </View>
        <TouchableOpacity
          style={taskStyles.filterBtn}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#007AFF" />
          {(filterStartDate || filterEndDate) && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#FF3B30",
              }}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Header sebelumnya */}
      {/* <View style={taskStyles.header}>
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>
            Manage dan buat jadwal anda!
          </Text>
        </View>
        <TouchableOpacity
          style={taskStyles.filterBtn}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#007AFF" />
          {(filterStartDate || filterEndDate) && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#FF3B30",
              }}
            />
          )}
        </TouchableOpacity>
      </View> */}

      {/* Search Bar */}
      <View style={taskStyles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8E8E93"
          style={taskStyles.searchIcon}
        />
        <TextInput
          style={taskStyles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari tugas, jadwal, kegiatan..."
          placeholderTextColor="#8E8E93"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              if (!filterStartDate && !filterEndDate) {
                filterByCategory(selectedCategory);
              }
            }}
          >
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View style={taskStyles.categoryFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          <View style={taskStyles.categoryFilterRow}>
            <TouchableOpacity
              style={[
                taskStyles.categoryFilterBtn,
                selectedCategory === "all" &&
                  taskStyles.categoryFilterBtnActive,
              ]}
              onPress={() => handleCategoryFilter("all")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="grid-outline"
                size={16}
                color={selectedCategory === "all" ? "#FFFFFF" : "#8E8E93"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  taskStyles.categoryFilterText,
                  selectedCategory === "all" &&
                    taskStyles.categoryFilterTextActive,
                ]}
              >
                Semua ({counts.all})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                taskStyles.categoryFilterBtn,
                selectedCategory === "tugas" &&
                  taskStyles.categoryFilterBtnActive,
              ]}
              onPress={() => handleCategoryFilter("tugas")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="briefcase"
                size={16}
                color={selectedCategory === "tugas" ? "#FFFFFF" : "#1976D2"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  taskStyles.categoryFilterText,
                  selectedCategory === "tugas" &&
                    taskStyles.categoryFilterTextActive,
                ]}
              >
                Tugas ({counts.tugas})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                taskStyles.categoryFilterBtn,
                selectedCategory === "jadwal" &&
                  taskStyles.categoryFilterBtnActive,
              ]}
              onPress={() => handleCategoryFilter("jadwal")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="school"
                size={16}
                color={selectedCategory === "jadwal" ? "#FFFFFF" : "#F57C00"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  taskStyles.categoryFilterText,
                  selectedCategory === "jadwal" &&
                    taskStyles.categoryFilterTextActive,
                ]}
              >
                Jadwal ({counts.jadwal})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                taskStyles.categoryFilterBtn,
                selectedCategory === "kegiatan" &&
                  taskStyles.categoryFilterBtnActive,
              ]}
              onPress={() => handleCategoryFilter("kegiatan")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar"
                size={16}
                color={selectedCategory === "kegiatan" ? "#FFFFFF" : "#7B1FA2"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  taskStyles.categoryFilterText,
                  selectedCategory === "kegiatan" &&
                    taskStyles.categoryFilterTextActive,
                ]}
              >
                Kegiatan ({counts.kegiatan})
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Clear All Filter Button */}
        {/* {hasActiveFilters && (
          <TouchableOpacity
            style={{
              marginLeft: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: "#FF3B30",
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#FFFFFF" }}>
              Reset
            </Text>
          </TouchableOpacity>
        )} */}
      </View>

      {/* Active Filters Info */}
      {(filterStartDate || filterEndDate) && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: "#F0F7FF",
            borderBottomWidth: 0.5,
            borderBottomColor: "#E5E5EA",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="filter"
              size={14}
              color="#007AFF"
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 13, color: "#007AFF" }}>
              Filter tanggal aktif:{" "}
              {filterStartDate?.toLocaleDateString("id-ID")} -{" "}
              {filterEndDate?.toLocaleDateString("id-ID")}
            </Text>
          </View>
        </View>
      )}

      {/* Task List */}
      <ScrollView
        style={taskStyles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 15 }}
      >
        {tasks.length === 0 ? (
          <View style={taskStyles.emptyState}>
            <Ionicons
              name={
                selectedCategory === "tugas"
                  ? "briefcase-outline"
                  : selectedCategory === "jadwal"
                    ? "school-outline"
                    : selectedCategory === "kegiatan"
                      ? "calendar-outline"
                      : "checkmark-circle-outline"
              }
              size={80}
              color="#C7C7CC"
            />
            <Text style={taskStyles.emptyText}>
              {hasActiveFilters
                ? "Tidak ada hasil"
                : `Belum ada ${selectedCategory === "all" ? "item" : getCategoryInfo(selectedCategory).label.toLowerCase()}`}
            </Text>
            <Text style={taskStyles.emptySubtext}>
              {hasActiveFilters
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Tap tombol + untuk membuat baru"}
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
            const categoryInfo = getCategoryInfo(task.category);

            return (
              <TouchableOpacity
                key={task.id}
                style={taskStyles.taskCard}
                onPress={() => router.push(`/tasks/${task.id}`)}
                activeOpacity={0.7}
              >
                <View style={taskStyles.taskHeader}>
                  <View
                    style={[
                      taskStyles.statusDot,
                      { backgroundColor: statusColors[task.status] },
                    ]}
                  />
                  <Text style={taskStyles.taskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <View
                    style={[
                      taskStyles.categoryBadge,
                      { backgroundColor: categoryInfo.bg },
                    ]}
                  >
                    <Text
                      style={[
                        taskStyles.categoryBadgeText,
                        { color: categoryInfo.color },
                      ]}
                    >
                      {categoryInfo.label}
                    </Text>
                  </View>
                </View>

                {task.description && (
                  <Text style={taskStyles.taskDesc} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}

                <View style={taskStyles.taskFooter}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View style={taskStyles.deadlineRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={isOverdue ? "#FF3B30" : "#8E8E93"}
                      />
                      <Text
                        style={[
                          taskStyles.deadlineText,
                          isOverdue && taskStyles.overdueText,
                        ]}
                      >
                        {deadline.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Text>
                    </View>

                    {task.time && (
                      <View
                        style={[
                          taskStyles.deadlineRow,
                          { backgroundColor: "#F0F7FF" },
                        ]}
                      >
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#007AFF"
                        />
                        <Text
                          style={[
                            taskStyles.deadlineText,
                            { color: "#007AFF" },
                          ]}
                        >
                          {task.time}
                        </Text>
                      </View>
                    )}

                    {task.repeatOption && task.repeatOption !== "none" && (
                      <View
                        style={[
                          taskStyles.deadlineRow,
                          { backgroundColor: "#FFF3E0" },
                        ]}
                      >
                        <Ionicons name="repeat" size={14} color="#F57C00" />
                        <Text
                          style={[
                            taskStyles.deadlineText,
                            { color: "#F57C00" },
                          ]}
                        >
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

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id, task.title);
                    }}
                    style={taskStyles.deleteBtn}
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
        style={taskStyles.fab}
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
        onReset={() => {
          setFilterStartDate(null);
          setFilterEndDate(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 27,
  },
});
