# EL-PRO V2 - E-Learning Platform

Platform pembelajaran interaktif untuk belajar pemrograman (HTML, CSS, PHP).

## Cara Menjalankan Server

Untuk mengaktifkan server backend dan menjalankan aplikasi ini, ikuti langkah-langkah berikut:

### 1. Prasyarat
Pastikan Anda sudah menginstal Python di komputer Anda. Anda juga memerlukan beberapa pustaka Python berikut:
- **Flask**: Framework web.
- **Flask-CORS**: Untuk menangani Cross-Origin Resource Sharing.

Instal prasyarat dengan perintah:
```bash
pip install flask flask-cors
```

### 2. Menjalankan Server
Buka terminal atau command prompt, navigasikan ke folder proyek, lalu jalankan server dengan perintah:
```bash
python backend/server.py
```

### 3. Akses Aplikasi
Setelah server berjalan, Anda dapat mengakses aplikasi melalui browser di alamat:
**[http://localhost:5000](http://localhost:5000)**

http://localhost:5000
---

## Daftar Akun Default
Sistem menyediakan akun bawaan untuk pengujian:

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | `admin@admin.com` | `admin123` |
| **Guru** | `guru@elpro.com` | `guru123` |

*Catatan: Akun Siswa dapat dibuat melalui menu **Registrasi**.*

---

## Dokumentasi Bookmark Feature

Untuk informasi lebih detail tentang fitur bookmark:

- 📖 **`README_BOOKMARK.md`** - Dokumentasi lengkap fitur bookmark
- 🧪 **`VERIFICATION_CHECKLIST.md`** - Checklist testing & verifikasi fitur
- 🧪 **`TESTING_GUIDE.md`** - Panduan testing dengan scenario lengkap
- 🚀 **`QUICK_START.md`** - Quick start untuk mulai testing
- 🔧 **`BOOKMARK_IMPLEMENTATION.md`** - Detail teknis implementasi
- 📊 **`ARCHITECTURE.md`** - Diagram arsitektur dan data flow

---

## Fitur Bookmark 🔖

### Untuk Siswa
Siswa dapat **mem-bookmark kelas favorit** untuk menyimpannya dan mengaksesnya dengan mudah nanti:

1. **Buka halaman daftar kelas**
   - Masuk sebagai siswa
   - Pergi ke menu **Kelas** (`/murid/kelas.html`)

2. **Bookmark kelas**
   - Klik tombol bookmark (ikon buku tanda) pada kelas yang ingin disimpan
   - Tombol akan berubah menjadi solid/filled
   - Muncul notifikasi: "Kelas berhasil di-bookmark!"

3. **Lihat bookmark**
   - Pergi ke menu **Bookmark** (`/murid/bookmark.html`)
   - Melihat semua kelas yang sudah di-bookmark
   - Klik kartu kelas untuk membuka materi pembelajaran

4. **Hapus bookmark**
   - Di halaman bookmark, klik tombol bookmark pada kartu kelas
   - Kelas akan dihapus dari bookmark

### Untuk Guru
Guru juga dapat **mem-bookmark kelas** untuk keperluan manajemen:

1. **Buka halaman daftar kelas**
   - Masuk sebagai guru
   - Pergi ke menu **Kelas** (`/guru/kelas.html`)

2. **Bookmark kelas**
   - Klik tombol bookmark pada kelas
   - Lihat bookmark di menu **Bookmark** (`/guru/bookmark.html`)

### ⚠️ Penting
- **Bookmark siswa terpisah dari bookmark guru** - Setiap user hanya bisa melihat bookmark miliknya sendiri
- Bookmark disimpan di **database server**, bukan hanya di browser
- Bookmark akan **persist di semua device** jika login dengan akun yang sama

---

## Struktur Folder Utama
*   `backend/`: Server Flask dan database SQLite (`elearning.db`).
*   `ui/`: Halaman antarmuka (Quiz, Workspace, dll).
*   `css/` & `js/`: File gaya dan logika frontend.
*   `index.html`: Halaman utama aplikasi.
*   `js/bookmark.js`: Logika fitur bookmark (backend API integration).
*   `js/kelas.js`: Handler bookmark button di halaman kelas.
