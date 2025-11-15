let tasks = [];
let gameData = {
    level: 1,
    xp: 0,
    streak: 0,
    achievements: []
};

const XP_PER_LEVEL = 100;
const ACHIEVEMENTS = [
    { id: 'first', name: '🎯 First Quest', condition: () => tasks.length >= 1 },
    { id: 'five', name: '⭐ 5 Quests', condition: () => tasks.length >= 5 },
    { id: 'complete5', name: '🏆 5 Completed', condition: () => tasks.filter(t => t.completed).length >= 5 },
    { id: 'streak3', name: '🔥 3 Day Streak', condition: () => gameData.streak >= 3 },
    { id: 'level5', name: '👑 Level 5', condition: () => gameData.level >= 5 }
];

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    const savedGameData = localStorage.getItem('gameData');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    if (savedGameData) {
        gameData = JSON.parse(savedGameData);
    }
    
    updateDOM();
    updateStats();
    checkAchievements();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

// Add task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        showNotification('⚠️ Please enter a quest!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        points: 10
    };
    
    tasks.push(task);
    saveTasks();
    updateDOM();
    checkAchievements();
    showNotification('✨ New quest added!');
    taskInput.value = '';
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    updateDOM();
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        
        if (task.completed) {
            gainXP(task.points);
            gameData.streak++;
            showNotification(`🎉 +${task.points} XP! Quest completed!`);
        } else {
            gameData.xp = Math.max(0, gameData.xp - task.points);
        }
        
        saveTasks();
        updateDOM();
        updateStats();
        checkAchievements();
    }
}

// Gain XP and level up
function gainXP(points) {
    gameData.xp += points;
    
    while (gameData.xp >= XP_PER_LEVEL) {
        gameData.xp -= XP_PER_LEVEL;
        gameData.level++;
        showNotification(`🎊 LEVEL UP! You're now level ${gameData.level}!`);
    }
}

// Update stats display
function updateStats() {
    document.getElementById('level').textContent = gameData.level;
    document.getElementById('xp').textContent = `${gameData.xp}/${XP_PER_LEVEL}`;
    document.getElementById('streak').textContent = `${gameData.streak}🔥`;
    
    const progressPercent = (gameData.xp / XP_PER_LEVEL) * 100;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
}

// Check and unlock achievements
function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (!gameData.achievements.includes(achievement.id) && achievement.condition()) {
            gameData.achievements.push(achievement.id);
            showNotification(`🏅 Achievement Unlocked: ${achievement.name}`);
            saveTasks();
        }
    });
    
    displayAchievements();
}

// Display achievements
function displayAchievements() {
    const achievementsDiv = document.getElementById('achievements');
    achievementsDiv.innerHTML = gameData.achievements.length > 0 
        ? '<strong>Achievements:</strong> ' + gameData.achievements.map(id => {
            const achievement = ACHIEVEMENTS.find(a => a.id === id);
            return `<span class="achievement-item">${achievement.name}</span>`;
        }).join('')
        : '';
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Update DOM
function updateDOM() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <span class="task-points">+${task.points} XP</span>
            <button class="delete-btn">Delete</button>
        `;
        
        // Checkbox event
        li.querySelector('.task-checkbox').addEventListener('change', () => toggleTask(task.id));
        
        // Delete button event
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
        
        taskList.appendChild(li);
    });
}

// Event listeners
document.getElementById('addBtn').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initialize
loadTasks();
