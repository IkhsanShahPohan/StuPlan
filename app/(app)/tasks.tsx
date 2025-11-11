import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const tasks = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Tasks Page</Text>
      <View className="absolute bottom-32 right-6">
        <TouchableOpacity
          className="bg-[#6B4545] w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={() => alert("Tambah Task")}
        >
          <Text className="text-white text-3xl">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default tasks;
