document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check authentication and auto-fill name
    const user = await checkAuth();
    if (user) {
        document.getElementById('studentName').value = user.fullname;
    }

    // 2. Load today's date
    const date = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    console.log("Halaman absen dimuat pada:", date);

    // 3. Dynamic visibility for notes field
    const statusInputs = document.querySelectorAll('input[name="status"]');
    const notesGroup = document.getElementById('notesGroup');

    statusInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (input.value === 'Hadir') {
                notesGroup.style.display = 'none';
                document.getElementById('notes').value = ''; // Clean up
            } else {
                notesGroup.style.display = 'block';
            }
        });
    });
});

async function handleSubmitAbsen(e) {
    e.preventDefault();
    
    const btn = document.getElementById('btnSubmit');
    const alertEl = document.getElementById('absenAlert');
    
    // UI Feedback
    btn.disabled = true;
    btn.textContent = 'Mengirim...';
    alertEl.style.display = 'none';

    const fullname = document.getElementById('studentName').value;
    const status = document.querySelector('input[name="status"]:checked').value;
    const notes = document.getElementById('notes').value;
    const token = localStorage.getItem('auth_token');

    try {
        if (!token) throw new Error("Silakan login kembali.");

        const res = await fetch(API_BASE + '/api/absensi/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, status, notes })
        });
        
        const data = await res.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        console.log("Absensi Berhasil:", { fullname, status, notes });

        alertEl.textContent = '✅ Berhasil! ' + data.message;
        alertEl.className = 'alert alert-success';
        alertEl.style.display = 'block';
        
        // Reset form except name
        document.getElementById('notes').value = '';
        
    } catch (err) {
        alertEl.textContent = '❌ Gagal: ' + err.message;
        alertEl.className = 'alert alert-error';
        alertEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Kirim Absensi 🚀';
    }
}
