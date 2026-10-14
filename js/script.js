const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const themeBtn = document.querySelector('#theme-toggle');

if (themeBtn) {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

    if (isDark) {
        document.documentElement.classList.add('dark');
        themeBtn.textContent = '☀️';
    }

    themeBtn.setAttribute('aria-pressed', String(isDark));

    themeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const nowDark = document.documentElement.classList.contains('dark');

        themeBtn.textContent = nowDark ? '☀️' : '🌙';
        themeBtn.setAttribute('aria-pressed', String(nowDark));
        localStorage.setItem('theme', nowDark ? 'dark' : 'light');
    });
}

const form = document.querySelector('form');
const statusMsg = document.querySelector('#form-status');

if (form && statusMsg) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const nameInput = document.querySelector('#name');
        const emailInput = document.querySelector('#email');
        const msgInput = document.querySelector('#msg');

        if (!nameInput.value.trim()) {
            statusMsg.textContent = 'Пожалуйста, укажите имя.';
            statusMsg.classList.add('visible');
            nameInput.focus();
            return;
        }

        if (!emailInput.value.trim() || !emailInput.checkValidity()) {
            statusMsg.textContent = 'Пожалуйста, укажите корректный e-mail.';
            statusMsg.classList.add('visible');
            emailInput.focus();
            return;
        }

        if (!msgInput.value.trim()) {
            statusMsg.textContent = 'Пожалуйста, введите сообщение.';
            statusMsg.classList.add('visible');
            msgInput.focus();
            return;
        }

        const name = nameInput.value.trim();

        statusMsg.classList.remove('visible');

        requestAnimationFrame(() => {
            statusMsg.textContent = `Спасибо, ${name}! Сообщение отправлено.`;
            statusMsg.classList.add('visible');
        });

        form.reset();
    });
}

const upBtn = document.querySelector('#to-top');

if (upBtn) {
    window.addEventListener('scroll', () => {
        upBtn.classList.toggle('visible', window.scrollY > 400);
    });

    upBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const skip = document.querySelector('.skip-link');
        if (skip) skip.focus();
    });
}

const readBtn = document.querySelector('#read-page');
let speaking = false;

if (readBtn && 'speechSynthesis' in window) {
    const gatherText = () => {
        const parts = [];
        const main = document.querySelector('main');
        if (!main) return '';

        main.querySelectorAll('h2, h3, p, li').forEach(el => {
            const text = el.innerText.trim();
            if (text) parts.push(text);
        });

        return parts.join('. ');
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        speaking = false;
        readBtn.textContent = '🔊';
        readBtn.classList.remove('speaking');
        readBtn.setAttribute('aria-pressed', 'false');
        readBtn.setAttribute('aria-label', 'Озвучить текст страницы');
    };

    readBtn.addEventListener('click', () => {
        if (speaking) {
            stopSpeaking();
            return;
        }

        const text = gatherText();
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        utterance.rate = 1;
        utterance.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const ruVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ru'));
        if (ruVoice) utterance.voice = ruVoice;

        utterance.onend = stopSpeaking;
        utterance.onerror = stopSpeaking;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        speaking = true;
        readBtn.textContent = '⏹';
        readBtn.classList.add('speaking');
        readBtn.setAttribute('aria-pressed', 'true');
        readBtn.setAttribute('aria-label', 'Остановить озвучку');
    });

    if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
        speechSynthesis.onvoiceschanged = () => {};
    }
}