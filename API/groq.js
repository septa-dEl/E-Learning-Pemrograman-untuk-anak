// ═══════════════════════════════════════════════════════
// Modul API Groq Cloud (Gemma)
// Menghubungkan aplikasi dengan model Gemma dari Google via Groq
// Endpoint: 
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// API Key (Silakan diisi dengan API Key Groq Anda)
// ═══════════════════════════════════════════════════════
const GROQ_API_KEY = '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';

/**
 * Fungsi utama untuk memanggil API Groq Cloud.
 * 
 * @param {Array} messages - Array objek pesan, format: [{ role: 'system'/'user'/'assistant', content: 'Halo' }]
 * @param {string} apiKey - Opsional. Jika tidak diisi, akan menggunakan GROQ_API_KEY bawaan.
 * @param {string} model - Model Groq, opsional (default: gemma2-9b-it)
 * @returns {Promise<string>} - Mengembalikan teks balasan dari AI
 */
async function generateGroqResponse(messages, apiKey = GROQ_API_KEY, model = 'llama-3.1-8b-instant') {
  const url = 'API';

  if (apiKey === 'YOUR_GROQ_API_KEY_HERE' || !apiKey) {
    throw new Error("⚠️ GROQ_API_KEY belum diatur! Silakan masukkan API key Anda di file API/groq.js");
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,   // Kreativitas model (0.0 sampai 1.0)
        max_tokens: 1024    // Batas maksimal respon
      })
    });

    if (!response.ok) {
      // Coba baca error dari respon JSON Groq
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || "Terjadi kesalahan saat menghubungi API Groq. Pastikan API Key benar.");
    }

    const data = await response.json();

    // Kembalikan text dari respons model
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error("Respons dari Groq kosong atau formatnya tidak sesuai.");
    }

  } catch (error) {
    console.error("Kesalahan Groq API: ", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════
// Model Groq (Gemma) yang tersedia
// ═══════════════════════════════════════════════════════
const GROQ_MODELS = {
  'gemma-7b-it': 'Gemma 7B (Google)',
  'llama-3.1-8b-instant': 'Llama 3.1 8B (Meta)',
  'llama-3.3-70b-versatile': 'Llama 3.3 70B (Meta)'
};

// Default model yang digunakan
const DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant';

console.log('✅ Groq Cloud API Module (Gemma) loaded — Endpoint: api.groq.com');
