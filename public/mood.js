let selectedMood = null;
let userEmail = null;
let moodHistory = [];

// Get user email from localStorage or session
function getCurrentUser() {
    // Assuming user data is stored in localStorage after login
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        const user = JSON.parse(userData);
        userEmail = user.email;
        return user;
    }
    return null;
}

// Initialize the page
function init() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        alert("You are not logged in. Redirecting to login...");
        window.location.href = "/login.html"; // change to your login page
        return;
    }

    const user = JSON.parse(userData);
    userEmail = user.email;

    setupEventListeners();
    loadMoodHistory();
}

function setupEventListeners() {
    // Mood selection
    document.querySelectorAll('.mood-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remove selection from all options
            document.querySelectorAll('.mood-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Select current option
            this.classList.add('selected');
            selectedMood = {
                value: parseInt(this.dataset.mood),
                label: this.dataset.label,
                emoji: this.querySelector('.mood-emoji').textContent
            };
            
            // Enable submit button
            document.getElementById('submitMood').disabled = false;
        });
    });
    
    // Submit mood
    document.getElementById('submitMood').addEventListener('click', submitMood);
    
    // History filter
    document.getElementById('historyFilter').addEventListener('change', function() {
        filterMoodHistory(this.value);
    });
}

async function submitMood() {
    if (!selectedMood || !userEmail) return;

    const moodData = {
        email: userEmail,
        mood: {
            value: selectedMood.value,
            label: selectedMood.label,
            emoji: selectedMood.emoji,
            notes: document.getElementById('moodNotes').value.trim(),
            date: new Date().toISOString()
        }
    };

    try {
        const response = await fetch('http://localhost:3000/api/mood', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(moodData)
        });

        if (response.ok) {
            showMessage('successMessage', 'Mood logged successfully! 🎉');
            resetForm();
            loadMoodHistory();
        } else {
            throw new Error('Failed to submit mood');
        }
    } catch (error) {
        console.error('Error submitting mood:', error);
        showMessage('errorMessage', 'Failed to log mood. Please try again.');
    }
}

function resetForm() {
    // Clear selection
    document.querySelectorAll('.mood-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Clear notes
    document.getElementById('moodNotes').value = '';
    
    // Reset variables
    selectedMood = null;
    document.getElementById('submitMood').disabled = true;
}

async function loadMoodHistory() {
    if (!userEmail) return;

    try {
        const response = await fetch(`http://localhost:3000/api/mood-history/${userEmail}`);
        if (response.ok) {
            const data = await response.json();
            moodHistory = data.moodEntries || [];
            displayMoodHistory();
            updateStats();
        } else {
            console.error('Failed to load mood history');
        }
    } catch (error) {
        console.error('Error loading mood history:', error);
    }
}

function displayMoodHistory(days = 7) {
    const historyContainer = document.getElementById('moodHistory');
    
    if (moodHistory.length === 0) {
        historyContainer.innerHTML = '<div class="no-data">No mood entries yet. Start tracking your mood today!</div>';
        return;
    }
    
    // Filter by days
    let filteredHistory = moodHistory;
    if (days !== 'all') {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        filteredHistory = moodHistory.filter(entry => new Date(entry.date) >= cutoffDate);
    }
    
    // Sort by date (newest first)
    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredHistory.length === 0) {
        historyContainer.innerHTML = '<div class="no-data">No mood entries in selected time period.</div>';
        return;
    }
    
    const historyHTML = filteredHistory.map(entry => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
            <div class="mood-entry">
                <div class="entry-date">${dateStr}</div>
                <div class="entry-mood">${entry.emoji}</div>
                <div class="entry-details">
                    <div class="entry-label">${entry.label}</div>
                    ${entry.notes ? `<div class="entry-notes">"${entry.notes}"</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    historyContainer.innerHTML = historyHTML;
}

function filterMoodHistory(days) {
    displayMoodHistory(days);
}

function updateStats() {
    if (moodHistory.length === 0) {
        document.getElementById('avgMood').textContent = '-';
        document.getElementById('totalEntries').textContent = '0';
        document.getElementById('streakDays').textContent = '0';
        return;
    }
    
    // Calculate average mood
    const avgMood = (moodHistory.reduce((sum, entry) => sum + entry.value, 0) / moodHistory.length).toFixed(1);
    document.getElementById('avgMood').textContent = avgMood;
    
    // Total entries
    document.getElementById('totalEntries').textContent = moodHistory.length;
    
    // Calculate streak (consecutive days with entries)
    const streak = calculateStreak();
    document.getElementById('streakDays').textContent = streak;
}

function calculateStreak() {
    if (moodHistory.length === 0) return 0;
    
    const sortedEntries = [...moodHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const entry of sortedEntries) {
        const entryDate = new Date(entry.date);
        const dayDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff <= streak + 1) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

function showMessage(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);