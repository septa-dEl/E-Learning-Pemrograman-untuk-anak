// Bookmark functionality for kelas.html
const API_BASE = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('auth_token');

    // Load saved bookmarks from API
    const savedBookmarks = await loadBookmarksFromAPI();

    // Update bookmark buttons based on saved state
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        const kelasName = btn.getAttribute('data-kelas');
        if (savedBookmarks.includes(kelasName)) {
            btn.classList.add('bookmarked');
            const svg = btn.querySelector('.bookmark-icon-svg');
            svg.setAttribute('fill', 'currentColor');
        }
    });

    // Add click event listeners to bookmark buttons
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const kelasName = this.getAttribute('data-kelas');
            const svg = this.querySelector('.bookmark-icon-svg');

            if (this.classList.contains('bookmarked')) {
                // Remove from bookmarks
                const success = await toggleBookmarkAPI(kelasName, false);
                if (success) {
                    this.classList.remove('bookmarked');
                    svg.setAttribute('fill', 'none');
                    showAlert('Kelas dihapus dari bookmark!', 'warning');
                }
            } else {
                // Add to bookmarks
                const success = await toggleBookmarkAPI(kelasName, true);
                if (success) {
                    this.classList.add('bookmarked');
                    svg.setAttribute('fill', 'currentColor');
                    showAlert('Kelas ditambahkan ke bookmark!', 'success');
                    // Redirect ke halaman bookmark agar kelas langsung muncul
                    window.location.href = '/murid/bookmark.html';
                }
            }
        });
    });

    // Load bookmarks dari API
    async function loadBookmarksFromAPI() {
        if (!token) {
            // Fallback ke localStorage
            return JSON.parse(localStorage.getItem('bookmarkedKelas') || '[]');
        }

        try {
            const res = await fetch(API_BASE + '/api/bookmarks/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await res.json();
            if (data.success) {
                return data.bookmarks;
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }

        // Fallback ke localStorage
        return JSON.parse(localStorage.getItem('bookmarkedKelas') || '[]');
    }

    // Toggle bookmark via API
    async function toggleBookmarkAPI(kelasName, shouldAdd) {
        if (!token) {
            showAlert('Silakan login terlebih dahulu', 'danger');
            return false;
        }

        try {
            const endpoint = shouldAdd ? '/api/bookmarks/add' : '/api/bookmarks/remove';
            const res = await fetch(API_BASE + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, kelas_name: kelasName })
            });

            const data = await res.json();
            if (data.success) {
                return true;
            } else if (data.message && data.message.includes('sudah')) {
                // Jika bookmark sudah ada, anggap sukses
                return true;
            } else {
                showAlert(data.message || 'Gagal memperbarui bookmark', 'danger');
                return false;
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Terjadi kesalahan', 'danger');
            return false;
        }
    }

    // Block admin and guru from accessing material
    try {
        const u = JSON.parse(localStorage.getItem('auth_user') || '{}');
        if (u.role === 'admin' || u.role === 'guru') {
            document.querySelectorAll('.kelas-card-link').forEach(link => {
                link.textContent = 'Khusus Murid';
                link.style.backgroundColor = '#d1d5db';
                link.style.color = '#4b5563';
                link.style.borderColor = '#9ca3af';
                link.style.cursor = 'not-allowed';
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    showAlert("Maaf, Admin dan Guru / Dosen hanya untuk manajemen sistem. Materi belajar khusus Murid.", "danger");
                });
            });
            return; // hentikan di sini kalau admin/guru
        }
    } catch(e) {}
    
    // Sistem Buka/Tutup Kelas Bertahap (Progressive Unlock) per akun
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    const email = user.email || 'guest';
    const progKey = 'course_progress_' + email;
    const prog = JSON.parse(localStorage.getItem(progKey) || '["logika_dasar"]');
    document.querySelectorAll('.kelas-card').forEach(card => {
        const kId = card.getAttribute('data-kelas');
        if (kId !== 'logika_dasar' && !prog.includes(kId)) {
            // Kunci kelas ini
            const link = card.querySelector('.kelas-card-link');
            link.textContent = 'Terkunci 🔒';
            link.style.backgroundColor = '#f3f4f6';
            link.style.color = '#9ca3af';
            link.style.borderColor = '#d1d5db';
            link.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showAlert("Selesaikan materi sebelumnya terlebih dahulu untuk membuka kelas ini!", "warning");
            });
        }
    });

});

// Function to show alerts
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Add to body
    document.body.appendChild(alertDiv);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}