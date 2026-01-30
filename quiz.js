// Quiz Page JavaScript

let allQuestions = [];
let currentSetNumber = 1;
let currentQuestionIndex = 0;
let userAnswers = {};
let quizQuestions = [];
let showingResults = false;

// Initialize quiz
document.addEventListener('DOMContentLoaded', async () => {
    // Get set number from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentSetNumber = parseInt(urlParams.get('set')) || 1;
    
    // Load questions
    await loadQuestions();
    
    // Initialize UI
    initializeQuiz();
    
    // Setup event listeners
    setupEventListeners();
});

async function loadQuestions() {
    try {
        const response = await fetch('vaskar_quiz_with_sn.json');
        allQuestions = await response.json();
        
        // Filter questions for current set
        const questionsPerSet = 100;
        const startSN = (currentSetNumber - 1) * questionsPerSet + 1;
        const endSN = currentSetNumber === 19 ? 1831 : currentSetNumber * questionsPerSet;
        
        quizQuestions = allQuestions.filter(q => q.sn >= startSN && q.sn <= endSN);
        
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Error loading questions. Please refresh the page.');
    }
}


function initializeQuiz() {
    document.getElementById('setTitle').textContent = `Set ${currentSetNumber}`;
    displayQuestion();
}

function setupEventListeners() {
    document.getElementById('prevBtn').addEventListener('click', previousQuestion);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('retryBtn')?.addEventListener('click', retrySet);
}

function displayQuestion() {
    if (showingResults) return;
    
    const question = quizQuestions[currentQuestionIndex];
    
    // Update header
    document.getElementById('questionCounter').textContent = 
        `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    
    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Update question
    document.getElementById('questionNumber').textContent = 
        `Question ${currentQuestionIndex + 1}`;
    document.getElementById('questionText').textContent = question.question;
    
    // Display options (fresh start, no previous answers shown)
    const optionsSection = document.getElementById('optionsSection');
    optionsSection.innerHTML = '';
    
    const letters = ['A', 'B', 'C', 'D'];
    
    question.options.forEach((option, index) => {
        const optionCard = document.createElement('div');
        optionCard.className = 'option-card';
        optionCard.dataset.answer = letters[index];
        
        optionCard.innerHTML = `
            <div class="option-letter">${letters[index]}</div>
            <div class="option-text">${option}</div>
        `;
        
        optionCard.addEventListener('click', () => selectOption(letters[index], question.sn, question.answer));
        
        optionsSection.appendChild(optionCard);
    });
    
    // Remove any previous feedback
    removeFeedback();
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    
    const nextBtn = document.getElementById('nextBtn');
    if (currentQuestionIndex === quizQuestions.length - 1) {
        nextBtn.textContent = 'Finish Quiz →';
    } else {
        nextBtn.textContent = 'Next →';
    }
}

function selectOption(selectedAnswer, questionSN, correctAnswer) {
    const question = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Save answer (in memory only)
    userAnswers[questionSN] = selectedAnswer;
    
    // Update all option cards to show feedback
    const allOptions = document.querySelectorAll('.option-card');
    allOptions.forEach(opt => {
        const optAnswer = opt.dataset.answer;
        
        // Remove previous selection classes
        opt.classList.remove('selected', 'incorrect', 'correct');
        
        if (optAnswer === selectedAnswer) {
            opt.classList.add('selected');
            if (isCorrect) {
                opt.classList.add('correct');
                // Disable all options if correct
                opt.classList.add('disabled');
            } else {
                opt.classList.add('incorrect');
            }
        } else if (isCorrect && optAnswer === correctAnswer) {
            // Only show correct answer when user gets it right
            opt.classList.add('correct', 'disabled');
        }
    });
    
    // Disable all options if correct answer is selected
    if (isCorrect) {
        allOptions.forEach(opt => opt.classList.add('disabled'));
    }
    
    // Show feedback message
    showFeedback(question);
}

function showFeedback(question) {
    const userAnswer = userAnswers[question.sn];
    const isCorrect = userAnswer === question.answer;
    
    // Remove existing feedback
    removeFeedback();
    
    // Create feedback section
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `feedback-section ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
    feedbackDiv.id = 'feedbackSection';
    
    if (isCorrect) {
        feedbackDiv.innerHTML = `
            <div class="feedback-icon">✅</div>
            <div class="feedback-content">
                <h3>Correct!</h3>
                <p>Great job! You selected the right answer. Click "Next" to continue.</p>
            </div>
        `;
    } else {
        const letters = ['A', 'B', 'C', 'D'];
        const correctIndex = letters.indexOf(question.answer);
        const correctOption = question.options[correctIndex];
        
        feedbackDiv.innerHTML = `
            <div class="feedback-icon">❌</div>
            <div class="feedback-content">
                <h3>Incorrect - Try Again!</h3>
                <p class="feedback-text">That's not correct. The right answer is:</p>
                <div class="correct-answer-display">
                    <strong>${correctOption}</strong>
                </div>
                <p class="retry-hint">💡 You can select another option to try again!</p>
            </div>
        `;
    }
    
    // Insert feedback after options section
    const optionsSection = document.getElementById('optionsSection');
    optionsSection.parentNode.insertBefore(feedbackDiv, optionsSection.nextSibling);
}

function removeFeedback() {
    const existingFeedback = document.getElementById('feedbackSection');
    if (existingFeedback) {
        existingFeedback.remove();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        // Clear the answer for the previous question
        const question = quizQuestions[currentQuestionIndex];
        delete userAnswers[question.sn];
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        // Finish quiz
        showResults();
    }
}

function showResults() {
    showingResults = true;
    
    // Calculate results
    let correct = 0;
    let incorrect = 0;
    
    quizQuestions.forEach(question => {
        const userAnswer = userAnswers[question.sn];
        if (userAnswer === question.answer) {
            correct++;
        } else if (userAnswer) {
            incorrect++;
        }
    });
    
    const total = quizQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    
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
    
    quizQuestions.forEach((question, index) => {
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

function retrySet() {
    // Reset variables
    userAnswers = {};
    currentQuestionIndex = 0;
    showingResults = false;
    
    // Show quiz content
    document.getElementById('quizContent').style.display = 'block';
    document.getElementById('resultsContent').style.display = 'none';
    
    // Reload quiz
    displayQuestion();
}
