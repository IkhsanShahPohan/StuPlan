import { useAlert } from "@/components/useAlert";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/lib/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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

const EDUCATION_LEVELS = [
  { value: "sd", label: "SD/Sederajat" },
  { value: "smp", label: "SMP/Sederajat" },
  { value: "sma", label: "SMA/Sederajat" },
  { value: "d3", label: "Diploma 3" },
  { value: "s1", label: "Sarjana (S1)" },
  { value: "s2", label: "Magister (S2)" },
  { value: "s3", label: "Doktor (S3)" },
  { value: "lainnya", label: "Lainnya" },
];

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const alert = useAlert();
  const { profile, loading, updating, updateProfile, profileCompletion } =
    useProfile(user?.id || "");

  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [birthDate, setBirthDate] = useState(
    profile?.birthDate ? new Date(profile.birthDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [educationLevel, setEducationLevel] = useState(
    profile?.educationLevel || ""
  );
  const [institution, setInstitution] = useState(profile?.institution || "");
  const [showEducationPicker, setShowEducationPicker] = useState(false);

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setBirthDate(
        profile.birthDate ? new Date(profile.birthDate) : new Date()
      );
      setEducationLevel(profile.educationLevel || "");
      setInstitution(profile.institution || "");
    }
  }, [profile]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!fullName.trim()) {
      alert.warning("Data Tidak Lengkap", "Nama lengkap harus diisi.");
      return;
    }

    if (!educationLevel) {
      alert.warning("Data Tidak Lengkap", "Jenjang pendidikan harus dipilih.");
      return;
    }

    if (!institution.trim()) {
      alert.warning("Data Tidak Lengkap", "Nama institusi harus diisi.");
      return;
    }

    // Calculate age
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 5 || age > 100) {
      alert.warning(
        "Tanggal Lahir Tidak Valid",
        "Periksa kembali tanggal lahir Anda."
      );
      return;
    }

    const success = await updateProfile({
      fullName: fullName.trim(),
      birthDate: birthDate.toISOString(),
      educationLevel,
      institution: institution.trim(),
    });

    if (success) {
      alert.success("Profil Diperbarui", "Perubahan telah berhasil disimpan.");
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      alert.error(
        "Gagal Menyimpan",
        "Terjadi kesalahan saat menyimpan profil. Silakan coba lagi."
      );
    }
  };

  const getEducationLabel = (value: string) => {
    return EDUCATION_LEVELS.find((e) => e.value === value)?.label || value;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memuat profil...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Profil</Text>
          <Text style={styles.headerSubtitle}>
            Ubah informasi profil anda!
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, updating && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={updating}
        >
          {updating ? (
            <Text style={styles.saveButtonText}>Menyimpan...</Text>
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Simpan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Completion Bar */}
      {/* <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill]} />
        </View>
        <Text style={styles.progressText}>
          {profileCompletion === 100
            ? "Profil Lengkap! ✨"
            : `${4 - Math.ceil(profileCompletion / 25)} field lagi`}
        </Text>
      </View> */}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Email (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Akun</Text>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Ionicons name="mail" size={20} color="#007AFF" />
              <Text style={styles.fieldLabel}>Email</Text>
            </View>
            <View style={[styles.input, styles.inputReadonly]}>
              <Text style={styles.inputTextReadonly}>{profile?.email}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.verifiedText}>Terverifikasi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Ionicons name="person" size={20} color="#FF9500" />
              <Text style={styles.fieldLabel}>Nama Lengkap *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#8E8E93"
            />
          </View>

          {/* Birth Date */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Ionicons name="calendar" size={20} color="#FF3B30" />
              <Text style={styles.fieldLabel}>Tanggal Lahir *</Text>
            </View>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputText}>
                {birthDate.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
            />
          )}
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pendidikan</Text>

          {/* Education Level */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Ionicons name="school" size={20} color="#5856D6" />
              <Text style={styles.fieldLabel}>Jenjang Pendidikan *</Text>
            </View>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowEducationPicker(!showEducationPicker)}
            >
              <Text
                style={[
                  styles.inputText,
                  !educationLevel && styles.placeholderText,
                ]}
              >
                {educationLevel
                  ? getEducationLabel(educationLevel)
                  : "Pilih jenjang pendidikan"}
              </Text>
              <Ionicons
                name={showEducationPicker ? "chevron-up" : "chevron-down"}
                size={20}
                color="#C7C7CC"
              />
            </TouchableOpacity>

            {showEducationPicker && (
              <View style={styles.pickerContainer}>
                {EDUCATION_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.pickerItem,
                      educationLevel === level.value &&
                        styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setEducationLevel(level.value);
                      setShowEducationPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        educationLevel === level.value &&
                          styles.pickerItemTextSelected,
                      ]}
                    >
                      {level.label}
                    </Text>
                    {educationLevel === level.value && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Institution */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Ionicons name="business" size={20} color="#34C759" />
              <Text style={styles.fieldLabel}>Nama Institusi *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={institution}
              onChangeText={setInstitution}
              placeholder="Contoh: Universitas Indonesia"
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {/* Info Card */}
        {/* <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Kenapa data ini penting?</Text>
            <Text style={styles.infoText}>
              Data profil membantu kami memberikan pengalaman yang lebih
              personal dan rekomendasi yang sesuai dengan kebutuhan Anda.
            </Text>
          </View>
        </View> */}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
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
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#007AFF",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1C1C1E",
  },
  inputReadonly: {
    backgroundColor: "#F2F2F7",
  },
  inputText: {
    fontSize: 16,
    color: "#1C1C1E",
    flex: 1,
  },
  inputTextReadonly: {
    fontSize: 16,
    color: "#8E8E93",
    flex: 1,
  },
  placeholderText: {
    color: "#8E8E93",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#E8F8EC",
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#34C759",
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    overflow: "hidden",
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  pickerItemSelected: {
    backgroundColor: "#E8F4FF",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  pickerItemTextSelected: {
    fontWeight: "600",
    color: "#007AFF",
  },
  infoCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#E8F4FF",
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#D0E9FF",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
