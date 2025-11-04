import Card from "@/atom/card";
import React from "react";
import { Text, View } from "react-native";

export interface TaskCardProps {
  id: string | number;
  title: string;
  subject: string;
  priority: "High" | "Medium" | "Low"; // 🔧 perbaiki agar sama tipe-nya
  dueDate: string;
  colorStyle?: string;
}

export default function TaskCard({
  id,
  title,
  subject,
  priority,
  dueDate,
  colorStyle,
}: TaskCardProps) {
  return (
    <Card id={id}>
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800 mb-1">
            {title}
          </Text>
          <Text className="text-sm text-gray-500">{subject}</Text>
        </View>

        <View className={`px-3 py-1 rounded-full ${colorStyle}`}>
          <Text className="text-xs font-semibold capitalize">{priority}</Text>
        </View>
      </View>

      <View className="flex-row items-center mt-2">
        <Text className="mr-2">📅</Text>
        <Text className="text-sm text-gray-600">{dueDate}</Text>
      </View>
    </Card>
  );
}
