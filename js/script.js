const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const a11yToggle = document.querySelector('#a11y-toggle');
const a11yPanel = document.querySelector('#a11y-panel');
const a11yClose = document.querySelector('#a11y-close');

const closePanel = () => {
    if (a11yPanel && a11yToggle) {
        a11yPanel.setAttribute('hidden', '');
        a11yToggle.setAttribute('aria-expanded', 'false');
    }
};

if (a11yToggle && a11yPanel) {
    a11yToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const isHidden = a11yPanel.hasAttribute('hidden');
        if (isHidden) {
            a11yPanel.removeAttribute('hidden');
            a11yToggle.setAttribute('aria-expanded', 'true');
        } else {
            closePanel();
        }
    });
}

if (a11yClose) {
    a11yClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closePanel();
    });
}

document.addEventListener('click', (event) => {
    if (a11yPanel && !a11yPanel.hasAttribute('hidden')) {
        if (!a11yPanel.contains(event.target) && !a11yToggle.contains(event.target)) {
            closePanel();
        }
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closePanel();
    }
});

const themeBtn = document.querySelector('#theme-toggle');
if (themeBtn) {
    const isDark = document.documentElement.classList.contains('dark');
    themeBtn.setAttribute('aria-pressed', String(isDark));
    
    const themeText = themeBtn.querySelector('span');
    if (themeText) {
        if (isDark) themeText.textContent = 'Светлая тема';
    }

    themeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const nowDark = document.documentElement.classList.contains('dark');
        
        if (themeText) themeText.textContent = nowDark ? 'Светлая тема' : 'Тёмная тема';
        
        themeBtn.setAttribute('aria-pressed', String(nowDark));
        localStorage.setItem('theme', nowDark ? 'dark' : 'light');
    });
}

const contrastBtn = document.querySelector('#contrast-toggle');
if (contrastBtn) {
    const isContrast = document.documentElement.classList.contains('high-contrast');
    contrastBtn.setAttribute('aria-pressed', String(isContrast));
    
    const contrastText = contrastBtn.querySelector('span');
    if (contrastText) {
        if (isContrast) contrastText.textContent = 'Обычные цвета';
    }

    contrastBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('high-contrast');
        const nowContrast = document.documentElement.classList.contains('high-contrast');
        
        if (contrastText) contrastText.textContent = nowContrast ? 'Обычные цвета' : 'Высокая контрастность';
        
        contrastBtn.setAttribute('aria-pressed', String(nowContrast));
        localStorage.setItem('contrast', nowContrast ? 'high' : 'normal');
    });
}

const fontIncreaseBtn = document.querySelector('#font-increase');
const fontDecreaseBtn = document.querySelector('#font-decrease');
const fontResetBtn = document.querySelector('#font-reset');
const bodyElement = document.querySelector('body');

let currentZoom = parseInt(localStorage.getItem('siteZoom')) || 100;
const applyZoom = (zoomLevel) => {
    currentZoom = zoomLevel;
    bodyElement.style.zoom = `${zoomLevel}%`;
    localStorage.setItem('siteZoom', zoomLevel);
};

applyZoom(currentZoom);

if (fontIncreaseBtn) fontIncreaseBtn.addEventListener('click', () => { if (currentZoom < 150) applyZoom(currentZoom + 10); });
if (fontDecreaseBtn) fontDecreaseBtn.addEventListener('click', () => { if (currentZoom > 70) applyZoom(currentZoom - 10); });
if (fontResetBtn) fontResetBtn.addEventListener('click', () => applyZoom(100));

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
        
        const readText = readBtn.querySelector('span');
        if (readText) readText.textContent = 'Озвучить текст';
        
        readBtn.setAttribute('aria-pressed', 'false');
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

        const voices = window.speechSynthesis.getVoices();
        const ruVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ru'));
        if (ruVoice) utterance.voice = ruVoice;

        utterance.onend = stopSpeaking;
        utterance.onerror = stopSpeaking;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        speaking = true;
        
        const readText = readBtn.querySelector('span');
        if (readText) readText.textContent = 'Остановить';
        
        readBtn.setAttribute('aria-pressed', 'true');
    });
}

const form = document.querySelector('form');
const statusMsg = document.querySelector('#form-status');

if (form && statusMsg) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);

        statusMsg.classList.remove('visible');
        statusMsg.textContent = 'Отправка...';
        statusMsg.classList.add('visible');

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                const name = document.querySelector('#name').value.trim();
                statusMsg.textContent = `Спасибо, ${name}! Сообщение отправлено.`;
                form.reset();
            } else {
                statusMsg.textContent = 'Ой, что-то пошло не так. Попробуйте ещё раз.';
            }
        } catch (error) {
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