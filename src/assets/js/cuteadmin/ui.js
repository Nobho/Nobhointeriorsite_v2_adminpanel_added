// UI Rendering - Complete with Real Data Integration
import { logout } from './auth.js';
import { getEffectiveRole, getGlobalLogs, getSystemAuditLogs } from './db.js';
import { getTasks, getCompletedTasks, createTask, updateTask, deleteTask, getTaskStats } from './tasks.js';
import { getAllUsers, getTeamMembers } from './users.js';
import { getDashboardData } from './dashboard.js';

export function showToast(message, type = "neutral") {
    let bg = "#333";
    if (type === "success") bg = "#10b981";
    if (type === "error") bg = "#ef4444";

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: bg },
        stopOnFocus: true
    }).showToast();
}

export function renderLoginPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <!-- Nobho Branding -->
                <div class="login-brand">
                    <img src="/assets/images/logo-placeholder.svg" alt="Nobho Logo" class="login-logo">
                    <h2>NOBHO</h2>
                    <p class="subtitle">Admin Portal</p>
                </div>
                
                <!-- Google Sign-In (Primary) -->
                <button type="button" id="googleSignInBtn" class="google-signin-btn">
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd"><path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"></path><path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"></path><path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"></path><path d="M9 18c2.43 0 4.47-.80 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.40-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"></path><path fill="none" d="M0 0h18v18H0z"></path></g></svg>
                    Sign in with Google
                </button>
                
                <div class="divider">
                    <span>or</span>
                </div>
                
                <!-- Email/Password Login (Alternative) -->
                <form id="loginForm">
                    <div class="input-group">
                        <label>Email</label>
                        <input type="email" id="email" placeholder="your@nobho.com" required>
                    </div>
                    <div class="input-group">
                        <label>Password</label>
                        <input type="password" id="password" placeholder="••••••••" required>
                    </div>
                    <button type="submit" id="loginBtn">Login with Email</button>
                </form>
                
                <!-- Footer Link to Main Site -->
                <div class="login-footer">
                    <a href="/" class="home-link">
                        <i class="material-icons-round">home</i>
                        Visit Main Website
                    </a>
                </div>
            </div>
        </div>
    `;
}

export function renderDashboardPage(user) {
    const app = document.getElementById('app');
    const realRole = window.CuteState.role || 'guest';
    const currentViewMode = window.CuteState.viewMode || realRole;
    const userProfile = window.CuteState.userProfile || {};

    let switcherHTML = "";
    // Only show view switcher for admin and moderator, NOT for employees
    if (realRole === 'admin') {
        switcherHTML = `
            <div class="role-switcher">
                <label>View As:</label>
                <select id="roleSwitcher">
                    <option value="admin" ${currentViewMode === 'admin' ? 'selected' : ''}>🦄 Admin (You)</option>
                    <option value="moderator" ${currentViewMode === 'moderator' ? 'selected' : ''}>🛡️ Moderator</option>
                    <option value="employee" ${currentViewMode === 'employee' ? 'selected' : ''}>👷 Employee</option>
                </select>
                ${currentViewMode !== 'admin' ? '<span class="masquerade-badge">MASQUERADE ACTIVE</span>' : ''}
            </div>
        `;
    } else if (realRole === 'moderator') {
        switcherHTML = `
            <div class="role-switcher">
                <label>View As:</label>
                <select id="roleSwitcher">
                    <option value="moderator" ${currentViewMode === 'moderator' ? 'selected' : ''}>🛡️ Moderator (You)</option>
                    <option value="employee" ${currentViewMode === 'employee' ? 'selected' : ''}>👷 Employee</option>
                </select>
                ${currentViewMode === 'employee' ? '<span class="masquerade-badge">VIEWING AS EMPLOYEE</span>' : ''}
            </div>
        `;
    }
    // For employee role: switcherHTML stays empty (no view switcher)

    app.innerHTML = `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="brand">
                    <img src="/assets/images/logo-placeholder.svg" alt="Nobho" class="sidebar-logo">
                    <span>Nobho Admin</span>
                </div>
                <nav>
                    <a href="#dashboard"><i class="material-icons-round">dashboard</i> Dashboard</a>
                    <a href="#projects"><i class="material-icons-round">folder</i> Tasks</a>
                    ${(realRole !== 'employee' && currentViewMode !== 'employee') ? '<a href="#users"><i class="material-icons-round">people</i> Team</a>' : ''}
                    ${(realRole !== 'employee' && currentViewMode !== 'employee') ? `
                        <div class="nav-divider"></div>
                        <a href="#invoices" class="ims-nav"><i class="material-icons-round">receipt_long</i> Invoices</a>
                        <a href="#customers" class="ims-nav"><i class="material-icons-round">people_alt</i> Customers</a>
                        <a href="#ims-projects" class="ims-nav"><i class="material-icons-round">work</i> Projects</a>
                    ` : ''}
                    ${(realRole === 'admin' && currentViewMode === 'admin') ? `
                        <div class="nav-divider"></div>
                        <a href="#logs"><i class="material-icons-round">history_edu</i> Activity Log</a>
                        <a href="#ultimate" style="color: #6366f1; font-weight: 600;"><i class="material-icons-round">back_hand</i> Touch of the Founder</a>
                        <a href="#company-settings" class="ims-nav"><i class="material-icons-round">business</i> Company Settings</a>
                    ` : ''}
                    <a href="#settings"><i class="material-icons-round">settings</i> Settings</a>
                    <button id="logoutBtn" class="logout-link"><i class="material-icons-round">logout</i> Logout</button>
                </nav>
                <div class="sidebar-footer">
                    <a href="/" class="home-link">
                        <i class="material-icons-round">home</i>
                        <span>Visit Main Website</span>
                    </a>
                </div>
            </aside>
            <main class="main-content">
                <header class="topbar">
                    <div class="header-left">
                        <h1>Nobho Dashboard</h1>
                        ${realRole !== 'employee' ? `
                        <div class="view-mode-container" title="View As...">
                            <div class="view-icon">
                                <i class="material-icons-round">visibility</i>
                            </div>
                             ${switcherHTML.replace('View As:', '')}
                        </div>
                        ` : ''}
                    </div>
                    <div class="user-profile">
                        <div class="user-info">
                            <span class="name">${userProfile.name || user.email}</span>
                            ${realRole !== 'employee' ? `<span class="role-label">${currentViewMode.toUpperCase()}</span>` : ''}
                        </div>
                        <img src="${userProfile.photoUrl || 'https://ui-avatars.com/api/?name=' + user.email}" class="avatar">
                    </div>
                </header>
                <div class="content-area" id="mainContentArea">
                    <div class="initial-loader"><div class="spinner"></div><p>Loading...</p></div>
                </div>
            </main>
        </div>
    `;

    const select = document.getElementById('roleSwitcher');
    if (select) {
        select.addEventListener('change', async (e) => {
            const newMode = e.target.value;
            const oldMode = window.CuteState.viewMode;
            window.CuteState.viewMode = newMode;

            // Log masquerade event
            try {
                const { logSystemAction } = await import('./db.js');
                await logSystemAction('masquerade_switch', `Admin switched view from ${oldMode} to ${newMode}`, {
                    from: oldMode,
                    to: newMode
                });
            } catch (err) {
                console.error("Failed to log masquerade:", err);
            }

            showToast(`Switched view to: ${newMode}`, "neutral");
            renderDashboardPage(user);

            // Re-render current route content after switching mode
            // This ensures we don't jump to dashboard
            const hash = window.location.hash || '#dashboard';
            // Trigger a re-route logic manually
            // We can dispatch hashchange or just reload via app.js handling
            // But simplest is to just window.location.reload() or rely on simple flow
            // However, since app.js handles routing, we just need to ensure content is refreshed:

            // Dispatch custom event to tell app.js to re-route
            window.dispatchEvent(new Event('hashchange'));
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('app:logout'));
        });
    }

    // Update active state based on current hash immediately
    const hash = window.location.hash || '#dashboard';
    const activeLink = document.querySelector(`.sidebar nav a[href="${hash}"]`);
    if (activeLink) activeLink.classList.add('active');
}

export async function renderDashboardContent() {
    const content = document.getElementById('mainContentArea');
    if (!content) return;

    try {
        const dashboardData = await getDashboardData();

        // Add null safety check
        if (!dashboardData) {
            console.error('[Dashboard] getDashboardData returned null');
            content.innerHTML = `
                <div class="card">
                    <div class="error-message" style="text-align: center; padding: 3rem;">
                        <i class="material-icons-round" style="font-size: 4rem; color: #ef4444;">error_outline</i>
                        <h3 style="margin: 1rem 0; color: #1e293b;">Failed to Load Dashboard</h3>
                        <p style="color: #64748b; margin-bottom: 1.5rem;">
                            We encountered an error loading your dashboard data. Please try refreshing the page.
                        </p>
                        <button class="btn-primary" onclick="window.location.reload()">
                            <i class="material-icons-round">refresh</i> Reload Page
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const { getActivityFeed } = await import('./dashboard.js');
        const activityFeed = await getActivityFeed();

        // Provide fallback for stats if missing
        const stats = dashboardData.stats || {
            total: 0,
            pending: 0,
            inProgress: 0,
            done: 0,
            overdue: 0,
            completionRate: 0
        };
        const role = window.CuteState.role;

        // KPI Section (Unchanged)
        let kpiCards = `
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-icon" style="background: #dbeafe;"><i class="material-icons-round" style="color: #1e40af;">task</i></div>
                    <div class="kpi-content">
                        <h3>${stats.total}</h3>
                        <p>Total Tasks</p>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background: #dcfce7;"><i class="material-icons-round" style="color: #15803d;">check_circle</i></div>
                    <div class="kpi-content">
                        <h3>${stats.done}</h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background: #fef3c7;"><i class="material-icons-round" style="color: #d97706;">pending</i></div>
                    <div class="kpi-content">
                        <h3>${stats.inProgress}</h3>
                        <p>In Progress</p>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background: #fee2e2;"><i class="material-icons-round" style="color: #dc2626;">warning</i></div>
                    <div class="kpi-content">
                        <h3>${stats.overdue}</h3>
                        <p>Overdue</p>
                    </div>
                </div>
            </div>
        `;

        // Updated Recent Tasks (Clickable)
        let recentTasksHTML = '';
        if (dashboardData.recentTasks.length > 0) {
            recentTasksHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3>Recent Tasks</h3>
                    </div>
                    <div class="task-list">
                        ${dashboardData.recentTasks.map(task => `
                            <div class="task-item clickable" onclick="window.showTaskActionModal('${task.id}')">
                                <div class="task-info">
                                    <strong>${task.title}</strong>
                                    <span class="task-assignee">For: ${task.assignedToName}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <span class="status-badge ${task.status}">${task.status.replace('_', ' ')}</span>
                                    <i class="material-icons-round" style="color: #94a3b8; font-size: 1.2rem;">chevron_right</i>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            recentTasksHTML = `
                <div class="card">
                    <h3>Recent Tasks</h3>
                    <p class="empty-state">No recent tasks found.</p>
                </div>
            `;
        }

        // Activity Feed HTML
        let feedHTML = `
            <div class="card activity-feed-card">
                <div class="card-header">
                    <h3>Activity Feed</h3>
                    <span class="badge">Live</span>
                </div>
                <div class="activity-feed">
                    ${activityFeed.length > 0 ? activityFeed.map(log => {
            const date = log.timestamp ? (log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp)) : new Date();
            const timeAgo = getTimeAgo(date);
            const userImg = log.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.userName || 'User')}&background=random`;

            return `
                        <div class="feed-item">
                            <img src="${userImg}" class="feed-avatar" alt="${log.userName}">
                            <div class="feed-content">
                                <p class="feed-text">
                                    <strong>${log.userName || 'Someone'}</strong> 
                                    ${log.details || log.action}
                                </p>
                                <span class="feed-time">${timeAgo}</span>
                            </div>
                        </div>
                        `;
        }).join('') : '<p class="empty-state">No recent activity</p>'}
                </div>
                ${role === 'admin' ? '<div class="card-footer"><a href="#logs" class="btn-text">View Full History</a></div>' : ''}
            </div>
        `;

        // Render Dashboard Grid
        content.innerHTML = `
            ${kpiCards}
            <div class="dashboard-grid">
                <div class="main-column">
                    ${recentTasksHTML}
                    
                    ${/* Placeholder for potential charts or other widgets */ ''}
                </div>
                <div class="side-column">
                    ${feedHTML}
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Dashboard render error:", error);
        content.innerHTML = `<p class="error-state">Failed to load dashboard: ${error.message}</p>`;
    }
}

// Helper for relative time
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

// Task Action Modal Logic
window.showTaskActionModal = async function (taskId) {
    // We need to fetch the task first or pass it. 
    // Fetching is safer to get latest status.
    try {
        const { getDoc, doc, getFirestore } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        const db = getFirestore();
        const snap = await getDoc(doc(db, "tasks", taskId));

        if (!snap.exists()) {
            showToast("Task not found", "error");
            return;
        }

        const task = { id: snap.id, ...snap.data() };

        // Show Modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${task.title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div style="padding: 1rem 0;">
                    <p style="color: #64748b; margin-bottom: 1rem;">${task.description || 'No description'}</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem; margin-bottom: 1.5rem;">
                        <div>
                            <strong>Status:</strong> 
                            <span class="status-badge ${task.status}">${task.status.replace('_', ' ')}</span>
                        </div>
                        <div>
                            <strong>Priority:</strong> 
                            <span style="font-weight: 600; color: ${task.priority === 'high' ? '#dc2626' : '#64748b'}">${task.priority.toUpperCase()}</span>
                        </div>
                        <div>
                            <strong>Assigned to:</strong> ${task.assignedToName}
                        </div>
                        <div>
                            <strong>Deadline:</strong> ${task.deadline ? (task.deadline.toDate ? task.deadline.toDate().toLocaleDateString() : new Date(task.deadline).toLocaleDateString()) : 'No Deadline'}
                        </div>
                    </div>

                    <h4 style="margin-bottom: 0.5rem; color: #334155;">Quick Actions</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <button class="btn-primary" id="btnMarkDone" ${task.status === 'done' ? 'disabled' : ''}>
                            <i class="material-icons-round">check_circle</i> Mark Complete
                        </button>
                         <button class="btn-secondary" id="btnViewDetails">
                            <i class="material-icons-round">visibility</i> Full Details
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelectorAll('.modal-close').forEach(b => b.onclick = () => modal.remove());
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        // Button Handlers
        document.getElementById('btnMarkDone').onclick = async () => {
            // Use existing showTaskCompletionModal logic
            // But we need to close this modal first
            modal.remove();
            const { showTaskCompletionModal } = await import('./task-completion.js');
            showTaskCompletionModal(task.id, task.title);
        };

        document.getElementById('btnViewDetails').onclick = () => {
            modal.remove();
            // Just navigate to tasks page? Or show edit modal?
            // User might be on dashboard.
            // Let's open the Edit Modal if allowed.
            // Check permission?
            // Simplest is to just show the completion modal or edit modal based on role.
            // For now, let's just use the "Edit" modal which is essentially "View Details" if fields disabled.
            // Or better, redirect to Tasks page highlighting this task?
            window.location.hash = '#projects';
            // Ideally we should open the specific task. but simplistic approach for now.
        };

    } catch (e) {
        console.error("Error showing task actions", e);
        showToast("Error loading task details", "error");
    }
};

export async function renderProjectsPage() {
    // Import completion modal
    const { showTaskCompletionModal } = await import('./task-completion.js');
    window.showTaskCompletionModal = showTaskCompletionModal;

    // Import export functions
    const { exportTasksCSV } = await import('./export.js');
    window.exportTasksCSV = exportTasksCSV;

    const content = document.getElementById('mainContentArea');
    if (!content) return;

    const role = window.CuteState.role;

    content.innerHTML = `
        <div class="projects-header">
            <h2>Tasks</h2>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn-secondary" onclick="window.renderCompletedTasksPage()" style="display: flex; align-items: center; gap: 0.5rem;"><i class="material-icons-round">archive</i> Archive</button>
                ${role === 'admin' ? '<button class="btn-secondary" onclick="window.exportTasksCSV()" style="display: flex; align-items: center; gap: 0.5rem;"><i class="material-icons-round" style="font-size: 1.1rem;">download</i> Export CSV</button>' : ''}
                ${role !== 'employee' ? '<button class="btn-primary" id="addTaskBtn"><i class="material-icons-round">add</i> New Task</button>' : ''}
            </div>
        </div>
        
        <!-- Filter Bar -->
        <div class="filters-bar" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <div class="filter-group">
                <label for="filterStatus" style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Filter by Status</label>
                <select id="filterStatus" class="filter-select" style="padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer;">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
            </div>
            
            ${(role === 'admin' || role === 'moderator') ? `
            <div class="filter-group">
                <label for="filterPerson" style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Filter by Person</label>
                <select id="filterPerson" class="filter-select" style="padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer;">
                    <option value="all">All People</option>
                </select>
            </div>
            ` : ''}
        </div>
        
        <div class="tasks-grid" id="tasksContainer">
            <div class="initial-loader"><div class="spinner"></div><p>Loading tasks...</p></div>
        </div>
    `;

    const addBtn = document.getElementById('addTaskBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showTaskModal());
    }

    await loadTasksUI();
}

async function loadTasksUI(filterStatus = 'all', filterPerson = 'all') {
    const container = document.getElementById('tasksContainer');
    if (!container) return;

    try {
        const allTasks = await getTasks();

        // Apply filters
        let tasks = allTasks;
        if (filterStatus !== 'all') {
            tasks = tasks.filter(t => t.status === filterStatus);
        }
        if (filterPerson !== 'all') {
            tasks = tasks.filter(t => t.assignedTo === filterPerson);
        }

        // Populate person filter if it exists
        const personFilter = document.getElementById('filterPerson');
        if (personFilter && personFilter.options.length === 1) {
            const { getTeamMembers } = await import('./users.js');
            const members = await getTeamMembers();
            members.forEach(member => {
                const option = document.createElement('option');
                option.value = member.uid;
                option.textContent = member.name;
                personFilter.appendChild(option);
            });
        }

        if (tasks.length === 0) {
            container.innerHTML = '<p class="empty-state">No tasks match your filters.</p>';
            return;
        }

        // Helper function to calculate time remaining
        function getTimeRemaining(deadline) {
            const now = new Date();
            const diff = deadline - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(diff / (1000 * 60 * 60));

            if (diff < 0) {
                return {
                    text: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`,
                    class: 'overdue',
                    days: days,
                    color: '#ef4444' // red
                };
            } else if (hours < 24) {
                return {
                    text: `${hours} hour${hours === 1 ? '' : 's'} left`,
                    class: 'urgent',
                    days: 0,
                    color: '#f97316' // orange-red
                };
            } else if (days === 0) {
                return {
                    text: 'Due today',
                    class: 'urgent',
                    days: 0,
                    color: '#f97316' // orange-red
                };
            } else if (days === 1) {
                return {
                    text: '1 day left',
                    class: 'soon',
                    days: 1,
                    color: '#fb923c' // orange
                };
            } else if (days <= 3) {
                return {
                    text: `${days} days left`,
                    class: 'soon',
                    days: days,
                    color: '#fbbf24' // yellow-orange
                };
            } else if (days <= 5) {
                return {
                    text: `${days} days left`,
                    class: 'normal',
                    days: days,
                    color: '#84cc16' // lime
                };
            } else {
                return {
                    text: `${days} days left`,
                    class: 'normal',
                    days: days,
                    color: '#22c55e' // green
                };
            }
        }

        container.innerHTML = tasks.map(task => {
            const deadline = task.deadline?.toDate ? task.deadline.toDate() : new Date(task.deadline);
            const createdAt = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt || Date.now());
            const isOverdue = task.isOverdue ? 'overdue' : '';
            const timeRemaining = getTimeRemaining(deadline);
            const userPhoto = task.assignedToPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedToName || 'User')}&background=random`;

            return `
                <div class="task-card" data-task-id="${task.id}">
                    
                    <div class="card-header">
                        <h2 class="task-title">${task.title}</h2>
                        <div class="priority-badge priority-${task.priority}">
                            <span class="priority-dot"></span>
                            ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </div>
                    </div>

                    <p class="task-desc">
                        ${task.description}
                    </p>

                    <div class="meta-info">
                        <div class="assignee">
                            <img src="${userPhoto}" alt="${task.assignedToName}" class="task-card-avatar">
                            <div class="person-info">
                                <h4>${task.assignedToName}</h4>
                                <span>Assigned: ${createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div class="deadline-info">
                            <h4>Deadline: ${deadline.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</h4>
                            <span class="time-left time-${timeRemaining.class}">${timeRemaining.text}</span>
                        </div>
                    </div>

                    <div class="card-footer">
                        <div class="status-select-wrapper">
                            <select class="status-select" data-task-id="${task.id}">
                                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                <option value="done" ${task.status === 'done' ? 'selected' : ''}>Completed</option>
                            </select>
                        </div>

                        ${window.CuteState.role !== 'employee' ? `
                        <button class="edit-btn" onclick="window.editTask('${task.id}')" title="Edit Task">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        ` : ''}
                    </div>

                </div>
            `;
        }).join('');

        // Attach status change listeners
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const taskId = e.target.dataset.taskId;
                const newStatus = e.target.value;
                const oldStatus = e.target.dataset.oldStatus || 'pending';

                // If marking as done, show completion form
                if (newStatus === 'done' && oldStatus !== 'done') {
                    e.target.value = oldStatus; // Reset dropdown
                    showTaskCompletionModal(taskId);
                } else {
                    await updateTask(taskId, { status: newStatus });
                    await loadTasksUI(filterStatus, filterPerson);
                }
            });

            // Store current status for comparison
            select.dataset.oldStatus = select.value;
        });

        // Attach filter listeners
        const statusFilterEl = document.getElementById('filterStatus');
        const personFilterEl = document.getElementById('filterPerson');

        if (statusFilterEl) {
            statusFilterEl.value = filterStatus;
            statusFilterEl.addEventListener('change', (e) => {
                loadTasksUI(e.target.value, personFilterEl?.value || 'all');
            });
        }

        if (personFilterEl) {
            personFilterEl.value = filterPerson;
            personFilterEl.addEventListener('change', (e) => {
                loadTasksUI(statusFilterEl?.value || 'all', e.target.value);
            });
        }

    } catch (error) {
        console.error("Failed to load tasks:", error);
        container.innerHTML = '<p class="error-state">Failed to load tasks</p>';
    }
}

function showTaskModal(taskId = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'taskModal';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>${taskId ? 'Edit Task' : 'Create New Task'}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <form id="taskForm">
                <div class="input-group">
                    <label>Title <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="taskTitle" placeholder="e.g. Create 3D Rendering" required>
                </div>
                <div class="input-group">
                    <label>Description <span style="color: #ef4444;">*</span></label>
                    <textarea id="taskDesc" rows="3" placeholder="Detailed description of the task..." required></textarea>
                </div>
                <div class="input-group">
                    <label>Assign To <span style="color: #ef4444;">*</span></label>
                    <div class="assignee-checkboxes" style="border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 1rem; max-height: 200px; overflow-y: auto; background: white;">
                        <div style="margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; color: #6366f1;">
                                <input type="checkbox" id="selectAllAssignees" style="width: 18px; height: 18px; cursor: pointer;">
                                <span>Select All</span>
                            </label>
                        </div>
                        <div id="assigneeCheckboxList">
                            <p style="color: #94a3b8; font-size: 0.9rem;">Loading team members...</p>
                        </div>
                    </div>
                </div>
                <div class="input-group">
                    <label>Priority <span style="color: #ef4444;">*</span></label>
                    <select id="taskPriority">
                        <option value="low">🟢 Low</option>
                        <option value="medium" selected>🟡 Medium</option>
                        <option value="high">🔴 High</option>
                    </select>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="input-group">
                        <label>Customer <small style="color: #64748b;">(optional)</small></label>
                        <div style="display: flex; gap: 0.5rem;">
                            <select id="taskCustomer" style="flex: 1;">
                                <option value="">No customer</option>
                            </select>
                            <button type="button" class="btn-icon" id="quickAddCustomerBtn" title="Add Customer" style="padding: 0.5rem;">
                                <i class="material-icons-round" style="font-size: 1.2rem;">person_add</i>
                            </button>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Project <small style="color: #64748b;">(optional)</small></label>
                        <div style="display: flex; gap: 0.5rem;">
                            <select id="taskProject" style="flex: 1;">
                                <option value="">No project</option>
                            </select>
                            <button type="button" class="btn-icon" id="quickAddProjectBtn" title="Add Project" style="padding: 0.5rem;">
                                <i class="material-icons-round" style="font-size: 1.2rem;">add_circle</i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="input-group">
                    <label>Deadline <span style="color: #ef4444;">*</span></label>
                    <input type="date" id="taskDeadline" required>
                </div>
                <div class="input-group">
                    <label>Reference Links</label>
                    <div id="referenceLinksContainer">
                        <div class="reference-link-item" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <input type="url" class="reference-link-input" placeholder="https://example.com" style="flex: 1;">
                            <button type="button" class="btn-icon" onclick="this.parentElement.remove()">
                                <i class="material-icons-round">delete</i>
                            </button>
                        </div>
                    </div>
                    <button type="button" id="addLinkBtn" class="btn-secondary" style="width: 100%; margin-top: 0.5rem;">
                        <i class="material-icons-round" style="font-size: 1rem; vertical-align: middle;">add</i> Add Another Link
                    </button>
                    <small style="color: #64748b; font-size: 0.8rem;">Add reference materials, inspiration, or related documents</small>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary modal-close">Cancel</button>
                    <button type="submit" class="btn-primary">Create Task</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Load team members as checkboxes (async)
    (async () => {
        try {
            const assigneeList = document.getElementById('assigneeCheckboxList');
            if (!assigneeList) {
                console.error('Assignee list container not found');
                return;
            }

            const { getTeamMembers } = await import('./users.js');
            const members = await getTeamMembers();

            assigneeList.innerHTML = members.map(member => `
                <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 6px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <input type="checkbox" class="assignee-checkbox" value="${member.uid}" data-name="${member.name}" data-photo="${member.photoUrl || ''}" style="width: 16px; height: 16px; cursor: pointer;">
                    <img src="${member.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                    <span style="font-size: 0.9rem; color: #334155;">${member.name}</span>
                </label>
            `).join('');

            // Select All functionality
            const selectAllCheckbox = document.getElementById('selectAllAssignees');
            const individualCheckboxes = document.querySelectorAll('.assignee-checkbox');

            selectAllCheckbox.addEventListener('change', (e) => {
                individualCheckboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                });
            });

            // Update Select All when individual checkboxes change
            individualCheckboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    const allChecked = Array.from(individualCheckboxes).every(checkbox => checkbox.checked);
                    const anyChecked = Array.from(individualCheckboxes).some(checkbox => checkbox.checked);
                    selectAllCheckbox.checked = allChecked;
                    selectAllCheckbox.indeterminate = anyChecked && !allChecked;
                });
            });
        } catch (error) {
            console.error('Error loading team members:', error);
            const assigneeList = document.getElementById('assigneeCheckboxList');
            if (assigneeList) {
                assigneeList.innerHTML = '<p style="color: #ef4444;">Failed to load team members</p>';
            }
        }
    })();

    // Load customers and projects for dropdowns (async)
    (async () => {
        try {
            const { getCurrentCustomers } = await import('./customers.js');
            const { getActiveProjects } = await import('./projects.js');

            // Load customers
            const customers = await getCurrentCustomers();
            const customerSelect = document.getElementById('taskCustomer');
            if (customerSelect) {
                customerSelect.innerHTML = `
                    <option value="">No customer</option>
                    ${customers.map(c => `
                        <option value="${c.id}" data-name="${c.name}">
                            ${c.name}${c.company ? ` (${c.company})` : ''}
                        </option>
                    `).join('')}
                `;
            }

            // Load projects
            const projects = await getActiveProjects();
            const projectSelect = document.getElementById('taskProject');
            if (projectSelect) {
                projectSelect.innerHTML = `
                    <option value="">No project</option>
                    ${projects.map(p => `
                        <option value="${p.id}" data-name="${p.name}">
                            ${p.name}${p.customerName ? ` (${p.customerName})` : ''}
                        </option>
                    `).join('')}
                `;
            }
        } catch (error) {
            console.error('Error loading customers/projects:', error);
        }
    })();

    // Quick Add Customer button
    document.getElementById('quickAddCustomerBtn')?.addEventListener('click', async () => {
        const { showQuickProjectModal } = await import('./projects.js');
        // Reuse customer modal from customer-ui.js via global function
        if (typeof window.editCustomer === 'function') {
            window.editCustomer(null); // null = create new
        } else {
            showToast("Customer module not loaded", "error");
        }
    });

    // Quick Add Project button
    document.getElementById('quickAddProjectBtn')?.addEventListener('click', async () => {
        const { showQuickProjectModal } = await import('./projects.js');
        showQuickProjectModal((newId, newName) => {
            // After project created, add it to the dropdown
            const select = document.getElementById('taskProject');
            if (select) {
                const option = document.createElement('option');
                option.value = newId;
                option.dataset.name = newName;
                option.textContent = newName;
                option.selected = true;
                select.appendChild(option);
            }
        });
    });

    // Close handlers
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Add link button handler
    document.getElementById('addLinkBtn').addEventListener('click', () => {
        const container = document.getElementById('referenceLinksContainer');
        const newLink = document.createElement('div');
        newLink.className = 'reference-link-item';
        newLink.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
        newLink.innerHTML = `
            <input type="url" class="reference-link-input" placeholder="https://example.com" style="flex: 1;">
            <button type="button" class="btn-icon" onclick="this.parentElement.remove()">
                <i class="material-icons-round">delete</i>
            </button>
        `;
        container.appendChild(newLink);
    });

    // Form submit
    document.getElementById('taskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("[UI] taskForm submitted");

        // Get all checked assignees
        const checkboxes = document.querySelectorAll('.assignee-checkbox:checked');
        console.log("[UI] Checked assignees found:", checkboxes.length);

        if (checkboxes.length === 0) {
            showToast("Please select at least one assignee", "error");
            return;
        }

        const assigneeData = Array.from(checkboxes).map(cb => {
            const data = {
                uid: cb.value,
                name: cb.dataset.name,
                photo: cb.dataset.photo
            };
            console.log("[UI] Collected assignee data:", data);
            return data;
        });

        // Reference links
        const linkInputs = document.querySelectorAll('.reference-link-input');
        const referenceLinks = Array.from(linkInputs)
            .map(input => input.value.trim())
            .filter(val => val.length > 0);

        // Get customer and project selections
        const customerSelect = document.getElementById('taskCustomer');
        const projectSelect = document.getElementById('taskProject');

        const selectedCustomer = customerSelect?.options[customerSelect?.selectedIndex];
        const selectedProject = projectSelect?.options[projectSelect?.selectedIndex];

        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDesc').value,
            priority: document.getElementById('taskPriority').value,
            deadline: new Date(document.getElementById('taskDeadline').value),
            referenceLinks: referenceLinks,
            // Customer & Project linking (from IMS)
            customerId: customerSelect?.value || null,
            customerName: selectedCustomer?.dataset?.name || "",
            projectId: projectSelect?.value || null,
            projectName: selectedProject?.dataset?.name || "",
            assignees: assigneeData
        };

        console.log("[UI] Calling createTask with:", taskData);

        try {
            await createTask(taskData);
            modal.remove();
            await loadTasksUI();
        } catch (error) {
            console.error("[UI] Task creation failed:", error);
        }
    });
}

// Global functions for inline actions
window.editTask = async function (taskId) {
    try {
        // Fetch task data
        const { getTask } = await import('./tasks.js');
        const task = await getTask(taskId);

        if (!task) {
            showToast("Task not found", "error");
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'editTaskModal';

        const deadline = task.deadline?.toDate ? task.deadline.toDate() : new Date(task.deadline);
        const deadlineStr = deadline.toISOString().split('T')[0];

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Edit Task</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="editTaskForm">
                    <div class="input-group">
                        <label>Title <span style="color: #ef4444;">*</span></label>
                        <input type="text" id="editTitle" value="${task.title}" required>
                    </div>
                    <div class="input-group">
                        <label>Description <span style="color: #ef4444;">*</span></label>
                        <textarea id="editDesc" rows="3" required>${task.description}</textarea>
                    </div>
                    <div class="input-group">
                        <label>Assign To <span style="color: #ef4444;">*</span></label>
                        <select id="editAssignee" required>
                            <option value="">Loading...</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Priority <span style="color: #ef4444;">*</span></label>
                        <select id="editPriority">
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>🟢 Low</option>
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>🟡 Medium</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>🔴 High</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Deadline <span style="color: #ef4444;">*</span></label>
                        <input type="date" id="editDeadline" value="${deadlineStr}" required>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary modal-close">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Load team members for assignee dropdown
        const assigneeSelect = document.getElementById('editAssignee');
        const { getTeamMembers } = await import('./users.js');
        const members = await getTeamMembers();

        assigneeSelect.innerHTML = '';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.uid;
            option.textContent = member.name;
            option.setAttribute('data-name', member.name);
            option.setAttribute('data-photo', member.photoUrl || '');
            if (member.uid === task.assignedTo) {
                option.selected = true;
            }
            assigneeSelect.appendChild(option);
        });

        // Close handlers
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Form submit
        document.getElementById('editTaskForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const selectedAssignee = assigneeSelect.selectedOptions[0];

            const updates = {
                title: document.getElementById('editTitle').value,
                description: document.getElementById('editDesc').value,
                assignedTo: selectedAssignee.value,
                assignedToName: selectedAssignee.getAttribute('data-name'),
                assignedToPhoto: selectedAssignee.getAttribute('data-photo'),
                priority: document.getElementById('editPriority').value,
                deadline: new Date(document.getElementById('editDeadline').value)
            };

            await updateTask(taskId, updates);
            modal.remove();
            await loadTasksUI();
        });

    } catch (error) {
        console.error("Error editing task:", error);
        showToast("Failed to load task for editing", "error");
    }
};

window.deleteTaskUI = async function (taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        await deleteTask(taskId);
        await loadTasksUI();
    }
};

export async function renderUsersPage() {
    const { renderUserManagementUI } = await import('./user-management.js');
    await renderUserManagementUI();
}

async function loadUsersUI() {
    const container = document.getElementById('usersContainer');
    if (!container) return;

    try {
        const users = await getAllUsers();

        if (users.length === 0) {
            container.innerHTML = '<p class="empty-state">No users found</p>';
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="user-card">
                <img src="${user.photoUrl || 'https://ui-avatars.com/api/?name=' + user.name}" class="user-avatar">
                <h3>${user.name}</h3>
                <p class="user-title">${user.title || user.email}</p>
                <span class="role-badge ${user.role}">${user.role}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error("Failed to load users:", error);
        container.innerHTML = '<p class="error-state">Failed to load users</p>';
    }
}

export function renderProfilePage(user) {
    const content = document.getElementById('mainContentArea');
    if (!content) return;

    const userProfile = window.CuteState.userProfile || {};
    const photoURL = userProfile.photoUrl || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`;

    content.innerHTML = `
        <div class="profile-grid">
            <div class="card profile-card">
                <div class="profile-header">
                    <img src="${photoURL}" id="profilePreview" class="large-avatar">
                </div>
                <h3>${userProfile.name || user.email}</h3>
                <span class="badge">${userProfile.role || 'employee'}</span>
            </div>

            <div class="card security-card">
                <h3>Security Settings</h3>
                <form id="passwordForm">
                    <div class="input-group">
                        <label>Current Password</label>
                        <input type="password" id="currentPass" required>
                    </div>
                    <div class="input-group">
                        <label>New Password</label>
                        <input type="password" id="newPass" required>
                    </div>
                    <div class="input-group">
                        <label>Confirm New Password</label>
                        <input type="password" id="confirmPass" required>
                    </div>
                    <button type="submit" class="btn-primary">Update Password</button>
                </form>
            </div>
        </div>
    `;

    const passForm = document.getElementById('passwordForm');
    if (passForm) {
        passForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const current = document.getElementById('currentPass').value;
            const newP = document.getElementById('newPass').value;
            const confirmP = document.getElementById('confirmPass').value;

            if (newP !== confirmP) {
                showToast("New passwords do not match", "error");
                return;
            }

            document.dispatchEvent(new CustomEvent('app:changePassword', { detail: { current, newP } }));
        });
    }
}

