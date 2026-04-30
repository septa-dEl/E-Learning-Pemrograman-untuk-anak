// ═══════════════════════════════════════════════════════
// CodeKids — Workspace Challenge System
// Challenge workspace dengan drag-drop dan hint AI
// ═══════════════════════════════════════════════════════

// ══ STATE ══
let currentChallenge = null;
let userSlots = [];
let hintLevel = 0;
let wrongAttempts = 0; // Menghitung berapa kali user salah jawab
let userPoints = parseInt(localStorage.getItem('codekids_pts') || '340');

// ══ UPDATE SCORE UI ══
function updateScoreUI() {
  document.querySelectorAll('.badge-pts, .user-pts').forEach(el => {
    el.textContent = '⭐ ' + userPoints + ' poin';
  });
}

// ══ LIGHT SHUFFLE FUNCTION ══
function lightShuffle(array) {
  const result = [...array];
  // Acak hanya beberapa posisi saja (tidak semua)
  const shuffleCount = Math.min(3, Math.floor(array.length / 2)); // Acak maksimal 3 posisi atau setengah panjang array

  for (let i = 0; i < shuffleCount; i++) {
    const idx1 = Math.floor(Math.random() * result.length);
    const idx2 = Math.floor(Math.random() * result.length);
    // Tukar posisi
    [result[idx1], result[idx2]] = [result[idx2], result[idx1]];
  }

  return result;
}

// ══ DATA TANTANGAN ══
const challenges = {
  "css-selector": {
    title: "CSS Selector Dasar",
    difficulty: "Mudah",
    context: "Kami ingin mengubah warna teks h1 menjadi merah. Susunlah kode CSS dengan benar!",
    story: "Yuk belajar CSS Selector! Kamu perlu memilih elemen h1 terlebih dahulu.",
    blocks: [
      { id: "b1", code: "h1", type: "selector" },
      { id: "b2", code: "{", type: "bracket" },
      { id: "b3", code: "color: red;", type: "property" },
      { id: "b4", code: "}", type: "bracket" }
    ],
    correctOrder: ["b1", "b2", "b3", "b4"],
    hints: [
      "Mulai dengan memilih elemen h1",
      "Setelah selector, kita perlu buka kurung kurawal {",
      "Taruh properti color: red; di dalam kurung kurawal"
    ],
    solution: "h1 { color: red; }",
    points: 10
  },
  
  "html-structure": {
    title: "Struktur HTML Dasar",
    difficulty: "Mudah",
    context: "Buat struktur HTML yang benar untuk sebuah halaman web!",
    story: "Struktur HTML adalah fondasi setiap website. Mari kita bangun bersama!",
    blocks: [
      { id: "h1", code: "&lt;!DOCTYPE html&gt;", type: "tag" },
      { id: "h2", code: "&lt;html&gt;", type: "tag" },
      { id: "h3", code: "&lt;head&gt;&lt;/head&gt;", type: "tag" },
      { id: "h4", code: "&lt;body&gt;&lt;/body&gt;", type: "tag" },
      { id: "h5", code: "&lt;/html&gt;", type: "tag" }
    ],
    correctOrder: ["h1", "h2", "h3", "h4", "h5"],
    hints: [
      "DOCTYPE harus berada di paling atas",
      "Buka html tag setelah DOCTYPE",
      "Head dan body berada di dalam html"
    ],
    solution: "<!DOCTYPE html>\n<html>\n<head></head>\n<body></body>\n</html>",
    points: 15
  },

  "js-variables": {
    title: "Deklarasi Variabel JavaScript",
    difficulty: "Mudah",
    context: "Deklarasikan variabel dengan nilai yang benar!",
    story: "Variabel adalah tempat menyimpan data. Mari buat variabel dengan baik!",
    blocks: [
      { id: "j1", code: "let", type: "keyword" },
      { id: "j2", code: "nama", type: "variable" },
      { id: "j3", code: "=", type: "operator" },
      { id: "j4", code: "\"Budi\"", type: "string" },
      { id: "j5", code: ";", type: "punctuation" }
    ],
    correctOrder: ["j1", "j2", "j3", "j4", "j5"],
    hints: [
      "Gunakan 'let' untuk mendeklarasikan variabel",
      "Setelah 'let', tulis nama variabel",
      "Gunakan = untuk memberi nilai"
    ],
    solution: "let nama = \"Budi\";",
    points: 10
  }
};

