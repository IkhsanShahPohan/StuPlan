import { Image, Text, View } from "react-native";

export const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <View className="flex flex-row flex-1 min-w-[110px] w-full min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
        <View className="flex flex-row justify-center items-center bg-white/95 rounded-full px-4 py-3 shadow-md">
          <Image source={icon} tintColor="#6366F1" className="size-5" />
          <Text className="text-indigo-600 text-base font-semibold ml-2">
            {title}
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View className="flex justify-center items-center w-[110px] h-14 mt-4 rounded-full">
        <Image source={icon} tintColor="#94A3B8" className="size-5" />
      </View>
    );
  }
};
