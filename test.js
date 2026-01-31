// Test Page JavaScript - Random 100 Question Tests

let allQuestions = [];
let currentTestNumber = 1;
let currentQuestionIndex = 0;
let userAnswers = {};
let testQuestions = [];
let showingResults = false;

const STORAGE_KEYS = {
    TESTS_PROGRESS: 'atp_tests_progress',
    TEST_QUESTIONS: 'atp_test_',
    TEST_ANSWERS: 'atp_test_',
    TEST_CURRENT: 'atp_test_current_'
};

// Initialize test
document.addEventListener('DOMContentLoaded', async () => {
    // Get test number from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentTestNumber = parseInt(urlParams.get('test')) || 1;
    
    // Load all questions
    await loadAllQuestions();
    
    // Load or generate test questions
    loadOrGenerateTestQuestions();
    
    // Load saved progress
    loadSavedProgress();
    
    // Initialize UI
    initializeTest();
    
    // Setup event listeners
    setupEventListeners();
});

async function loadAllQuestions() {
    try {
        const response = await fetch('vaskar_quiz_with_sn.json');
        allQuestions = await response.json();
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Error loading questions. Please refresh the page.');
    }
}

function loadOrGenerateTestQuestions() {
    // Check if test questions already exist in localStorage
    const savedQuestions = localStorage.getItem(STORAGE_KEYS.TEST_QUESTIONS + currentTestNumber + '_questions');
    
    if (savedQuestions) {
        testQuestions = JSON.parse(savedQuestions);
    } else {
        // Generate random 100 questions
        testQuestions = generateRandomQuestions(100);
        // Save them to localStorage
        localStorage.setItem(
            STORAGE_KEYS.TEST_QUESTIONS + currentTestNumber + '_questions',
            JSON.stringify(testQuestions)
        );
    }
}

function generateRandomQuestions(count) {
    // Create a copy of all questions and shuffle
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    // Take first 'count' questions
    return shuffled.slice(0, count);
}

function loadSavedProgress() {
    // Load saved answers
    const savedAnswers = localStorage.getItem(STORAGE_KEYS.TEST_ANSWERS + currentTestNumber + '_answers');
    if (savedAnswers) {
        userAnswers = JSON.parse(savedAnswers);
    }
    
    // Load current question
    const savedCurrent = localStorage.getItem(STORAGE_KEYS.TEST_CURRENT + currentTestNumber);
    if (savedCurrent) {
        currentQuestionIndex = parseInt(savedCurrent);
    }
}

function saveProgress() {
    // Save answers
    localStorage.setItem(
        STORAGE_KEYS.TEST_ANSWERS + currentTestNumber + '_answers',
        JSON.stringify(userAnswers)
    );
    
    // Save current question
    localStorage.setItem(
        STORAGE_KEYS.TEST_CURRENT + currentTestNumber,
        currentQuestionIndex.toString()
    );
    
    // Update tests progress
    updateTestsProgress('in-progress');
}

function updateTestsProgress(status, results = null) {
    const testsProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.TESTS_PROGRESS) || '{}');
    
    testsProgress[currentTestNumber] = {
        status: status,
        currentQuestion: currentQuestionIndex + 1,
        lastUpdated: new Date().toISOString()
    };
    
    if (results) {
        testsProgress[currentTestNumber].correct = results.correct;
        testsProgress[currentTestNumber].incorrect = results.incorrect;
        testsProgress[currentTestNumber].total = results.total;
    }
    
    localStorage.setItem(STORAGE_KEYS.TESTS_PROGRESS, JSON.stringify(testsProgress));
}

function initializeTest() {
    document.getElementById('testTitle').textContent = `Test ${currentTestNumber}`;
    displayQuestion();
}

function setupEventListeners() {
    document.getElementById('prevBtn').addEventListener('click', previousQuestion);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('retryBtn')?.addEventListener('click', retryTest);
}

