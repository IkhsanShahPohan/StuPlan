import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FloatingActionButtonProps {
  onPress: () => void;
}

// Komponen FAB dengan StyleSheet untuk positioning yang lebih akurat
export const FloatingActionButton = ({
  onPress,
}: FloatingActionButtonProps) => (
  <View style={styles.fabContainer}>
    <TouchableOpacity onPress={onPress} style={styles.fab}>
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 999,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: "white",
    fontSize: 32,
    fontWeight: "300",
  },
});
