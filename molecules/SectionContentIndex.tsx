import {
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SectionHeaderProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
}

export default function SectionHeader({ title, onPress }: SectionHeaderProps) {
  return (
    <View className="flex-row justify-between items-center mb-4">
      <Text className="text-lg font-bold text-gray-800">{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text className="text-sm font-semibold text-indigo-500">See More</Text>
      </TouchableOpacity>
    </View>
  );
}
