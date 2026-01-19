// User Management UI Functions
import { getAllUsers } from './users.js';
import { showToast } from './ui.js';
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

export async function renderUserManagementUI() {
    const content = document.getElementById('mainContentArea');
    if (!content) return;

    const role = window.CuteState.role;

    content.innerHTML = `
        <div class="users-header">
            <h2>Team Members</h2>
            ${role === 'admin' ? '<button class="btn-primary" id="addUserBtn"><i class="material-icons-round">person_add</i> Add User</button>' : ''}
        </div>
        <div class="users-grid" id="usersContainer">
            <div class="initial-loader"><div class="spinner"></div><p>Loading team...</p></div>
        </div>
    `;

    const addBtn = document.getElementById('addUserBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showUserModal());
    }

    await loadUsersGrid();
}

async function loadUsersGrid() {
    const container = document.getElementById('usersContainer');
    if (!container) return;

    try {
        const users = await getAllUsers();

        if (users.length === 0) {
            container.innerHTML = '<p class="empty-state">No users found. Add your first team member!</p>';
            return;
        }

        // Fetch ALL tasks to calculate stats per user
        const { getTasks } = await import('./tasks.js');
        const allTasks = await getTasks();

        const role = window.CuteState.role;

        // Calculate Active Stats
        let activeCount = 0;
        const now = new Date();
        const FIVE_MINUTES = 5 * 60 * 1000;

        users.forEach(u => {
            let lastActive = u.lastActiveAt ? (u.lastActiveAt.toDate ? u.lastActiveAt.toDate() : new Date(u.lastActiveAt)) : null;
            if (lastActive && (now - lastActive) < FIVE_MINUTES) {
                u.isOnline = true;
                activeCount++;
            }
        });

        // Insert Stats Header for Admin
        let html = '';
        if (role === 'admin') {
            html += `
                <div style="grid-column: 1 / -1; background: white; padding: 1rem; border-radius: 12px; margin-bottom: 2rem; display: flex; gap: 2rem; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <div>
                        <small style="color: #64748b; font-weight: 600;">ACTIVE NOW</small>
                        <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${activeCount}</div>
                    </div>
                    <div>
                        <small style="color: #64748b; font-weight: 600;">TOTAL USERS</small>
                        <div style="font-size: 1.5rem; font-weight: 700; color: #6366f1;">${users.length}</div>
                    </div>
                </div>
            `;
        }

        html += users.map(user => {
            // Calculate Task Stats for this user
            const userTasks = allTasks.filter(t => t.assignedTo === user.id);
            const pendingTasks = userTasks.filter(t => t.status === 'pending').length;
            const inProgressTasks = userTasks.filter(t => t.status === 'in_progress').length;
            const completedTasks = userTasks.filter(t => t.status === 'done').length;
            const totalTasks = userTasks.length;

            // Format Last Active
            let lastSeen = 'Never';
            let statusColor = '#cbd5e1'; // gray
            let statusText = 'Offline';

            if (user.lastActiveAt) {
                const date = user.lastActiveAt.toDate ? user.lastActiveAt.toDate() : new Date(user.lastActiveAt);
                lastSeen = date.toLocaleString();

                // If active in last 5 mins
                if ((now - date) < FIVE_MINUTES) {
                    statusColor = '#10b981'; // green
                    statusText = 'Online';
                } else if ((now - date) < 30 * 60 * 1000) {
                    statusColor = '#f59e0b'; // yellow (away)
                    statusText = 'Away';
                }
            }

            return `
            <div class="user-card" style="position: relative;">
                ${role === 'admin' ? `
                    <div style="position: absolute; top: 1rem; right: 1rem; display: flex; align-items: center; gap: 0.25rem;">
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></div>
                        <span style="font-size: 0.75rem; color: #64748b;">${statusText}</span>
                    </div>
                ` : ''}
                
                <img src="${user.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}" class="user-avatar" alt="${user.name}">
                <h3>${user.name}</h3>
                <p class="user-title">${user.title || user.email}</p>
                <p class="user-email" style="font-size: 0.85rem; color: #64748b; margin: 0.5rem 0;">${user.email}</p>
                <span class="role-badge ${user.role}">${user.role}</span>
                
                ${(role === 'admin' || role === 'moderator') ? `
                    <!-- Task Statistics Badge -->
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 1rem; border-radius: 12px; margin-top: 1rem; color: white; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                        <div style="font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">📊 Task Statistics</div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; text-align: center;">
                            <div style="background: rgba(255,255,255,0.15); padding: 0.5rem; border-radius: 8px; backdrop-filter: blur(10px);">
                                <div style="font-size: 1.5rem; font-weight: 700;">${pendingTasks}</div>
                                <div style="font-size: 0.7rem; opacity: 0.9; margin-top: 0.25rem;">Not Started</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.15); padding: 0.5rem; border-radius: 8px; backdrop-filter: blur(10px);">
                                <div style="font-size: 1.5rem; font-weight: 700;">${inProgressTasks}</div>
                                <div style="font-size: 0.7rem; opacity: 0.9; margin-top: 0.25rem;">In Progress</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.15); padding: 0.5rem; border-radius: 8px; backdrop-filter: blur(10px);">
                                <div style="font-size: 1.5rem; font-weight: 700;">${completedTasks}</div>
                                <div style="font-size: 0.7rem; opacity: 0.9; margin-top: 0.25rem;">Completed</div>
                            </div>
                        </div>
                        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.2); text-align: center; font-size: 0.85rem; font-weight: 600;">
                            Total: ${totalTasks} Task${totalTasks !== 1 ? 's' : ''}
                        </div>
                    </div>
                ` : ''}
                
                ${role === 'admin' ? `
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; width: 100%;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.75rem;">
                            <div>
                                <span style="color: #94a3b8; display: block;">Last Login IP</span>
                                <span style="font-family: monospace; color: #334155;">${user.lastLoginIP || 'Unknown'}</span>
                            </div>
                            <div>
                                <span style="color: #94a3b8; display: block;">Last Seen</span>
                                <span style="color: #334155;">${lastSeen}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="user-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn-sm" onclick="window.editUserRole('${user.id}', '${user.name}', '${user.role}')">
                            <i class="material-icons-round" style="font-size: 1rem;">edit</i> Edit Role
                        </button>
                    </div>
                ` : ''}
            </div>
            `;
        }).join('');

        container.innerHTML = html;

    } catch (error) {
        console.error("Failed to load users:", error);
        container.innerHTML = '<p class="error-state">Failed to load users</p>';
    }
}

function showUserModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New User</h2>
                <button class="modal-close">&times;</button>
            </div>
            <form id="userForm">
                <div class="input-group">
                    <label>Firebase Auth UID <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="userUid" placeholder="Paste from Firebase Console" required>
                    <small style="color: #64748b; font-size: 0.8rem;">Get this from Firebase Console → Authentication</small>
                </div>
                <div class="input-group">
                    <label>Full Name <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="userName" placeholder="e.g. John Doe" required>
                </div>
                <div class="input-group">
                    <label>Email <span style="color: #ef4444;">*</span></label>
                    <input type="email" id="userEmail" placeholder="user@example.com" required>
                </div>
                <div class="input-group">
                    <label>Role <span style="color: #ef4444;">*</span></label>
                    <select id="userRole" required style="cursor: pointer;">
                        <option value="">Select role...</option>
                        <option value="admin">👑 Admin - Full system access</option>
                        <option value="moderator">🛡️ Moderator - Manage tasks & team</option>
                        <option value="employee">👷 Employee - View assigned tasks only</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Job Title</label>
                    <input type="text" id="userTitle" placeholder="e.g. Lead Designer">
                </div>
                <div class="input-group">
                    <label>Photo URL</label>
                    <input type="text" id="userPhoto" placeholder="/assets/images/team/photo.jpg">
                    <small style="color: #64748b; font-size: 0.8rem;">Leave blank to use auto-generated avatar</small>
                </div>
                <div class="input-group">
                    <label>Telegram ID (optional)</label>
                    <input type="text" id="userTelegram" placeholder="e.g. 1234567890">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary modal-close">Cancel</button>
                    <button type="submit" class="btn-primary">Save User</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            uid: document.getElementById('userUid').value.trim(),
            name: document.getElementById('userName').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            role: document.getElementById('userRole').value,
            title: document.getElementById('userTitle').value.trim() || '',
            photoUrl: document.getElementById('userPhoto').value.trim() || null,
            telegramId: document.getElementById('userTelegram').value.trim() || null
        };

        if (!userData.uid || userData.uid.length < 10) {
            showToast("Please enter a valid Firebase UID", "error");
            return;
        }

        try {
            await setDoc(doc(db, "users", userData.uid), {
                name: userData.name,
                email: userData.email,
                role: userData.role,
                title: userData.title,
                photoUrl: userData.photoUrl,
                telegramId: userData.telegramId,
                status: "active",
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp()
            });

            showToast(`User ${userData.name} added successfully!`, "success");
            modal.remove();
            await loadUsersGrid();
        } catch (error) {
            console.error("Error creating user:", error);
            showToast(`Failed to create user: ${error.message}`, "error");
        }
    });
}

window.editUserRole = async function (userId, userName, currentRole) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Edit Role</h2>
                <button class="modal-close">&times;</button>
            </div>
            <form id="roleForm">
                <p style="margin-bottom: 1rem; color: #64748b;">Changing role for: <strong>${userName}</strong></p>
                <div class="input-group">
                    <label>Select New Role</label>
                    <select id="newRole" required style="cursor: pointer;">
                        <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>👑 Admin - Full access</option>
                        <option value="moderator" ${currentRole === 'moderator' ? 'selected' : ''}>🛡️ Moderator - Manage tasks</option>
                        <option value="employee" ${currentRole === 'employee' ? 'selected' : ''}>👷 Employee - View only</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary modal-close">Cancel</button>
                    <button type="submit" class="btn-primary">Update Role</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    document.getElementById('roleForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const newRole = document.getElementById('newRole').value;

        if (newRole === currentRole) {
            showToast("Role unchanged", "neutral");
            modal.remove();
            return;
        }

        try {
            const { updateUserRole } = await import('./users.js');
            await updateUserRole(userId, newRole);
            modal.remove();
            await loadUsersGrid();
        } catch (error) {
            console.error("Failed to update role:", error);
        }
    });
};