// ══ INISIALISASI ══
document.addEventListener('DOMContentLoaded', function() {
  updateScoreUI();
  
  // Cek apakah ada challenge dari quiz yang tersimpan di localStorage
  const storedTitle = localStorage.getItem('challenge_title');
  const storedBlocks = localStorage.getItem('challenge_blocks');
  const storedOrder = localStorage.getItem('challenge_order');
  const storedHints = localStorage.getItem('challenge_hints');
  const storedStory = localStorage.getItem('challenge_story');
  
  if (storedTitle && storedBlocks && storedOrder && storedHints) {
    // Load dari quiz
    currentChallenge = {
      title: storedTitle,
      story: storedStory || 'Mari kerjakan tantangan ini dengan sempurna!',
      blocks: JSON.parse(storedBlocks),
      correctOrder: JSON.parse(storedOrder),
      hints: JSON.parse(storedHints),
      points: 10,
      difficulty: 'Tantangan'
    };
    loadChallengeWithData(currentChallenge);
    
    // JANGAN bersihkan localStorage agar bisa di-restore saat refresh
    // Hanya bersihkan saat challenge selesai
  } else {
    // Load default challenge
    loadChallenge('css-selector');
  }
});

// ══ LOAD CHALLENGE ══
function loadChallenge(challengeId) {
  currentChallenge = challenges[challengeId];
  if (!currentChallenge) {
    console.error("Tantangan tidak ditemukan:", challengeId);
    return;
  }

  loadChallengeWithData(currentChallenge);
}

function loadChallengeWithData(challenge) {
  currentChallenge = challenge;
  userSlots = [];
  hintLevel = 0;
  wrongAttempts = 0; // Reset percobaan salah

  // Update header
  document.querySelector('.ws-title').textContent = currentChallenge.title;
  document.querySelector('.ws-meta').textContent = currentChallenge.difficulty || 'Challenge';
  document.querySelector('.story-bubble').textContent = currentChallenge.story;

  // Ambil detail tambahan (hints & penjelasan) dari database
  const chIdStr = localStorage.getItem('current_challenge_id') || 'css-selector';
  fetch('/api/challenges/' + chIdStr)
    .then(r => r.json())
    .then(data => {
        if (data.hints) {
            const h = JSON.parse(data.hints).filter(txt => txt.trim() !== '');
            if (h.length > 0) currentChallenge.hints = h;
        }
        if (data.explanation) currentChallenge.explanation = data.explanation;
    })
    .catch(e => console.log("No DB overrides found"));

  // Render blok pool (acak sedikit)
  const shuffledBlocks = lightShuffle([...currentChallenge.blocks]);
  const poolEl = document.getElementById('pool');
  poolEl.innerHTML = '';
  shuffledBlocks.forEach(block => {
    const blockEl = document.createElement('div');
    blockEl.className = 'drag-block';
    blockEl.draggable = true;
    blockEl.id = 'block-' + block.id;
    blockEl.innerHTML = `<span class="block-code">${block.text || block.code}</span>`;
    blockEl.dataset.blockId = block.id;

    blockEl.addEventListener('dragstart', handleDragStart);
    poolEl.appendChild(blockEl);
  });

  // Setup drop zone
  const slotsEl = document.getElementById('slots');
  slotsEl.innerHTML = '';
  for (let i = 0; i < currentChallenge.blocks.length; i++) {
    const slotEl = document.createElement('div');
    slotEl.className = 'drop-slot';
    slotEl.id = 'slot-' + i;
    slotEl.dataset.index = i;
    slotEl.innerHTML = '<span class="slot-number">' + (i + 1) + '</span>';
    slotEl.addEventListener('dragover', handleDragOver);
    slotEl.addEventListener('drop', handleDrop);
    slotEl.addEventListener('dragleave', handleDragLeave);
    slotsEl.appendChild(slotEl);
  }

  updateCodePreview();
  resetHints();
}

