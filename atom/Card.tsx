import React from "react";
import { View } from "react-native";

interface Props {
  children?: React.ReactNode;
  id?: string | number; // ganti dari 'key' ke 'id'
}

export default function Card({ id, children }: Props) {
  return (
    <View
      key={id}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
    >
      {children}
    </View>
  );
}
