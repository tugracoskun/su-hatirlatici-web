document.addEventListener('DOMContentLoaded', () => {
    // --- TEMA DEĞİŞTİRME ELEMANLARI ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 9c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM3.515 6.025l-1.414-1.414L3.515 3.2zM2 11h2v2H2zm1.515 9.39l-1.414 1.414L3.515 20.4zM11 20h2v2h-2zm7.879-2.207l1.414-1.414L19.586 18zM20 11h2v2h-2zm-1.515-9.39l1.414 1.414L19.586 4.6zM13 2h-2V0h2z"/></svg>`;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`;

    // --- SABİTLER VE DEĞİŞKENLER ---
    let TARGET_ML = 2000;
    const ALARM_DURATION_MS = 90 * 60 * 1000;
    let currentMl = 0, history = [], alarmTimer = null;

    // --- HTML ELEMENTLERİNİ SEÇME ---
    const statusText = document.getElementById('status-text');
    const progressBar = document.getElementById('progress-bar');
    const mlInput = document.getElementById('ml-input');
    const addBtn = document.getElementById('add-btn');
    const quickAddBtns = document.querySelectorAll('.quick-add-btn');
    const undoBtn = document.getElementById('undo-btn');
    const resetBtn = document.getElementById('reset-btn');
    const toast = document.getElementById('toast-notification');
    const editTargetBtn = document.getElementById('edit-target-btn');
    const logList = document.getElementById('log-list');

    // --- TEMA YÖNETİMİ ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggleBtn.innerHTML = sunIcon;
        } else {
            body.classList.remove('dark-mode');
            themeToggleBtn.innerHTML = moonIcon;
        }
    }
    
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Varsayılanı koyu yapalım
    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- BİLDİRİM İZNİ ---
    if (Notification.permission !== 'granted') { Notification.requestPermission(); }

    // --- ANA FONKSİYONLAR ---
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }

    function updateUI() {
        const percentage = (currentMl / TARGET_ML) * 100;
        statusText.textContent = `Hedef: ${TARGET_ML} ml / İçilen: ${currentMl} ml`;
        progressBar.style.width = `${Math.min(percentage, 100)}%`;
        undoBtn.disabled = history.length === 0;
    }

    function updateLog() {
        logList.innerHTML = '';
        [...history].reverse().forEach(item => {
            const logItem = document.createElement('li');
            const time = new Date(item.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit'});
            logItem.innerHTML = `+${item.amount} ml <span class="log-time">${time}</span>`;
            logList.appendChild(logItem);
        });
    }

    function addWater(amount) {
        if (amount <= 0) return;
        currentMl += amount;
        history.push({ amount: amount, time: Date.now() });
        updateUI();
        updateLog();
        setAlarm();
    }
    
    function setAlarm() {
        if (alarmTimer) clearTimeout(alarmTimer);
        alarmTimer = setTimeout(showNotification, ALARM_DURATION_MS);
        showToast("Harika! Alarm 1.5 saat sonraya kuruldu.");
    }
    
    function showNotification() {
        if (Notification.permission === 'granted') {
            new Notification("Su İçme Zamanı! 🔔", {
                body: "Vücudunun suya ihtiyacı var. Bir bardak su içmeye ne dersin?",
                icon: "https://i.imgur.com/V68q3hE.png"
            });
        } else {
            alert("🔔 SU İÇME ZAMANI! 🔔");
        }
    }

    // --- BUTON OLAYLARI ---
    editTargetBtn.addEventListener('click', () => {
        const newTarget = prompt("Yeni günlük hedefinizi ml olarak girin:", TARGET_ML);
        if (newTarget !== null && !isNaN(newTarget) && Number(newTarget) > 0) {
            TARGET_ML = Number(newTarget);
            updateUI();
            showToast(`Hedef ${TARGET_ML} ml olarak güncellendi!`);
        }
    });

    addBtn.addEventListener('click', () => {
        const amount = parseInt(mlInput.value);
        if (!isNaN(amount) && amount > 0) {
            addWater(amount);
            mlInput.value = '';
        }
    });
    
    quickAddBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            addWater(parseInt(btn.dataset.amount));
        });
    });

    undoBtn.addEventListener('click', () => {
        if (history.length > 0) {
            currentMl -= history.pop().amount;
            updateUI();
            updateLog();
            setAlarm();
        }
    });

    resetBtn.addEventListener('click', () => {
        if (confirm("Günlük ilerlemenizi sıfırlamak istediğinizden emin misiniz?")) {
            currentMl = 0;
            history = [];
            if (alarmTimer) clearTimeout(alarmTimer);
            updateUI();
            updateLog();
        }
    });
    
    mlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addBtn.click();
        }
    });

    updateUI();
});