// ══ DRAG & DROP ══
let draggedBlock = null;

function handleDragStart(e) {
  draggedBlock = e.target.closest('.drag-block');
  e.target.closest('.drag-block').style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.style.borderColor = 'var(--acc)';
  e.currentTarget.style.backgroundColor = 'var(--acc-lt)';
}

function handleDragLeave(e) {
  e.currentTarget.style.borderColor = '';
  e.currentTarget.style.backgroundColor = '';
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!draggedBlock) return;

  const slot = e.currentTarget;
  const blockId = draggedBlock.dataset.blockId;
  const slotIndex = parseInt(slot.dataset.index);

  // Hapus dari slot lain jika ada
  userSlots = userSlots.filter(item => item.id !== blockId);

  // Tambah ke slot baru
  userSlots.push({ id: blockId, index: slotIndex });
  userSlots.sort((a, b) => a.index - b.index);

  // Update UI
  renderSlots();
  draggedBlock.style.opacity = '1';
  draggedBlock = null;

  slot.style.borderColor = '';
  slot.style.backgroundColor = '';

  updateCodePreview();
}

// ══ RENDER SLOTS ══
function renderSlots() {
  // Clear semua slot
  const slots = document.querySelectorAll('.drop-slot');
  slots.forEach((slot, idx) => {
    slot.innerHTML = '<span class="slot-number">' + (idx + 1) + '</span>';
  });

  // Render blok di slot
  userSlots.forEach(item => {
    const block = currentChallenge.blocks.find(b => b.id === item.id);
    const slot = document.getElementById('slot-' + item.index);
    if (slot) {
      const blockEl = document.createElement('div');
      blockEl.className = 'slot-item';
      const blockText = block.text || block.code;
      blockEl.innerHTML = `
        <span class="slot-code">${blockText}</span>
        <button class="slot-remove" onclick="removeFromSlot('${item.id}')" style="margin-left: 4px; background: none; border: none; cursor: pointer; color: #999;">✕</button>
      `;
      slot.appendChild(blockEl);
    }
  });
}

// ══ REMOVE FROM SLOT ══
function removeFromSlot(blockId) {
  userSlots = userSlots.filter(item => item.id !== blockId);
  renderSlots();
  updateCodePreview();
}

