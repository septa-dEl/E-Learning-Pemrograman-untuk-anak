/* ── Navigation & Global State ── */
let userPoints = parseInt(localStorage.getItem('codekids_pts') || '340');

function updateScoreUI() {
  document.querySelectorAll('.user-pts, .badge-pts').forEach(el => {
    el.textContent = '⭐ ' + userPoints + ' poin';
  });
}

const pages = {
  dashboard: 'Dashboard', quiz: 'Daftar Tantangan',
  workspace: 'Kerjakan Tantangan',
  hint: 'AI Hint System',
  badges: 'Badge & Prestasi', quiz_mini: 'Kuis Mini', admin: 'Panel Admin'
};
function navTo(p) {
  const file = p === 'dashboard' ? '/index.html' : p + '.html';
  window.location.href = file;
}
const goto = navTo; // Alias for backward compatibility

/* ── Challenge Data ── */
let challengeData = {
  1: {
    title: 'Tantangan 1 — Susun Urutan Memasak Mie',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Mudah', 'Hint tersedia', '⭐ Maks 5 poin'],
    konsep: 'Sequence (Urutan)',
    blockCount: 5,
    story: 'Budi mau memasak mie instan. Tapi dia bingung urutan yang benar. Yuk bantu Budi menyusun urutannya! Ingat: setiap langkah harus dilakukan <em>berurutan dari atas ke bawah</em>.',
    hints: [
      'Langkah pertama pasti menyiapkan sumber panas. Apa yang harus dipanaskan dulu sebelum memasukkan mie?',
      'Urutan logisnya: siapkan air panas dulu → masukkan mie → siapkan bumbu di mangkuk → tuang → aduk. Coba susun lagi!',
      'Blok pertama adalah <strong>Rebus air</strong>, lalu <strong>Masukkan mie</strong>, lalu <strong>Siapkan bumbu</strong>, lalu <strong>Tuang mie dan kuah</strong>, terakhir <strong>Aduk mie</strong>.'
    ],
    blocks: [
      { id: 'a', text: 'Rebus air sampai mendidih', color: 'blk-blue' },
      { id: 'b', text: 'Masukkan mie ke dalam air', color: 'blk-green' },
      { id: 'c', text: 'Siapkan bumbu di mangkuk', color: 'blk-pink' },
      { id: 'd', text: 'Tuang mie dan kuah ke mangkuk', color: 'blk-yellow' },
      { id: 'e', text: 'Aduk mie hingga merata', color: 'blk-gray' }
    ],
    order: ['a', 'b', 'c', 'd', 'e']
  },
  2: {
    title: 'Tantangan 2 — Blok Kondisi Nilai Ujian',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Mudah', 'Hint tersedia', '⭐ Maks 5 poin'],
    konsep: 'Conditional (IF-ELSE)',
    blockCount: 4,
    story: 'Nilai ujian Budi sudah keluar! Kalau nilai Budi di atas 70, Budi <strong>Lulus</strong>. Kalau tidak, Budi harus <strong>Mengulang</strong>. Bantu susun kondisi (IF-ELSE) nya ya!',
    hints: [
      'Kondisi dimulai dengan blok <strong>IF</strong>. Blok IF selalu di posisi paling atas dari percabangan.',
      'Setelah IF ada akibatnya (PRINT Lulus), lalu ELSE, lalu akibat ELSE (PRINT Mengulang). Urutan ini tidak boleh terbalik!',
      'Urutan yang benar: <strong>IF nilai &gt; 70</strong> → <strong>PRINT "Lulus"</strong> → <strong>ELSE</strong> → <strong>PRINT "Mengulang"</strong>.'
    ],
    blocks: [
      { id: 'a', text: 'IF nilai > 70', color: 'blk-blue' },
      { id: 'b', text: 'PRINT "Lulus"', color: 'blk-green' },
      { id: 'c', text: 'ELSE', color: 'blk-yellow' },
      { id: 'd', text: 'PRINT "Mengulang"', color: 'blk-pink' }
    ],
    order: ['a', 'b', 'c', 'd']
  },
  3: {
    title: 'Tantangan 3 — Cuaca dan Rencana Main Bola',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Sedang', 'Hint tersedia', '⭐ Maks 10 poin'],
    konsep: 'Sequence + Conditional',
    blockCount: 7,
    story: 'Budi mau main bola! Tapi dulu dia harus cek cuaca. Kalau cuaca <strong>cerah</strong>, main di lapangan. Kalau cuaca <strong>hujan</strong>, main di dalam rumah. Susun program Budi ya!',
    hints: [
      'Program dimulai dengan menyimpan nilai cuaca ke variabel. Variabel apa yang harus diisi pertama?',
      'Setelah menyimpan cuaca, Budi perlu menyiapkan bola dulu sebelum cek kondisi. Baru kemudian IF-ELSE untuk cek cuacanya.',
      'Urutan lengkap: <strong>cuaca = "hujan"</strong> → <strong>siapkan bola</strong> → <strong>IF cuaca == "cerah"</strong> → <strong>PRINT "Main luar"</strong> → <strong>ELSE</strong> → <strong>PRINT "Main dalam"</strong> → <strong>END</strong>.'
    ],
    blocks: [
      { id: 'a', text: 'cuaca = "hujan"', color: 'blk-pink' },
      { id: 'b', text: 'siapkan bola', color: 'blk-gray' },
      { id: 'c', text: 'IF cuaca == "cerah"', color: 'blk-blue' },
      { id: 'd', text: 'PRINT "Main di lapangan"', color: 'blk-green' },
      { id: 'e', text: 'ELSE', color: 'blk-yellow' },
      { id: 'f', text: 'PRINT "Main di dalam rumah"', color: 'blk-green' },
      { id: 'g', text: 'END', color: 'blk-gray' }
    ],
    order: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
  },
  4: {
    title: 'Tantangan 4 — Angka Genap atau Ganjil',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Sedang', 'Hint tersedia', '⭐ Maks 10 poin'],
    konsep: 'Conditional + Variabel',
    blockCount: 6,
    story: 'Robot ingin tahu apakah angka <strong>8</strong> itu genap atau ganjil. Bantuin robot buat kondisinya ya! Ingat: angka genap habis dibagi 2 (sisa = 0).',
    hints: [
      'Coba pikirkan — ketika kita bilang angka genap, apa yang terjadi kalau angka itu dibagi 2?',
      'Kondisi IF angka % 2 == 0 artinya "Jika sisa bagi angka dengan 2 sama dengan nol". Diawali dengan menyimpan angkanya dulu.',
      'Urutan lengkap: <strong>angka = 8</strong> → <strong>IF angka % 2 == 0</strong> → <strong>PRINT "Genap"</strong> → <strong>ELSE</strong> → <strong>PRINT "Ganjil"</strong> → <strong>END</strong>.'
    ],
    blocks: [
      { id: 'a', text: 'angka = 8', color: 'blk-pink' },
      { id: 'b', text: 'IF angka % 2 == 0', color: 'blk-blue' },
      { id: 'c', text: 'PRINT "Genap"', color: 'blk-green' },
      { id: 'd', text: 'ELSE', color: 'blk-yellow' },
      { id: 'e', text: 'PRINT "Ganjil"', color: 'blk-pink' },
      { id: 'f', text: 'END', color: 'blk-gray' }
    ],
    order: ['a', 'b', 'c', 'd', 'e', 'f']
  },
  5: {
    title: 'Tantangan 5 — Budi Memberi Makan Ikan',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Sulit', 'Hint tersedia', '⭐ Maks 15 poin'],
    konsep: 'Loop + Conditional',
    blockCount: 8,
    story: 'Budi punya 3 ikan! Beri makan setiap ikan satu per satu menggunakan <strong>perulangan (FOR)</strong>. Setiap ikan yang diberi makan akan senang.',
    hints: [
      'Program perulangan dimulai dengan menyimpan jumlah ikan. Variabel apa yang perlu disiapkan pertama?',
      'Blok FOR digunakan untuk mengulang. Di dalam FOR, ada aksi memberi makan dan kondisi IF untuk mengecek.',
      'Urutan: <strong>jumlah_ikan = 3</strong> → <strong>FOR i = 1 TO jumlah_ikan</strong> → <strong>PRINT "Makan ikan"</strong> → <strong>makan = TRUE</strong> → <strong>IF makan == TRUE</strong> → <strong>PRINT "Ikan senang!"</strong> → <strong>END IF</strong> → <strong>END FOR</strong>.'
    ],
    blocks: [
      { id: 'a', text: 'jumlah_ikan = 3', color: 'blk-pink' },
      { id: 'b', text: 'FOR i = 1 TO jumlah_ikan', color: 'blk-blue' },
      { id: 'c', text: 'PRINT "Makan ikan " + i', color: 'blk-green' },
      { id: 'd', text: 'makan = TRUE', color: 'blk-yellow' },
      { id: 'e', text: 'IF makan == TRUE', color: 'blk-blue' },
      { id: 'f', text: 'PRINT "Ikan senang!"', color: 'blk-pink' },
      { id: 'g', text: 'END IF', color: 'blk-gray' },
      { id: 'h', text: 'END FOR', color: 'blk-gray' }
    ],
    order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  },
  6: {
    title: 'Tantangan 6 — Mencetak Sapaan',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Mudah', 'Hint tersedia', '⭐ Maks 5 poin'],
    konsep: 'Variabel + Print',
    blockCount: 4,
    story: 'Ani ingin menyapa temannya. Dia harus menyimpan nama teman ke variabel, lalu mencetaknya di layar. Bantu Ani ya!',
    hints: [
      'Langkah pertama selalu menyimpan data ke variabel dulu.',
      'Setelah menyimpan nama, gabungkan teks sapaan dengan variabel nama.',
      'Urutan: <strong>nama = "Budi"</strong> → <strong>sapaan = "Halo, " + nama</strong> → <strong>PRINT sapaan</strong> → <strong>END</strong>.'
    ],
    blocks: [
      { id: 'a', text: 'nama = "Budi"', color: 'blk-pink' },
      { id: 'b', text: 'sapaan = "Halo, " + nama', color: 'blk-green' },
      { id: 'c', text: 'PRINT sapaan', color: 'blk-blue' },
      { id: 'd', text: 'END', color: 'blk-gray' }
    ],
    order: ['a', 'b', 'c', 'd']
  },
  7: {
    title: 'Tantangan 7 — Hitung Mundur Roket',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Sedang', 'Hint tersedia', '⭐ Maks 10 poin'],
    konsep: 'While Loop',
    blockCount: 6,
    story: 'Roket akan diluncurkan! Kita harus menghitung mundur dari <strong>3</strong> sampai <strong>1</strong>, lalu cetak "Luncurkan!". Gunakan perulangan WHILE!',
    hints: [
      'Mulai dengan menyimpan angka hitung mundur. Dari angka berapa kita mulai?',
      'WHILE loop berjalan selama kondisi benar. Kita hitung mundur, jadi angka harus > 0.',
      'Urutan: <strong>angka = 3</strong> → <strong>WHILE angka > 0</strong> → <strong>PRINT angka</strong> → <strong>angka = angka - 1</strong> → <strong>END WHILE</strong> → <strong>PRINT "Luncurkan!"</strong>.'
    ],
    blocks: [
      { id: 'a', text: 'angka = 3', color: 'blk-pink' },
      { id: 'b', text: 'WHILE angka > 0', color: 'blk-blue' },
      { id: 'c', text: 'PRINT angka', color: 'blk-green' },
      { id: 'd', text: 'angka = angka - 1', color: 'blk-yellow' },
      { id: 'e', text: 'END WHILE', color: 'blk-gray' },
      { id: 'f', text: 'PRINT "Luncurkan!"', color: 'blk-pink' }
    ],
    order: ['a', 'b', 'c', 'd', 'e', 'f']
  },
  8: {
    title: 'Tantangan 8 — Fungsi Luas Persegi',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Sedang', 'Hint tersedia', '⭐ Maks 10 poin'],
    konsep: 'Function',
    blockCount: 5,
    story: 'Kita akan membuat <strong>fungsi</strong> untuk menghitung luas persegi. Fungsi menerima panjang sisi, lalu mengembalikan hasilnya!',
    hints: [
      'Fungsi dimulai dengan kata kunci FUNCTION diikuti nama dan parameter.',
      'Di dalam fungsi, hitung luas = sisi × sisi, lalu RETURN hasilnya.',
      'Urutan: <strong>FUNCTION hitungLuas(sisi)</strong> → <strong>luas = sisi * sisi</strong> → <strong>RETURN luas</strong> → <strong>END FUNCTION</strong> → <strong>PRINT hitungLuas(5)</strong>.'
    ],
    blocks: [
      { id: 'a', text: 'FUNCTION hitungLuas(sisi)', color: 'blk-blue' },
      { id: 'b', text: 'luas = sisi * sisi', color: 'blk-green' },
      { id: 'c', text: 'RETURN luas', color: 'blk-yellow' },
      { id: 'd', text: 'END FUNCTION', color: 'blk-gray' },
      { id: 'e', text: 'PRINT hitungLuas(5)', color: 'blk-pink' }
    ],
    order: ['a', 'b', 'c', 'd', 'e']
  },
  9: {
    title: 'Tantangan 9 — Daftar Belanja',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Sedang', 'Hint tersedia', '⭐ Maks 10 poin'],
    konsep: 'Array + Loop',
    blockCount: 5,
    story: 'Ibu mau belanja! Kita simpan daftar belanjaan di <strong>array</strong>, lalu cetak satu per satu pakai perulangan FOR.',
    hints: [
      'Array adalah daftar data. Buat array berisi barang belanjaan terlebih dahulu.',
      'Gunakan FOR untuk mencetak setiap item di dalam array.',
      'Urutan: <strong>belanja = ["Roti", "Susu", "Telur"]</strong> → <strong>FOR item IN belanja</strong> → <strong>PRINT item</strong> → <strong>END FOR</strong> → <strong>PRINT "Selesai!"</strong>.'
    ],
    blocks: [
      { id: 'a', text: 'belanja = ["Roti", "Susu", "Telur"]', color: 'blk-pink' },
      { id: 'b', text: 'FOR item IN belanja', color: 'blk-blue' },
      { id: 'c', text: 'PRINT item', color: 'blk-green' },
      { id: 'd', text: 'END FOR', color: 'blk-gray' },
      { id: 'e', text: 'PRINT "Selesai!"', color: 'blk-yellow' }
    ],
    order: ['a', 'b', 'c', 'd', 'e']
  },
  10: {
    title: 'Tantangan 10 — Diskon Toko Online',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Sulit', 'Hint tersedia', '⭐ Maks 15 poin'],
    konsep: 'Nested Conditional',
    blockCount: 8,
    story: 'Toko online memberikan diskon! Jika total belanja <strong>lebih dari 100000</strong>, dapat diskon 20%. Jika <strong>lebih dari 50000</strong>, diskon 10%. Selain itu, tidak ada diskon.',
    hints: [
      'Pertama simpan total belanja. Lalu cek kondisi dari yang terbesar dulu (> 100000).',
      'IF-ELSE IF-ELSE digunakan untuk mengecek beberapa kondisi berurutan. Kondisi terbesar dicek duluan.',
      'Urutan: <strong>total = 150000</strong> → <strong>IF total > 100000</strong> → <strong>diskon = total * 0.2</strong> → <strong>ELSE IF total > 50000</strong> → <strong>diskon = total * 0.1</strong> → <strong>ELSE</strong> → <strong>diskon = 0</strong> → <strong>PRINT "Diskon: " + diskon</strong>.'
    ],
    blocks: [
      { id: 'a', text: 'total = 150000', color: 'blk-pink' },
      { id: 'b', text: 'IF total > 100000', color: 'blk-blue' },
      { id: 'c', text: 'diskon = total * 0.2', color: 'blk-green' },
      { id: 'd', text: 'ELSE IF total > 50000', color: 'blk-blue' },
      { id: 'e', text: 'diskon = total * 0.1', color: 'blk-yellow' },
      { id: 'f', text: 'ELSE', color: 'blk-yellow' },
      { id: 'g', text: 'diskon = 0', color: 'blk-gray' },
      { id: 'h', text: 'PRINT "Diskon: " + diskon', color: 'blk-pink' }
    ],
    order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  },
  11: {
    title: 'Tantangan 11 — CSS Selector Dasar',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Mudah', 'Hint tersedia', '⭐ Maks 10 poin'],
    konsep: 'CSS Selector',
    blockCount: 4,
    story: 'Kami ingin mengubah warna teks h1 menjadi merah. Susunlah kode CSS dengan benar! Yuk belajar CSS Selector! Kamu perlu memilih elemen h1 terlebih dahulu.',
    hints: [
      'Mulai dengan memilih elemen h1',
      'Setelah selector, kita perlu buka kurung kurawal {',
      'Taruh properti color: red; di dalam kurung kurawal'
    ],
    blocks: [
      { id: 'a', text: 'h1', color: 'blk-blue' },
      { id: 'b', text: '{', color: 'blk-gray' },
      { id: 'c', text: 'color: red;', color: 'blk-green' },
      { id: 'd', text: '}', color: 'blk-gray' }
    ],
    order: ['a', 'b', 'c', 'd']
  },
  12: {
    title: 'Tantangan 12 — Struktur HTML Dasar',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Mudah', 'Hint tersedia', '⭐ Maks 15 poin'],
    konsep: 'HTML Structure',
    blockCount: 5,
    story: 'Buat struktur HTML yang benar untuk sebuah halaman web! Struktur HTML adalah fondasi setiap website. Mari kita bangun bersama!',
    hints: [
      'DOCTYPE harus berada di paling atas',
      'Buka html tag setelah DOCTYPE',
      'Head dan body berada di dalam html'
    ],
    blocks: [
      { id: 'a', text: '&lt;!DOCTYPE html&gt;', color: 'blk-blue' },
      { id: 'b', text: '&lt;html&gt;', color: 'blk-green' },
      { id: 'c', text: '&lt;head&gt;&lt;/head&gt;', color: 'blk-pink' },
      { id: 'd', text: '&lt;body&gt;&lt;/body&gt;', color: 'blk-yellow' },
      { id: 'e', text: '&lt;/html&gt;', color: 'blk-gray' }
    ],
    order: ['a', 'b', 'c', 'd', 'e']
  },
  13: {
    title: 'Tantangan 13 — Deklarasi Variabel JavaScript',
    sub: 'Seret blok kode ke urutan yang benar',
    meta: ['Mudah', 'Hint tersedia', '⭐ Maks 10 poin'],
    konsep: 'JavaScript Variables',
    blockCount: 5,
    story: 'Deklarasikan variabel dengan nilai yang benar! Variabel adalah tempat menyimpan data. Mari buat variabel dengan baik!',
    hints: [
      'Gunakan "let" untuk mendeklarasikan variabel',
      'Setelah "let", tulis nama variabel',
      'Gunakan = untuk memberi nilai'
    ],
    blocks: [
      { id: 'a', text: 'let', color: 'blk-blue' },
      { id: 'b', text: 'nama', color: 'blk-green' },
      { id: 'c', text: '=', color: 'blk-yellow' },
      { id: 'd', text: '"Budi"', color: 'blk-pink' },
      { id: 'e', text: ';', color: 'blk-gray' }
    ],
    order: ['a', 'b', 'c', 'd', 'e']
  }
};

