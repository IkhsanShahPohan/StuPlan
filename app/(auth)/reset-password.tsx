import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";

const { height, width } = Dimensions.get("window");

export default function ForgotPasswordOTP() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  // Step 1: Kirim OTP ke email
  async function handleSendOtp() {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Invalid email format");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined,
      });

      if (error) throw error;

      Alert.alert(
        "OTP Sent! 📧",
        "A 6-digit OTP code has been sent to your email. Please check your inbox or spam folder.",
        [{ text: "OK", onPress: () => setStep("otp") }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verifikasi OTP
  async function handleVerifyOtp() {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP code");
      return;
    }

    if (otp.length !== 6) {
      Alert.alert("Error", "OTP code must be 6 digits");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery",
      });

      if (error) throw error;

      Alert.alert("OTP Verified! ✅", "Please create your new password.", [
        { text: "OK", onPress: () => setStep("password") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid or expired OTP code");
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Reset password
  async function handleResetPassword() {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      Alert.alert(
        "Success! 🎉",
        "Your password has been successfully changed. Please sign in with your new password.",
        [
          {
            text: "OK",
            onPress: () => {
              supabase.auth.signOut();
              router.push("/(auth)/sign-in");
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background Decorative Elements */}
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />
          <View style={styles.bgCircle3} />

          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Ionicons name="key" size={60} color="#2563eb" />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {step === "email" && "Enter your email to receive OTP"}
                {step === "otp" && "Verify your OTP code"}
                {step === "password" && "Create your new password"}
              </Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressWrapper}>
                <View
                  style={[
                    styles.progressStep,
                    step === "email" && styles.progressStepActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.progressStepText,
                      step === "email" && styles.progressStepTextActive,
                    ]}
                  >
                    1
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressLine,
                    step !== "email" && styles.progressLineActive,
                  ]}
                />
                <View
                  style={[
                    styles.progressStep,
                    step === "otp" && styles.progressStepActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.progressStepText,
                      step === "otp" && styles.progressStepTextActive,
                    ]}
                  >
                    2
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressLine,
                    step === "password" && styles.progressLineActive,
                  ]}
                />
                <View
                  style={[
                    styles.progressStep,
                    step === "password" && styles.progressStepActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.progressStepText,
                      step === "password" && styles.progressStepTextActive,
                    ]}
                  >
                    3
                  </Text>
                </View>
              </View>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {/* STEP 1: EMAIL INPUT */}
              {step === "email" && (
                <View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>EMAIL ADDRESS</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        emailFocused && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={emailFocused ? "#2563eb" : "#9ca3af"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="your@email.com"
                        placeholderTextColor="#9ca3af"
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={loading}
                    activeOpacity={0.85}
                    style={styles.buttonContainer}
                  >
                    <LinearGradient
                      colors={["#1e40af", "#2563eb", "#3b82f6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.buttonText}>Send OTP Code</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: OTP INPUT */}
              {step === "otp" && (
                <View>
                  <View style={styles.emailPreview}>
                    <View style={styles.emailPreviewContent}>
                      <Ionicons name="mail" size={18} color="#2563eb" />
                      <View style={styles.emailPreviewText}>
                        <Text style={styles.emailPreviewLabel}>Sending to</Text>
                        <Text style={styles.emailPreviewEmail}>{email}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setStep("email")}
                        disabled={loading}
                      >
                        <Text style={styles.changeEmailText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>ENTER 6-DIGIT OTP CODE</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        otpFocused && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={20}
                        color={otpFocused ? "#2563eb" : "#9ca3af"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="000000"
                        placeholderTextColor="#9ca3af"
                        value={otp}
                        onChangeText={(text) =>
                          setOtp(text.replace(/[^0-9]/g, ""))
                        }
                        onFocus={() => setOtpFocused(true)}
                        onBlur={() => setOtpFocused(false)}
                        keyboardType="number-pad"
                        maxLength={6}
                        style={styles.otpInput}
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleVerifyOtp}
                    disabled={loading}
                    activeOpacity={0.85}
                    style={styles.buttonContainer}
                  >
                    <LinearGradient
                      colors={["#1e40af", "#2563eb", "#3b82f6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.buttonText}>Verify OTP</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={loading}
                    style={styles.resendButton}
                  >
                    <Text style={styles.resendButtonText}>Resend OTP Code</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 3: PASSWORD INPUT */}
              {step === "password" && (
                <View>
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#10b981"
                    />
                    <Text style={styles.verifiedText}>{email}</Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>NEW PASSWORD</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        passwordFocused && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={passwordFocused ? "#2563eb" : "#9ca3af"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="Min. 6 characters"
                        placeholderTextColor="#9ca3af"
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        style={[styles.input, styles.inputPassword]}
                        editable={!loading}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                        activeOpacity={0.7}
                        disabled={loading}
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-outline" : "eye-off-outline"
                          }
                          size={22}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        confirmPasswordFocused && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={20}
                        color={confirmPasswordFocused ? "#2563eb" : "#9ca3af"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="Re-enter your password"
                        placeholderTextColor="#9ca3af"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setConfirmPasswordFocused(true)}
                        onBlur={() => setConfirmPasswordFocused(false)}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        style={[styles.input, styles.inputPassword]}
                        editable={!loading}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={styles.eyeIcon}
                        activeOpacity={0.7}
                        disabled={loading}
                      >
                        <Ionicons
                          name={
                            showConfirmPassword
                              ? "eye-outline"
                              : "eye-off-outline"
                          }
                          size={22}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={loading}
                    activeOpacity={0.85}
                    style={styles.buttonContainer}
                  >
                    <LinearGradient
                      colors={["#1e40af", "#2563eb", "#3b82f6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.buttonText}>Reset Password</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* Back to Sign In - Always visible */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(auth)/sign-in")}
                disabled={loading}
                activeOpacity={0.7}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Text */}
            <View style={styles.bottomTextContainer}>
              <Ionicons name="shield-checkmark" size={16} color="#9ca3af" />
              <Text style={styles.bottomText}>Secure Password Recovery</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    minHeight: height,
  },
  bgCircle1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#f0f9ff",
  },
  bgCircle2: {
    position: "absolute",
    top: height * 0.15,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#eff6ff",
  },
  bgCircle3: {
    position: "absolute",
    bottom: -80,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#f0f9ff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },
  progressContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  progressStepActive: {
    backgroundColor: "#2563eb",
  },
  progressStepText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9ca3af",
  },
  progressStepTextActive: {
    color: "#ffffff",
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: "#e5e7eb",
  },
  progressLineActive: {
    backgroundColor: "#2563eb",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#f3f4f6",
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    backgroundColor: "#ffffff",
    borderColor: "#2563eb",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  inputPassword: {
    paddingRight: 40,
  },
  otpInput: {
    flex: 1,
    fontSize: 24,
    color: "#111827",
    fontWeight: "700",
    letterSpacing: 8,
    textAlign: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  emailPreview: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  emailPreviewContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailPreviewText: {
    flex: 1,
    marginLeft: 12,
  },
  emailPreviewLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  emailPreviewEmail: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  changeEmailText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "700",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  verifiedText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 12,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  resendButtonText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
    letterSpacing: 1,
  },
  backButton: {
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "700",
  },
  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  bottomText: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "500",
    marginLeft: 6,
  },
});