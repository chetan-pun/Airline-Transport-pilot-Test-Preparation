// Main App JavaScript for Home Page

const STORAGE_KEYS = {
    TESTS_PROGRESS: 'atp_tests_progress'
};

const notesState = {
    pages: [],
    currentIndex: 0
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeHomePage();
    setupEventListeners();
});

function initializeHomePage() {
    generateTestCards();
    generateSetCards();
    initializeNotesViewer();
}

function setupEventListeners() {
    const clearTestsBtn = document.getElementById('clearTestsBtn');
    const confirmModal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmClearBtn = document.getElementById('confirmClearBtn');
    const prevNotePageBtn = document.getElementById('prevNotePageBtn');
    const nextNotePageBtn = document.getElementById('nextNotePageBtn');

    if (clearTestsBtn && confirmModal) {
        clearTestsBtn.addEventListener('click', () => {
            confirmModal.classList.add('show');
        });
    }

    if (cancelBtn && confirmModal) {
        cancelBtn.addEventListener('click', () => {
            confirmModal.classList.remove('show');
        });
    }

    if (confirmClearBtn && confirmModal) {
        confirmClearBtn.addEventListener('click', () => {
            clearAllTestData();
            confirmModal.classList.remove('show');
        });
    }

    // Close modal on outside click
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                confirmModal.classList.remove('show');
            }
        });
    }

    if (prevNotePageBtn) {
        prevNotePageBtn.addEventListener('click', () => {
            renderNotesPage(notesState.currentIndex - 1);
        });
    }

    if (nextNotePageBtn) {
        nextNotePageBtn.addEventListener('click', () => {
            renderNotesPage(notesState.currentIndex + 1);
        });
    }
}

function generateTestCards() {
    const testsGrid = document.getElementById('testsGrid');
    if (!testsGrid) {
        return;
    }

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
    if (!setsGrid) {
        return;
    }
    
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

function initializeNotesViewer() {
    const pageList = document.getElementById('notesPageList');
    if (!pageList) {
        return;
    }

    const rawNotes = typeof window.NOTES_RAW === 'string' ? window.NOTES_RAW : '';
    notesState.pages = parseNotesPages(rawNotes);

    if (notesState.pages.length === 0) {
        renderEmptyNotesState();
        return;
    }

    renderNotesPageList();
    renderNotesPage(0);
}

function parseNotesPages(rawNotes) {
    const markerPattern = /^--- Page (\d+) ---$/gm;
    const matches = [...rawNotes.matchAll(markerPattern)];

    return matches.map((match, index) => {
        const pageNumber = Number(match[1]);
        const start = match.index + match[0].length;
        const end = index < matches.length - 1 ? matches[index + 1].index : rawNotes.length;
        const content = rawNotes.slice(start, end).trim();

        return {
            pageNumber,
            content
        };
    });
}

function renderNotesPageList() {
    const pageList = document.getElementById('notesPageList');
    if (!pageList) {
        return;
    }

    pageList.innerHTML = '';

    notesState.pages.forEach((page, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'notes-page-pill';
        button.textContent = `Page ${page.pageNumber}`;
        button.addEventListener('click', () => {
            renderNotesPage(index);
        });

        pageList.appendChild(button);
    });
}

function renderNotesPage(index) {
    if (index < 0 || index >= notesState.pages.length) {
        return;
    }

    notesState.currentIndex = index;

    const page = notesState.pages[index];
    const notesPageMeta = document.getElementById('notesPageMeta');
    const notesPageStatus = document.getElementById('notesPageStatus');
    const notesPageTitle = document.getElementById('notesPageTitle');
    const notesPageContent = document.getElementById('notesPageContent');
    const prevNotePageBtn = document.getElementById('prevNotePageBtn');
    const nextNotePageBtn = document.getElementById('nextNotePageBtn');
    const pageButtons = document.querySelectorAll('.notes-page-pill');

    if (notesPageMeta) {
        notesPageMeta.textContent = `Page ${page.pageNumber} of ${notesState.pages[notesState.pages.length - 1].pageNumber}`;
    }

    if (notesPageStatus) {
        notesPageStatus.textContent = `Showing scanned page ${page.pageNumber} · ${index + 1}/${notesState.pages.length}`;
    }

    if (notesPageTitle) {
        notesPageTitle.textContent = `Page ${page.pageNumber}`;
    }

    if (notesPageContent) {
        notesPageContent.textContent = page.content || 'No readable content found on this scanned page.';
    }

    if (prevNotePageBtn) {
        prevNotePageBtn.disabled = index === 0;
    }

    if (nextNotePageBtn) {
        nextNotePageBtn.disabled = index === notesState.pages.length - 1;
    }

    pageButtons.forEach((button, buttonIndex) => {
        button.classList.toggle('active', buttonIndex === index);
    });
}

function renderEmptyNotesState() {
    const notesPageMeta = document.getElementById('notesPageMeta');
    const notesPageStatus = document.getElementById('notesPageStatus');
    const notesPageTitle = document.getElementById('notesPageTitle');
    const notesPageContent = document.getElementById('notesPageContent');

    if (notesPageMeta) {
        notesPageMeta.textContent = 'No pages available';
    }

    if (notesPageStatus) {
        notesPageStatus.textContent = 'The notes file could not be parsed.';
    }

    if (notesPageTitle) {
        notesPageTitle.textContent = 'Study Notes';
    }

    if (notesPageContent) {
        notesPageContent.textContent = 'No notes content is available yet.';
    }
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