/**
 * Renders the Activity Log page with a professional tabular layout.
 */
export async function renderAuditLogPage() {
    const content = document.getElementById('mainContentArea');
    if (!content) return;

    const realRole = window.CuteState.role || 'guest';
    const isAdmin = realRole === 'admin';

    content.innerHTML = `
        <div class="logs-container">
            <div class="page-header">
                <div>
                    <h1>Activity Logs</h1>
                    <p>Track system changes and team activity</p>
                </div>
                ${isAdmin ? `
                <div class="log-tabs">
                    <button class="log-tab active" data-tab="public">Public Feed</button>
                    <button class="log-tab" data-tab="system">System Audit (Ultimate Mode)</button>
                </div>
                ` : ''}
            </div>

            <div id="logContentArea" class="card log-card">
                <div class="initial-loader"><div class="spinner"></div><p>Fetching activity logs...</p></div>
            </div>
        </div>
    `;

    // Internal function to load specific log type
    const loadLogs = async (type) => {
        const logArea = document.getElementById('logContentArea');
        logArea.innerHTML = `<div class="initial-loader"><div class="spinner"></div><p>Loading ${type} logs...</p></div>`;

        try {
            const logs = type === 'system' ? await getSystemAuditLogs() : await getGlobalLogs();

            // Store logs globally for metadata lookup
            if (type === 'system') {
                window.CuteState.systemLogs = logs;
            }

            logArea.innerHTML = renderLogTable(logs, type);
        } catch (error) {
            console.error(error);
            logArea.innerHTML = `<div class="error-state">Failed to load ${type} logs</div>`;
        }
    };

    // Initial load
    await loadLogs('public');

    // Tab switching logic
    if (isAdmin) {
        document.querySelectorAll('.log-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                loadLogs(tab.dataset.tab);
            });
        });
    }
}

