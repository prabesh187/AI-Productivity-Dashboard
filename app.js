// ============================================
// DATA MODELS & STORAGE
// ============================================

// Task Model
class Task {
    constructor(title, priority = 'medium', dueDate = null) {
        this.id = Date.now() + Math.random();
        this.title = title;
        this.priority = priority;
        this.dueDate = dueDate;
        this.status = 'pending';
        this.createdAt = new Date().toISOString();
        this.completedAt = null;
    }
}

// Focus Session Model
class FocusSession {
    constructor(duration) {
        this.id = Date.now();
        this.duration = duration; // in minutes
        this.date = new Date().toISOString().split('T')[0];
        this.timestamp = new Date().toISOString();
    }
}

// Storage Manager
class StorageManager {
    static getTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    static saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    static getFocusSessions() {
        const sessions = localStorage.getItem('focusSessions');
        return sessions ? JSON.parse(sessions) : [];
    }

    static saveFocusSessions(sessions) {
        localStorage.setItem('focusSessions', JSON.stringify(sessions));
    }

    static getTheme() {
        return localStorage.getItem('theme') || 'light';
    }

    static saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }
}

// ============================================
// APPLICATION STATE
// ============================================

let tasks = StorageManager.getTasks();
let focusSessions = StorageManager.getFocusSessions();
let currentFilter = 'all';
let timerInterval = null;
let timerSeconds = 25 * 60; // 25 minutes
let isTimerRunning = false;
let isBreakTime = false;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App initializing...'); // Debug log
    initializeApp();
    console.log('✅ App initialized successfully!'); // Debug log
});

function initializeApp() {
    // Apply saved theme
    const savedTheme = StorageManager.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Set default due date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').value = today;

    // Event Listeners
    setupEventListeners();

    // Initial Render
    renderOverview();
    renderTasks();
    renderAnalytics();
    renderInsights();
    updateTimerStats();
}

function setupEventListeners() {
    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });

    // Task Management
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('taskTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Task Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderTasks();
        });
    });

    // Timer Controls
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
}

// ============================================
// THEME MANAGEMENT
// ============================================

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    StorageManager.saveTheme(newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeToggle');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ============================================
// VIEW MANAGEMENT
// ============================================

function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    document.getElementById(viewName).classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });

    // Refresh data for specific views
    if (viewName === 'overview') renderOverview();
    if (viewName === 'analytics') renderAnalytics();
    if (viewName === 'insights') renderInsights();
}

// ============================================
// TASK MANAGEMENT
// ============================================

function addTask() {
    console.log('addTask function called'); // Debug log
    
    const titleInput = document.getElementById('taskTitle');
    const prioritySelect = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('taskDueDate');

    console.log('Elements found:', { titleInput, prioritySelect, dueDateInput }); // Debug log

    const title = titleInput.value.trim();
    if (!title) {
        alert('Please enter a task title');
        return;
    }

    const task = new Task(title, prioritySelect.value, dueDateInput.value);
    console.log('Task created:', task); // Debug log
    
    tasks.push(task);
    StorageManager.saveTasks(tasks);
    console.log('Task saved. Total tasks:', tasks.length); // Debug log

    // Clear inputs
    titleInput.value = '';
    prioritySelect.value = 'medium';
    dueDateInput.value = new Date().toISOString().split('T')[0];

    // Re-render
    renderTasks();
    renderOverview();
    renderInsights();
    
    console.log('Task added successfully!'); // Debug log
}

function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
        task.completedAt = task.status === 'completed' ? new Date().toISOString() : null;
        StorageManager.saveTasks(tasks);
        renderTasks();
        renderOverview();
        renderAnalytics();
        renderInsights();
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        StorageManager.saveTasks(tasks);
        renderTasks();
        renderOverview();
        renderInsights();
    }
}