// ══ UPDATE CODE PREVIEW ══
function updateCodePreview() {
  const codeEl = document.getElementById('codePreview');
  const lineNumbersEl = document.getElementById('lineNumbers');
  
  if (userSlots.length === 0) {
    codeEl.innerHTML = '<span class="code-comment"># Kode kamu akan muncul di sini saat kamu menyusun blok...</span>';
    lineNumbersEl.innerHTML = '1';
    return;
  }

  let codeHTML = '';
  let lineNumbersHTML = '';

  userSlots.forEach((item, idx) => {
    const block = currentChallenge.blocks.find(b => b.id === item.id);
    if (block) {
      let text = block.text || block.code;
      
      // Basic Syntax Highlighting Logic
      let formatted = text
        .replace(/\b(let|var|const|if|else|for|while|function|return|class|import|from|def|print)\b/g, '<span class="code-keyword">$1</span>')
        .replace(/([{}()])/g, '<span class="code-val">$1</span>')
        .replace(/("[^"]*"|'[^']*')/g, '<span class="code-str">$1</span>')
        .replace(/(\/\/.*|#.*)/g, '<span class="code-comment">$1</span>');

      codeHTML += `<div>${formatted}</div>`;
      lineNumbersHTML += `<div>${idx + 1}</div>`;
    }
  });

  codeEl.innerHTML = codeHTML;
  lineNumbersEl.innerHTML = lineNumbersHTML;
}

// ══ CHECK ANSWER ══
function checkAnswer() {
  const userOrder = userSlots.map(item => item.id);
  const correctOrder = currentChallenge.correctOrder;

  if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
    showFeedback(true);
  } else {
    showFeedback(false);
  }
}

// ══ SHOW FEEDBACK ══
function showFeedback(isCorrect) {
  const overlay = document.getElementById('feedbackOverlay');
  const fbIcon = document.getElementById('fbIcon');
  const fbTitle = document.getElementById('fbTitle');
  const fbMsg = document.getElementById('fbMsg');
  const fbPts = document.getElementById('fbPts');

  if (isCorrect) {
    fbIcon.textContent = '';
    fbTitle.textContent = 'Jawaban Benar!';
    fbMsg.textContent = 'Kamu berhasil menyusun kode dengan tepat. Luar biasa!';
    fbPts.textContent = '+' + currentChallenge.points + ' Poin';

    // Tambah poin ke server dan localStorage
    addPointsToServer(currentChallenge.points);
    userPoints += currentChallenge.points;
    localStorage.setItem('codekids_pts', userPoints);
    updateScoreUI();

    // Tampilkan penjelasan jika ada
    const expArea = document.getElementById('fbExpArea');
    const expText = document.getElementById('fbExpText');
    if (currentChallenge.explanation && expArea) {
        expText.textContent = currentChallenge.explanation;
        expArea.style.display = 'block';
    } else {
        expArea.style.display = 'none';
    }
    
    // Simpan progres tantangan per akun
    try {
        const u = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const email = u.email || 'guest';
        const progressKey = 'quiz_progress_' + email;
        let completed = JSON.parse(localStorage.getItem(progressKey) || '[]');
        const chIdStr = localStorage.getItem('current_challenge_id');
        if (chIdStr) {
            const chId = parseInt(chIdStr);
            if (!completed.includes(chId) && !completed.includes(String(chId))) {
                completed.push(chId);
                localStorage.setItem(progressKey, JSON.stringify(completed));
            }
        }
        
        // Bersihkan challenge data setelah selesai
        localStorage.removeItem('challenge_title');
        localStorage.removeItem('challenge_blocks');
        localStorage.removeItem('challenge_order');
        localStorage.removeItem('challenge_hints');
        localStorage.removeItem('challenge_story');
        localStorage.removeItem('current_challenge_id');
    } catch(e) {}
    
  } else {
    wrongAttempts++;
    fbIcon.textContent = '';
    
    if (wrongAttempts <= 3) {
      fbTitle.textContent = `Coba Lagi (Percobaan ${wrongAttempts}/3)`;
      fbMsg.textContent = 'Urutan blok belum benar. AI Tutor akan memberimu petunjuk!';
      fbPts.textContent = '';
    } else {
      fbTitle.textContent = 'Kesempatan Habis!';
      fbMsg.textContent = 'Jangan khawatir! AI Tutor akan menjelaskan jawabannya untukmu';
      fbPts.textContent = '';
    }
    
    // Otomatis buka hint modal dan kirim request AI
    setTimeout(() => {
      closeFeedback();
      openHintModal();
      autoRequestAIHint(wrongAttempts);
    }, 2000);
  }

  overlay.classList.add('show');
}

// ══ CLOSE FEEDBACK ══
function closeFeedback() {
  document.getElementById('feedbackOverlay').classList.remove('show');
}

// ══ RESET SLOTS ══
function resetSlots() {
  userSlots = [];
  renderSlots();
  updateCodePreview();
  hintLevel = 0;
  wrongAttempts = 0; // Reset percobaan salah
  resetHints();
}

// ══ HINT SYSTEM (Card-based) ══
let chatHistory = [];

function initChatHistory() {
  if (chatHistory.length === 0 && currentChallenge) {
    const title = currentChallenge.title || "Tantangan Koding";
    const story = currentChallenge.story || "Memecahkan teka-teki logika.";
    const solution = currentChallenge.solution || "Jawaban belum didefinisikan";
    
    // Kumpulkan teks blok dari berbagai format data
    let blocksStr = "Blok kode bervariasi.";
    if (currentChallenge.blocks) {
      blocksStr = currentChallenge.blocks.map(b => b.text || b.code).join(', ');
    }
    
    // Pre-populate system prompt context
    chatHistory = [
      {
        role: 'system', 
        content: `Kamu adalah tutor bahasa pemrograman berbahasa Indonesia yang ramah untuk edukasi anak-anak bernama CodeKids AI Tutor.
Tugasmu membimbing murid memecahkan tantangan ini: ${title}.
Cerita Tantangan: ${story}.
Terdapat blok kode berbentuk drag-and-drop: ${blocksStr}.
Jawaban yang diharapkan (solusi logis urutannya): ${solution}.
- Jika diminta memberi HINT, berikan petunjuk kecil yang membimbing tanpa memberi jawaban langsung. JANGAN gunakan emoji.
- Jika diminta memberi JAWABAN LENGKAP, berikan urutan blok yang benar beserta penjelasan mengapa urutannya seperti itu, langkah demi langkah.
- Selalu jawab dalam bahasa Indonesia yang ramah dan sederhana untuk anak-anak. JANGAN gunakan emoji dalam jawabanmu.
- Jawab dengan singkat dan padat (maksimal 3-4 kalimat untuk hint, 6-8 kalimat untuk jawaban lengkap).`
      }
    ];
  }
}

function updateProgressDots(attemptNumber) {
  const dot1 = document.getElementById('dot1');
  const dot2 = document.getElementById('dot2');
  const dot3 = document.getElementById('dot3');
  const dot4 = document.getElementById('dot4');
  const lines = document.querySelectorAll('.hint-step-line');
  const label = document.getElementById('hintProgressLabel');
  
  // Reset semua
  [dot1, dot2, dot3, dot4].forEach(d => { d.className = 'hint-step-dot'; });
  lines.forEach(l => l.classList.remove('filled'));
  
  if (attemptNumber >= 1) {
    dot1.classList.add('done');
    dot1.innerHTML = '<span>✓</span>';
  }
  if (attemptNumber >= 2) {
    dot2.classList.add('done');
    dot2.innerHTML = '<span>✓</span>';
    lines[0].classList.add('filled');
  }
  if (attemptNumber >= 3) {
    dot3.classList.add('done');
    dot3.innerHTML = '<span>✓</span>';
    lines[0].classList.add('filled');
    lines[1].classList.add('filled');
  }
  if (attemptNumber >= 4) {
    dot4.classList.add('final');
    dot4.innerHTML = '<span>4</span>';
    lines[0].classList.add('filled');
    lines[1].classList.add('filled');
    lines[2].classList.add('filled');
  }
  
  // Set active dot (current step)
  if (attemptNumber === 1) dot1.classList.add('active');
  if (attemptNumber === 2) dot2.classList.add('active');
  if (attemptNumber === 3) dot3.classList.add('active');
  
  // Update label
  if (attemptNumber <= 3) {
    label.textContent = `Hint ${attemptNumber} dari 3 - Kamu masih bisa mencoba!`;
  } else {
    label.textContent = `Jawaban lengkap ditampilkan`;
  }
}

function openHintModal() {
  document.getElementById('hintOverlay').classList.add('show');
  initChatHistory();
  
  // Update progress dots saat dibuka
  if (wrongAttempts > 0) {
    updateProgressDots(wrongAttempts);
  }
}

function closeHintModal() {
  document.getElementById('hintOverlay').classList.remove('show');
}

// ══ AUTO AI HINT — Render sebagai kartu hint ══
async function autoRequestAIHint(attemptNumber) {
  const cardsArea = document.getElementById('hintCardsArea');
  
  // Pastikan chat history sudah diinisialisasi
  initChatHistory();
  
  // Sembunyikan empty state
  const emptyState = document.getElementById('hintEmptyState');
  if (emptyState) emptyState.style.display = 'none';
  
  // Update progress dots
  updateProgressDots(attemptNumber);
  
  // Tentukan konfigurasi kartu berdasarkan level
  const levelConfig = {
    1: { emoji: '', badge: 'Hint 1', label: 'Petunjuk Awal' },
    2: { emoji: '', badge: 'Hint 2', label: 'Petunjuk Lanjutan' },
    3: { emoji: '', badge: 'Hint 3', label: 'Petunjuk Detail' },
    4: { emoji: '', badge: 'Jawaban', label: 'Jawaban & Penjelasan' }
  };
  const level = Math.min(attemptNumber, 4);
  const config = levelConfig[level];
  
  // Buat loading card
  const cardId = 'hint-card-' + level;
  const loadingCard = document.createElement('div');
  loadingCard.className = `hint-card hint-card-loading hint-level-${level}`;
  loadingCard.id = cardId;
  loadingCard.innerHTML = `
    <div class="hint-card-header">
      <span class="hint-card-badge">${config.emoji} ${config.badge}</span>
      <span class="hint-card-label">${config.label}</span>
    </div>
    <div class="hint-card-body">
      <div class="hint-skeleton">
        <div class="hint-skeleton-line"></div>
        <div class="hint-skeleton-line"></div>
        <div class="hint-skeleton-line"></div>
      </div>
    </div>
  `;
  cardsArea.appendChild(loadingCard);
  cardsArea.scrollTop = cardsArea.scrollHeight;
  
  // Tentukan pesan otomatis berdasarkan jumlah percobaan
  let autoMessage;
  if (attemptNumber <= 3) {
    autoMessage = `Aku salah menjawab untuk ke-${attemptNumber} kalinya. Tolong beri aku hint ke-${attemptNumber} dari 3 yang membimbing tanpa memberi jawaban langsung. Hint harus lebih detail dari sebelumnya. Jawab singkat dan padat.`;
  } else {
    autoMessage = `Aku sudah salah 4 kali. Tolong berikan jawaban lengkap beserta penjelasan step-by-step mengapa urutan blok yang benar seperti itu. Jelaskan secara sederhana agar aku paham konsepnya.`;
  }
  
  // Kirim ke AI
  chatHistory.push({ role: 'user', content: autoMessage });

  // ── CEK HINT MANUAL/GURU TERLEBIH DAHULU ──
  let hasManualHint = false;
  let manualContent = '';

  if (attemptNumber <= 3) {
      if (currentChallenge.hints && currentChallenge.hints[attemptNumber - 1] && currentChallenge.hints[attemptNumber - 1].trim() !== '') {
          hasManualHint = true;
          manualContent = currentChallenge.hints[attemptNumber - 1];
      }
  } else {
      if (currentChallenge.explanation && currentChallenge.explanation.trim() !== '') {
          hasManualHint = true;
          manualContent = `<strong>Jawaban & Penjelasan:</strong><br>${currentChallenge.explanation}`;
      } else if (currentChallenge.solution && currentChallenge.solution.trim() !== '') {
          hasManualHint = true;
          manualContent = `<strong>Jawaban Lengkap:</strong><br>${currentChallenge.solution}`;
      } else if (currentChallenge.correctOrder && currentChallenge.blocks) {
          // Fallback Otomatis: Jika tidak ada penjelasan manual, ambil urutan dari correctOrder database
          hasManualHint = true;
          const solText = currentChallenge.correctOrder.map(id => {
              const b = currentChallenge.blocks.find(block => block.id === id);
              return b ? (b.text || b.code) : '';
          }).join('\n');
          manualContent = `<strong>Urutan Jawaban yang Benar:</strong><br><pre style="background:#f1f5f9; padding:12px; border-radius:8px; border:1px solid #cbd5e1; font-family:'Courier New', monospace; margin-top:10px; font-size:13px; line-height:1.5;">${solText}</pre><p style="margin-top:10px; font-size:13px; color:var(--muted)">Ini adalah urutan logika yang benar untuk menyelesaikan tantangan ini.</p>`;
      }
  }

  // Jika guru/admin sudah mengisi hint statis atau solusi otomatis tersedia, gunakan itu
  if (hasManualHint) {
      setTimeout(() => {
          const card = document.getElementById(cardId);
          card.classList.remove('hint-card-loading');
          
          // Format respons untuk HTML
          card.querySelector('.hint-card-body').innerHTML = manualContent.replace(/\n/g, '<br>');
          
          // Simpan respons dalam riwayat chat
          chatHistory.push({ role: 'assistant', content: manualContent });
          cardsArea.scrollTop = cardsArea.scrollHeight;
      }, 600); // Simulasi delay loading sedikit agar efek pop-up tetap terasa natural
      return; 
  }
  
  // ── JIKA TIDAK ADA HINT GURU, GUNAKAN GENERAI AI (GROQ) ──
  try {
    const reply = await generateGroqResponse(chatHistory);
    
    // Format balasan
    const formattedReply = reply
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    
    // Update card dengan konten
    const card = document.getElementById(cardId);
    card.classList.remove('hint-card-loading');
    card.querySelector('.hint-card-body').innerHTML = formattedReply;
    
    chatHistory.push({ role: 'assistant', content: reply });
    cardsArea.scrollTop = cardsArea.scrollHeight;
    
  } catch(err) {
    // Jika API gagal
    const card = document.getElementById(cardId);
    card.classList.remove('hint-card-loading');
    card.querySelector('.hint-card-body').innerHTML = `<span style="color:var(--dan)">Gagal menghubungi AI: ${err.message}</span>`;
    chatHistory.pop();
  }
}

function resetHints() {
  chatHistory = [];
  // Reset UI hint panel
  const cardsArea = document.getElementById('hintCardsArea');
  if (cardsArea) {
    cardsArea.innerHTML = `
      <div class="hint-empty-state" id="hintEmptyState">
        <div style="font-weight:800;color:var(--dk);margin-bottom:6px">Belum Ada Hint</div>
        <div style="font-size:13px;color:var(--muted)">Coba jawab tantangannya dulu! Jika salah, AI Tutor akan otomatis memberikan petunjuk.</div>
      </div>
    `;
  }
  // Reset progress dots
  const dots = document.querySelectorAll('.hint-step-dot');
  dots.forEach((d, i) => { d.className = 'hint-step-dot'; d.innerHTML = `<span>${i+1}</span>`; });
  const lines = document.querySelectorAll('.hint-step-line');
  lines.forEach(l => l.classList.remove('filled'));
  const label = document.getElementById('hintProgressLabel');
  if (label) label.textContent = 'Belum ada percobaan salah';
}

// ══ NAVIGATION ══
function navTo(page) {
  // Implementasi navigasi halaman
  console.log('Navigasi ke:', page);
  
  if (page === 'challenges') {
    // Kembali ke daftar tantangan
    document.location.href = '/murid/quiz.html';
  } else if (page === 'dashboard') {
    document.location.href = '/index.html';
  } else if (page === 'quiz') {
    document.location.href = '/murid/quiz.html';
  } else if (page === 'kelas') {
    document.location.href = '/murid/kelas.html';
  }
}

console.log('Kids.js loaded successfully - Workspace Challenge System ready!');

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
