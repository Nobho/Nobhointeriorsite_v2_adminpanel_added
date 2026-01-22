// CuteAdmin Main Entry
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from './config.js';
import { initAuth, login, logout } from './auth.js';
import { renderLoginPage, renderDashboardPage, renderProfilePage, showToast, renderAuditLogPage, renderProjectsPage, renderUsersPage, renderDashboardContent } from './ui.js';
import { renderUltimateView } from './ultimate-view.js';
import { uploadProfilePhoto, changeUserPassword } from './profile.js';
import { initMobileMenu } from './mobile-nav.js';

// Placeholder for Projects Module (Future Development)
function renderProjectsPlaceholder() {
    const content = document.getElementById('mainContentArea');
    if (!content) return;
    content.innerHTML = `
        <div class="ims-page projects-placeholder">
            <div class="placeholder-content">
                <i class="material-icons-round" style="font-size: 5rem; color: #00C9BC; margin-bottom: 1rem;">construction</i>
                <h2>Projects Module</h2>
                <p style="color: #64748b; max-width: 400px; margin: 1rem auto;">
                    This module is under development. Soon you'll be able to manage projects, 
                    link invoices, and track project milestones here.
                </p>
                <div style="background: #f1f5f9; padding: 1rem; border-radius: 12px; margin-top: 2rem;">
                    <p style="margin: 0; font-size: 0.9rem; color: #475569;">
                        <strong>Coming Features:</strong><br>
                        • Project creation & management<br>
                        • Link invoices to projects<br>
                        • Milestone tracking<br>
                        • Project-based reporting
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Initialize Services
const app = initializeApp(firebaseConfig);
const auth = initAuth(app);
const db = getFirestore(app);

// Global State
window.CuteState = {
    user: null,
    role: null, // Will be set from Firestore after login
    viewMode: null // Will be set to match role, can be changed by admins/moderators
};

// --- Routing & State Logic ---

const handleRoute = () => {
    const hash = window.location.hash || '#dashboard';

    // Public Routes
    if (hash === '#login') {
        if (window.CuteState.user) {
            window.location.hash = '#dashboard';
            return;
        }
        renderLogin();
        return;
    }

    // Private Routes
    if (!window.CuteState.user) {
        return;
    }

    // Render dashboard shell ONLY if not already rendered
    const dashboardExists = document.querySelector('.dashboard-layout');
    if (!dashboardExists) {
        renderDashboard();
        // Initialize mobile menu
        setTimeout(() => initMobileMenu(), 100);
    }

    // Update active nav link
    updateActiveNavLink(hash);

    // Route to specific content
    if (hash === '#dashboard' || hash === '') {
        renderDashboardContent();
    } else if (hash === '#settings' || hash === '#profile') {
        renderProfilePage(window.CuteState.user);
    } else if (hash === '#logs') {
        renderAuditLogPage();
    } else if (hash === '#projects') {
        renderProjectsPage();
    } else if (hash === '#users') {
        renderUsersPage();
    } else if (hash === '#ultimate') {
        renderUltimateView();
    } else if (hash === '#invoices') {
        import('./invoice-ui.js').then(m => m.renderInvoicesPage());
    } else if (hash === '#customers') {
        import('./customer-ui.js').then(m => m.renderCustomersPage());
    } else if (hash === '#ims-projects') {
        import('./projects-ui.js').then(m => m.renderProjectsPage());
    } else if (hash === '#company-settings') {
        import('./company-settings.js').then(m => m.renderCompanySettingsPage());
    }
};

function updateActiveNavLink(hash) {
    // Remove active class from all nav links
    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to current link
    const currentLink = document.querySelector(`.sidebar nav a[href="${hash}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }
}

function renderLogin() {
    renderLoginPage();

    // Google Sign-In button
    const googleBtn = document.getElementById('googleSignInBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                googleBtn.textContent = "Signing in...";
                googleBtn.disabled = true;
                const { loginWithGoogle } = await import('./auth.js');
                await loginWithGoogle(auth);
            } catch (err) {
                googleBtn.innerHTML = `
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd"><path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"></path><path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"></path><path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"></path><path d="M9 18c2.43 0 4.47-.80 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.40-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"></path><path fill="none" d="M0 0h18v18H0z"></path></g></svg>
                    Sign in with Google
                `;
                googleBtn.disabled = false;
            }
        });
    }

    // Email/Password form
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('loginBtn');

            try {
                btn.textContent = "Verifying...";
                btn.disabled = true;
                await login(auth, email, password);
            } catch (err) {
                btn.textContent = "Login with Email";
                btn.disabled = false;
            }
        });
    }
}

function renderDashboard() {
    renderDashboardPage(window.CuteState.user);
}

// --- Event Listeners ---
document.addEventListener('app:logout', () => {
    logout(auth);
});

document.addEventListener('app:uploadPhoto', async (e) => {
    const url = await uploadProfilePhoto(e.detail.file, window.CuteState.user);
    if (url) {
        document.getElementById('profilePreview').src = url;
    }
});

document.addEventListener('app:changePassword', async (e) => {
    const { current, newP } = e.detail;
    await changeUserPassword(window.CuteState.user, current, newP);
});

// --- Auth Observer ---

// Store initial hash to prevent overriding
const initialHash = window.location.hash;

onAuthStateChanged(auth, async (user) => {
    window.CuteState.user = user;
    if (user) {
        console.log("User Access Granted:", user.email);

        // Sync user profile and get role
        try {
            const { syncUserProfile } = await import('./users.js');
            const userProfile = await syncUserProfile(user);

            // Set role from Firestore
            window.CuteState.role = userProfile.role || 'employee';
            // Always set viewMode to match actual role on login
            // Admins can change this later using the view switcher
            window.CuteState.viewMode = window.CuteState.role;
            window.CuteState.userProfile = userProfile;

            console.log("User role:", window.CuteState.role);
        } catch (error) {
            console.error("Failed to sync user profile:", error);
            window.CuteState.role = 'employee';
            window.CuteState.viewMode = 'employee';
        }

        // Logic to preserve current route on refresh
        // If we are on login or root, go to dashboard.
        // Otherwise, respect the hash.
        const currentHash = window.location.hash;

        if (currentHash === '#login' || !currentHash) {
            // If expressly on login page, redirect to dashboard
            window.location.hash = '#dashboard';
        } else {
            // Force route handling for current hash
            handleRoute();
        }
    } else {
        console.log("User Access Denied / Guest");
        window.location.hash = '#login';
    }
});

// Initial Init
window.addEventListener('hashchange', handleRoute);

console.log("CuteAdmin System Online");
