import { Image, View } from "react-native";

export const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <View className="flex flex-row flex-1 min-w-[110px] w-full min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden">
        <View className="flex justify-center items-center bg-[#6B4545] rounded-full px-5 py-3 shadow-lg">
          <Image source={icon} tintColor="#FFEBEB" className="size-6" />
        </View>
      </View>
    );
  } else {
    return (
      <View className="flex justify-center items-center w-14 h-14 mt-4 rounded-full">
        <Image source={icon} tintColor="#B57474" className="size-6" />
      </View>
    );
  }
};
