import React from "react";
import { View, Text } from "react-native";

interface StatCardProps {
  value: string | number;
  label: string;
  color: "blue" | "green" | "purple" | "orange";
}

const colorMap = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-600" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600" },
};

const StatCard: React.FC<StatCardProps> = ({ value, label, color }) => {
  const { bg, border, text } = colorMap[color];
  return (
    <View className={`flex-1 ${bg} rounded-2xl p-4 border ${border}`}>
      <Text className={`text-3xl font-bold ${text} mb-1`}>{value}</Text>
      <Text className="text-sm text-gray-600">{label}</Text>
    </View>
  );
};

export default StatCard;
