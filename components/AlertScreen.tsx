import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export type AlertType = "success" | "error" | "warning" | "info" | "confirm";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface CustomAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  buttons?: AlertButton[];
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  showCloseButton?: boolean;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type = "info",
  title,
  message,
  icon,
  buttons,
  onClose,
  autoClose = false,
  autoCloseDuration = 3000,
  showCloseButton = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]).start();

      // Auto close
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDuration);

        return () => clearTimeout(timer);
      }
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible, autoClose, autoCloseDuration]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  const getAlertConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: icon || "checkmark-circle",
          iconColor: "#34C759",
          iconBg: "#E8F8EC",
          borderColor: "#34C759",
          gradientStart: "#E8F8EC",
          gradientEnd: "#F0FFF4",
        };
      case "error":
        return {
          icon: icon || "close-circle",
          iconColor: "#FF3B30",
          iconBg: "#FFEBEE",
          borderColor: "#FF3B30",
          gradientStart: "#FFEBEE",
          gradientEnd: "#FFF5F5",
        };
      case "warning":
        return {
          icon: icon || "warning",
          iconColor: "#FF9500",
          iconBg: "#FFF4E6",
          borderColor: "#FF9500",
          gradientStart: "#FFF4E6",
          gradientEnd: "#FFFBF0",
        };
      case "info":
        return {
          icon: icon || "information-circle",
          iconColor: "#007AFF",
          iconBg: "#E8F4FF",
          borderColor: "#007AFF",
          gradientStart: "#E8F4FF",
          gradientEnd: "#F0F9FF",
        };
      case "confirm":
        return {
          icon: icon || "help-circle",
          iconColor: "#5856D6",
          iconBg: "#F0EFFF",
          borderColor: "#5856D6",
          gradientStart: "#F0EFFF",
          gradientEnd: "#F8F7FF",
        };
      default:
        return {
          icon: icon || "information-circle",
          iconColor: "#8E8E93",
          iconBg: "#F2F2F7",
          borderColor: "#8E8E93",
          gradientStart: "#F2F2F7",
          gradientEnd: "#FAFAFA",
        };
    }
  };

  const config = getAlertConfig();

  const defaultButtons: AlertButton[] = buttons || [
    {
      text: "OK",
      onPress: handleClose,
      style: "default",
    },
  ];

  const renderButtons = () => {
    if (defaultButtons.length === 1) {
      const button = defaultButtons[0];
      return (
        <TouchableOpacity
          style={[
            styles.singleButton,
            button.style === "destructive" && styles.destructiveButton,
            { backgroundColor: config.iconColor },
          ]}
          onPress={() => {
            button.onPress?.();
            if (button.style !== "cancel") {
              handleClose();
            }
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.singleButtonText,
              button.style === "destructive" && styles.destructiveButtonText,
            ]}
          >
            {button.text}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        {defaultButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              button.style === "cancel" && styles.cancelButton,
              button.style === "destructive" && styles.destructiveButton,
              button.style === "default" && {
                backgroundColor: config.iconColor,
              },
            ]}
            onPress={() => {
              button.onPress?.();
              if (button.style !== "cancel") {
                handleClose();
              }
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.buttonText,
                button.style === "cancel" && styles.cancelButtonText,
                button.style === "destructive" && styles.destructiveButtonText,
                button.style === "default" && styles.defaultButtonText,
              ]}
            >
              {button.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={showCloseButton ? undefined : handleClose}
        />

        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Top Accent Bar */}
          <View
            style={[styles.accentBar, { backgroundColor: config.iconColor }]}
          />

          {/* Close Button */}
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          )}

          {/* Icon Container */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: config.iconBg,
                borderColor: config.iconColor,
              },
            ]}
          >
            <Ionicons
              name={config.icon as any}
              size={48}
              color={config.iconColor}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>

          {/* Buttons */}
          {renderButtons()}

          {/* Bottom Progress Bar for Auto Close */}
          {autoClose && (
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: config.iconColor,
                    // width: fadeAnim.interpolate({
                    //   inputRange: [0, 1],
                    //   outputRange: ["0%", "100%"],
                    // }),
                  },
                ]}
              />
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  alertContainer: {
    width: width - 64,
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 32,
    marginBottom: 20,
    borderWidth: 3,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
  },
  destructiveButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#1C1C1E",
  },
  destructiveButtonText: {
    color: "#FFFFFF",
  },
  defaultButtonText: {
    color: "#FFFFFF",
  },
  singleButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  singleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: "#F2F2F7",
    width: "100%",
  },
  progressBar: {
    height: "100%",
  },
});

export default CustomAlert;
