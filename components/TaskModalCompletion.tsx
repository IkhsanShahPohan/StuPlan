import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

interface TaskCompletionModalProps {
  visible: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const { width, height } = Dimensions.get("window");

const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  visible,
  taskTitle,
  onConfirm,
  onCancel,
}) => {
  const [phase, setPhase] = useState<"confirm" | "celebrating">("confirm");
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      setPhase("confirm");
      // Animate modal entrance
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
      checkmarkScale.setValue(0);
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });
    }
  }, [visible]);

  const handleConfirm = () => {
    setPhase("celebrating");

    // Animate checkmark
    Animated.spring(checkmarkScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 5,
    }).start();

    // Animate confetti
    confettiAnims.forEach((anim, index) => {
      const angle = (Math.PI * 2 * index) / confettiAnims.length;
      const distance = 150 + Math.random() * 100;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance - 100;

      Animated.parallel([
        Animated.timing(anim.translateX, {
          toValue: endX,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: endY,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim.rotate, {
          toValue: Math.random() * 720 - 360,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Execute the actual completion
    onConfirm();
  };

  const renderConfetti = () => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"];
    const shapes = ["●", "■", "▲", "★", "♦"];

    return confettiAnims.map((anim, index) => {
      const color = colors[index % colors.length];
      const shape = shapes[index % shapes.length];

      return (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
                {
                  rotate: anim.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
              opacity: anim.opacity,
            },
          ]}
        >
          <Text style={[styles.confettiText, { color }]}>{shape}</Text>
        </Animated.View>
      );
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {phase === "confirm" ? (
            // Confirmation Phase
            <>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="checkmark-circle"
                    size={60}
                    color="#34C759"
                  />
                </View>
              </View>

              <Text style={styles.title}>Selesaikan Task?</Text>
              <Text style={styles.taskTitleText} numberOfLines={2}>
                {taskTitle}
              </Text>
              <Text style={styles.subtitle}>
                Task akan ditandai selesai dan semua notifikasi akan dibatalkan.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.confirmButtonText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Celebration Phase
            <>
              <View style={styles.celebrationContainer}>
                <Animated.View
                  style={[
                    styles.checkmarkCircle,
                    {
                      transform: [{ scale: checkmarkScale }],
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={100}
                    color="#34C759"
                  />
                </Animated.View>

                {renderConfetti()}
              </View>

              <Text style={styles.celebrationTitle}>🎉 Selamat! 🎉</Text>
              <Text style={styles.celebrationSubtitle}>
                Task berhasil diselesaikan
              </Text>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0FFF4",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
    textAlign: "center",
  },
  taskTitleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 12,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  confirmButton: {
    backgroundColor: "#34C759",
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  celebrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    height: 200,
    width: "100%",
  },
  checkmarkCircle: {
    position: "absolute",
    zIndex: 1,
  },
  confetti: {
    position: "absolute",
    zIndex: 0,
  },
  confettiText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1C1E",
    marginBottom: 8,
    textAlign: "center",
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: "#34C759",
    textAlign: "center",
    fontWeight: "600",
  },
});

export default TaskCompletionModal;