function renderTasks() {
    const container = document.getElementById('tasksList');
    
    // Sort tasks: high priority first, then by due date
    let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'all') return true;
        return task.status === currentFilter;
    });

    // Sort by priority and due date
    filteredTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    if (filteredTasks.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:2rem;">No tasks found. Add your first task!</p>';
        return;
    }

    container.innerHTML = filteredTasks.map(task => `
        <div class="task-item priority-${task.priority} ${task.status}">
            <input type="checkbox" 
                   class="task-checkbox" 
                   ${task.status === 'completed' ? 'checked' : ''}
                   onchange="toggleTaskStatus(${task.id})">
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span>📌 ${task.priority.toUpperCase()}</span>
                    <span>📅 ${formatDate(task.dueDate)}</span>
                    ${isOverdue(task) ? '<span style="color:var(--danger)">⚠️ OVERDUE</span>' : ''}
                </div>
            </div>
            <div class="task-actions">
                <button onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ============================================
// OVERVIEW SECTION
// ============================================

function renderOverview() {
    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const todayFocus = getTodayFocusTime();
    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update stat cards
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('todayFocus').textContent = `${(todayFocus / 60).toFixed(1)}h`;
    document.getElementById('productivity').textContent = `${productivity}%`;

    // Render today's tasks
    renderTodayTasks();
}

function renderTodayTasks() {
    const container = document.getElementById('todayTasksList');
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.dueDate === today);

    if (todayTasks.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);">No tasks due today</p>';
        return;
    }

    container.innerHTML = todayTasks.slice(0, 5).map(task => `
        <div class="task-item priority-${task.priority} ${task.status}" style="margin-bottom:0.5rem;">
            <input type="checkbox" 
                   class="task-checkbox" 
                   ${task.status === 'completed' ? 'checked' : ''}
                   onchange="toggleTaskStatus(${task.id})">
            <div class="task-content">
                <div class="task-title">${task.title}</div>
            </div>
        </div>
    `).join('');
}

// ============================================
// FOCUS TIMER (POMODORO)
// ============================================

function startTimer() {
    isTimerRunning = true;
    document.getElementById('startTimer').style.display = 'none';
    document.getElementById('pauseTimer').style.display = 'inline-block';

    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();

        if (timerSeconds <= 0) {
            completeTimer();
        }
    }, 1000);
}

function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    document.getElementById('startTimer').style.display = 'inline-block';
    document.getElementById('pauseTimer').style.display = 'none';
}

function resetTimer() {
    pauseTimer();
    timerSeconds = 25 * 60;
    isBreakTime = false;
    updateTimerDisplay();
}

function completeTimer() {
    pauseTimer();

    if (!isBreakTime) {
        // Focus session completed
        const session = new FocusSession(25);
        focusSessions.push(session);
        StorageManager.saveFocusSessions(focusSessions);

        alert('🎉 Focus session complete! Time for a 5-minute break.');
        timerSeconds = 5 * 60;
        isBreakTime = true;
    } else {
        // Break completed
        alert('✅ Break complete! Ready for another focus session?');
        timerSeconds = 25 * 60;
        isBreakTime = false;
    }

    updateTimerDisplay();
    updateTimerStats();
    renderOverview();
    renderAnalytics();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimerStats() {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = focusSessions.filter(s => s.date === today);
    const totalMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);

    document.getElementById('sessionsToday').textContent = todaySessions.length;
    document.getElementById('totalFocusTime').textContent = `${totalMinutes} min`;
}

function getTodayFocusTime() {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = focusSessions.filter(s => s.date === today);
    return todaySessions.reduce((sum, s) => sum + s.duration, 0);
}

// ============================================
// ANALYTICS & CHARTS
// ============================================

function renderAnalytics() {
    renderTasksChart();
    renderFocusChart();
    updateWeeklySummary();
}

function renderTasksChart() {
    const ctx = document.getElementById('tasksChart');
    const last7Days = getLast7Days();
    
    const completedByDay = last7Days.map(date => {
        return tasks.filter(t => 
            t.status === 'completed' && 
            t.completedAt && 
            t.completedAt.split('T')[0] === date
        ).length;
    });

    if (window.tasksChart) window.tasksChart.destroy();

    window.tasksChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last7Days.map(d => formatShortDate(d)),
            datasets: [{
                label: 'Tasks Completed',
                data: completedByDay,
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderFocusChart() {
    const ctx = document.getElementById('focusChart');
    const last7Days = getLast7Days();
    
    const focusByDay = last7Days.map(date => {
        const sessions = focusSessions.filter(s => s.date === date);
        return sessions.reduce((sum, s) => sum + s.duration, 0);
    });

    if (window.focusChart) window.focusChart.destroy();

    window.focusChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days.map(d => formatShortDate(d)),
            datasets: [{
                label: 'Focus Time (minutes)',
                data: focusByDay,
                backgroundColor: 'rgba(118, 75, 162, 0.2)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateWeeklySummary() {
    const last7Days = getLast7Days();
    
    const weeklyCompleted = tasks.filter(t => 
        t.status === 'completed' && 
        t.completedAt && 
        last7Days.includes(t.completedAt.split('T')[0])
    ).length;

    const weeklyTotal = tasks.filter(t => 
        last7Days.includes(t.createdAt.split('T')[0])
    ).length;

    const completionRate = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

    const weeklyFocusMinutes = focusSessions
        .filter(s => last7Days.includes(s.date))
        .reduce((sum, s) => sum + s.duration, 0);

    const avgDailyFocus = weeklyFocusMinutes / 7;

    document.getElementById('weeklyTasks').textContent = weeklyCompleted;
    document.getElementById('completionRate').textContent = `${completionRate}%`;
    document.getElementById('weeklyFocus').textContent = `${(weeklyFocusMinutes / 60).toFixed(1)}h`;
    document.getElementById('avgFocus').textContent = `${(avgDailyFocus / 60).toFixed(1)}h`;
}

// ============================================
// AI INSIGHTS (LOGIC-BASED)
// ============================================

function renderInsights() {
    const insights = generateInsights();
    const container = document.getElementById('insightsContainer');

    if (insights.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Keep using the app to get personalized insights!</p>';
        return;
    }

    container.innerHTML = insights.map(insight => `
        <div class="insight-card type-${insight.type}">
            <div class="insight-header">
                ${insight.icon} ${insight.title}
            </div>
            <div class="insight-body">
                ${insight.message}
            </div>
        </div>
    `).join('');
}

function generateInsights() {
    // Use the enhanced AI rules engine if available
    if (typeof ProductivityAI !== 'undefined') {
        const ai = new ProductivityAI(tasks, focusSessions);
        return ai.analyze();
    }
    
    // Fallback to basic insights if ai-rules.js not loaded
    return generateBasicInsights();
}

function generateBasicInsights() {
    const insights = [];
    const today = new Date().toISOString().split('T')[0];
    const last7Days = getLast7Days();

    // Basic Insight 1: Best Working Time
    const morningTasks = tasks.filter(t => {
        if (!t.completedAt) return false;
        const hour = new Date(t.completedAt).getHours();
        return hour >= 6 && hour < 12;
    }).length;

    const eveningTasks = tasks.filter(t => {
        if (!t.completedAt) return false;
        const hour = new Date(t.completedAt).getHours();
        return hour >= 18 && hour < 24;
    }).length;

    if (morningTasks > eveningTasks && morningTasks > 5) {
        insights.push({
            type: 'success',
            icon: '🌅',
            title: 'Morning Productivity',
            message: `You complete most tasks in the morning! You've completed ${morningTasks} tasks before noon. Keep leveraging your morning energy.`
        });
    } else if (eveningTasks > morningTasks && eveningTasks > 5) {
        insights.push({
            type: 'info',
            icon: '🌙',
            title: 'Evening Productivity',
            message: `You're an evening person! ${eveningTasks} tasks completed after 6 PM. Schedule important work for evenings.`
        });
    }

    // Basic Insight 2: Overdue Tasks Warning
    const overdueTasks = tasks.filter(t => isOverdue(t) && t.status === 'pending');
    if (overdueTasks.length > 0) {
        insights.push({
            type: 'danger',
            icon: '⚠️',
            title: 'Overdue Tasks Alert',
            message: `You have ${overdueTasks.length} overdue task(s). Consider breaking them into smaller tasks or adjusting deadlines.`
        });
    }

    return insights;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

function formatDate(dateString) {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(task) {
    if (!task.dueDate || task.status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today;
}

// Make functions globally accessible for inline event handlers
window.toggleTaskStatus = toggleTaskStatus;
window.deleteTask = deleteTask;
window.switchView = switchView;
