import { Image, View, Animated } from "react-native";
import { useEffect, useRef } from "react";

export const TabIcon = ({ focused, icon, title }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (focused) {
      // Animasi untuk tab yang aktif
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animasi untuk tab yang inactive
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  if (focused) {
    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
        className="flex flex-row flex-1 min-w-[110px] w-full min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden"
      >
        <View className="flex flex-row justify-center items-center bg-purple-700 rounded-full px-5 py-3 shadow-lg">
          <Image source={icon} tintColor="#FFFFFF" className="size-5" />
        </View>
      </Animated.View>
    );
  } else {
    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
        className="flex justify-center items-center w-[110px] h-14 mt-4 rounded-full"
      >
        <Image source={icon} tintColor="#94A3B8" className="size-5" />
      </Animated.View>
    );
  }
};