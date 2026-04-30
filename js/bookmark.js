// Bookmark display functionality for bookmark.html
// Menggunakan API backend untuk simpan bookmark per user

const API_BASE = 'http://localhost:5000';

// Define all available classes with their data
const allClasses = {
    logika_dasar: {
        title: 'Kelas Logika Dasar',
        description: 'Kelas pengenalan awal untuk memahami alur logika, urutan, dan kondisi dalam pemrograman dengan cara yang mudah dipahami.',
        image: '/assets/image/course icons/html-svgrepo-com.svg',
        link: '/kelas/kelasLogikaDasar.html'
    },
    html: {
        title: 'Kelas HTML',
        description: 'Bahasa markup untuk membuat struktur halaman web, fondasi dari semua situs web modern.',
        image: '/assets/image/course icons/html-svgrepo-com.svg',
        link: '/kelas/kelasHtml.html'
    },
    css: {
        title: 'Kelas CSS',
        description: 'Bahasa stylesheet untuk mengatur tampilan dan layout halaman web, membuat website lebih menarik.',
        image: '/assets/image/course icons/css-3-svgrepo-com.svg',
        link: '/kelas/kelasCSS.html'
    },
    js: {
        title: 'Kelas JavaScript',
        description: 'Bahasa pemrograman untuk membuat interaktivitas pada website, dari animasi hingga aplikasi web kompleks.',
        image: '/assets/image/course icons/js-official-svgrepo-com.svg',
        link: '/kelas/kelasJS.html'
    },
    php: {
        title: 'Kelas PHP',
        description: 'Bahasa pemrograman server-side untuk membuat aplikasi web dinamis dan berinteraksi dengan database.',
        image: '/assets/image/course icons/php2-svgrepo-com.svg',
        link: '/kelas/kelasPHP.html'
    },
    python: {
        title: 'Kelas Python',
        description: 'Bahasa pemrograman yang serbaguna dan mudah dipelajari, digunakan untuk web development, data science, kecerdasan buatan, scripting otomatisasi, dan banyak aplikasi lainnya.',
        image: '/assets/image/course icons/python-svgrepo-com.svg',
        link: '/kelas/kelasPYTHON.html'
    }
};

document.addEventListener('DOMContentLoaded', async function() {
    const bookmarkedContainer = document.getElementById('bookmarked-kelas');
    const noBookmarksDiv = document.getElementById('no-bookmarks');
    const bookmarkCount = document.getElementById('bookmark-count');
    const token = localStorage.getItem('auth_token');

    function updateBookmarkCount(count) {
        if (bookmarkCount) {
            bookmarkCount.textContent = `${count} kelas disimpan`;
        }
    }

    function renderBookmarks(bookmarks) {
        bookmarkedContainer.innerHTML = '';

        if (bookmarks.length === 0) {
            noBookmarksDiv.style.display = 'block';
            updateBookmarkCount(0);
            return;
        }

        noBookmarksDiv.style.display = 'none';
        updateBookmarkCount(bookmarks.length);

        bookmarks.forEach(kelasName => {
            if (!allClasses[kelasName]) return;

            const kelasData = allClasses[kelasName];
            const cardHtml = `
                <article class="kelas-card" data-kelas="${kelasName}">
                    <button class="bookmark-btn bookmarked" data-kelas="${kelasName}" aria-label="Hapus bookmark">
                        <svg class="bookmark-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"></path>
                        </svg>
                    </button>
                    <div class="kelas-card-body">
                        <div class="kelas-card-media">
                            <img src="${kelasData.image}" alt="${kelasData.title}">
                        </div>
                        <div class="kelas-card-main">
                            <div>
                                <h5 class="kelas-card-title">${kelasData.title}</h5>
                                <p class="kelas-card-text">${kelasData.description}</p>
                            </div>
                            <div class="kelas-card-actions">
                                <a href="${kelasData.link}" class="kelas-card-link">Ambil Kelas</a>
                                <span class="kelas-card-badge">Disimpan</span>
                            </div>
                        </div>
                    </div>
                </article>
            `;
            bookmarkedContainer.innerHTML += cardHtml;
        });

        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const kelasName = this.getAttribute('data-kelas');
                const card = this.closest('.kelas-card');
                
                try {
                    const res = await fetch(API_BASE + '/api/bookmarks/remove', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token, kelas_name: kelasName })
                    });

                    const data = await res.json();
                    if (data.success) {
                        if (card) {
                            card.classList.add('fade-out');
                            setTimeout(() => {
                                loadBookmarks();
                            }, 280);
                        } else {
                            loadBookmarks();
                        }
                        showToast('Kelas berhasil dihapus dari bookmark.', 'success');
                    } else {
                        showToast(data.message || 'Gagal menghapus bookmark', 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showToast('Terjadi kesalahan', 'error');
                }
            });
        });
    }

    async function loadBookmarks() {
        if (!token) {
            noBookmarksDiv.style.display = 'block';
            return;
        }

        try {
            const res = await fetch(API_BASE + '/api/bookmarks/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await res.json();
            if (data.success) {
                renderBookmarks(data.bookmarks);
            } else {
                console.error('Error:', data.message);
                noBookmarksDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            // Fallback ke localStorage jika server tidak tersedia
            const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedKelas') || '[]');
            renderBookmarks(savedBookmarks);
        }
    }

    // Load bookmarks saat halaman dimuat
    loadBookmarks();
});

