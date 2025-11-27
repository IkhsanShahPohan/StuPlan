import { Stack } from "expo-router";

export default function HalamanLayout() {
  return (
    <Stack>
      {/* <Stack.Screen name="index" options={{ title: "Daftar Halaman" }} /> */}
      <Stack.Screen
        name="[id]"
        options={{
          title: "Detail Halaman",
          presentation: "card", // bisa modal, fullscreen, dsb
        }}
      />
    </Stack>
  );
}