function displayQuestion() {
    if (showingResults) return;
    
    const question = testQuestions[currentQuestionIndex];
    
    // Update header
    document.getElementById('questionCounter').textContent = 
        `Question ${currentQuestionIndex + 1} of ${testQuestions.length}`;
    
    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Update question
    document.getElementById('questionNumber').textContent = 
        `Question ${currentQuestionIndex + 1}`;
    document.getElementById('questionText').textContent = question.question;
    
    // Display options
    const optionsSection = document.getElementById('optionsSection');
    optionsSection.innerHTML = '';
    
    const letters = ['A', 'B', 'C', 'D'];
    const hasAnswered = userAnswers[question.sn] !== undefined;
    
    question.options.forEach((option, index) => {
        const optionCard = document.createElement('div');
        optionCard.className = 'option-card';
        optionCard.dataset.answer = letters[index];
        
        // Check if this option was selected
        if (hasAnswered && userAnswers[question.sn] === letters[index]) {
            optionCard.classList.add('selected');
        }
        
        optionCard.innerHTML = `
            <div class="option-letter">${letters[index]}</div>
            <div class="option-text">${option}</div>
        `;
        
        optionCard.addEventListener('click', () => selectOption(optionCard, letters[index], question.sn));
        optionsSection.appendChild(optionCard);
    });
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    
    const nextBtn = document.getElementById('nextBtn');
    if (currentQuestionIndex === testQuestions.length - 1) {
        nextBtn.textContent = 'Finish Test →';
    } else {
        nextBtn.textContent = 'Next →';
    }
}

function selectOption(optionCard, answer, questionSN) {
    // Remove previous selection
    const allOptions = document.querySelectorAll('.option-card');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Add selection to clicked option
    optionCard.classList.add('selected');
    
    // Save answer
    userAnswers[questionSN] = answer;
    saveProgress();
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        saveProgress();
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < testQuestions.length - 1) {
        currentQuestionIndex++;
        saveProgress();
        displayQuestion();
    } else {
        // Finish test
        showResults();
    }
}

function showResults() {
    showingResults = true;
    
    // Calculate results
    let correct = 0;
    let incorrect = 0;
    
    testQuestions.forEach(question => {
        const userAnswer = userAnswers[question.sn];
        if (userAnswer === question.answer) {
            correct++;
        } else if (userAnswer) {
            incorrect++;
        }
    });
    
    const total = testQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    
    // Update tests progress
    updateTestsProgress('completed', { correct, incorrect, total });
    
    // Hide quiz content
    document.getElementById('quizContent').style.display = 'none';
    
    // Show results content
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.style.display = 'block';
    
    // Update score display
    document.getElementById('scoreValue').textContent = percentage + '%';
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('incorrectCount').textContent = incorrect;
    document.getElementById('totalCount').textContent = total;
    
    // Display review
    displayReview();
}

function displayReview() {
    const reviewList = document.getElementById('reviewList');
    reviewList.innerHTML = '';
    
    testQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[question.sn];
        const correctAnswer = question.answer;
        const isCorrect = userAnswer === correctAnswer;
        
        // Only show if answered
        if (!userAnswer) return;
        
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        // Get the full text of the options
        const letters = ['A', 'B', 'C', 'D'];
        const correctOptionIndex = letters.indexOf(correctAnswer);
        const userAnswerIndex = letters.indexOf(userAnswer);
        const correctOptionText = question.options[correctOptionIndex];
        const userAnswerText = userAnswer ? question.options[userAnswerIndex] : 'Not answered';
        
        let reviewHTML = `
            <div class="review-question">
                <span class="review-icon">${isCorrect ? '✅' : '❌'}</span>
                <span>Question ${index + 1}: ${question.question}</span>
            </div>
            <div class="review-answer">
        `;
        
        if (!isCorrect) {
            reviewHTML += `
                <div class="review-answer-line">
                    <span class="answer-label">Your Answer:</span>
                    <span class="answer-value incorrect-answer">${userAnswerText}</span>
                </div>
                <div class="review-answer-line">
                    <span class="answer-label">Correct Answer:</span>
                    <span class="answer-value correct-answer">${correctOptionText}</span>
                </div>
            `;
        } else {
            reviewHTML += `
                <div class="review-answer-line">
                    <span class="answer-label">Your Answer:</span>
                    <span class="answer-value correct-answer">${correctOptionText}</span>
                </div>
            `;
        }
        
        reviewHTML += `</div>`;
        reviewItem.innerHTML = reviewHTML;
        reviewList.appendChild(reviewItem);
    });
}

function retryTest() {
    // Clear saved progress for this test
    localStorage.removeItem(STORAGE_KEYS.TEST_QUESTIONS + currentTestNumber + '_questions');
    localStorage.removeItem(STORAGE_KEYS.TEST_ANSWERS + currentTestNumber + '_answers');
    localStorage.removeItem(STORAGE_KEYS.TEST_CURRENT + currentTestNumber);
    
    // Update progress status
    updateTestsProgress('not-started');
    
    // Reload the page to generate new random questions
    location.reload();
}
