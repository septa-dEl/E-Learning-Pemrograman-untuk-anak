"""
E-Learning Backend Server
Flask + SQLite untuk sistem login/register
"""

import sqlite3
import hashlib
import secrets
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Path ke database
DB_PATH = os.path.join(os.path.dirname(__file__), 'elearning.db')

# Path ke folder frontend (satu level di atas backend)
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# ══ DATABASE SETUP ══
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn



def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS challenges (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            hints TEXT, -- JSON array
            explanation TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS absensi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            fullname TEXT NOT NULL,
            status TEXT NOT NULL,
            notes TEXT,
            tanggal DATE DEFAULT (date('now', 'localtime')),
            created_at DATETIME DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            kelas_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, kelas_name),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_points INTEGER DEFAULT 0,
            streak_days INTEGER DEFAULT 0,
            last_activity DATE DEFAULT (date('now', 'localtime')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user_badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            badge_id TEXT NOT NULL,
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, badge_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS challenge_completions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            challenge_id TEXT NOT NULL,
            points_earned INTEGER NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, challenge_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Auto-create admin account
    admin_email = "admin@admin.com"
    admin = conn.execute('SELECT id FROM users WHERE email = ?', (admin_email,)).fetchone()
    if not admin:
        admin_pass_hash = hash_password("admin123")
        conn.execute('INSERT INTO users (fullname, email, password_hash, role) VALUES (?, ?, ?, ?)', ("Administrator", admin_email, admin_pass_hash, "admin"))

    # Auto-create guru account
    guru_email = "guru@elpro.com"
    guru = conn.execute('SELECT id FROM users WHERE email = ?', (guru_email,)).fetchone()
    if not guru:
        guru_pass_hash = hash_password("guru123")
        conn.execute('INSERT INTO users (fullname, email, password_hash, role) VALUES (?, ?, ?, ?)', ("Bapak/Ibu Guru", guru_email, guru_pass_hash, "guru"))
        
    conn.commit()
    conn.close()

def hash_password(password):
    """Hash password dengan SHA-256 + salt sederhana"""
    salt = "elpro_salt_2026"
    return hashlib.sha256((password + salt).encode()).hexdigest()

# ══ API ROUTES ══

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    fullname = data.get('fullname', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validasi
    if not fullname or not email or not password:
        return jsonify({'success': False, 'message': 'Semua field wajib diisi'}), 400
    
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password minimal 6 karakter'}), 400

    conn = get_db()
    try:
        # Cek email sudah terdaftar
        existing = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        if existing:
            return jsonify({'success': False, 'message': 'Email sudah terdaftar'}), 409

        # Insert user baru
        password_hash = hash_password(password)
        conn.execute(
            'INSERT INTO users (fullname, email, password_hash, role) VALUES (?, ?, ?, ?)',
            (fullname, email, password_hash, 'user')
        )
        conn.commit()

        return jsonify({'success': True, 'message': 'Registrasi berhasil! Silakan login.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email dan password wajib diisi'}), 400

    conn = get_db()
    try:
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        if not user:
            return jsonify({'success': False, 'message': 'Email tidak ditemukan'}), 401

        password_hash = hash_password(password)
        if user['password_hash'] != password_hash:
            return jsonify({'success': False, 'message': 'Password salah'}), 401

        # Buat session token
        token = secrets.token_hex(32)
        conn.execute('INSERT INTO sessions (token, user_id) VALUES (?, ?)', (token, user['id']))
        conn.commit()

        return jsonify({
            'success': True,
            'message': 'Login berhasil!',
            'token': token,
            'user': {
                'id': user['id'],
                'fullname': user['fullname'],
                'email': user['email'],
                'role': user['role'] if 'role' in user.keys() else 'user'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/verify', methods=['POST'])
def verify_session():
    data = request.get_json()
    token = data.get('token', '')

    if not token:
        return jsonify({'success': False, 'message': 'Token tidak ditemukan'}), 401

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT s.*, u.fullname, u.email, u.role 
            FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ?
        ''', (token,)).fetchone()

        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        return jsonify({
            'success': True,
            'user': {
                'id': session['user_id'],
                'fullname': session['fullname'],
                'email': session['email'],
                'role': session['role'] if 'role' in session.keys() else 'user'
            }
        })
    finally:
        conn.close()

@app.route('/api/logout', methods=['POST'])
def logout():
    data = request.get_json()
    token = data.get('token', '')

    conn = get_db()
    conn.execute('DELETE FROM sessions WHERE token = ?', (token,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Logout berhasil'})

@app.route('/api/profile/update', methods=['POST'])
def update_profile():
    data = request.get_json()
    token = data.get('token', '')
    fullname = data.get('fullname', '').strip()
    email = data.get('email', '').strip().lower()

    if not token or not fullname or not email:
        return jsonify({'success': False, 'message': 'Data tidak lengkap'}), 400

    conn = get_db()
    try:
        session = conn.execute('SELECT user_id FROM sessions WHERE token = ?', (token,)).fetchone()
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        # Cek email duplikat (kecuali milik user sendiri)
        existing = conn.execute('SELECT id FROM users WHERE email = ? AND id != ?', (email, session['user_id'])).fetchone()
        if existing:
            return jsonify({'success': False, 'message': 'Email sudah digunakan user lain'}), 409

        conn.execute('UPDATE users SET fullname = ?, email = ? WHERE id = ?', (fullname, email, session['user_id']))
        conn.commit()

        return jsonify({'success': True, 'message': 'Profil berhasil diperbarui', 'user': {'id': session['user_id'], 'fullname': fullname, 'email': email}})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/profile/password', methods=['POST'])
def change_password():
    data = request.get_json()
    token = data.get('token', '')
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    if not token or not old_password or not new_password:
        return jsonify({'success': False, 'message': 'Data tidak lengkap'}), 400
    if len(new_password) < 6:
        return jsonify({'success': False, 'message': 'Password baru minimal 6 karakter'}), 400

    conn = get_db()
    try:
        session = conn.execute('SELECT user_id FROM sessions WHERE token = ?', (token,)).fetchone()
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user = conn.execute('SELECT password_hash FROM users WHERE id = ?', (session['user_id'],)).fetchone()
        if user['password_hash'] != hash_password(old_password):
            return jsonify({'success': False, 'message': 'Password lama salah'}), 401

        conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', (hash_password(new_password), session['user_id']))
        conn.commit()
        return jsonify({'success': True, 'message': 'Password berhasil diubah'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/profile/delete', methods=['POST'])
def delete_account():
    data = request.get_json()
    token = data.get('token', '')
    password = data.get('password', '')

    if not token or not password:
        return jsonify({'success': False, 'message': 'Data tidak lengkap'}), 400

    conn = get_db()
    try:
        session = conn.execute('SELECT user_id FROM sessions WHERE token = ?', (token,)).fetchone()
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user = conn.execute('SELECT password_hash FROM users WHERE id = ?', (session['user_id'],)).fetchone()
        if user['password_hash'] != hash_password(password):
            return jsonify({'success': False, 'message': 'Password salah'}), 401

        conn.execute('DELETE FROM sessions WHERE user_id = ?', (session['user_id'],))
        conn.execute('DELETE FROM users WHERE id = ?', (session['user_id'],))
        conn.commit()
        return jsonify({'success': True, 'message': 'Akun berhasil dihapus'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

# ══ CHALLENGE API ══

@app.route('/api/challenges', methods=['GET'])
def get_challenges():
    conn = get_db()
    rows = conn.execute('SELECT * FROM challenges').fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/challenges/<id>', methods=['GET'])
def get_challenge(id):
    conn = get_db()
    row = conn.execute('SELECT * FROM challenges WHERE id = ?', (id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({'success': False, 'message': 'Challenge not found'}), 404
    return jsonify(dict(row))

@app.route('/api/challenges/save', methods=['POST'])
def save_challenge():
    data = request.get_json()
    token = data.get('token', '')
    ch_id = data.get('id')
    title = data.get('title')
    hints = data.get('hints') # JSON string
    explanation = data.get('explanation')

    if not token or not ch_id or not title:
        return jsonify({'success': False, 'message': 'Data tidak lengkap'}), 400

    conn = get_db()
    try:
        # Check permissions
        session = conn.execute('''
            SELECT u.role FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session or session['role'] not in ['admin', 'guru']:
            return jsonify({'success': False, 'message': 'Akses ditolak. Cuma Guru/Admin yang bisa.'}), 403

        # Upsert
        existing = conn.execute('SELECT id FROM challenges WHERE id = ?', (ch_id,)).fetchone()
        if existing:
            conn.execute('''
                UPDATE challenges 
                SET title = ?, hints = ?, explanation = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ''', (title, hints, explanation, ch_id))
        else:
            conn.execute('''
                INSERT INTO challenges (id, title, hints, explanation) 
                VALUES (?, ?, ?, ?)
            ''', (ch_id, title, hints, explanation))
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Data tantangan berhasil disimpan'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/challenges/delete/<id>', methods=['POST'])
def delete_challenge_api(id):
    data = request.get_json()
    token = data.get('token', '')

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT u.role FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session or session['role'] not in ['admin', 'guru']:
            return jsonify({'success': False, 'message': 'Akses ditolak'}), 403

        conn.execute('DELETE FROM challenges WHERE id = ?', (id,))
        conn.commit()
        return jsonify({'success': True, 'message': 'Tantangan dihapus dari database'})
    finally:
        conn.close()

# ══ ABSENSI API ══

@app.route('/api/absensi/submit', methods=['POST'])
def submit_absensi():
    data = request.get_json()
    token = data.get('token', '')
    status = data.get('status', 'Hadir')
    notes = data.get('notes', '')

    if not token:
        return jsonify({'success': False, 'message': 'Akses ditolak'}), 401

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT s.user_id, u.fullname FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user_id = session['user_id']
        fullname = session['fullname']

        # Check if already submitted today
        today_absensi = conn.execute(
            "SELECT id FROM absensi WHERE user_id = ? AND tanggal = date('now', 'localtime')", 
            (user_id,)
        ).fetchone()

        if today_absensi:
            return jsonify({'success': False, 'message': 'Anda sudah absen hari ini'}), 400

        conn.execute('''
            INSERT INTO absensi (user_id, fullname, status, notes) 
            VALUES (?, ?, ?, ?)
        ''', (user_id, fullname, status, notes))
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Absensi berhasil dicatat'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/absensi/today', methods=['POST'])
def get_today_absensi():
    data = request.get_json()
    token = data.get('token', '')

    if not token:
        return jsonify({'success': False, 'message': 'Akses ditolak'}), 401

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT u.role FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session or session['role'] not in ['admin', 'guru']:
            return jsonify({'success': False, 'message': 'Akses ditolak. Hanya Guru/Admin.'}), 403

        # Get today's attendance
        rows = conn.execute('''
            SELECT fullname as name, status, notes, strftime('%H:%M WIB', created_at) as time 
            FROM absensi 
            WHERE tanggal = date('now', 'localtime')
            ORDER BY created_at DESC
        ''').fetchall()
        
        return jsonify({'success': True, 'data': [dict(r) for r in rows]})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

# ══ MANAJEMEN USER (ADMIN ONLY) ══

@app.route('/api/users', methods=['POST'])
def get_all_users():
    data = request.get_json()
    token = data.get('token', '')

    if not token:
        return jsonify({'success': False, 'message': 'Akses ditolak'}), 401

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT u.role FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session or session['role'] != 'admin':
            return jsonify({'success': False, 'message': 'Akses ditolak. Cuma Admin yang bisa.'}), 403

        # Return all users
        rows = conn.execute('SELECT id, fullname, email, role FROM users ORDER BY created_at DESC').fetchall()
        return jsonify({'success': True, 'users': [dict(r) for r in rows]})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/users/add', methods=['POST'])
def admin_add_user_account():
    data = request.get_json()
    token = data.get('token', '')
    fullname = data.get('fullname', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'user')

    if not token or not fullname or not email or not password:
        return jsonify({'success': False, 'message': 'Data tidak lengkap'}), 400
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password minimal 6 karakter'}), 400

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT u.role FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session or session['role'] != 'admin':
            return jsonify({'success': False, 'message': 'Akses ditolak. Cuma Admin yang bisa.'}), 403

        existing = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        if existing:
            return jsonify({'success': False, 'message': 'Email sudah terdaftar'}), 409

        conn.execute(
            'INSERT INTO users (fullname, email, password_hash, role) VALUES (?, ?, ?, ?)',
            (fullname, email, hash_password(password), role)
        )
        conn.commit()
        return jsonify({'success': True, 'message': 'Akun berhasil ditambahkan'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/users/update_role', methods=['POST'])
def update_user_role():
    data = request.get_json()
    token = data.get('token', '')
    user_id = data.get('user_id')
    new_role = data.get('role', 'user')

    if not token or not user_id:
        return jsonify({'success': False, 'message': 'Data tidak lengkap'}), 400

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT u.role FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session or session['role'] != 'admin':
            return jsonify({'success': False, 'message': 'Akses ditolak.'}), 403

        conn.execute('UPDATE users SET role = ? WHERE id = ?', (new_role, user_id))
        conn.commit()
        return jsonify({'success': True, 'message': 'Role berhasil diubah'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/users/delete', methods=['POST'])
def admin_delete_user():
    data = request.get_json()
    token = data.get('token', '')
    user_id = data.get('user_id')

    if not token or not user_id:
        return jsonify({'success': False, 'message': 'Data tidak lengkap'}), 400

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT u.role, u.id FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session or session['role'] != 'admin':
            return jsonify({'success': False, 'message': 'Akses ditolak.'}), 403

        if session['id'] == user_id:
            return jsonify({'success': False, 'message': 'Tidak bisa menghapus akun sendiri.'}), 400

        conn.execute('DELETE FROM sessions WHERE user_id = ?', (user_id,))
        conn.execute('DELETE FROM absensi WHERE user_id = ?', (user_id,))
        conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        return jsonify({'success': True, 'message': 'Akun berhasil dihapus'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

# ══ BOOKMARK API ══

@app.route('/api/bookmarks/add', methods=['POST'])
def add_bookmark():
    data = request.get_json()
    token = data.get('token', '')
    kelas_name = data.get('kelas_name', '')

    if not token or not kelas_name:
        return jsonify({'success': False, 'message': 'Data tidak lengkap'}), 400

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT s.user_id FROM sessions s 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user_id = session['user_id']
        
        # Check if bookmark already exists
        existing = conn.execute(
            'SELECT id FROM bookmarks WHERE user_id = ? AND kelas_name = ?',
            (user_id, kelas_name)
        ).fetchone()
        
        if existing:
            return jsonify({'success': False, 'message': 'Kelas sudah di-bookmark'}), 409

        conn.execute(
            'INSERT INTO bookmarks (user_id, kelas_name) VALUES (?, ?)',
            (user_id, kelas_name)
        )
        conn.commit()
        return jsonify({'success': True, 'message': 'Kelas berhasil di-bookmark'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/bookmarks/remove', methods=['POST'])
def remove_bookmark():
    data = request.get_json()
    token = data.get('token', '')
    kelas_name = data.get('kelas_name', '')

    if not token or not kelas_name:
        return jsonify({'success': False, 'message': 'Data tidak lengkap'}), 400

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT s.user_id FROM sessions s 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user_id = session['user_id']
        conn.execute(
            'DELETE FROM bookmarks WHERE user_id = ? AND kelas_name = ?',
            (user_id, kelas_name)
        )
        conn.commit()
        return jsonify({'success': True, 'message': 'Bookmark berhasil dihapus'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/bookmarks/list', methods=['POST'])
def get_bookmarks():
    data = request.get_json()
    token = data.get('token', '')

    if not token:
        return jsonify({'success': False, 'message': 'Token tidak ditemukan'}), 401

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT s.user_id FROM sessions s 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user_id = session['user_id']
        rows = conn.execute(
            'SELECT kelas_name FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC',
            (user_id,)
        ).fetchall()
        
        bookmarks = [row['kelas_name'] for row in rows]
        return jsonify({'success': True, 'bookmarks': bookmarks})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/bookmarks/check', methods=['POST'])
def check_bookmark():
    data = request.get_json()
    token = data.get('token', '')
    kelas_name = data.get('kelas_name', '')

    if not token or not kelas_name:
        return jsonify({'success': False, 'message': 'Data tidak lengkap'}), 400

    conn = get_db()
    try:
        session = conn.execute('''
            SELECT s.user_id FROM sessions s 
            WHERE s.token = ?
        ''', (token,)).fetchone()
        
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user_id = session['user_id']
        bookmark = conn.execute(
            'SELECT id FROM bookmarks WHERE user_id = ? AND kelas_name = ?',
            (user_id, kelas_name)
        ).fetchone()
        
        return jsonify({'success': True, 'is_bookmarked': bookmark is not None})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

# ══ POINTS & BADGES API ══

@app.route('/api/points/sync', methods=['POST'])
def sync_points():
    data = request.get_json()
    token = data.get('token', '')
    local_points = data.get('points', 0)

    if not token:
        return jsonify({'success': False, 'message': 'Token tidak ditemukan'}), 401

    conn = get_db()
    try:
        session = conn.execute('SELECT user_id FROM sessions WHERE token = ?', (token,)).fetchone()
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user_id = session['user_id']
        
        # Get current server points
        user_points = conn.execute('SELECT total_points FROM user_points WHERE user_id = ?', (user_id,)).fetchone()
        server_points = user_points['total_points'] if user_points else 0
        
        # Sync: take the higher value
        final_points = max(server_points, local_points)
        
        # Update or insert points
        if user_points:
            conn.execute('UPDATE user_points SET total_points = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', (final_points, user_id))
        else:
            conn.execute('INSERT INTO user_points (user_id, total_points) VALUES (?, ?)', (user_id, final_points))
        
        conn.commit()
        return jsonify({'success': True, 'points': final_points, 'message': 'Poin berhasil disinkronkan'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/points/get', methods=['POST'])
def get_user_points():
    data = request.get_json()
    token = data.get('token', '')

    if not token:
        return jsonify({'success': False, 'message': 'Token tidak ditemukan'}), 401

    conn = get_db()
    try:
        session = conn.execute('SELECT user_id FROM sessions WHERE token = ?', (token,)).fetchone()
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user_id = session['user_id']
        user_points = conn.execute('SELECT total_points, streak_days FROM user_points WHERE user_id = ?', (user_id,)).fetchone()
        
        points = user_points['total_points'] if user_points else 0
        streak = user_points['streak_days'] if user_points else 0
        
        return jsonify({'success': True, 'points': points, 'streak': streak})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/points/add', methods=['POST'])
def add_points():
    data = request.get_json()
    token = data.get('token', '')
    points_to_add = data.get('points', 0)
    challenge_id = data.get('challenge_id', '')

    if not token or points_to_add <= 0:
        return jsonify({'success': False, 'message': 'Data tidak valid'}), 400

    conn = get_db()
    try:
        session = conn.execute('SELECT user_id FROM sessions WHERE token = ?', (token,)).fetchone()
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user_id = session['user_id']
        
        # Check if challenge already completed
        if challenge_id:
            existing = conn.execute('SELECT id FROM challenge_completions WHERE user_id = ? AND challenge_id = ?', (user_id, challenge_id)).fetchone()
            if existing:
                return jsonify({'success': False, 'message': 'Tantangan sudah diselesaikan sebelumnya'}), 409
        
        # Update or insert points
        user_points = conn.execute('SELECT total_points FROM user_points WHERE user_id = ?', (user_id,)).fetchone()
        current_points = user_points['total_points'] if user_points else 0
        new_points = current_points + points_to_add
        
        if user_points:
            conn.execute('UPDATE user_points SET total_points = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', (new_points, user_id))
        else:
            conn.execute('INSERT INTO user_points (user_id, total_points) VALUES (?, ?)', (user_id, new_points))
        
        # Record challenge completion if provided
        if challenge_id:
            conn.execute('INSERT INTO challenge_completions (user_id, challenge_id, points_earned) VALUES (?, ?, ?)', (user_id, challenge_id, points_to_add))
        
        # Check and award badges
        awarded_badges = check_and_award_badges(conn, user_id, new_points)
        
        conn.commit()
        return jsonify({
            'success': True, 
            'new_points': new_points, 
            'points_added': points_to_add,
            'awarded_badges': awarded_badges
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

def check_and_award_badges(conn, user_id, total_points):
    badges = [
        {'id': 'pemula', 'name': 'Pemula Coding', 'min_points': 5},
        {'id': 'penjelajah', 'name': 'Penjelajah Kode', 'min_points': 30},
        {'id': 'logika', 'name': 'Ahli Logika', 'min_points': 50},
        {'id': 'pantang', 'name': 'Pantang Menyerah', 'min_points': 80},
        {'id': 'coder', 'name': 'Coder Muda', 'min_points': 120},
        {'id': 'master', 'name': 'Master Logika', 'min_points': 200},
        {'id': 'legend', 'name': 'Legenda El-pro', 'min_points': 300}
    ]
    
    awarded = []
    for badge in badges:
        if total_points >= badge['min_points']:
            # Check if already earned
            existing = conn.execute('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?', (user_id, badge['id'])).fetchone()
            if not existing:
                conn.execute('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', (user_id, badge['id']))
                awarded.append(badge)
    
    return awarded

@app.route('/api/badges/get', methods=['POST'])
def get_user_badges():
    data = request.get_json()
    token = data.get('token', '')

    if not token:
        return jsonify({'success': False, 'message': 'Token tidak ditemukan'}), 401

    conn = get_db()
    try:
        session = conn.execute('SELECT user_id FROM sessions WHERE token = ?', (token,)).fetchone()
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user_id = session['user_id']
        
        # Get earned badges
        earned_badges = conn.execute('SELECT badge_id FROM user_badges WHERE user_id = ?', (user_id,)).fetchall()
        earned_ids = [row['badge_id'] for row in earned_badges]
        
        # Get total points for badge calculation
        user_points = conn.execute('SELECT total_points FROM user_points WHERE user_id = ?', (user_id,)).fetchone()
        total_points = user_points['total_points'] if user_points else 0
        
        # Get challenge completions count
        completions = conn.execute('SELECT COUNT(*) as count FROM challenge_completions WHERE user_id = ?', (user_id,)).fetchone()
        completed_count = completions['count']
        
        return jsonify({
            'success': True,
            'earned_badges': earned_ids,
            'total_points': total_points,
            'completed_challenges': completed_count
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/challenges/completed', methods=['POST'])
def get_completed_challenges():
    data = request.get_json()
    token = data.get('token', '')

    if not token:
        return jsonify({'success': False, 'message': 'Token tidak ditemukan'}), 401

    conn = get_db()
    try:
        session = conn.execute('SELECT user_id FROM sessions WHERE token = ?', (token,)).fetchone()
        if not session:
            return jsonify({'success': False, 'message': 'Session tidak valid'}), 401

        user_id = session['user_id']
        completions = conn.execute('SELECT challenge_id FROM challenge_completions WHERE user_id = ?', (user_id,)).fetchall()
        completed_ids = [row['challenge_id'] for row in completions]
        
        return jsonify({'success': True, 'completed_challenges': completed_ids})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

# ══ SERVE STATIC FILES ══
# Flask akan melayani semua file frontend
@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:filepath>')
def serve_static(filepath):
    # Serve file from frontend root if available.
    requested_file = os.path.join(FRONTEND_DIR, filepath)
    if os.path.isfile(requested_file):
        return send_from_directory(FRONTEND_DIR, filepath)

    # Fallback for legacy /murid/* paths stored under kelasCSS/murid/.
    if filepath.startswith('murid/'):
        fallback_dir = os.path.join(FRONTEND_DIR, 'kelasCSS')
        fallback_file = os.path.join(fallback_dir, filepath)
        if os.path.isfile(fallback_file):
            return send_from_directory(fallback_dir, filepath)

    return send_from_directory(FRONTEND_DIR, filepath)

# ══ MAIN ══
if __name__ == '__main__':
    init_db()
    print("=" * 50)
    print("  E-Learning Server")
    print("  http://localhost:5000")
    print("=" * 50)
    app.run(host='0.0.0.0', debug=True, port=5000)