/* ── Drag & Drop Workspace ── */
let dragId = null, slotData = {};
let currentChallengeId = 4;
let correctOrder = [];
let blockText = {};

function initDragAndDrop() {
  document.querySelectorAll('.block').forEach(b => {
    b.addEventListener('dragstart', e => {
      dragId = b.dataset.id;
      e.dataTransfer.effectAllowed = 'move';
    });
  });
  document.querySelectorAll('.slot').forEach(slot => {
    // try to remove existing listeners to prevent duplicates if called multiple times,
    // though simplest is replacing the slots entirely before calling this (which we do).
    slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('filled') });
    slot.addEventListener('dragleave', () => { if (!slotData[slot.dataset.slot]) slot.classList.remove('filled') });
    slot.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragId) return;
      const sn = slot.dataset.slot;
      Object.keys(slotData).forEach(k => { if (slotData[k] === dragId) { delete slotData[k]; document.querySelector('.slot[data-slot="' + k + '"]').textContent = 'Seret blok ke sini...'; document.querySelector('.slot[data-slot="' + k + '"]').classList.remove('filled', 'correct', 'wrong'); } });
      slotData[sn] = dragId;
      slot.textContent = blockText[dragId].text;
      slot.classList.add('filled');
      dragId = null;
      updateCodePreview();
    });
  });
}

