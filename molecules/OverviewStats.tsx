import StatCard from "@/atom/StatCard";
import React from "react";
import { View } from "react-native";

const OverviewStats = () => {
  return (
    <>
      <View className="flex-row gap-3 mb-3">
        <StatCard value={8} label="Total Tasks" color="blue" />
        <StatCard value={6} label="Completed" color="green" />
      </View>

      <View className="flex-row gap-3">
        <StatCard value={12} label="Pomodoro Today" color="purple" />
        <StatCard value="6h" label="Focus Time" color="orange" />
      </View>
    </>
  );
};

export default OverviewStats;
