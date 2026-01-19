import { getFirestore as getFirestoreSDK, doc as docSDK, getDoc as getDocSDK, collection as collectionSDK, addDoc as addDocSDK, serverTimestamp as serverTimestampSDK, updateDoc as updateDocSDK, query as querySDK, orderBy as orderBySDK, limit as limitSDK, getDocs as getDocsSDK } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { firebaseConfig } from './config.js';

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestoreSDK(app);

// --- User & Role Management ---

export async function getUserProfile(uid) {
    const userRef = docSDK(db, "users", uid);
    const docSnap = await getDocSDK(userRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
}

export async function createUserProfile(user) {
    const userRef = docSDK(db, 'users', user.uid);
    // TODO: implement with setDoc
}

// --- Masquerade Logic ---

export function getEffectiveRole() {
    if (window.CuteState.role === 'admin' && window.CuteState.viewMode) {
        return window.CuteState.viewMode;
    }
    return window.CuteState.role || 'guest';
}

export function canPerform(action) {
    const role = getEffectiveRole();

    const permissions = {
        'admin': ['view_all', 'delete_task', 'manage_users', 'view_logs'],
        'moderator': ['view_all', 'edit_task'],
        'employee': ['view_assigned']
    };

    const allowed = permissions[role] || [];
    return allowed.includes(action);
}

// --- Logging System (The Double-Lock Audit) ---

/**
 * Public Activity Feed Log (Team-facing)
 */
export async function logAction(userId, actionType, details, taskId = null) {
    const timestamp = serverTimestampSDK();
    try {
        const userProfile = window.CuteState.userProfile || {};
        const userName = userProfile.name || window.CuteState.user.displayName || window.CuteState.user.email;
        const userPhoto = userProfile.photoUrl || null;

        const activityData = {
            userId: userId,
            userName: userName,
            userPhoto: userPhoto,
            userRole: userProfile.role || 'employee',
            action: actionType,
            details: details,
            timestamp: timestamp,
            relatedTaskId: taskId
        };

        await addDocSDK(collectionSDK(db, "activity_feed"), activityData);
    } catch (e) {
        console.error("[ActivityFeed] Failed to create log:", e);
    }

    // Task-Specific History
    if (taskId) {
        try {
            const historyRef = collectionSDK(db, "tasks", taskId, "history");
            await addDocSDK(historyRef, {
                userId: userId,
                action: actionType,
                details: details,
                timestamp: timestamp
            });
        } catch (e) {
            console.error("Task history log failed", e);
        }
    }
}

/**
 * Advanced System Audit (Admin-only)
 * Tracks logins, role changes, masquerading, and critical deletes.
 */
export async function logSystemAction(action, details, metadata = {}) {
    try {
        const user = window.CuteState.user;
        const auditData = {
            actorId: user ? user.uid : 'system',
            actorName: user ? (user.displayName || user.email) : 'System',
            actorRole: window.CuteState.role || 'guest',
            action: action,
            details: details,
            metadata: {
                ...metadata,
                viewMode: window.CuteState.viewMode || null,
                userAgent: navigator.userAgent
            },
            timestamp: serverTimestampSDK()
        };

        await addDocSDK(collectionSDK(db, "system_audit"), auditData);
    } catch (e) {
        console.error("[SystemAudit] Failed to log security event:", e);
    }
}

export async function getGlobalLogs() {
    const q = querySDK(collectionSDK(db, "activity_feed"), orderBySDK("timestamp", "desc"), limitSDK(50));
    const querySnapshot = await getDocsSDK(q);

    const logs = [];
    querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
}

export async function getSystemAuditLogs() {
    // Only admins can fetch these
    if (window.CuteState.role !== 'admin') return [];

    const q = querySDK(collectionSDK(db, "system_audit"), orderBySDK("timestamp", "desc"), limitSDK(100));
    const querySnapshot = await getDocsSDK(q);
    const logs = [];
    querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
}

