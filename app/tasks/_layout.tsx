import { Stack } from "expo-router";

export default function HalamanLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          presentation: "card", // bisa modal, fullscreen, dsb
          headerShown: false,
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerShown: false,
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
