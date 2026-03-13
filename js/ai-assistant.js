/**
 * Business AI Assistant — voice + text chat with server-side AI
 * No API keys client-side. Calls POST /api/dashboard/ai-chat
 */
'use strict';

class BusinessAIAssistant {
  constructor() {
    this.history = [];
    this.isListening = false;
    this.voiceMode = false;
    this.recognition = null;
    this.open = false;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      this.recognition = new SR();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        this.voiceMode = true;
        this.send(text);
      };
      this.recognition.onerror = () => this.stopListening();
      this.recognition.onend = () => {
        this.isListening = false;
        this._updateMic();
      };
    }

    // Preload voices for TTS
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {};
    }
  }

  toggle() {
    this.open = !this.open;
    const el = document.getElementById('ai-assistant');
    const fab = document.getElementById('ai-toggle-btn');
    if (!el) return;

    if (this.open) {
      el.style.display = 'flex';
      fab.classList.add('hidden');
      if (this.history.length === 0) {
        this._addMsg('assistant', "Hey! I'm your business assistant. Ask me anything — bookings, revenue, reviews, marketing ideas, or just tap the mic and talk.");
      }
      setTimeout(() => {
        const input = document.getElementById('ai-input');
        if (input) input.focus();
      }, 100);
    } else {
      el.style.display = 'none';
      fab.classList.remove('hidden');
      speechSynthesis.cancel();
    }
  }

  show() { if (!this.open) this.toggle(); }
  hide() { if (this.open) this.toggle(); }

  async send(text) {
    if (!text || !text.trim()) return;
    const msg = text.trim();

    this._addMsg('user', msg);
    this.history.push({ role: 'user', content: msg });
    this._showTyping();

    try {
      const API = window.CC_API_BASE || '';
      const token = window.CC && CC.getToken ? CC.getToken() : localStorage.getItem('cc_token');

      const res = await fetch(API + '/api/dashboard/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify({ message: msg, history: this.history.slice(-10) })
      });

      const data = await res.json();
      this._removeTyping();

      const reply = data.reply || "Sorry, couldn't get a response.";
      this._addMsg('assistant', reply);
      this.history.push({ role: 'assistant', content: reply });

      if (this.voiceMode) this._speak(reply);
      this.voiceMode = false;
    } catch (err) {
      this._removeTyping();
      this._addMsg('assistant', 'Connection error — try again.');
    }
  }

  handleTextInput() {
    const input = document.getElementById('ai-input');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    this.voiceMode = false;
    this.send(msg);
  }

  toggleVoice() {
    if (!this.recognition) {
      this._addMsg('assistant', 'Voice not supported — try Chrome or Safari.');
      return;
    }
    if (this.isListening) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
        this.isListening = true;
        this._updateMic();
      } catch (e) {}
    }
  }

  stopListening() {
    if (this.recognition) this.recognition.stop();
    this.isListening = false;
    this._updateMic();
  }

  clearChat() {
    const el = document.getElementById('ai-chat-messages');
    if (el) el.innerHTML = '';
    this.history = [];
    this._addMsg('assistant', "Chat cleared. What can I help with?");
  }

  // ── Private ──

  _speak(text) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    const voices = speechSynthesis.getVoices();
    const pick = voices.find(v => v.name.includes('Samantha')) ||
                 voices.find(v => v.lang === 'en-US' && v.localService) || voices[0];
    if (pick) utter.voice = pick;
    speechSynthesis.speak(utter);
  }

  _updateMic() {
    const btn = document.getElementById('ai-mic-btn');
    if (!btn) return;
    if (this.isListening) {
      btn.classList.add('listening');
      btn.innerHTML = '🔴';
    } else {
      btn.classList.remove('listening');
      btn.innerHTML = '🎤';
    }
  }

  _addMsg(role, content) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `ai-message ai-${role}`;
    const icon = role === 'user' ? '👤' : '🤖';

    // Basic markdown
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    div.innerHTML = `
      <div class="ai-message-icon">${icon}</div>
      <div class="ai-message-content">${html}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  _showTyping() {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'ai-message ai-system';
    div.id = 'ai-typing';
    div.innerHTML = '<div class="ai-message-content"><div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  _removeTyping() {
    const el = document.getElementById('ai-typing');
    if (el) el.remove();
  }
}

// Global instance
window.dashboardAI = new BusinessAIAssistant();