/**
 * Helper to render a clean data table for logs
 */
function renderLogTable(logs, type) {
    if (!logs || logs.length === 0) return '<div class="empty-state">No activity records found</div>';

    const isSystem = type === 'system';

    return `
        <div class="table-responsive">
            <table class="data-table log-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Details</th>
                        ${isSystem ? '<th>Metadata</th>' : '<th>Task</th>'}
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(log => {
        const date = log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Just now';

        let actionLabel = log.action || 'Unknown';
        let actionClass = 'tag-neutral';

        // Dynamic styling for actions
        if (actionLabel.includes('create') || actionLabel.includes('login')) actionClass = 'tag-success';
        else if (actionLabel.includes('delete') || actionLabel.includes('failed')) actionClass = 'tag-danger';
        else if (actionLabel.includes('update') || actionLabel.includes('switch')) actionClass = 'tag-warning';

        const actor = isSystem ? log.actorName : log.userName;
        const details = log.details || '';

        return `
                            <tr>
                                <td class="col-date">${date}</td>
                                <td class="col-user">
                                    <div class="user-info-cell">
                                        ${!isSystem && log.userPhoto ? `<img src="${log.userPhoto}" class="mini-avatar">` : '<div class="mini-avatar-placeholder">?</div>'}
                                        <span>${actor}</span>
                                    </div>
                                </td>
                                <td class="col-action">
                                    <span class="log-tag ${actionClass}">${actionLabel.replace(/_/g, ' ')}</span>
                                </td>
                                <td class="col-details">${details}</td>
                                <td class="col-extra">
                                    ${isSystem ?
                `<button class="btn-text" onclick="window.showMetadataModal('${log.id}')">View Meta</button>` :
                (log.relatedTaskId ? `<span class="task-id">#${log.relatedTaskId.slice(0, 6)}</span>` : '-')
            }
                                </td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Global function to show metadata modal
window.showMetadataModal = function (logId) {
    const logs = window.CuteState.systemLogs || [];
    const log = logs.find(l => l.id === logId);

    if (!log || !log.metadata) {
        showToast("No metadata available", "neutral");
        return;
    }

    const modalHtml = `
        <div class="modal active" id="metadataModal">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Log Metadata</h3>
                    <button class="close-btn" onclick="document.getElementById('metadataModal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <pre style="background: #f1f5f9; padding: 1rem; border-radius: 8px; overflow: auto; max-height: 400px; font-size: 0.85rem;">${JSON.stringify(log.metadata, null, 2)}</pre>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="document.getElementById('metadataModal').remove()">Close</button>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existing = document.getElementById('metadataModal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// --- Completed Tasks Archive Logic ---

// Expose renderProjectsPage for the Back button
window.renderProjectsPage = renderProjectsPage;

window.renderCompletedTasksPage = async function () {
    const content = document.getElementById('mainContentArea');
    if (!content) return;

    const role = window.CuteState.role;
    const viewMode = window.CuteState.viewMode || role;

    content.innerHTML = `
        <div class="completed-archive-container">
            <div class="page-header" style="margin-bottom: 1.5rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: #64748b; cursor: pointer;" onclick="window.renderProjectsPage()">
                         <i class="material-icons-round" style="font-size: 1.1rem;">arrow_back</i> Back to Tasks
                    </div>
                    <h1>Completed Tasks Archive</h1>
                    <p>History of all accomplished work</p>
                </div>
            </div>

            <div class="filters-bar card" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: flex-end; padding: 1rem;">
                ${(role === 'admin' || role === 'moderator') ? `
                <div class="filter-group">
                    <label style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Filtered By Person</label>
                    <select id="archiveFilterPerson" class="filter-select" style="padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <option value="all">All Team Members</option>
                    </select>
                </div>
                ` : ''}

                <div class="filter-group">
                    <label style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Priority</label>
                    <select id="archiveFilterPriority" class="filter-select" style="padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                <div class="filter-group" style="margin-left: auto;">
                     <span class="badge" id="archiveCountBadge">0 Tasks Found</span>
                </div>
            </div>

            <div id="archiveContentArea" class="card" style="padding: 0; overflow: hidden;">
                <div class="initial-loader"><div class="spinner"></div><p>Loading archive...</p></div>
            </div>
        </div>
    `;

    // Populate team filter for admins
    if (role === 'admin' || role === 'moderator') {
        try {
            const { getTeamMembers } = await import('./users.js');
            const members = await getTeamMembers();
            const filter = document.getElementById('archiveFilterPerson');
            members.forEach(member => {
                const option = document.createElement('option');
                option.value = member.uid;
                option.textContent = member.name;
                filter.appendChild(option);
            });
        } catch (e) {
            console.error("Error loading team members for filter", e);
        }
    }

    // Initial Load
    await loadArchiveTable();

    // Event Listeners
    document.getElementById('archiveFilterPriority')?.addEventListener('change', () => loadArchiveTable());
    document.getElementById('archiveFilterPerson')?.addEventListener('change', () => loadArchiveTable());
}

async function loadArchiveTable() {
    const container = document.getElementById('archiveContentArea');
    const priority = document.getElementById('archiveFilterPriority')?.value;
    const assignee = document.getElementById('archiveFilterPerson')?.value;

    container.innerHTML = `<div class="initial-loader"><div class="spinner"></div><p>Filtering tasks...</p></div>`;

    try {
        const filters = {
            priority: priority !== 'all' ? priority : null,
            assignedTo: (assignee && assignee !== 'all') ? assignee : null
        };

        const tasks = await getCompletedTasks(filters);

        // Save tasks to global state for modal lookup
        window.CuteState.archiveTasks = tasks;

        document.getElementById('archiveCountBadge').textContent = `${tasks.length} Tasks Found`;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 3rem;">
                    <i class="material-icons-round" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;">inventory_2</i>
                    <p>No completed tasks found matching your filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Completed Date</th>
                            <th>Assignee</th>
                            <th>Priority</th>
                            <th style="text-align: right;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasks.map(task => {
            const completedAt = task.completedAt ? (task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt)) : new Date();
            const assigneePhoto = task.assignedToPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedToName)}&background=random`;

            return `
                                <tr class="clickable" onclick="window.showArchiveDetails('${task.id}')">
                                    <td>
                                        <div style="font-weight: 500; color: #1e293b;">${task.title}</div>
                                        <div style="font-size: 0.85rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
                                            ${task.description || 'No description'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-weight: 500;">${completedAt.toLocaleDateString()}</div>
                                        <div style="font-size: 0.8rem; color: #94a3b8;">${completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                                            <img src="${assigneePhoto}" alt="${task.assignedToName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                                            <span>${task.assignedToName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="priority-badge priority-${task.priority}" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">
                                            ${task.priority.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style="text-align: right;">
                                        <button class="btn-text" style="color: #6366f1;">View Details</button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

    } catch (e) {
        console.error("Error loading archive:", e);
        container.innerHTML = `<div class="error-state">Failed to load archive data</div>`;
    }
}

window.showArchiveDetails = function (taskId) {
    const tasks = window.CuteState.archiveTasks || [];
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    // Calculate duration if created and completed dates exist
    let durationStr = 'Unknown';
    if (task.createdAt && task.completedAt) {
        const start = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
        const end = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
        const diffMs = end - start;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) durationStr = `${diffDays}d ${diffHours}h`;
        else durationStr = `${diffHours} hours`;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Task Details</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="padding: 1.5rem 0;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.25rem;">${task.title}</h3>
                        <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                            <span class="status-badge done">Completed</span>
                            <span class="priority-badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem;">Description</h4>
                    <p style="color: #334155; line-height: 1.6; white-space: pre-wrap;">${task.description || 'No description provided.'}</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div>
                        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem;">Completed By</h4>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <img src="${task.assignedToPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedToName)}`}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <div style="font-weight: 500;">${task.assignedToName}</div>
                                <div style="font-size: 0.8rem; color: #64748b;">Duration: ${durationStr}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                         <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem;">Completion Date</h4>
                         <div style="font-weight: 500; font-size: 1.1rem;">
                            ${task.completedAt ? (task.completedAt.toDate ? task.completedAt.toDate().toLocaleDateString() : new Date(task.completedAt).toLocaleDateString()) : 'N/A'}
                         </div>
                         <div style="font-size: 0.85rem; color: #64748b;">
                            ${task.completedAt ? (task.completedAt.toDate ? task.completedAt.toDate().toLocaleTimeString() : new Date(task.completedAt).toLocaleTimeString()) : ''}
                         </div>
                    </div>
                </div>

                <!-- Delivery Information -->
               ${(task.completionNotes || task.fileLink || task.deliveryMethod) ? `
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <h3 style="margin-top: 0; color: #166534; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                        <i class="material-icons-round">check_circle</i> Delivery Information
                    </h3>
                    
                    <div style="display: grid; gap: 1rem;">
                        ${task.deliveryMethod ? `
                        <div>
                            <strong style="display: block; font-size: 0.8rem; color: #15803d; text-transform: uppercase;">Delivery Platform</strong>
                            <div style="color: #14532d; font-weight: 500;">
                                ${task.deliveryMethod === 'telegram' ? '📱 Telegram' :
                    task.deliveryMethod === 'drive' ? '☁️ Google Drive' :
                        task.deliveryMethod === 'whatsapp' ? '💬 WhatsApp' :
                            task.deliveryMethod === 'dropbox' ? '📦 Dropbox' : '🔗 Other'}
                            </div>
                        </div>
                        ` : ''}

                        ${task.fileLink ? `
                        <div>
                             <strong style="display: block; font-size: 0.8rem; color: #15803d; text-transform: uppercase;">Delivery Link</strong>
                             <a href="${task.fileLink}" target="_blank" style="color: #16a34a; font-weight: 500; word-break: break-all;">${task.fileLink}</a>
                        </div>
                        ` : ''}

                        ${task.completionNotes ? `
                        <div>
                             <strong style="display: block; font-size: 0.8rem; color: #15803d; text-transform: uppercase;">Delivery Comment / Notes</strong>
                             <p style="margin: 0; color: #14532d; white-space: pre-wrap;">${task.completionNotes}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                <div style="margin-bottom: 1.5rem;">
                    <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem;">Reference Links</h4>
                    ${task.referenceLinks && task.referenceLinks.length > 0 ? `
                    <ul style="list-style: none; padding: 0;">
                        ${task.referenceLinks.map(link => `
                            <li style="margin-bottom: 0.5rem;">
                                <a href="${link}" target="_blank" style="color: #6366f1; text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="material-icons-round" style="font-size: 1rem;">link</i> 
                                    <span style="overflow: hidden; text-overflow: ellipsis; max-width: 400px; white-space: nowrap;">${link}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                    ` : '<p style="font-size: 0.9rem; color: #94a3b8; font-style: italic;">No reference links attached.</p>'}
                </div>

                ${task.history ? `
                <div>
                     <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem;">Task History</h4>
                     <p style="font-size: 0.8rem; color: #94a3b8;">Create a real 'View History' feature later...</p>
                </div>
                ` : ''}

            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}
