// Main App JavaScript for Home Page

// Storage keys
const STORAGE_KEYS = {
    SETS_PROGRESS: 'atp_sets_progress',
    CURRENT_SET: 'atp_current_set'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeHomePage();
    setupEventListeners();
});

function initializeHomePage() {
    generateSetCards();
    updateStats();
}

function setupEventListeners() {
    const clearDataBtn = document.getElementById('clearDataBtn');
    const confirmModal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmClearBtn = document.getElementById('confirmClearBtn');

    clearDataBtn.addEventListener('click', () => {
        confirmModal.classList.add('show');
    });

    cancelBtn.addEventListener('click', () => {
        confirmModal.classList.remove('show');
    });

    confirmClearBtn.addEventListener('click', () => {
        clearAllProgress();
        confirmModal.classList.remove('show');
    });

    // Close modal on outside click
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            confirmModal.classList.remove('show');
        }
    });
}

function generateSetCards() {
    const setsGrid = document.getElementById('setsGrid');
    const setsProgress = getSetsProgress();
    
    // Total 19 sets: 18 sets of 100 questions + 1 set of 31 questions
    const totalSets = 19;
    
    for (let i = 1; i <= totalSets; i++) {
        const questionsInSet = i === 19 ? 31 : 100;
        const startSN = (i - 1) * 100 + 1;
        const endSN = i === 19 ? 1831 : i * 100;
        
        const setProgress = setsProgress[i] || { status: 'not-started' };
        
        const setCard = document.createElement('a');
        setCard.href = `quiz.html?set=${i}`;
        setCard.className = `set-card ${setProgress.status}`;
        
        let statusBadgeHTML = '';
        let statusInfoHTML = '';
        
        if (setProgress.status === 'completed') {
            const percentage = Math.round((setProgress.correct / questionsInSet) * 100);
            statusBadgeHTML = '<span class="status-badge completed">✓ Completed</span>';
            statusInfoHTML = `<div class="set-score">Score: ${setProgress.correct}/${questionsInSet} (${percentage}%)</div>`;
        } else if (setProgress.status === 'in-progress') {
            statusBadgeHTML = '<span class="status-badge in-progress">In Progress</span>';
            statusInfoHTML = `<div class="set-score">Question ${setProgress.currentQuestion || 1}/${questionsInSet}</div>`;
        } else {
            statusBadgeHTML = '<span class="status-badge not-started">Not Started</span>';
        }
        
        setCard.innerHTML = `
            <div class="set-title">Set ${i}</div>
            <div class="set-info">Questions ${startSN} - ${endSN}</div>
            <div class="set-info">${questionsInSet} Questions</div>
            ${statusBadgeHTML}
            ${statusInfoHTML}
        `;
        
        setsGrid.appendChild(setCard);
    }
}

function updateStats() {
    const setsProgress = getSetsProgress();
    
    let completedSets = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;
    
    Object.values(setsProgress).forEach(set => {
        if (set.status === 'completed') {
            completedSets++;
            totalQuestions += set.total || 0;
            totalCorrect += set.correct || 0;
        }
    });
    
    const avgScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    document.getElementById('completedSets').textContent = completedSets;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('avgScore').textContent = avgScore + '%';
}

function getSetsProgress() {
    const stored = localStorage.getItem(STORAGE_KEYS.SETS_PROGRESS);
    return stored ? JSON.parse(stored) : {};
}

function clearAllProgress() {
    localStorage.removeItem(STORAGE_KEYS.SETS_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SET);
    
    // Clear all set-specific progress
    for (let i = 1; i <= 19; i++) {
        localStorage.removeItem(`atp_set_${i}_answers`);
        localStorage.removeItem(`atp_set_${i}_current`);
    }
    
    // Reload the page
    location.reload();
}
