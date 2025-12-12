import CustomAlert, {
  AlertButton,
  AlertType,
  CustomAlertProps,
} from "@/components/AlertScreen";
import { Ionicons } from "@expo/vector-icons";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface AlertContextType {
  showAlert: (options: ShowAlertOptions) => void;
  hideAlert: () => void;
  success: (title: string, message?: string, buttons?: AlertButton[]) => void;
  error: (title: string, message?: string, buttons?: AlertButton[]) => void;
  warning: (title: string, message?: string, buttons?: AlertButton[]) => void;
  info: (title: string, message?: string, buttons?: AlertButton[]) => void;
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
}

interface ShowAlertOptions {
  type?: AlertType;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  buttons?: AlertButton[];
  autoClose?: boolean;
  autoCloseDuration?: number;
  showCloseButton?: boolean;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alertProps, setAlertProps] = useState<CustomAlertProps>({
    visible: false,
    title: "",
    type: "info",
  });

  const showAlert = (options: ShowAlertOptions) => {
    setAlertProps({
      visible: true,
      type: options.type || "info",
      title: options.title,
      message: options.message,
      icon: options.icon,
      buttons: options.buttons,
      autoClose: options.autoClose,
      autoCloseDuration: options.autoCloseDuration,
      showCloseButton: options.showCloseButton,
      onClose: hideAlert,
    });
  };

  const hideAlert = () => {
    setAlertProps((prev) => ({ ...prev, visible: false }));
  };

  const success = (
    title: string,
    message?: string,
    buttons?: AlertButton[]
  ) => {
    showAlert({
      type: "success",
      title,
      message,
      buttons,
      autoClose: !buttons,
      autoCloseDuration: 2500,
    });
  };

  const error = (title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert({
      type: "error",
      title,
      message,
      buttons,
    });
  };

  const warning = (
    title: string,
    message?: string,
    buttons?: AlertButton[]
  ) => {
    showAlert({
      type: "warning",
      title,
      message,
      buttons,
    });
  };

  const info = (title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert({
      type: "info",
      title,
      message,
      buttons,
      autoClose: !buttons,
      autoCloseDuration: 2500,
    });
  };

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      type: "confirm",
      title,
      message,
      buttons: [
        {
          text: "Batal",
          style: "cancel",
          onPress: onCancel,
        },
        {
          text: "Konfirmasi",
          style: "default",
          onPress: onConfirm,
        },
      ],
    });
  };

  return (
    <AlertContext.Provider
      value={{ showAlert, hideAlert, success, error, warning, info, confirm }}
    >
      {children}
      <CustomAlert {...alertProps} />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