let currentChallengePointsRemaining = 10;

/* ── Persist / Load Data ── */
function saveChallengeData() {
  localStorage.setItem('codekids_challenges', JSON.stringify(challengeData));
}
function saveQuizData() {
  localStorage.setItem('codekids_quiz', JSON.stringify(qs));
}
(function loadStoredData() {
  try {
    const sc = localStorage.getItem('codekids_challenges');
    if (sc) challengeData = JSON.parse(sc);
  } catch(e) {}
})();

function loadChallenge(id) {
  if (!challengeData[id]) return;
  currentChallengeId = id;

  // if not on workspace page, redirect FIRST before mutating DOM
  if (!window.location.pathname.endsWith('workspace.html')) {
    window.location.href = 'workspace.html?id=' + id;
    return;
  }

  const c = challengeData[id];
  document.querySelector('.ws-title').innerHTML = c.title;
  document.querySelector('.ws-sub').innerHTML = c.sub;
  
  // Extract max points from meta (e.g. "⭐ Maks 10 poin")
  let maxPts = 10;
  const ptsMeta = c.meta.find(m => m.includes('Maks'));
  if (ptsMeta) {
    const match = ptsMeta.match(/\d+/);
    if (match) maxPts = parseInt(match[0]);
  }
  currentChallengePointsRemaining = maxPts;

  const metaHtml = c.meta.map((m, i) => {
    if (i===0) return `<span class="ws-tag" style="background:var(--war-lt);color:#b37800">${m}</span>`;
    if (i===1) return `<span class="ws-tag" style="background:var(--pri-lt);color:var(--pri)">${m}</span>`;
    return `<span class="ws-tag" style="background:var(--suc-lt);color:#059669">${m}</span>`;
  }).join('');
  document.querySelector('.ws-meta').innerHTML = metaHtml;
  document.querySelector('.story-bubble').innerHTML = c.story;

  // Render pool (shuffle it slightly for fun, or keep static. For simplicity, static)
  const poolHtml = c.blocks.map(b => `<span class="block ${b.color}" draggable="true" data-id="${b.id}">${b.text}</span>`).join('');
  document.getElementById('pool').innerHTML = poolHtml;

  // Render slots
  const slotsHtml = c.order.map((_, idx) => `
    <div class="slot-row">
      <div class="slot-num">${idx + 1}</div>
      <div class="slot" data-slot="${idx + 1}">Seret blok ke sini...</div>
    </div>`).join('');
  document.getElementById('slots').innerHTML = slotsHtml;

  correctOrder = c.order;
  blockText = {};
  c.blocks.forEach(b => blockText[b.id] = b);
  slotData = {};

  document.getElementById('codePreview').innerHTML = '<span class="code-comment"># Kode kamu akan muncul di sini saat kamu menyusun blok...</span>';
  
  initDragAndDrop();
}

