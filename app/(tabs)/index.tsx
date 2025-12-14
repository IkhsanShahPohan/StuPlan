import AddTaskModal from "@/components/tasks/AddTaskModal";
import { useTask } from "@/hooks/useTasks";
import { useAuth } from "@/lib/AuthContext";
import { styles } from "@/styles/homeStyles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HomeScreen = () => {
  const { user } = useAuth();
  const {
    tasks,
    loading,
    refreshTasks,
    getUpcomingTasks,
    getOverdueTasks,
    getCompletedTasks,
    createTask,
  } = useTask(user?.id || "");

  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Set greeting based on time
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Selamat Pagi");
      else if (hour < 18) setGreeting("Selamat Siang");
      else setGreeting("Selamat Malam");
    };

    updateGreeting();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateGreeting();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay(); // 0 = Minggu, 1 = Senin, ...
    const diffToMonday = (day === 0 ? -6 : 1 - day); 
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);

    // Set jam ke awal hari
    startOfWeek.setHours(0, 0, 0, 0);

    // Akhir minggu = awal minggu + 7 hari
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    const completedThisWeek = tasks.filter((task) => {
      const updatedAt = new Date(task.updatedAt || '');
      return (
        task.status === 'completed' &&
        updatedAt >= startOfWeek &&
        updatedAt < endOfWeek
      );
    }).length;

    const completedToday = tasks.filter((task) => {
      const updatedAt = new Date(task.updatedAt || "");
      return (
        task.status === "completed" &&
        updatedAt >= today &&
        updatedAt < tomorrow
      );
    }).length;

    const upcomingTasks = getUpcomingTasks();
    const overdueTasks = getOverdueTasks();
    const completedTasks = getCompletedTasks();

    const totalTasks = tasks.length;
    const completionRate =
      totalTasks > 0
        ? Math.round((completedTasks.length / totalTasks) * 100)
        : 0;

    return {
      totalTasks,
      completedToday,
      completedThisWeek,
      upcoming: upcomingTasks.length,
      overdue: overdueTasks.length,
      completionRate,
    };
  }, [tasks, getUpcomingTasks, getOverdueTasks, getCompletedTasks]);

  // Get upcoming tasks (limited to 5)
  const upcomingTasksList = useMemo(() => {
    return getUpcomingTasks()
      .slice(0, 5)
      .sort((a, b) => {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }, [getUpcomingTasks]);

  // Category helpers
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tugas":
        return "#8B5CF6";
      case "jadwal":
        return "#3B82F6";
      case "kegiatan":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getCategoryIcon = (
    category: string,
    color: string,
    size: number = 20
  ) => {
    switch (category) {
      case "tugas":
        return <Ionicons name="checkmark-circle" size={size} color={color} />;
      case "jadwal":
        return <Ionicons name="calendar" size={size} color={color} />;
      case "kegiatan":
        return <Ionicons name="pulse" size={size} color={color} />;
      default:
        return <Ionicons name="flag" size={size} color={color} />;
    }
  };

  const formatTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (diff < 0) return "Overdue";
    if (hours < 1) return "Less than 1h";
    if (hours < 24) return `${hours}h remaining`;

    const days = Math.floor(hours / 24);
    return `${days}d remaining`;
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  // Navigation handlers
  const handleCreateTask = (category?: string) => {
    router.push({
      pathname: "/tasks/create",
      params: { category },
    });
  };

  const handleViewTask = (taskId: number) => {
    router.push({
      pathname: `/tasks/${taskId}`,
    });
  };

  const handleViewAllTasks = () => {
    router.push("/tasks");
  };

  // Get user name from email
  const userName = user?.email?.split("@")[0] || "User";
  const displayName =
    userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase();

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.dateTime}>
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications" size={24} color="#fff" />
            {stats.overdue > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {stats.overdue}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
            colors={["#667eea", "#764ba2"]}
          />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={[styles.statCard, styles.statCardPrimary]}
              activeOpacity={0.7}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{stats.completedToday}</Text>
              <Text style={styles.statLabel}>Completed Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, styles.statCardSecondary]}
              activeOpacity={0.7}
              onPress={handleViewAllTasks}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{stats.upcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, styles.statCardWarning]}
              activeOpacity={0.7}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="flash" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{stats.overdue}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, styles.statCardSuccess]}
              activeOpacity={0.7}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="trending-up" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{stats.completionRate}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <TouchableOpacity onPress={handleViewAllTasks}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Ionicons name="bar-chart" size={24} color="#667eea" />
              <Text style={styles.progressTitle}>Weekly Goal</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${stats.completionRate}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.progressStats}>
              <Text style={styles.progressText}>
                {stats.completedThisWeek} of {stats.totalTasks} tasks completed
              </Text>
              <Text style={styles.progressPercentage}>
                {stats.completionRate}%
              </Text>
            </View>
          </View>
        </View>

        {/* Upcoming Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
            <TouchableOpacity onPress={handleViewAllTasks}>
              <Ionicons name="chevron-forward" size={24} color="#667eea" />
            </TouchableOpacity>
          </View>

          {upcomingTasksList.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No upcoming tasks</Text>
              <Text style={styles.emptyStateSubtext}>
                Create a new task to get started
              </Text>
            </View>
          ) : (
            upcomingTasksList.map((task) => {
              const categoryColor = getCategoryColor(task.category);

              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  activeOpacity={0.7}
                  onPress={() => handleViewTask(task.id)}
                >
                  <View
                    style={[
                      styles.taskIconContainer,
                      { backgroundColor: `${categoryColor}15` },
                    ]}
                  >
                    {getCategoryIcon(task.category, categoryColor, 20)}
                  </View>

                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <View style={styles.taskMeta}>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: `${categoryColor}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            { color: categoryColor },
                          ]}
                        >
                          {task.category}
                        </Text>
                      </View>
                      <Text style={styles.taskTime}>
                        {formatTimeRemaining(task.deadline)}
                      </Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={() => setAddModalVisible(true)}
            >
              <LinearGradient
                colors={["#8B5CF6", "#7C3AED"]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.quickActionText}>New Task</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={() => router.push("/(tabs)/calendar")}
            >
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="calendar" size={24} color="#fff" />
                <Text style={styles.quickActionText}>Schedule</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={() => handleCreateTask("kegiatan")}
            >
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="pulse" size={24} color="#fff" />
                <Text style={styles.quickActionText}>Activity</Text>
              </LinearGradient>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={handleViewAllTasks}
            >
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="flag" size={24} color="#fff" />
                <Text style={styles.quickActionText}>All Tasks</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      {/* <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => handleCreateTask()}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity> */}
      <AddTaskModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onCreateTask={createTask}
      />
    </View>
  );
};

export default HomeScreen;
