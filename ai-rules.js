// ============================================
// AI PRODUCTIVITY RULES ENGINE
// Logic-based analysis (no machine learning)
// ============================================

class ProductivityAI {
    constructor(tasks, focusSessions) {
        this.tasks = tasks;
        this.focusSessions = focusSessions;
        this.insights = [];
        this.today = new Date().toISOString().split('T')[0];
        this.last7Days = this.getLast7Days();
        this.last30Days = this.getLast30Days();
    }

    // Main analysis function
    analyze() {
        this.insights = [];
        
        // Run all analysis rules
        this.analyzeWorkingTimePattern();
        this.analyzeMissedDeadlines();
        this.analyzeFocusTime();
        this.analyzeTaskCompletionRate();
        this.analyzeProductivityStreak();
        this.analyzeTaskOverload();
        this.analyzeProcrastination();
        this.analyzeWorkLifeBalance();
        this.analyzeTaskPriorityPattern();
        this.analyzeConsistency();
        this.analyzeBurnoutRisk();
        this.analyzeOptimalTaskSize();
        
        return this.insights;
    }

    // RULE 1: Working Time Pattern Analysis
    analyzeWorkingTimePattern() {
        const completedTasks = this.tasks.filter(t => t.status === 'completed' && t.completedAt);
        
        if (completedTasks.length < 5) return; // Need enough data

        let morningCount = 0;   // 6 AM - 12 PM
        let afternoonCount = 0; // 12 PM - 6 PM
        let eveningCount = 0;   // 6 PM - 12 AM
        let nightCount = 0;     // 12 AM - 6 AM

        completedTasks.forEach(task => {
            const hour = new Date(task.completedAt).getHours();
            if (hour >= 6 && hour < 12) morningCount++;
            else if (hour >= 12 && hour < 18) afternoonCount++;
            else if (hour >= 18 && hour < 24) eveningCount++;
            else nightCount++;
        });

        const total = completedTasks.length;
        const morningPercent = (morningCount / total) * 100;
        const afternoonPercent = (afternoonCount / total) * 100;
        const eveningPercent = (eveningCount / total) * 100;

        // Rule: If 40%+ tasks completed in one time period
        if (morningPercent >= 40) {
            this.addInsight('success', '🌅', 'Morning Productivity Peak',
                `${morningPercent.toFixed(0)}% of your tasks are completed before noon. You're a morning person! Schedule important work between 6 AM - 12 PM for best results.`);
        } else if (afternoonPercent >= 40) {
            this.addInsight('info', '☀️', 'Afternoon Productivity Peak',
                `${afternoonPercent.toFixed(0)}% of your tasks are completed in the afternoon. Your peak hours are 12 PM - 6 PM. Plan demanding tasks during this window.`);
        } else if (eveningPercent >= 40) {
            this.addInsight('info', '🌙', 'Evening Productivity Peak',
                `${eveningPercent.toFixed(0)}% of your tasks are completed in the evening. You work best after 6 PM. Embrace your night owl nature!`);
        } else if (nightCount > 5) {
            this.addInsight('warning', '🦉', 'Late Night Work Pattern',
                `You've completed ${nightCount} tasks between midnight and 6 AM. Consider shifting your schedule for better health and productivity.`);
        }
    }