function updateCodePreview() {
  const lines = [];
  for (let i = 1; i <= correctOrder.length; i++) { 
    const d = slotData[i]; 
    if (d) lines.push(blockText[d].text); 
  }
  if (!lines.length) { document.getElementById('codePreview').innerHTML = '<span class="code-comment"># Kode kamu akan muncul di sini...</span>'; return; }
  document.getElementById('codePreview').innerHTML = lines.map(l => {
    if (l.includes('IF')) return '<span class="code-kw">' + l.replace('IF', 'IF') + '</span>';
    if (l.includes('ELSE')) return '<span class="code-kw">ELSE</span>';
    if (l.includes('END')) return '<span class="code-kw">END</span>';
    if (l.includes('FOR')) return '<span class="code-kw">' + l + '</span>';
    if (l.includes('PRINT')) return l.replace('PRINT', '<span class="code-kw">PRINT</span>').replace(/".*"/g, '<span class="code-str">$&</span>');
    if (/\d+/.test(l)) return l.replace(/\d+/, '<span class="code-num">$&</span>');
    return l;
  }).join('\n');
}

function resetSlots() {
  slotData = {};
  document.querySelectorAll('.slot').forEach(s => {
    s.textContent = 'Seret blok ke sini...';
    s.className = 'slot';
  });
  document.getElementById('codePreview').innerHTML = '<span class="code-comment"># Kode kamu akan muncul di sini saat kamu menyusun blok...</span>';
}

