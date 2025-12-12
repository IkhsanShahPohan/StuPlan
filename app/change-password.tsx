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

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "#E5E5EA" };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    
    if (strength < 40) return { strength, label: "Lemah", color: "#FF3B30" };
    if (strength < 70) return { strength, label: "Sedang", color: "#FF9500" };
    return { strength: 100, label: "Kuat", color: "#34C759" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

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

  const handleForgotPassword = async () => {
    alert.confirm(
      "Reset Password?",
      "Kami akan mengirim link reset password ke email Anda.",
      async () => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(
            user?.email || "",
            {
              redirectTo: "yourapp://reset-password", // Update with your deep link
            }
          );

          if (error) {
            alert.error("Gagal", "Gagal mengirim email reset password.");
          } else {
            alert.success(
              "Email Terkirim",
              "Cek email Anda untuk link reset password."
            );
          }
        } catch (error) {
          console.error("Reset password error:", error);
          alert.error("Error", "Terjadi kesalahan.");
        }
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
            Pastikan password baru Anda kuat dan mudah diingat.
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
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotButtonText}>Lupa password?</Text>
            </TouchableOpacity>
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

            {/* Password Strength */}
            {newPassword && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${passwordStrength.strength}%`,
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthLabel,
                    { color: passwordStrength.color },
                  ]}
                >
                  {passwordStrength.label}
                </Text>
              </View>
            )}

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <RequirementItem
                text="Minimal 8 karakter"
                met={newPassword.length >= 8}
              />
              <RequirementItem
                text="Huruf besar & kecil"
                met={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)}
              />
              <RequirementItem
                text="Mengandung angka"
                met={/[0-9]/.test(newPassword)}
              />
              <RequirementItem
                text="Karakter khusus (!@#$%)"
                met={/[^a-zA-Z0-9]/.test(newPassword)}
              />
            </View>
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

        {/* Security Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips Keamanan:</Text>
          <TipItem text="Gunakan kombinasi huruf, angka, dan simbol" />
          <TipItem text="Hindari informasi pribadi yang mudah ditebak" />
          <TipItem text="Jangan gunakan password yang sama di layanan lain" />
          <TipItem text="Ubah password secara berkala" />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helper Components
const RequirementItem = ({ text, met }: { text: string; met: boolean }) => (
  <View style={styles.requirementItem}>
    <Ionicons
      name={met ? "checkmark-circle" : "ellipse-outline"}
      size={16}
      color={met ? "#34C759" : "#C7C7CC"}
    />
    <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
      {text}
    </Text>
  </View>
);

const TipItem = ({ text }: { text: string }) => (
  <View style={styles.tipItem}>
    <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
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
  forgotButton: {
    alignSelf: "flex-end",
    paddingVertical: 4,
  },
  forgotButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  strengthContainer: {
    gap: 6,
  },
  strengthBar: {
    height: 6,
    backgroundColor: "#F2F2F7",
    borderRadius: 3,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 13,
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  requirementsContainer: {
    gap: 8,
    marginTop: 4,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  requirementTextMet: {
    color: "#34C759",
    fontWeight: "500",
  },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  tipsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    gap: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});