    // RULE 2: Missed Deadlines Analysis
    analyzeMissedDeadlines() {
        const weeklyMissed = this.tasks.filter(t => {
            if (!t.dueDate || t.status === 'completed') return false;
            const dueDate = new Date(t.dueDate);
            const today = new Date(this.today);
            return dueDate < today && this.last7Days.includes(t.dueDate);
        });

        const monthlyMissed = this.tasks.filter(t => {
            if (!t.dueDate || t.status === 'completed') return false;
            const dueDate = new Date(t.dueDate);
            const today = new Date(this.today);
            return dueDate < today && this.last30Days.includes(t.dueDate);
        });

        // Rule: If missed deadlines > 3 per week
        if (weeklyMissed.length > 3) {
            this.addInsight('danger', '⚠️', 'Critical: Frequent Missed Deadlines',
                `You've missed ${weeklyMissed.length} deadlines this week. Action needed: Break tasks into smaller chunks, extend deadlines, or reduce commitments.`);
        } else if (weeklyMissed.length > 0) {
            this.addInsight('warning', '📅', 'Deadline Alert',
                `${weeklyMissed.length} deadline(s) missed this week. Review your task load and adjust priorities.`);
        }

        // Rule: If monthly pattern shows increasing misses
        if (monthlyMissed.length > 10) {
            this.addInsight('danger', '🚨', 'Chronic Deadline Issues',
                `${monthlyMissed.length} missed deadlines this month. This pattern suggests overcommitment. Consider: 1) Setting more realistic deadlines, 2) Saying no to new tasks, 3) Delegating when possible.`);
        }

        // Rule: If no missed deadlines and many completed
        const completedOnTime = this.tasks.filter(t => 
            t.status === 'completed' && 
            t.dueDate && 
            t.completedAt &&
            new Date(t.completedAt) <= new Date(t.dueDate)
        );

        if (completedOnTime.length >= 10 && weeklyMissed.length === 0) {
            this.addInsight('success', '🎯', 'Deadline Master',
                `Perfect! ${completedOnTime.length} tasks completed on time with zero missed deadlines. Your time management is excellent!`);
        }
    }

    // RULE 3: Focus Time Analysis
    analyzeFocusTime() {
        const todayFocus = this.focusSessions
            .filter(s => s.date === this.today)
            .reduce((sum, s) => sum + s.duration, 0);

        const weeklyFocus = this.focusSessions
            .filter(s => this.last7Days.includes(s.date))
            .reduce((sum, s) => sum + s.duration, 0);

        const avgDailyFocus = weeklyFocus / 7;

        // Rule: If focus time < 60 min/day
        if (avgDailyFocus < 60 && this.focusSessions.length > 0) {
            this.addInsight('warning', '⏱️', 'Low Focus Time Detected',
                `Your average daily focus is ${avgDailyFocus.toFixed(0)} minutes. Aim for at least 2 Pomodoro sessions (50 min) daily. Start with one 25-minute session today!`);
        }

        // Rule: If no focus sessions today
        if (todayFocus === 0 && this.focusSessions.length > 0) {
            this.addInsight('info', '🎯', 'Start Your Focus Session',
                `You haven't started any focus sessions today. Begin with just one 25-minute Pomodoro to build momentum!`);
        }

        // Rule: If excellent focus time
        if (avgDailyFocus >= 120) {
            this.addInsight('success', '🔥', 'Deep Work Champion',
                `Outstanding! ${(avgDailyFocus / 60).toFixed(1)} hours of daily focus time. You're in the top 5% of productive people. Keep this momentum!`);
        }

        // Rule: If focus time declining
        const recentFocus = this.focusSessions
            .filter(s => this.last7Days.slice(-3).includes(s.date))
            .reduce((sum, s) => sum + s.duration, 0);

        const previousFocus = this.focusSessions
            .filter(s => this.last7Days.slice(0, 4).includes(s.date))
            .reduce((sum, s) => sum + s.duration, 0);

        if (previousFocus > 0 && recentFocus < previousFocus * 0.5) {
            this.addInsight('warning', '📉', 'Focus Time Declining',
                `Your focus time dropped by ${(((previousFocus - recentFocus) / previousFocus) * 100).toFixed(0)}% this week. Identify distractions and schedule dedicated focus blocks.`);
        }
    }