function checkAnswer() {
  const filled = Object.keys(slotData);
  if (filled.length < correctOrder.length) { alert('Isi semua ' + correctOrder.length + ' slot dulu ya!'); return; }
  let correct = true;
  for (let i = 1; i <= correctOrder.length; i++) { if (slotData[i] !== correctOrder[i - 1]) { correct = false; break; } }
  document.querySelectorAll('.slot').forEach(s => {
    const sn = parseInt(s.dataset.slot);
    if (slotData[sn]) { s.classList.toggle('correct', slotData[sn] === correctOrder[sn - 1]); s.classList.toggle('wrong', slotData[sn] !== correctOrder[sn - 1]); }
  });
  showFeedback(correct);
}

/* ── Feedback ── */
function showFeedback(ok) {
  document.getElementById('fbIcon').textContent = '';
  document.getElementById('fbTitle').textContent = ok ? 'Jawaban Benar!' : 'Belum Tepat...';
  document.getElementById('fbMsg').textContent = ok ? 'Kode kamu sudah benar! Luar biasa!' : 'Ada blok yang posisinya terbalik. Yuk coba lagi!';

  if (ok) {
    document.getElementById('fbPts').textContent = '+' + currentChallengePointsRemaining + ' Poin ⭐';
    addPointsToServer(currentChallengePointsRemaining);
    userPoints += currentChallengePointsRemaining;
    localStorage.setItem('codekids_pts', userPoints);
    updateScoreUI();
    // prevent farming points on same challenge by setting remaining to 0
    currentChallengePointsRemaining = 0;
  } else {
    document.getElementById('fbPts').textContent = 'Coba lagi untuk dapat poin!';

    // Otomatis buka hint setelah 2 detik
    setTimeout(() => {
      closeFeedback();
      openHintModal();
    }, 2000);
  }

  document.getElementById('feedbackOverlay').classList.add('show');
}
function closeFeedback() { document.getElementById('feedbackOverlay').classList.remove('show'); }

