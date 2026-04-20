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
        this._addMsg('assistant', "Hey! I can answer questions about your business **and** make real changes.\n\nPaste a full menu, specials list, or event schedule and say **\"add this\"** — I'll import everything at once. Or just ask me anything.");
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

    // Truncate display of very long pastes
    const displayMsg = msg.length > 300 ? msg.slice(0, 300) + `\n…(+${msg.length - 300} more chars)` : msg;
    this._addMsg('user', displayMsg);
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
        body: JSON.stringify({ message: msg, history: this.history.slice(-8) })
      });

      const data = await res.json();
      this._removeTyping();

      // Show tool result badges first if any
      if (data.tool_results && data.tool_results.length) {
        this._showToolResults(data.tool_results);
      }

      const reply = data.reply || "Done!";
      this._addMsg('assistant', reply);
      this.history.push({ role: 'assistant', content: reply });

      if (this.voiceMode) this._speak(reply);
      this.voiceMode = false;

      // Refresh relevant dashboard sections
      if (data.tool_results && data.tool_results.length) {
        data.tool_results.forEach(r => {
          if (r.tool === 'add_menu_items' || r.tool === 'clear_menu_type') {
            if (typeof loadMenu === 'function') loadMenu();
          }
          if (r.tool === 'add_specials') {
            if (typeof loadSpecials === 'function') loadSpecials();
          }
          if (r.tool === 'add_events') {
            if (typeof loadEvents === 'function') loadEvents();
          }
        });
      }
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
    input.style.height = 'auto';
    this.voiceMode = false;
    this.send(msg);
  }

  _showToolResults(results) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'ai-message ai-system';
    const badges = results.map(r => {
      if (r.tool === 'add_menu_items')   return `<span class="ai-tool-badge">✅ Added ${r.count} menu item${r.count !== 1 ? 's' : ''}</span>`;
      if (r.tool === 'clear_menu_type')  return `<span class="ai-tool-badge ai-tool-warn">🗑 Cleared ${r.cleared} items</span>`;
      if (r.tool === 'add_specials')     return `<span class="ai-tool-badge">✅ Added ${r.count} special${r.count !== 1 ? 's' : ''}</span>`;
      if (r.tool === 'add_events')       return `<span class="ai-tool-badge">✅ Added ${r.count} event${r.count !== 1 ? 's' : ''}</span>`;
      if (r.tool === 'update_hh_schedule') return `<span class="ai-tool-badge">✅ Happy Hour set: ${r.schedule.days} ${r.schedule.start}–${r.schedule.end}</span>`;
      return '';
    }).join(' ');
    div.innerHTML = `<div class="ai-message-content" style="background:transparent;box-shadow:none;">${badges}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
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