    // RULE 4: Task Completion Rate Analysis
    analyzeTaskCompletionRate() {
        const totalTasks = this.tasks.length;
        if (totalTasks === 0) return;

        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const completionRate = (completedTasks / totalTasks) * 100;

        const weeklyCreated = this.tasks.filter(t => 
            this.last7Days.includes(t.createdAt.split('T')[0])
        ).length;

        const weeklyCompleted = this.tasks.filter(t => 
            t.status === 'completed' && 
            t.completedAt &&
            this.last7Days.includes(t.completedAt.split('T')[0])
        ).length;

        // Rule: If completion rate < 30%
        if (completionRate < 30 && totalTasks >= 10) {
            this.addInsight('danger', '📊', 'Low Completion Rate Alert',
                `Only ${completionRate.toFixed(0)}% of tasks completed. You're creating tasks faster than completing them. Try: 1) Limit new tasks, 2) Delete unnecessary tasks, 3) Break large tasks into smaller ones.`);
        }

        // Rule: If completion rate 30-50%
        else if (completionRate >= 30 && completionRate < 50) {
            this.addInsight('warning', '💡', 'Improve Task Completion',
                `${completionRate.toFixed(0)}% completion rate. Focus on finishing existing tasks before adding new ones. Use the 2-minute rule: if it takes < 2 minutes, do it now!`);
        }

        // Rule: If completion rate 50-70%
        else if (completionRate >= 50 && completionRate < 70) {
            this.addInsight('info', '📈', 'Good Progress',
                `${completionRate.toFixed(0)}% completion rate - you're making solid progress! Push to 80%+ by tackling 2-3 quick wins today.`);
        }

        // Rule: If completion rate >= 80%
        else if (completionRate >= 80) {
            this.addInsight('success', '⭐', 'Exceptional Completion Rate',
                `${completionRate.toFixed(0)}% completion rate! You're excellent at finishing what you start. This discipline sets you apart.`);
        }

        // Rule: If creating more than completing
        if (weeklyCreated > weeklyCompleted * 2 && weeklyCreated > 5) {
            this.addInsight('warning', '⚖️', 'Task Creation Imbalance',
                `You created ${weeklyCreated} tasks but completed only ${weeklyCompleted} this week. Pause adding new tasks and focus on your existing list.`);
        }
    }

    // RULE 5: Productivity Streak Analysis
    analyzeProductivityStreak() {
        const dailyCompletions = {};
        
        this.last7Days.forEach(date => {
            dailyCompletions[date] = this.tasks.filter(t => 
                t.status === 'completed' && 
                t.completedAt &&
                t.completedAt.split('T')[0] === date
            ).length;
        });

        const productiveDays = Object.values(dailyCompletions).filter(count => count > 0).length;
        const totalCompleted = Object.values(dailyCompletions).reduce((sum, count) => sum + count, 0);

        // Rule: If 5+ productive days in a week
        if (productiveDays >= 5) {
            this.addInsight('success', '🔥', 'Productivity Streak Active',
                `${productiveDays} productive days this week! You're building a powerful habit. Consistency beats intensity.`);
        }

        // Rule: If 10+ tasks completed this week
        if (totalCompleted >= 10) {
            this.addInsight('success', '🚀', 'High Output Week',
                `${totalCompleted} tasks completed this week! You're crushing it. This momentum will compound over time.`);
        }

        // Rule: If < 2 productive days
        if (productiveDays < 2 && this.tasks.length > 0) {
            this.addInsight('warning', '📅', 'Build Consistency',
                `Only ${productiveDays} productive day(s) this week. Aim for at least one task daily. Small daily wins create big results.`);
        }

        // Rule: If zero productivity for 3+ days
        const zeroDays = Object.values(dailyCompletions).filter(count => count === 0).length;
        if (zeroDays >= 3) {
            this.addInsight('danger', '⏰', 'Productivity Gap Detected',
                `${zeroDays} days with zero completed tasks. Break the pattern today with just ONE small task. Momentum starts with action.`);
        }
    }

    // RULE 6: Task Overload Detection
    analyzeTaskOverload() {
        const pendingTasks = this.tasks.filter(t => t.status === 'pending');
        const highPriority = pendingTasks.filter(t => t.priority === 'high').length;
        const mediumPriority = pendingTasks.filter(t => t.priority === 'medium').length;
        const todayDue = pendingTasks.filter(t => t.dueDate === this.today).length;

        // Rule: If 5+ high priority tasks
        if (highPriority >= 5) {
            this.addInsight('danger', '🚨', 'High Priority Overload',
                `${highPriority} high-priority tasks pending. Everything can't be urgent. Re-evaluate: What's truly critical? Downgrade or delegate the rest.`);
        }

        // Rule: If 10+ tasks due today
        if (todayDue >= 10) {
            this.addInsight('warning', '📋', 'Today's Task Overload',
                `${todayDue} tasks due today - that's unrealistic. Pick your top 3 must-dos and reschedule the rest. Quality over quantity.`);
        }

        // Rule: If 20+ pending tasks total
        if (pendingTasks.length >= 20) {
            this.addInsight('warning', '📚', 'Task List Bloat',
                `${pendingTasks.length} pending tasks. Your list is overwhelming. Archive completed tasks, delete unnecessary ones, and focus on top 5 priorities.`);
        }

        // Rule: If balanced workload
        if (pendingTasks.length > 0 && pendingTasks.length <= 10 && highPriority <= 3) {
            this.addInsight('success', '✅', 'Healthy Task Load',
                `${pendingTasks.length} pending tasks with ${highPriority} high-priority items. Your workload is manageable and well-prioritized!`);
        }
    }

