// Main App JavaScript for Home Page

const STORAGE_KEYS = {
    TESTS_PROGRESS: 'atp_tests_progress'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeHomePage();
    setupEventListeners();
});

function initializeHomePage() {
    generateTestCards();
    generateSetCards();
}

function setupEventListeners() {
    const clearTestsBtn = document.getElementById('clearTestsBtn');
    const confirmModal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmClearBtn = document.getElementById('confirmClearBtn');

    clearTestsBtn.addEventListener('click', () => {
        confirmModal.classList.add('show');
    });

    cancelBtn.addEventListener('click', () => {
        confirmModal.classList.remove('show');
    });

    confirmClearBtn.addEventListener('click', () => {
        clearAllTestData();
        confirmModal.classList.remove('show');
    });

    // Close modal on outside click
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            confirmModal.classList.remove('show');
        }
    });
}

function generateTestCards() {
    const testsGrid = document.getElementById('testsGrid');
    const testsProgress = getTestsProgress();
    
    // Generate 10 random tests
    const totalTests = 10;
    
    for (let i = 1; i <= totalTests; i++) {
        const testProgress = testsProgress[i] || { status: 'not-started' };
        
        const testCard = document.createElement('a');
        testCard.href = `test.html?test=${i}`;
        testCard.className = `set-card ${testProgress.status}`;
        
        let statusBadgeHTML = '';
        let statusInfoHTML = '';
        
        if (testProgress.status === 'completed') {
            const percentage = Math.round((testProgress.correct / 100) * 100);
            statusBadgeHTML = '<span class="status-badge completed">✓ Completed</span>';
            statusInfoHTML = `<div class="set-score">Score: ${testProgress.correct}/100 (${percentage}%)</div>`;
        } else if (testProgress.status === 'in-progress') {
            statusBadgeHTML = '<span class="status-badge in-progress">In Progress</span>';
            statusInfoHTML = `<div class="set-score">Question ${testProgress.currentQuestion || 1}/100</div>`;
        } else {
            statusBadgeHTML = '<span class="status-badge not-started">Not Started</span>';
        }
        
        testCard.innerHTML = `
            <div class="set-title">🎯 Test ${i}</div>
            <div class="set-info">100 Random Questions</div>
            ${statusBadgeHTML}
            ${statusInfoHTML}
        `;
        
        testsGrid.appendChild(testCard);
    }
}

function generateSetCards() {
    const setsGrid = document.getElementById('setsGrid');
    
    // Total 19 sets: 18 sets of 100 questions + 1 set of 31 questions
    const totalSets = 19;
    
    for (let i = 1; i <= totalSets; i++) {
        const questionsInSet = i === 19 ? 31 : 100;
        const startSN = (i - 1) * 100 + 1;
        const endSN = i === 19 ? 1831 : i * 100;
        
        const setCard = document.createElement('a');
        setCard.href = `quiz.html?set=${i}`;
        setCard.className = 'set-card';
        
        setCard.innerHTML = `
            <div class="set-title">Set ${i}</div>
            <div class="set-info">Questions ${startSN} - ${endSN}</div>
            <div class="set-info">${questionsInSet} Questions</div>
        `;
        
        setsGrid.appendChild(setCard);
    }
}

function getTestsProgress() {
    const stored = localStorage.getItem(STORAGE_KEYS.TESTS_PROGRESS);
    return stored ? JSON.parse(stored) : {};
}

function clearAllTestData() {
    localStorage.removeItem(STORAGE_KEYS.TESTS_PROGRESS);
    
    // Clear all test-specific data
    for (let i = 1; i <= 10; i++) {
        localStorage.removeItem(`atp_test_${i}_questions`);
        localStorage.removeItem(`atp_test_${i}_answers`);
        localStorage.removeItem(`atp_test_${i}_current`);
    }
    
    // Reload the page
    location.reload();
}