// Function untuk menambah bookmark dari halaman kelas
async function addBookmark(kelasName) {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        showToast('Silakan login terlebih dahulu', 'error');
        return false;
    }

    try {
        const res = await fetch(API_BASE + '/api/bookmarks/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, kelas_name: kelasName })
        });

        const data = await res.json();
        if (data.success) {
            showToast('Kelas berhasil di-bookmark!', 'success');
            updateBookmarkButton(kelasName, true);
            return true;
        } else {
            showToast(data.message || 'Gagal menambah bookmark', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Terjadi kesalahan', 'error');
        return false;
    }
}

// Function untuk menghapus bookmark dari halaman kelas
async function removeBookmark(kelasName) {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        showToast('Silakan login terlebih dahulu', 'error');
        return false;
    }

    try {
        const res = await fetch(API_BASE + '/api/bookmarks/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, kelas_name: kelasName })
        });

        const data = await res.json();
        if (data.success) {
            showToast('Bookmark berhasil dihapus', 'success');
            updateBookmarkButton(kelasName, false);
            return true;
        } else {
            showToast(data.message || 'Gagal menghapus bookmark', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Terjadi kesalahan', 'error');
        return false;
    }
}

// Function untuk mengecek apakah kelas sudah di-bookmark
async function isBookmarked(kelasName) {
    const token = localStorage.getItem('auth_token');
    
    if (!token) return false;

    try {
        const res = await fetch(API_BASE + '/api/bookmarks/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, kelas_name: kelasName })
        });

        const data = await res.json();
        return data.success ? data.is_bookmarked : false;
    } catch (error) {
        console.error('Error checking bookmark:', error);
        return false;
    }
}

// Function untuk update tampilan bookmark button
function updateBookmarkButton(kelasName, isBookmarked) {
    const btn = document.querySelector(`[data-kelas="${kelasName}"]`);
    if (btn) {
        if (isBookmarked) {
            btn.classList.add('bookmarked');
        } else {
            btn.classList.remove('bookmarked');
        }
    }
}

// Function untuk setup bookmark button pada halaman kelas
async function setupBookmarkButton(kelasName) {
    const btn = document.querySelector(`[data-kelas="${kelasName}"]`);
    if (!btn) return;

    // Check if already bookmarked
    const bookmarked = await isBookmarked(kelasName);
    if (bookmarked) {
        btn.classList.add('bookmarked');
    }

    btn.addEventListener('click', async function(e) {
        e.preventDefault();
        const isCurrentlyBookmarked = this.classList.contains('bookmarked');
        
        if (isCurrentlyBookmarked) {
            await removeBookmark(kelasName);
        } else {
            await addBookmark(kelasName);
        }
    });
}

// Function untuk toggle bookmark
async function toggleBookmark(kelasName) {
    const bookmarked = await isBookmarked(kelasName);
    if (bookmarked) {
        return await removeBookmark(kelasName);
    } else {
        return await addBookmark(kelasName);
    }
}

// Function to show alerts
function showToast(message, type) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast-alert toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</div>
        <div class="toast-message">${message}</div>
        <button type="button" class="toast-close" aria-label="Tutup">×</button>
    `;

    toastContainer.appendChild(toast);

    const removeToast = () => {
        toast.classList.add('toast-hidden');
        setTimeout(() => toast.remove(), 280);
    };

    toast.querySelector('.toast-close').addEventListener('click', removeToast);
    setTimeout(removeToast, 3200);
}