import OverviewStats from "@/molecules/OverviewStats";
import SectionHeader from "@/molecules/SectionContentIndex";
import React from "react";
import { View } from "react-native";

const Overview = () => {
  const handleSeeMore = () => {
    console.log("See more pressed!");
  };

  return (
    <View className="mb-6">
      <SectionHeader title="Overview" onPress={handleSeeMore} />
      <OverviewStats />
    </View>
  );
};

export default Overview;
