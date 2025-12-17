import { useAuth } from "@/lib/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height, width } = Dimensions.get("window");

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  async function handleSignUp() {
    // Validasi input kosong
    if (!email || !password || !confirmPassword) {
      Alert.alert("Kesalahan", "Harap isi semua kolom");
      return;
    }

    // // Validasi format email
    if (!email.includes("@")) {
      Alert.alert("Kesalahan", "Harap masukkan alamat email yang valid");
      return;
    }

    // Validasi panjang password
    if (password.length < 6) {
      Alert.alert("Kesalahan", "Password minimal 6 karakter");
      return;
    }

    // Validasi password match
    if (password !== confirmPassword) {
      Alert.alert("Kesalahan", "Password tidak sama");
      return;
    }

    setLoading(true);
    console.log(email)
    console.log(password)
    console.log("Nama: Ikhsan")

    try {
      const result = await signUp(email, password);

      // Cek jika result undefined atau null
      if (!result) {
        setLoading(false);
        Alert.alert("Kesalahan", "Terjadi kesalahan saat membuat akun");
        return;
      }

      const { error } = result;
      console.log("Berhasil");
      if (error) {
        setLoading(false);

        // Handle berbagai jenis error
        const errorMessage = error.message || error.toString();

        if (
          errorMessage.includes("already registered") ||
          errorMessage.includes("User already registered")
        ) {
          Alert.alert(
            "Akun Sudah Ada",
            "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain."
          );
        } else if (
          errorMessage.includes("Password should be") ||
          errorMessage.includes("password")
        ) {
          Alert.alert("Kesalahan", "Password minimal 6 karakter");
        } else if (
          errorMessage.includes("Invalid email") ||
          errorMessage.includes("email")
        ) {
          Alert.alert("Kesalahan", "Format email tidak valid");
        } else {
          Alert.alert("Kesalahan", `Gagal membuat akun: ${errorMessage}`);
        }
        return;
      }

      // Sukses
      setLoading(false);
      Alert.alert(
        "Berhasil! 🎉",
        "Akun Anda berhasil dibuat. Silakan cek email Anda untuk verifikasi akun.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/sign-in"),
          },
        ]
      );
    } catch (error: any) {
      setLoading(false);
      console.error("Sign up error:", error);

      // Handle error yang tidak terduga
      const errorMessage =
        error?.message || error?.toString() || "Terjadi kesalahan";
      Alert.alert("Kesalahan", `Terjadi kesalahan: ${errorMessage}`);
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
                <Image
                  source={require("../../assets/images/2.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Buat Akun</Text>
              <Text style={styles.subtitle}>
                Bergabunglah dengan kami dan mulai perjalanan Anda
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>ALAMAT EMAIL</Text>
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
                    placeholder="email@anda.com"
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

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>PASSWORD</Text>
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
                    placeholder="Min. 6 karakter"
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
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={22}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>KONFIRMASI PASSWORD</Text>
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
                    placeholder="Masukkan ulang password"
                    placeholderTextColor="#9ca3af"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    style={[styles.input, styles.inputPassword]}
                    editable={!loading}
                    onSubmitEditing={handleSignUp}
                    returnKeyType="go"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={22}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Info */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#2563eb" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Persyaratan Password:</Text>
                  <View style={styles.infoItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.infoText}>Minimal 6 karakter</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.infoText}>Password harus sama</Text>
                  </View>
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignUp}
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
                    <Text style={styles.buttonText}>Buat Akun</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ATAU</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Sign In Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Sudah punya akun? </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/sign-in")}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerLink}>Masuk</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: 40,
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
  logo: {
    width: 70,
    height: 70,
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
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#60a5fa",
    marginRight: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#1e40af",
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 24,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  footerLink: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "700",
  },
  bottomTextContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  bottomText: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "500",
    textAlign: "center",
  },
});
