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
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Отменяем перезагрузку страницы

        const formData = new FormData(form);

        // Показываем сообщение "Отправка..."
        statusMsg.classList.remove('visible');
        statusMsg.textContent = 'Отправка...';
        statusMsg.classList.add('visible');

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Успех
                const nameInput = document.querySelector('#name');
                const name = nameInput.value.trim();
                
                statusMsg.textContent = `Спасибо, ${name}! Сообщение отправлено.`;
                form.reset();
            } else {
                // Ошибка от Formspree
                statusMsg.textContent = 'Ой, что-то пошло не так. Попробуйте ещё раз.';
            }
        } catch (error) {
            // Ошибка сети (например, пропал интернет)
            statusMsg.textContent = 'Ошибка сети. Проверьте подключение к интернету.';
        }
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

const fontIncreaseBtn = document.querySelector('#font-increase');
const fontDecreaseBtn = document.querySelector('#font-decrease');
const bodyElement = document.querySelector('body');

// Загружаем сохранённый масштаб или ставим 100%
let currentZoom = parseInt(localStorage.getItem('siteZoom')) || 100;

const applyZoom = (zoomLevel) => {
    currentZoom = zoomLevel;
    bodyElement.style.zoom = `${zoomLevel}%`;
    localStorage.setItem('siteZoom', zoomLevel);
    
    // Меняем подсказку (title) у кнопок, чтобы было понятно
    if (fontDecreaseBtn) fontDecreaseBtn.title = currentZoom === 100 ? "Сбросить масштаб" : "Уменьшить текст";
};

// Применяем масштаб при загрузке
applyZoom(currentZoom);

// Увеличение
if (fontIncreaseBtn) {
    fontIncreaseBtn.addEventListener('click', () => {
        if (currentZoom < 150) {
            applyZoom(currentZoom + 10);
        }
    });
}

// Уменьшение (и сброс до 100%, если уже меньше или равно 100%)
if (fontDecreaseBtn) {
    fontDecreaseBtn.addEventListener('click', () => {
        if (currentZoom > 100) {
            applyZoom(currentZoom - 10);
        } else {
            applyZoom(100); // Сброс, если нажали на 100% или меньше
        }
    });
}

// Бонус: двойной клик по ЛЮБОЙ кнопке возвращает всё к 100%
const resetZoom = () => applyZoom(100);
if (fontIncreaseBtn) fontIncreaseBtn.addEventListener('dblclick', resetZoom);
if (fontDecreaseBtn) fontDecreaseBtn.addEventListener('dblclick', resetZoom);

// Кнопка сброса масштаба (🔄)
const fontResetBtn = document.querySelector('#font-reset');
if (fontResetBtn) {
    fontResetBtn.addEventListener('click', () => {
        applyZoom(100);
    });
}