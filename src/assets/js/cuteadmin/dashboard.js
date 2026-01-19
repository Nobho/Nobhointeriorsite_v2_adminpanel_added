// Dashboard Module - Real KPIs and Metrics
import { getTaskStats, getTasks } from './tasks.js';
import { getAllUsers } from './users.js';

export async function getDashboardData() {
    try {
        // Use viewMode to determine what data to show
        const viewMode = window.CuteState.viewMode || window.CuteState.role;
        console.log('[Dashboard] Loading dashboard for viewMode:', viewMode);

        const stats = await getTaskStats();
        console.log('[Dashboard] Task stats loaded:', stats);

        const tasks = await getTasks();
        console.log('[Dashboard] Tasks loaded:', tasks?.length || 0);

        const dashboardData = {
            stats: stats,
            recentTasks: tasks.filter(t => t.status !== 'done').slice(0, 5), // Show only pending and in-progress
            upcomingDeadlines: getUpcomingDeadlines(tasks),
            overdueTasks: tasks.filter(t => t.isOverdue)
        };

        // Admin and Moderator-specific data (only when NOT viewing as employee)
        if (viewMode === 'admin' || viewMode === 'moderator') {
            const users = await getAllUsers();
            dashboardData.userStats = await getUserStats(tasks, users);
            dashboardData.teamPerformance = calculateTeamPerformance(tasks, users);
        }

        console.log('[Dashboard] Dashboard data loaded successfully');
        return dashboardData;
    } catch (error) {
        console.error("[Dashboard] Error loading dashboard data:", error);
        console.error("[Dashboard] Error details:", error.message, error.stack);

        // Return a valid empty structure instead of null to prevent crashes
        return {
            stats: {
                total: 0,
                pending: 0,
                inProgress: 0,
                done: 0,
                overdue: 0,
                highPriority: 0,
                completionRate: 0
            },
            recentTasks: [],
            upcomingDeadlines: [],
            overdueTasks: []
        };
    }
}

function getUpcomingDeadlines(tasks) {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    return tasks
        .filter(t => {
            if (!t.deadline || t.status === 'done') return false;
            const deadline = t.deadline.toDate ? t.deadline.toDate() : new Date(t.deadline);
            return deadline > now && deadline <= threeDaysFromNow;
        })
        .sort((a, b) => {
            const aDate = a.deadline.toDate ? a.deadline.toDate() : new Date(a.deadline);
            const bDate = b.deadline.toDate ? b.deadline.toDate() : new Date(b.deadline);
            return aDate - bDate;
        });
}

async function getUserStats(tasks, users) {
    const userStats = users.map(user => {
        const userTasks = tasks.filter(t => t.assignedTo === user.id);
        const completed = userTasks.filter(t => t.status === 'done').length;
        const total = userTasks.length;

        return {
            name: user.name,
            photoUrl: user.photoUrl,
            totalTasks: total,
            completedTasks: completed,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            overdueTasks: userTasks.filter(t => t.isOverdue).length
        };
    });

    return userStats.sort((a, b) => b.completionRate - a.completionRate);
}

function calculateTeamPerformance(tasks, users) {
    const thisWeek = getTasksThisWeek(tasks);
    const lastWeek = getTasksLastWeek(tasks);

    return {
        tasksCompletedThisWeek: thisWeek.filter(t => t.status === 'done').length,
        tasksCompletedLastWeek: lastWeek.filter(t => t.status === 'done').length,
        activeUsers: users.filter(u => u.status === 'active').length,
        totalUsers: users.length
    };
}

function getTasksThisWeek(tasks) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    return tasks.filter(t => {
        const created = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
        return created >= weekAgo;
    });
}

function getTasksLastWeek(tasks) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

    return tasks.filter(t => {
        const created = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
        return created >= twoWeeksAgo && created < weekAgo;
    });
}

// Activity Feed Logic
import { getGlobalLogs } from './db.js';

export async function getActivityFeed() {
    try {
        console.log('[ActivityFeed] Fetching activity logs...');
        const logs = await getGlobalLogs();
        console.log('[ActivityFeed] Retrieved logs:', logs.length, logs);

        if (!logs || logs.length === 0) {
            console.warn('[ActivityFeed] No activity logs found in database');
            return [];
        }

        return logs.slice(0, 10); // Ensure max 10
    } catch (e) {
        console.error("[ActivityFeed] Failed to get activity feed:", e);
        return [];
    }
}