    // RULE 7: Procrastination Detection
    analyzeProcrastination() {
        const oldTasks = this.tasks.filter(t => {
            if (t.status !== 'pending') return false;
            const daysSinceCreated = this.getDaysDifference(t.createdAt.split('T')[0], this.today);
            return daysSinceCreated >= 7;
        });

        // Rule: If tasks sitting for 7+ days
        if (oldTasks.length >= 3) {
            this.addInsight('warning', '🐌', 'Procrastination Pattern Detected',
                `${oldTasks.length} tasks have been pending for 7+ days. These are your "avoidance tasks". Either: 1) Break them down, 2) Schedule specific time, or 3) Delete if not important.`);
        }

        // Rule: If tasks sitting for 30+ days
        const veryOldTasks = oldTasks.filter(t => {
            const daysSinceCreated = this.getDaysDifference(t.createdAt.split('T')[0], this.today);
            return daysSinceCreated >= 30;
        });

        if (veryOldTasks.length > 0) {
            this.addInsight('danger', '⏳', 'Chronic Procrastination Alert',
                `${veryOldTasks.length} task(s) pending for 30+ days. Be honest: Will you ever do these? If not, delete them. If yes, schedule them NOW.`);
        }
    }

    // RULE 8: Work-Life Balance Analysis
    analyzeWorkLifeBalance() {
        const weekendWork = this.tasks.filter(t => {
            if (!t.completedAt) return false;
            const date = new Date(t.completedAt);
            const day = date.getDay();
            return (day === 0 || day === 6) && this.last7Days.includes(t.completedAt.split('T')[0]);
        }).length;

        const weekdayWork = this.tasks.filter(t => {
            if (!t.completedAt) return false;
            const date = new Date(t.completedAt);
            const day = date.getDay();
            return (day >= 1 && day <= 5) && this.last7Days.includes(t.completedAt.split('T')[0]);
        }).length;

        // Rule: If working heavily on weekends
        if (weekendWork > weekdayWork && weekendWork > 5) {
            this.addInsight('warning', '⚖️', 'Weekend Work Pattern',
                `You completed ${weekendWork} tasks on weekends vs ${weekdayWork} on weekdays. Ensure you're taking proper rest. Burnout prevention is productivity.`);
        }

        // Rule: If good work-life balance
        if (weekdayWork > 0 && weekendWork === 0) {
            this.addInsight('success', '🌴', 'Healthy Work-Life Balance',
                `Great! You kept weekends task-free. Rest and recovery are essential for sustained productivity.`);
        }
    }

    // RULE 9: Task Priority Pattern Analysis
    analyzeTaskPriorityPattern() {
        const completed = this.tasks.filter(t => t.status === 'completed');
        if (completed.length < 5) return;

        const highCompleted = completed.filter(t => t.priority === 'high').length;
        const lowCompleted = completed.filter(t => t.priority === 'low').length;

        // Rule: If completing mostly low priority tasks
        if (lowCompleted > highCompleted * 2 && highCompleted > 0) {
            this.addInsight('warning', '🎯', 'Priority Misalignment',
                `You're completing ${lowCompleted} low-priority tasks vs ${highCompleted} high-priority. Focus on what matters most. Do the hard stuff first!`);
        }

        // Rule: If completing high priority tasks
        if (highCompleted >= 5 && highCompleted > lowCompleted) {
            this.addInsight('success', '🏆', 'Priority Master',
                `Excellent! You're tackling high-priority tasks first (${highCompleted} completed). This is how top performers work.`);
        }
    }

