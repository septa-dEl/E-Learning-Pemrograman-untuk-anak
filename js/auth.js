/**
 * Auth Guard - Cek login status di semua halaman
 * Tambahkan <script src="/js/auth.js"></script> di setiap halaman yang butuh login
 */

const API_BASE = 'http://localhost:5000';

// Cek apakah halaman ini adalah halaman login/register
const isAuthPage = window.location.pathname.includes('auth/login.html') ||
  window.location.pathname.includes('auth/register.html');

function getRoleHomePage(role) {
  if (role === 'admin') return '/admin/dashboard.html';
  if (role === 'guru') return '/guru/index.html';
  return '/murid/kelas.html';
}

function enforceRolePage(user) {
  const path = window.location.pathname;

  if (user.role === 'admin') {
    if (path.includes('/auth/') || path.includes('/admin/')) return;
    window.location.href = getRoleHomePage(user.role);
    return;
  }

  if (user.role === 'guru') {
    if (path.includes('/auth/')) return;
    if (path.includes('/guru/')) return;
    if (path === '/admin/dashboard.html') return;
    // Jika guru membuka root atau /index.html, arahkan ke homepage guru
    if (path === '/' || path === '/index.html') {
      window.location.href = getRoleHomePage(user.role);
      return;
    }
    window.location.href = getRoleHomePage(user.role);
    return;
  }

  if (user.role === 'murid') {
    if (path.includes('/auth/')) return;
    if (path.includes('/murid/')) return;
    window.location.href = getRoleHomePage(user.role);
    return;
  }
}

// Fungsi untuk mendapatkan user dari session
async function checkAuth() {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    // Tidak ada token, redirect ke login (kecuali sudah di halaman login/register)
    if (!isAuthPage) {
      window.location.href = '/auth/login.html';
    }
    return null;
  }

  try {
    const res = await fetch(API_BASE + '/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();

    if (data.success) {
      // User sudah login
      if (isAuthPage) {
        window.location.href = getRoleHomePage(data.user.role);
        return null;
      }
      // Update UI dengan info user
      updateUserUI(data.user);
      enforceRolePage(data.user);
      return data.user;
    } else {
      // Token tidak valid, hapus dan redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (!isAuthPage) {
        window.location.href = '/auth/login.html';
      }
      return null;
    }
  } catch (err) {
    // Server mungkin belum jalan, fallback ke localStorage
    console.warn('Server tidak tersedia, menggunakan mode offline');
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (isAuthPage) {
        window.location.href = getRoleHomePage(user.role);
        return null;
      }
      updateUserUI(user);
      enforceRolePage(user);
      return user;
    } else {
      if (!isAuthPage) {
        window.location.href = '/auth/login.html';
      }
      return null;
    }
  }
}

// Update tampilan UI dengan data user
function updateUserUI(user) {
  // Update nama user di sidebar (jika ada)
  document.querySelectorAll('.user-name').forEach(el => {
    el.textContent = user.fullname;
  });
  // Update poin
  document.querySelectorAll('.user-pts, .badge-pts').forEach(el => {
    const pts = localStorage.getItem('codekids_pts') || '0';
    el.textContent = '\u2b50 ' + pts + ' poin';
  });

  // Role-based sidebar adjustments (Guru/Admin)
  if (user.role === 'guru' || user.role === 'admin') {
    // 1. Ubah link Daftar Tantangan milik Murid menjadi Manajemen Tantangan
    // (Otomatis daftar tantangan murid tidak ditampilkan karena ditimpa)
    const tantanganLinks = document.querySelectorAll('a[href="/murid/quiz.html"]');
    tantanganLinks.forEach(link => {
      link.href = '/guru/manajemen-tantangan.html';
      const img = link.querySelector('img');
      if (img) {
        img.title = 'Manajemen Tantangan & Quiz';
        img.setAttribute('data-nav', 'manajemen-tantangan');
        // Ubah ikon ke course2 jika diinginkan, atau biarkan default
        img.src = '/assets/image/web icons/course2.svg';
      }
    });

    if (window.location.pathname.includes('/murid/quiz.html')) {
      window.location.href = '/guru/manajemen-tantangan.html';
    }

    // 2. Ubah link Absen murid menjadi Manajemen Absensi Murid
    const absenLinks = document.querySelectorAll('a[href="/murid/absen.html"]');
    absenLinks.forEach(link => {
      link.href = '/guru/absensi.html';
      const img = link.querySelector('img');
      if (img) {
        img.title = 'Manajemen Absensi Murid';
        img.setAttribute('data-nav', 'manajemen-absensi');
      }
    });

    if (window.location.pathname.includes('/murid/absen.html')) {
      window.location.href = '/guru/absensi.html';
    }
  }

  // Khusus Admin
  if (user.role === 'admin') {
    const ul = document.querySelector('.sidebar-icons ul');
    const hasAdminUsersLink = ul && ul.querySelector('a[href="/admin/users.html"]');
    const hasAdminProfileLink = ul && ul.querySelector('a[href="/admin/profile.html"]');

    if (ul && !hasAdminUsersLink) {
      const li = document.createElement('li');
      const isActive = window.location.pathname.includes('/admin/users.html') ? 'active' : '';
      li.innerHTML = `<a href="/admin/users.html" id="adminUsersNav" class="${isActive}"><img src="/assets/image/web icons/profile.svg" class="user-profile" title="Manajemen Akun"></a>`;

      const profileLi = ul.querySelector('a[href="/murid/profile.html"]');
      if (profileLi && profileLi.parentElement) {
        profileLi.parentElement.replaceWith(li);
      } else {
        ul.appendChild(li);
      }
    }

    if (ul && !hasAdminProfileLink) {
      const li = document.createElement('li');
      const isActive = window.location.pathname.includes('/admin/profile.html') ? 'active' : '';
      li.innerHTML = `<a href="/admin/profile.html" id="adminProfileNav" class="${isActive}"><img src="/assets/image/web icons/profile.svg" class="user-profile" title="Profil Admin"></a>`;
      ul.appendChild(li);
    }

    if (window.location.pathname.includes('/murid/absen.html') || window.location.pathname.includes('/murid/quiz.html')) {
      // Redirection handled above
    }
  }
}

// Fungsi logout 
async function doLogout() {
  const token = localStorage.getItem('auth_token');

  try {
    await fetch(API_BASE + '/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
  } catch (err) {
    // Ignore error, tetap logout di client
  }

  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  window.location.href = '/auth/login.html';
}

// Auto-check saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});
