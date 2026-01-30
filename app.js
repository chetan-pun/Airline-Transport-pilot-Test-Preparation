// Main App JavaScript for Home Page

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeHomePage();
});

function initializeHomePage() {
    generateSetCards();
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
