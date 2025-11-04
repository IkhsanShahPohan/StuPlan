// src/atom/PomodoroCard.tsx
import Card from "@/atom/card";
import React from "react";
import { Text, View } from "react-native";

interface PomodoroCardProps {
  id: number | string;
  task: string;
  duration: string;
  completedAt: string;
}

export default function PomodoroCard({
  id,
  task,
  duration,
  completedAt,
}: PomodoroCardProps) {
  return (
    <Card id={id}>
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800 mb-1">
            {task}
          </Text>
          <Text className="text-sm text-gray-500">{completedAt}</Text>
        </View>
        <View className="bg-indigo-100 px-3 py-2 rounded-full">
          <Text className="text-sm font-semibold text-indigo-600">
            {duration}
          </Text>
        </View>
      </View>
    </Card>
  );
}
