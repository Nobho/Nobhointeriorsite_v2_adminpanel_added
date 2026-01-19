// QuestAdmin - Firebase Data Initialization Script
// ================================================
// INSTRUCTIONS:
// 1. Create users in Firebase Auth first
// 2. Copy each user's UID from Firebase Console
// 3. Replace the UIDs below with actual values
// 4. Run this script in browser console while logged in

async function initializeQuestAdmin() {
    const { getFirestore, collection, doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const db = getFirestore();

    console.log("🚀 Initializing QuestAdmin...");

    // ===== STEP 1: UPDATE THESE UIDs =====
    // Get UIDs from Firebase Console > Authentication
    const USER_IDS = {
        azwad: "VZe8mdHhVbYQpZ1i32h0CaTPCmW2",      // azwad@nobho.com
        nusaiba: "Pm8Mg8bQcSjdAH4OvLdM6p8FYA9f1",  // nusaiba@nobho.com
        abdullah: "nW6evgEsimbq3gkyj9xJfdxlEoO2", // abdullah@nobho.com
        shariar: "xvFe6Fc2DuX6HlfQFm7cLOv3nIg1"   // shariar@nobho.com
    };

    // User profiles (with team photos)
    const users = [
        {
            uid: USER_IDS.azwad,
            name: "MD. Azwad Riyan",
            email: "azwadriyan@gmail.com",
            role: "admin",
            photoUrl: "/assets/images/team/Riyan.jpg",
            title: "Co-founder, Technology & Visualization",
            telegramId: "1276130679",
            status: "active"
        },
        {
            uid: USER_IDS.nusaiba,
            name: "Nusaiba Binte Mamun",
            email: "nusaiba.mamun20@gmail.com",
            role: "moderator",
            photoUrl: "/assets/images/team/Nusaiba.jpg",
            title: "Co-founder, Client Relations & Management",
            telegramId: "1617312734",
            status: "active"
        },
        {
            uid: USER_IDS.abdullah,
            name: "Abdullah Mubasshir",
            email: "abdullahmubasshir786@gmail.com",
            role: "employee",
            photoUrl: "/assets/images/team/Mubasshir.jpg",
            title: "Co-founder, Lead Designer",
            telegramId: "5243994015",
            status: "active"
        },
        {
            uid: USER_IDS.shariar,
            name: "Shariar Hasan",
            email: "shariarhassan2002@gmail.com",
            role: "employee",
            photoUrl: "/assets/images/team/Shariar.png",
            title: "Co-founder, Art Direction & Styling",
            telegramId: "1367897356",
            status: "active"
        }
    ];

    // Create user profiles
    for (const user of users) {
        if (user.uid.includes("PASTE")) {
            console.warn(`⚠️ Skipping ${user.name} - UID not set`);
            continue;
        }

        try {
            await setDoc(doc(db, "users", user.uid), {
                name: user.name,
                email: user.email,
                role: user.role,
                photoUrl: user.photoUrl,
                title: user.title,
                telegramId: user.telegramId,
                status: user.status,
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp()
            });
            console.log(`✅ Created user: ${user.name} (${user.role})`);
        } catch (e) {
            console.error(`❌ Failed to create ${user.name}:`, e);
        }
    }

    // Sample tasks
    const now = new Date();
    const tasks = [
        {
            title: "Create 3D Rendering of Residential Building",
            description: "High-quality 3D visualization for the new residential project in Gulshan. Include exterior views, interior spaces, and landscaping.",
            assignedTo: USER_IDS.azwad,
            assignedToName: "MD. Azwad Riyan",
            assignedToPhoto: "/assets/images/team/Riyan.jpg",
            status: "in_progress",
            priority: "high",
            deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        {
            title: "Client Meeting - Dhanmondi Apartment",
            description: "Initial consultation with client for interior design of 2500 sqft apartment. Discuss budget, timeline, and design preferences.",
            assignedTo: USER_IDS.nusaiba,
            assignedToName: "Nusaiba Binte Mamun",
            assignedToPhoto: "/assets/images/team/Nusaiba.jpg",
            status: "pending",
            priority: "medium",
            deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        },
        {
            title: "Material Selection for Office Project",
            description: "Finalize flooring, wall finishes, and furniture for corporate office. Prepare mood boards and cost estimates.",
            assignedTo: USER_IDS.abdullah,
            assignedToName: "Abdullah Mubasshir",
            assignedToPhoto: "/assets/images/team/Mubasshir.jpg",
            status: "in_progress",
            priority: "high",
            deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
        },
        {
            title: "Art Curation for Luxury Villa",
            description: "Select and arrange artwork for the main living areas. Coordinate with local artists and galleries.",
            assignedTo: USER_IDS.shariar,
            assignedToName: "Shariar Hasan",
            assignedToPhoto: "/assets/images/team/Shariar.png",
            status: "pending",
            priority: "medium",
            deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        {
            title: "Update Portfolio Website",
            description: "Add latest project photos and case studies to the website. Optimize images and write descriptions.",
            assignedTo: USER_IDS.azwad,
            assignedToName: "MD. Azwad Riyan",
            assignedToPhoto: "/assets/images/team/Riyan.jpg",
            status: "done",
            priority: "low",
            deadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            completedAt: serverTimestamp()
        },
        {
            title: "Prepare Presentation for Investor Meeting",
            description: "Create comprehensive presentation showcasing recent projects, financial projections, and growth strategy.",
            assignedTo: USER_IDS.nusaiba,
            assignedToName: "Nusaiba Binte Mamun",
            assignedToPhoto: "/assets/images/team/Nusaiba.jpg",
            status: "in_progress",
            priority: "high",
            deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
        }
    ];

    // Create tasks
    for (const task of tasks) {
        if (task.assignedTo.includes("PASTE")) {
            console.warn(`⚠️ Skipping task: ${task.title} - UID not set`);
            continue;
        }

        try {
            const taskData = {
                ...task,
                createdBy: "system",
                createdByName: "System",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const { addDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            await addDoc(collection(db, "tasks"), taskData);
            console.log(`✅ Created task: ${task.title}`);
        } catch (e) {
            console.error(`❌ Failed to create task:`, e);
        }
    }

    console.log("🎉 QuestAdmin initialization complete!");
    console.log("\n📝 Next steps:");
    console.log("1. Verify users in Firestore Console");
    console.log("2. Deploy security rules from firestore.rules");
    console.log("3. Test login with each user");
    console.log("4. Verify role-based access works correctly");
}

// Auto-run
initializeQuestAdmin();