/* ── Hint System ── */
let hintLevel = 1;

function openHintModal() {
  document.getElementById('hintOverlay').classList.add('show');
  
  // Reset UI state
  hintLevel = 1;
  document.getElementById('hb1').classList.add('show');
  document.getElementById('hb2').classList.remove('show');
  document.getElementById('hb3').classList.remove('show');
  document.getElementById('hbSol').classList.remove('show');
  document.getElementById('hs1').className = 'hint-step done active';
  document.getElementById('hs2').className = 'hint-step';
  document.getElementById('hs3').className = 'hint-step';
  
  document.getElementById('btnH2').style.display = 'inline-flex';
  document.getElementById('btnH3').style.display = 'none';
  document.getElementById('btnSol').style.display = 'none';
  document.getElementById('hintCount').textContent = 'Hint 1 dari 3 terbuka';

  // Make text dynamic based on challenge
  const c = challengeData[currentChallengeId];
  if (c) {
    const hints = c.hints || [
      `Ingat prinsip dasar: ${c.story} Coba cek urutan pertama secara logis.`,
      `Pastikan blok disusun berurutan dari atas ke bawah. Ingat bahwa komputer selalu mengeksekusi dari baris pertama.`,
      `Perhatikan letak blok yang kamu geser. Blok-blok ini adalah: ${c.blocks.map(b => b.text).slice(0, 2).join(' dan ')}... Terus sempurnakan urutannya!`
    ];
    document.getElementById('hb1').innerHTML = `<strong>Hint 1:</strong> ${hints[0]}`;
    document.getElementById('hb2').innerHTML = `<strong>Hint 2:</strong> ${hints[1]}`;
    document.getElementById('hb3').innerHTML = `<strong>Hint 3:</strong> ${hints[2]}`;
    document.getElementById('hbSol').innerHTML = `<strong>Solusi Lengkap:</strong><br><pre style="background:#d1fae5;border-radius:6px;padding:10px;margin-top:8px;font-size:12px;font-family:'Courier New',monospace">${c.order.map(id => c.blocks.find(b => b.id === id).text).join('\n')}</pre><span style="font-size:12px;color:var(--muted)">Sekarang kamu sudah tahu urutannya! Yuk kembali!</span>`;
  }
}

function closeHintModal() {
  document.getElementById('hintOverlay').classList.remove('show');
}

function showHint(n) {
  hintLevel = n;
  
  // Deduct points for using hints!
  if (n === 2 && currentChallengePointsRemaining > 2) currentChallengePointsRemaining -= 2;
  if (n === 3 && currentChallengePointsRemaining > 2) currentChallengePointsRemaining -= 2;

  document.getElementById('hb' + n).classList.add('show');
  document.getElementById('hs' + n).classList.add('done');
  if (n < 3) { document.getElementById('hs' + (n)).classList.add('active'); }
  if (n === 2) { document.getElementById('btnH2').style.display = 'none'; document.getElementById('btnH3').style.display = 'inline-flex'; }
  if (n === 3) { document.getElementById('btnH3').style.display = 'none'; document.getElementById('btnSol').style.display = 'inline-flex'; }
  document.getElementById('hintCount').textContent = 'Hint ' + n + ' dari 3 terbuka';
}
function showSolution() {
  currentChallengePointsRemaining = 1;
  document.getElementById('hbSol').classList.add('show');
  document.getElementById('btnSol').style.display = 'none';
  document.getElementById('hintCount').textContent = 'Solusi ditampilkan (Poin sisa: 1)';
}

