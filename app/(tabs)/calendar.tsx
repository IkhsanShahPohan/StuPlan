import { useTask } from "@/hooks/useTasks";
import { useAuth } from "@/lib/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Task {
  id: number;
  title: string;
  category: "tugas" | "jadwal" | "kegiatan";
  deadline: string;
  time: string | null;
  status: "pending" | "in_progress" | "completed";
}

const categoryConfig = {
  tugas: {
    color: "#3B82F6",
    lightColor: "#EFF6FF",
    icon: "document-text",
    label: "Tugas",
  },
  jadwal: {
    color: "#A855F7",
    lightColor: "#FAF5FF",
    icon: "calendar",
    label: "Jadwal",
  },
  kegiatan: {
    color: "#10B981",
    lightColor: "#ECFDF5",
    icon: "flash",
    label: "Kegiatan",
  },
};

const TaskCalendar = () => {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;
  const { tasks } = useTask(userId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Helper function untuk normalize tanggal (remove time)
  const normalizeDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      date: Date;
    }> = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const getTasksForDate = (date: Date): Task[] => {
    const targetDateStr = normalizeDate(date.toISOString());

    return tasks.filter((task) => {
      const taskDateStr = normalizeDate(task.deadline);
      return taskDateStr === targetDateStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      normalizeDate(date.toISOString()) === normalizeDate(today.toISOString())
    );
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      normalizeDate(date1.toISOString()) === normalizeDate(date2.toISOString())
    );
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const openDatePicker = () => {
    setPickerYear(currentDate.getFullYear());
    setPickerMonth(currentDate.getMonth());
    setShowDatePicker(true);
  };

  const applyDatePicker = () => {
    const newDate = new Date(pickerYear, pickerMonth, 1);
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  const days = getDaysInMonth(currentDate);
  const selectedDayTasks = getTasksForDate(selectedDate);

  const handleTaskPress = (taskId: number) => {
    router.push(`/tasks/${taskId}`);
  };

  // Generate years array (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Kalender Tasks</Text>
          <Text style={styles.headerSubtitle}>
            Kelola jadwal dan tugas Anda
          </Text>
        </View>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Hari Ini</Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth(-1)}
        >
          <Ionicons name="chevron-back" size={24} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.monthTitle} onPress={openDatePicker}>
          <Text style={styles.monthText}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color="#64748B"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth(1)}
        >
          <Ionicons name="chevron-forward" size={24} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarCard}>
        {/* Day Names */}
        <View style={styles.dayNamesRow}>
          {dayNames.map((day) => (
            <View key={day} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.daysGrid}>
          {days.map((dayInfo, index) => {
            const tasksForDay = getTasksForDate(dayInfo.date);
            const isSelected = isSameDay(dayInfo.date, selectedDate);
            const isTodayDate = isToday(dayInfo.date);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !dayInfo.isCurrentMonth && styles.dayCellInactive,
                  isSelected && styles.dayCellSelected,
                  isTodayDate && !isSelected && styles.dayCellToday,
                ]}
                onPress={() => setSelectedDate(dayInfo.date)}
              >
                <Text
                  style={[
                    styles.dayText,
                    !dayInfo.isCurrentMonth && styles.dayTextInactive,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {dayInfo.day}
                </Text>

                {tasksForDay.length > 0 && (
                  <View style={styles.taskIndicators}>
                    {tasksForDay.slice(0, 3).map((task) => (
                      <View
                        key={task.id}
                        style={[
                          styles.taskDot,
                          {
                            backgroundColor:
                              categoryConfig[task.category].color,
                          },
                        ]}
                      />
                    ))}
                    {tasksForDay.length > 3 && (
                      <Text
                        style={[
                          styles.moreTasksText,
                          isSelected && styles.moreTasksTextSelected,
                        ]}
                      >
                        +{tasksForDay.length - 3}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Date Tasks */}
      <View style={styles.tasksSection}>
        <View style={styles.tasksSectionHeader}>
          <Text style={styles.tasksSectionTitle}>
            {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
          </Text>
          <Text style={styles.tasksSectionSubtitle}>
            {selectedDayTasks.length} tasks
          </Text>
        </View>

        {selectedDayTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>Tidak ada tasks</Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {selectedDayTasks.map((task) => {
              const config = categoryConfig[task.category];

              return (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskCard,
                    { backgroundColor: config.lightColor },
                  ]}
                  onPress={() => handleTaskPress(task.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskCardContent}>
                    <View
                      style={[
                        styles.taskIcon,
                        { backgroundColor: config.color },
                      ]}
                    >
                      <Ionicons
                        name={config.icon as any}
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>

                    <View style={styles.taskInfo}>
                      <Text style={styles.taskTitle} numberOfLines={2}>
                        {task.title}
                      </Text>

                      <View style={styles.taskMeta}>
                        <View
                          style={[
                            styles.categoryBadge,
                            { backgroundColor: config.color },
                          ]}
                        >
                          <Text style={styles.categoryBadgeText}>
                            {config.label}
                          </Text>
                        </View>

                        {task.time && (
                          <View style={styles.timeBadge}>
                            <Ionicons
                              name="time-outline"
                              size={12}
                              color="#64748B"
                            />
                            <Text style={styles.timeBadgeText}>
                              {task.time}
                            </Text>
                          </View>
                        )}

                        <View
                          style={[
                            styles.statusBadge,
                            task.status === "completed" &&
                              styles.statusBadgeCompleted,
                            task.status === "in_progress" &&
                              styles.statusBadgeProgress,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              task.status === "completed" &&
                                styles.statusBadgeTextCompleted,
                              task.status === "in_progress" &&
                                styles.statusBadgeTextProgress,
                            ]}
                          >
                            {task.status === "completed"
                              ? "Selesai"
                              : task.status === "in_progress"
                                ? "Progress"
                                : "Pending"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Kategori</Text>
        <View style={styles.legendItems}>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <View key={key} style={styles.legendItem}>
              <View
                style={[styles.legendIcon, { backgroundColor: config.color }]}
              >
                <Ionicons name={config.icon as any} size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.legendText}>{config.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Bulan & Tahun</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {/* Year Picker */}
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Tahun</Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        pickerYear === year && styles.pickerItemSelected,
                      ]}
                      onPress={() => setPickerYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          pickerYear === year && styles.pickerItemTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Bulan</Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {monthNames.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        pickerMonth === index && styles.pickerItemSelected,
                      ]}
                      onPress={() => setPickerMonth(index)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          pickerMonth === index &&
                            styles.pickerItemTextSelected,
                        ]}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyDatePicker}
            >
              <Text style={styles.applyButtonText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingBottom: 100,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
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
  todayButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthTitle: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  monthText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dayNamesRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dayNameCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  dayCellInactive: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: "#3B82F6",
    transform: [{ scale: 1.05 }],
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  dayTextInactive: {
    color: "#94A3B8",
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  taskIndicators: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
    alignItems: "center",
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreTasksText: {
    fontSize: 8,
    color: "#64748B",
    marginLeft: 2,
  },
  moreTasksTextSelected: {
    color: "#FFFFFF",
  },
  tasksSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tasksSectionHeader: {
    marginBottom: 16,
  },
  tasksSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  tasksSectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 16,
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  taskCardContent: {
    flexDirection: "row",
    gap: 12,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeBadgeText: {
    fontSize: 10,
    color: "#64748B",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  statusBadgeCompleted: {
    backgroundColor: "#D1FAE5",
  },
  statusBadgeProgress: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#475569",
  },
  statusBadgeTextCompleted: {
    color: "#065F46",
  },
  statusBadgeTextProgress: {
    color: "#92400E",
  },
  legend: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: "row",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  legendText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  pickerContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  pickerSection: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
  },
  pickerScroll: {
    maxHeight: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  pickerItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
  },
  pickerItemTextSelected: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default TaskCalendar;
