### 📄 Nama dan Deskripsi Singkat Aplikasi

**Nama Aplikasi:** StuPlan

**Deskripsi Singkat:** Aplikasi ini membantu mahasiswa dalam mencatat dan mengelola kegiatan akademik serta keuangan pribadi agar lebih produktif dan teratur.

---

### 👥 Anggota Kelompok (Nama - NIM)

- Ari Gamaliel Manohan Silitonga (231402030)
- Ikhsan Shah Pohan (231402039)
- Raswan Haqqi Al Amwi (231402018)
- Fauzan Luthfi Khair Siregar (231402088)
- Zahra Naziha Parinduri (231402127)
- Khairunissa Pohan (231402100)

---

## 🧩 Rencana Fitur yang Akan Ada di Aplikasi

### Manajemen Tugas Mahasiswa
Pengguna dapat menambah, mengedit, dan menghapus daftar tugas kuliah serta mendapatkan pengingat sebelum deadline.

### Pencatatan Keuangan
Pengguna dapat mencatat pemasukan dan pengeluaran bulanan, sehingga membantu mengontrol keuangan pribadi.

### Statistik dan Laporan
Menampilkan grafik dan laporan bulanan untuk analisis pengeluaran dan produktivitas mahasiswa.

---

## 🧱 Deskripsi Project

- **Jenis:** Cross Platform
- **Framework:** React Native (Expo)
- **Backend:** Supabase
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Bahasa Pemrograman:** TypeScript
- **SDK Version:** Expo SDK 54
- **Node.js Version:** 20.x

---

## ⚙️ Cara Membuat Proyek dan Mengambil Kunci Supabase

### 1️⃣ Membuat Proyek React Native (Expo)

```bash
npx create-expo-app@latest nama-proyek
cd nama-proyek
```

### 2️⃣ Install Dependensi

```bash
npm install nativewind @supabase/supabase-js react-native-svg
```

### 3️⃣ Membuat Proyek di Supabase

1. Buka https://supabase.com
2. Klik **New Project**
3. Isi nama proyek dan pilih region yang diinginkan
4. Setelah proyek dibuat, buka tab **Project Settings → API**
5. Salin:
   - **Project URL** → digunakan untuk `EXPO_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → digunakan untuk `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 4️⃣ Tambahkan ke File `.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚀 Cara Menjalankan Aplikasi

### 1️⃣ Jalankan Aplikasi

```bash
npx expo start
```

### 2️⃣ Pilihan Menjalankan

- Tekan **`a`** → Jalankan di Android Emulator
- Tekan **`i`** → Jalankan di iOS Simulator
- **Scan QR Code** di terminal menggunakan aplikasi **Expo Go**

---

## 📝 Catatan Tambahan

- Pastikan Node.js versi 20.x sudah terinstall di komputer Anda
- Untuk menggunakan Android Emulator, pastikan Android Studio sudah terinstall
- Untuk iOS Simulator, pastikan Xcode sudah terinstall (hanya di macOS)
- File `.env` jangan di-push ke repository Git (tambahkan ke `.gitignore`)

---

## 📞 Kontak

Untuk pertanyaan lebih lanjut terkait key supabase (jika mau akses langsung), silakan hubungi salah satu anggota tim.