/* ── Quiz ── */
let qs = [
  { q: 'Apa yang dimaksud dengan "urutan" dalam pemrograman?', opts: ['Instruksi yang dijalankan secara acak', 'Instruksi yang dijalankan dari atas ke bawah secara berurutan', 'Instruksi yang hanya dijalankan jika kondisi benar', 'Instruksi yang diulang terus menerus'], ans: 1 },
  { q: 'Simbol "IF" dalam pemrograman digunakan untuk apa?', opts: ['Mengulang instruksi', 'Mencetak teks', 'Membuat kondisi/percabangan', 'Menyimpan angka'], ans: 2 },
  { q: 'Jika angka = 6 dan kondisi adalah angka % 2 == 0, maka kondisinya...', opts: ['SALAH, karena 6 ganjil', 'BENAR, karena 6 genap (6÷2=3, sisa 0)', 'SALAH, karena 6 tidak habis dibagi 3', 'Tidak bisa ditentukan'], ans: 1 },
  { q: 'Apa yang terjadi jika urutan blok kode ditulis terbalik?', opts: ['Tidak ada masalah', 'Program tetap berjalan normal', 'Program mungkin memberikan hasil yang salah', 'Program lebih cepat'], ans: 2 },
  { q: 'Blok "ELSE" digunakan untuk...', opts: ['Mengakhiri program', 'Menjalankan instruksi jika kondisi IF tidak terpenuhi', 'Mendefinisikan variabel', 'Mengulangi instruksi'], ans: 1 }
];
(function loadStoredQuiz() {
  try { const sq = localStorage.getItem('codekids_quiz'); if (sq) qs = JSON.parse(sq); } catch(e) {}
})();
let curQ = 0, score = 0, answered = false;
function selectOpt(el, isRight) {
  if (answered) return;
  answered = true;
  const opts = document.querySelectorAll('.quiz-opt');
  opts.forEach((o, i) => { if (i === qs[curQ].ans) o.classList.add('correct'); });
  if (!isRight) el.classList.add('wrong'); else { score++; el.classList.add('correct'); }
  document.getElementById('btnNext').disabled = false;
}
function nextQ() {
  curQ++;
  if (curQ >= qs.length) {
    document.querySelector('.quiz-wrapper').innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:24px;font-weight:900;color:var(--dk);margin-bottom:8px">Kuis Selesai!</div>
        <div style="font-size:14px;color:var(--muted);margin-bottom:20px">Kamu menjawab benar <strong style="color:var(--pri)">${score} dari 5</strong> soal</div>
        <div class="fb-pts" style="display:inline-block;margin-bottom:24px">+${score * 10} Poin ⭐</div>
        <div><button class="btn btn-primary btn-lg" onclick="endQuiz()">Kembali ke Daftar Tantangan</button></div>
      </div>`;
    return;
  }
  answered = false;
  const d = qs[curQ];
  document.getElementById('quizQ').textContent = d.q;
  document.getElementById('quizCounter').textContent = 'Soal ' + (curQ + 1) + ' dari 5';
  document.getElementById('quizBar').style.width = ((curQ + 1) / 5 * 100) + '%';
  document.getElementById('quizOpts').innerHTML = d.opts.map((o, i) => `
    <button class="quiz-opt" onclick="selectOpt(this,${i === d.ans})">
      <div class="opt-letter">${['A', 'B', 'C', 'D'][i]}</div>${o}
    </button>`).join('');
  document.getElementById('btnNext').disabled = true;
}

function startQuiz() {
  const u = JSON.parse(localStorage.getItem('auth_user') || '{}');
  if (u.role === 'admin' || u.role === 'guru') {
    alert("Maaf, Admin dan Guru tidak bisa mulai kuis, khusus Siswa saja.");
    return;
  }
  document.getElementById('p-challenges').style.display = 'none';
  document.getElementById('p-quiz').style.display = 'block';
  document.getElementById('pageTitle').textContent = 'Kuis Mini';
}

function endQuiz() {
  document.getElementById('p-challenges').style.display = 'block';
  document.getElementById('p-quiz').style.display = 'none';
  document.getElementById('pageTitle').textContent = 'Daftar Tantangan';
}

/* ── Locked System ── */
function showLockedPopup(id) {
  let overlay = document.getElementById('lockedOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';
    overlay.id = 'lockedOverlay';
    overlay.innerHTML = `
      <div class="feedback-card" style="animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
        <span class="fb-icon" style="background:#ffebee;color:#d32f2f"></span>
        <div class="fb-title">Level Terkunci!</div>
        <div class="fb-msg" id="lockedMsg">Harap selesaikan level sebelumnya!</div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
          <button class="btn btn-primary" onclick="document.getElementById('lockedOverlay').classList.remove('show')">Kembali</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  document.getElementById('lockedMsg').textContent = 'Kamu harus menyelesaikan Tantangan ' + (id - 1) + ' terlebih dahulu untuk membuka Tantangan ' + id + '. Semangat!';
  overlay.classList.add('show');
}

/* ── Render Challenges List ── */
function renderChallengesList() {
  const grid = document.getElementById('challenges-grid');
  if (!grid) return;
  
  // Progress tracker per account
  const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const email = user.email || 'guest';
  const progressKey = 'quiz_progress_' + email;
  const completedLevels = JSON.parse(localStorage.getItem(progressKey) || '[]');
  
  const statusMap = {};
  let nextUnlocked = 1;

  for (let id = 1; id <= Object.keys(challengeData).length; id++) {
     if (completedLevels.includes(id) || completedLevels.includes(String(id))) {
         statusMap[id] = 'done';
         nextUnlocked = Math.max(nextUnlocked, id + 1); // Unlocks the next one
     } else {
         statusMap[id] = 'locked';
     }
  }
  // unlock the next one available
  if (nextUnlocked <= Object.keys(challengeData).length) {
     statusMap[nextUnlocked] = '';
  }

  const levelClassMap = { 'Mudah': 'cb-easy', 'Sedang': 'cb-med', 'Sulit': 'cb-hard' };
  
  grid.innerHTML = Object.keys(challengeData).map(idStr => {
    const id = parseInt(idStr);
    const c = challengeData[id];
    const status = statusMap[id] || '';
    const levelWord = (c.meta[0].match(/Mudah|Sedang|Sulit/) || ['Mudah'])[0];
    const levelClass = levelClassMap[levelWord] || 'cb-easy';
    const numColor = status === 'done' ? 'c-green' : status === 'locked' ? 'c-pink' : 'c-blue';
    const numLabel = status === 'done' ? '✓' : status === 'locked' ? 'X' : id;
    const onClick = status === 'locked' ? `showLockedPopup(${id})` : `openWorkspace(${id})`;
    
    const stars = [1, 2, 3].map(s => {
      const lit = (status === 'done') ? 'lit' : '';
      return `<span class="star ${lit}">⭐</span>`;
    }).join('');

    const actionBtn = status === 'locked' 
      ? `<button class="btn btn-outline btn-sm" disabled style="width:100%">Terkunci</button>`
      : `<button class="btn btn-primary btn-sm" onclick="openWorkspace(${id})" style="width:100%">Mulai Belajar</button>`;

    return `
    <div class="challenge-card ${status}">
      <div class="cc-header" onclick="${onClick}" style="cursor:pointer">
        <div class="c-num ${numColor}">${numLabel}</div>
        <div class="c-info">
          <div class="c-title">${c.title}</div>
          <div class="c-sub">${c.konsep || c.sub} • ${c.blockCount || c.blocks.length} blok</div>
        </div>
      </div>
      <div class="cc-meta">
        <span class="c-badge ${levelClass}">${levelWord}</span>
        <div class="star-row">${stars}</div>
      </div>
      ${actionBtn}
    </div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isWorkspace = path.includes('workspace');
  let p = 'dashboard';
  if (path.includes('challenges') || isWorkspace) p = 'quiz';
  if (path.includes('badges')) p = 'badges';
  if (path.includes('quiz')) p = 'quiz';
  if (path.includes('admin')) p = 'admin';

  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = isWorkspace ? pages['workspace'] : (pages[p] || p);

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
    if (el.getAttribute('onclick') && el.getAttribute('onclick').includes("'" + p + "'"))
      el.classList.add('active');
  });

  // Auto-load challenge in workspace from URL param
  if (isWorkspace) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      loadChallenge(parseInt(id));
    } else {
      loadChallenge(4); // default
    }
  }

  // Render challenges list page dynamically
  renderChallengesList();
  updateScoreUI();

  // Persist data to localStorage for admin panel
  saveChallengeData();
  saveQuizData();
});

/* ── Workspace Integration ── */
function openWorkspace(challengeId) {
  const u = JSON.parse(localStorage.getItem('auth_user') || '{}');
  if (u.role === 'admin' || u.role === 'guru') {
    alert("Maaf, Admin dan Guru tidak bisa mulai belajar, khusus Siswa saja.");
    return;
  }
  
  // Simpan challenge ID ke localStorage
  localStorage.setItem('current_challenge_id', challengeId);
  localStorage.setItem('challenge_title', challengeData[challengeId].title);
  localStorage.setItem('challenge_story', challengeData[challengeId].story);
  localStorage.setItem('challenge_blocks', JSON.stringify(challengeData[challengeId].blocks));
  localStorage.setItem('challenge_order', JSON.stringify(challengeData[challengeId].order));
  localStorage.setItem('challenge_hints', JSON.stringify(challengeData[challengeId].hints));
  
  // Redirect ke workspace
  window.location.href = '/murid/workspace.html?challenge=' + challengeId;
}

// ══ ADD POINTS TO SERVER ══
function addPointsToServer(points) {
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('auth_user') || '{}');

  // Check user role - only murid can earn points
  if (user.role && user.role !== 'user') {
    console.warn('Hanya murid yang bisa mendapatkan poin');
    return;
  }

  if (!token) {
    console.warn('Tidak ada token autentikasi, poin hanya disimpan di localStorage');
    return;
  }

  fetch('http://localhost:5000/api/points/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, points })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('Poin berhasil ditambahkan ke server:', data.new_points);
    } else {
      console.warn('Gagal menambahkan poin ke server:', data.message);
    }
  })
  .catch(err => {
    console.warn('Error menambahkan poin ke server:', err);
  });
}
