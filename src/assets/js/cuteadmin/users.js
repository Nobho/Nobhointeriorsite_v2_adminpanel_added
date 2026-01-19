// User Management Module
import { getFirestore, collection, doc, getDoc, getDocs, updateDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from './ui.js';

const db = getFirestore();

// Team data mapping (from team.json)
const TEAM_MAPPING = {
    "azwadriyan@gmail.com": {
        name: "MD. Azwad Riyan",
        photoUrl: "/assets/images/team/Riyan.jpg",
        title: "Co-founder, Technology & Visualization",
        telegramId: "1276130679"
    },
    "nusaiba.mamun20@gmail.com": {
        name: "Nusaiba Binte Mamun",
        photoUrl: "/assets/images/team/Nusaiba.jpg",
        title: "Co-founder, Client Relations & Management",
        telegramId: "1617312734"
    },
    "abdullahmubasshir25@gmail.com": {
        name: "Abdullah Mubasshir",
        photoUrl: "/assets/images/team/Mubasshir.jpg",
        title: "Co-founder, Lead Designer",
        telegramId: "5243994015"
    },
    "shariarhassan2002@gmail.com": {
        name: "Shariar Hassan",
        photoUrl: "/assets/images/team/Shariar.png",
        title: "Co-founder, Art Direction & Styling",
        telegramId: "1367897356"
    }
};

// Get all users
export async function getAllUsers() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Hotfix: Rename Shariar Hasan to Shariar Hassan (Frontend Only)
            if (data.name === "Shariar Hasan") data.name = "Shariar Hassan";
            users.push({ id: doc.id, ...data });
        });

        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

// Get single user
export async function getUser(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

// Create or update user profile
export async function syncUserProfile(authUser) {
    try {
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);

        // Get team data if exists
        const teamData = TEAM_MAPPING[authUser.email] || {};

        if (!userSnap.exists()) {
            // SECURITY: Only auto-create user if they're in the TEAM_MAPPING (whitelist)
            if (!TEAM_MAPPING[authUser.email]) {
                throw new Error("User not authorized. Email not in team whitelist.");
            }

            // Create new user (only for whitelisted emails)
            const userData = {
                email: authUser.email,
                name: teamData.name || authUser.displayName || authUser.email,
                photoUrl: teamData.photoUrl || authUser.photoURL || null,
                title: teamData.title || "",
                telegramId: teamData.telegramId || null,
                role: "employee", // Default role
                status: "active",
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp()
            };

            await setDoc(userRef, userData);
            return userData;
        } else {
            // Update last active
            await updateDoc(userRef, {
                lastActive: serverTimestamp()
            });

            return userSnap.data();
        }
    } catch (error) {
        console.error("Error syncing user profile:", error);
        throw error;
    }
}

// Update user role (admin only)
export async function updateUserRole(uid, newRole) {
    try {
        if (window.CuteState.role !== 'admin') {
            throw new Error("Permission denied");
        }

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        const oldRole = userSnap.exists() ? userSnap.data().role : 'unknown';

        await updateDoc(userRef, {
            role: newRole,
            updatedAt: serverTimestamp()
        });

        // Log to System Audit
        try {
            const { logSystemAction } = await import('./db.js');
            await logSystemAction('role_update', `Updated role for ${uid} from ${oldRole} to ${newRole}`, {
                targetUid: uid,
                oldRole: oldRole,
                newRole: newRole
            });
        } catch (e) { }

        showToast("User role updated", "success");
    } catch (error) {
        console.error("Error updating role:", error);
        showToast("Failed to update role", "error");
        throw error;
    }
}

// Get user by email
export async function getUserByEmail(email) {
    try {
        const users = await getAllUsers();
        return users.find(u => u.email === email);
    } catch (error) {
        console.error("Error finding user:", error);
        return null;
    }
}

// Get team members for assignment dropdown
export async function getTeamMembers() {
    try {
        const users = await getAllUsers();
        return users.filter(u => u.status === 'active').map(u => ({
            uid: u.id,
            name: u.name,
            email: u.email,
            photoUrl: u.photoUrl,
            role: u.role
        }));
    } catch (error) {
        console.error("Error fetching team members:", error);
        return [];
    }
}
