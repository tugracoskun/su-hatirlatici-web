document.addEventListener('DOMContentLoaded', () => {
    let TARGET_ML = 2000;
    const ALARM_DURATION_MS = 90 * 60 * 1000;
    let currentMl = 0;
    let history = []; 
    let alarmTimer = null;

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

    if (Notification.permission !== 'granted') { Notification.requestPermission(); }
    
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

    // YENİ: "Enter" tuşu ile ekleme özelliği
    mlInput.addEventListener('keydown', (event) => {
        // Eğer basılan tuş 'Enter' ise...
        if (event.key === 'Enter') {
            // "Ekle" butonuna programatik olarak tıkla
            addBtn.click();
        }
    });

    updateUI();
});