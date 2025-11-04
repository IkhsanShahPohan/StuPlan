import SectionHeader from "@/molecules/SectionContentIndex";
import CardTaskSection from "@/molecules/TaskCard";
import React from "react";
import { View } from "react-native";

interface Task {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
}

interface TaskContentProps {
  tasks: Task[];
}

export default function TaskContent({ tasks }: TaskContentProps) {
  const priorityColors = {
    High: "bg-red-100 text-red-600",
    Medium: "bg-yellow-100 text-yellow-600",
    Low: "bg-green-100 text-green-600",
  };

  const handleSeeMore = () => {
    console.log("See more pressed!");
  };

  return (
    <View>
      <SectionHeader title="All Tasks (7 Days)" onPress={handleSeeMore} />

      {tasks.map((task) => (
        <CardTaskSection
          key={task.id}
          id={task.id}
          title={task.title}
          subject={task.subject}
          dueDate={task.dueDate}
          priority={task.priority}
          colorStyle={priorityColors[task.priority]}
        />
      ))}
    </View>
  );
}