    // RULE 10: Consistency Analysis
    analyzeConsistency() {
        const last14Days = this.getLast14Days();
        const firstWeek = last14Days.slice(0, 7);
        const secondWeek = last14Days.slice(7, 14);

        const firstWeekCompleted = this.tasks.filter(t => 
            t.status === 'completed' && 
            t.completedAt &&
            firstWeek.includes(t.completedAt.split('T')[0])
        ).length;

        const secondWeekCompleted = this.tasks.filter(t => 
            t.status === 'completed' && 
            t.completedAt &&
            secondWeek.includes(t.completedAt.split('T')[0])
        ).length;

        // Rule: If improving week over week
        if (secondWeekCompleted > firstWeekCompleted && secondWeekCompleted >= 5) {
            const improvement = ((secondWeekCompleted - firstWeekCompleted) / firstWeekCompleted * 100).toFixed(0);
            this.addInsight('success', '📈', 'Upward Trend Detected',
                `You're improving! ${improvement}% more tasks completed this week vs last week. This growth mindset will take you far.`);
        }

        // Rule: If declining week over week
        if (firstWeekCompleted > 0 && secondWeekCompleted < firstWeekCompleted * 0.7) {
            const decline = ((firstWeekCompleted - secondWeekCompleted) / firstWeekCompleted * 100).toFixed(0);
            this.addInsight('warning', '📉', 'Productivity Decline',
                `${decline}% fewer tasks completed this week. What changed? Identify obstacles and adjust your approach.`);
        }
    }

    // RULE 11: Burnout Risk Assessment
    analyzeBurnoutRisk() {
        const weeklyFocus = this.focusSessions
            .filter(s => this.last7Days.includes(s.date))
            .reduce((sum, s) => sum + s.duration, 0);

        const weeklyCompleted = this.tasks.filter(t => 
            t.status === 'completed' && 
            t.completedAt &&
            this.last7Days.includes(t.completedAt.split('T')[0])
        ).length;

        const pendingHigh = this.tasks.filter(t => 
            t.status === 'pending' && t.priority === 'high'
        ).length;

        // Rule: If excessive work (high focus + high output + high pending)
        if (weeklyFocus > 600 && weeklyCompleted > 20 && pendingHigh > 5) {
            this.addInsight('danger', '🔴', 'Burnout Risk Warning',
                `Red flag: ${(weeklyFocus/60).toFixed(0)}h focus time, ${weeklyCompleted} tasks completed, ${pendingHigh} high-priority pending. You're pushing too hard. Schedule rest days to prevent burnout.`);
        }

        // Rule: If sustainable pace
        if (weeklyFocus >= 180 && weeklyFocus <= 420 && weeklyCompleted >= 5 && weeklyCompleted <= 15) {
            this.addInsight('success', '🌟', 'Sustainable Pace',
                `Perfect balance: ${(weeklyFocus/60).toFixed(1)}h focus, ${weeklyCompleted} tasks completed. This is sustainable long-term productivity!`);
        }
    }

    // RULE 12: Optimal Task Size Analysis
    analyzeOptimalTaskSize() {
        const quickTasks = this.tasks.filter(t => {
            if (!t.completedAt || !t.createdAt) return false;
            const completionTime = this.getDaysDifference(
                t.createdAt.split('T')[0], 
                t.completedAt.split('T')[0]
            );
            return completionTime === 0; // Same day
        }).length;

        const slowTasks = this.tasks.filter(t => {
            if (!t.completedAt || !t.createdAt) return false;
            const completionTime = this.getDaysDifference(
                t.createdAt.split('T')[0], 
                t.completedAt.split('T')[0]
            );
            return completionTime >= 7; // 7+ days
        }).length;

        // Rule: If most tasks are quick wins
        if (quickTasks > slowTasks * 2 && quickTasks >= 10) {
            this.addInsight('success', '⚡', 'Quick Win Strategy',
                `${quickTasks} tasks completed same-day! You're great at breaking work into actionable chunks. This approach builds momentum.`);
        }

        // Rule: If too many slow tasks
        if (slowTasks > quickTasks && slowTasks >= 5) {
            this.addInsight('info', '🔨', 'Break Down Large Tasks',
                `${slowTasks} tasks took 7+ days to complete. Try breaking large tasks into smaller, daily sub-tasks for faster progress and motivation.`);
        }
    }

    // Helper Methods
    addInsight(type, icon, title, message) {
        this.insights.push({ type, icon, title, message });
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    getLast14Days() {
        const days = [];
        for (let i = 13; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    getLast30Days() {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    getDaysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductivityAI;
}
