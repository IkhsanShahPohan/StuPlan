import Overview from "@/organism/Overview";
import PomodoroSection from "@/organism/PomodoroContent";
import TaskContent from "@/organism/TaskContent";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const [activeFilter, setActiveFilter] = useState("All");
  const userName = "Budi";
  const taskProgress = 75;

  const filters = ["All", "Task", "Pomodoro"];

  // Dummy data untuk pomodoro history
  const pomodoroHistory = [
    {
      id: 1,
      task: "Belajar React Native",
      duration: "25 min",
      completedAt: "Hari ini, 14:30",
    },
    {
      id: 2,
      task: "Mengerjakan Tugas Kalkulus",
      duration: "25 min",
      completedAt: "Hari ini, 10:15",
    },
    {
      id: 3,
      task: "Membaca Jurnal",
      duration: "25 min",
      completedAt: "Kemarin, 16:45",
    },
  ];

  // Data dipindahkan ke sini
  const upcomingTasks = [
    {
      id: 1,
      title: "Tugas Matematika Diskrit",
      subject: "Matematika",
      dueDate: "2 hari lagi",
      priority: "High",
    },
    {
      id: 2,
      title: "Essay Bahasa Indonesia",
      subject: "Bahasa",
      dueDate: "4 hari lagi",
      priority: "Medium",
    },
    {
      id: 3,
      title: "Presentasi Proyek Akhir",
      subject: "Pemrograman",
      dueDate: "6 hari lagi",
      priority: "High",
    },
  ];

  const handleSeeMorePomodoro = () => {
    console.log("See more pressed!");
  };

  const renderAllContent = () => (
    <View className="flex gap-4">
      <TaskContent tasks={upcomingTasks} />
      {/* <PomodoroSection
        sessions={pomodoroHistory}
        onSeeMore={handleSeeMorePomodoro}
      /> */}
      {/* <Overview /> */}
    </View>
  );

  const renderPomodoroContent = () => (
    <PomodoroSection
      sessions={pomodoroHistory}
      onSeeMore={handleSeeMorePomodoro}
    />
  );

  const renderTaskContent = () => <TaskContent tasks={upcomingTasks} />;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Header Section */}
        <View className="px-5 pt-12 pb-6 bg-white">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-gray-800">
                Hello, {userName}
              </Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
              <Image
                source={{
                  uri:
                    "https://ui-avatars.com/api/?name=" +
                    userName +
                    "&background=6366f1&color=fff",
                }}
                className="w-full h-full"
              />
            </View>
          </View>
        </View>

        {/* Progress Card */}
        <View className="px-5 mb-2 bg-white pb-6">
          <View
            className="rounded-3xl p-8 flex-row justify-between items-center"
            style={{ backgroundColor: "#BADFDB" }}
          >
            <View className="flex-1 pr-4 gap-2">
              <Text className="text-xl font-bold text-[#3b4544] mb-3 max-w-40">
                Your today task's is almost done
              </Text>
              <TouchableOpacity className="bg-white rounded-full px-5 py-2.5 self-start">
                <Text className="text-sm font-semibold text-gray-800">
                  View tasks
                </Text>
              </TouchableOpacity>
            </View>
            <View className="items-center justify-center">
              <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                <Text className="text-2xl font-bold text-gray-800">
                  {taskProgress}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filter Section */}
        <View className="px-5 mb-4">
          <View className="flex-row gap-3">
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-full ${
                  activeFilter === filter
                    ? "bg-indigo-500"
                    : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    activeFilter === filter ? "text-white" : "text-gray-600"
                  }`}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content Section */}
        <View className="px-5 py-6">
          {activeFilter === "All" && renderAllContent()}
          {activeFilter === "Task" && renderTaskContent()}
          {activeFilter === "Pomodoro" && renderPomodoroContent()}
        </View>
      </ScrollView>
    </View>
  );
}