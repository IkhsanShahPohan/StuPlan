import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useAuth } from "@/lib/AuthContext";
import { useAlert } from "@/components/useAlert";
import { supabase } from "@/lib/supabase";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const alert = useAlert();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!currentPassword) {
      alert.warning("Form Tidak Lengkap", "Password saat ini harus diisi.");
      return false;
    }

    if (!newPassword) {
      alert.warning("Form Tidak Lengkap", "Password baru harus diisi.");
      return false;
    }

    if (newPassword.length < 8) {
      alert.warning(
        "Password Terlalu Pendek",
        "Password baru minimal 8 karakter."
      );
      return false;
    }

    if (newPassword === currentPassword) {
      alert.warning(
        "Password Sama",
        "Password baru harus berbeda dari password saat ini."
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      alert.warning(
        "Password Tidak Cocok",
        "Konfirmasi password tidak sesuai dengan password baru."
      );
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        alert.error(
          "Password Salah",
          "Password saat ini yang Anda masukkan salah."
        );
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error("Update password error:", updateError);
        alert.error(
          "Gagal Mengubah Password",
          updateError.message || "Terjadi kesalahan. Silakan coba lagi."
        );
        setLoading(false);
        return;
      }

      // Success
      alert.success(
        "Password Berhasil Diubah",
        "Password Anda telah diperbarui dengan aman."
      );

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Navigate back after delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Change password error:", error);
      alert.error("Error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Ubah Password</Text>
              <Text style={styles.headerSubtitle}>Perbarui password akun Anda</Text>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Security Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={48} color="#007AFF" />
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                Password minimal 8 karakter dan harus berbeda dari password lama.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Current Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Password Saat Ini *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color="#8E8E93"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Masukkan password saat ini"
                    placeholderTextColor="#8E8E93"
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showCurrentPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Password Baru *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="key"
                    size={20}
                    color="#8E8E93"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Masukkan password baru"
                    placeholderTextColor="#8E8E93"
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>
                {newPassword && (
                  <Text style={styles.helperText}>
                    {newPassword.length}/8 karakter
                  </Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Konfirmasi Password Baru *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#8E8E93"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Ulangi password baru"
                    placeholderTextColor="#8E8E93"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleChangePassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPassword && newPassword && (
                  <View style={styles.matchIndicator}>
                    {confirmPassword === newPassword ? (
                      <>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.matchTextSuccess}>Password cocok</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="close-circle" size={16} color="#FF3B30" />
                        <Text style={styles.matchTextError}>Password tidak cocok</Text>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleChangePassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Text style={styles.submitButtonText}>Mengubah Password...</Text>
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Ubah Password</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F4FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#E8F4FF",
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D0E9FF",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#007AFF",
    lineHeight: 20,
    fontWeight: "500",
  },
  form: {
    gap: 20,
    marginBottom: 24,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1C1C1E",
  },
  helperText: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
  },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  matchTextSuccess: {
    fontSize: 13,
    color: "#34C759",
    fontWeight: "600",
  },
  matchTextError: {
    fontSize: 13,
    color: "#FF3B30",
    fontWeight: "600",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomSpacer: {
    height: 60,
  },
});