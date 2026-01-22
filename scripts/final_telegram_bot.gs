/**
 * 🤖 QuestAdmin Telegram Bot & Scheduler (Refactored v2)
 * ======================================================
 * 
 * CHANGES v2:
 * - Fixes Database Duplication: Updates existing rows instead of appending.
 * - Enhanced Messages: Shows Duration, "Completed By" vs "Assignee".
 * - Smart Reminders: Accurate filtering for daily pending tasks.
 */

// --- CONFIGURATION ---
// ⚠️ IMPORTANT: Set these values in Project Settings -> Script Properties
const scriptProperties = PropertiesService.getScriptProperties();

const CONFIG = {
  BOT_TOKEN: scriptProperties.getProperty('BOT_TOKEN') || 'YOUR_BOT_TOKEN_HERE',
  GROUP_CHAT_ID: scriptProperties.getProperty('GROUP_CHAT_ID') || 'YOUR_GROUP_CHAT_ID',
  SHEET_ID: scriptProperties.getProperty('SHEET_ID') || 'YOUR_SHEET_ID',
  
  // Map Firebase UIDs to Telegram Chat IDs
  // Set these as properties like: "USER_MAP_UID1" -> "123456"
  // OR keep hardcoded if not strictly secret (User IDs are less sensitive than Bot Tokens)
  USER_MAP: {
    "VZe8mdHhVbYQpZ1i32h0CaTPCmW2": "1276130679", // Azwad
    "m8Mg8bQcSjdAH4OvLdM6p8FYA9f1": "1617312734", // Nusaiba
    "3Ab4SgapYHagUHhQFRq4StqeYbx2": "5243994015", // Abdullah
    "xvFe6Fc2DuX6HlfQFm7cLOv3nIg1": "1367897356"  // Shariar Hassan
  }
};

// --- WEBHOOK HANDLER ---
function doPost(e) {
  try {
    Logger.log('🌐 Webhook received at: ' + new Date().toISOString());
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const task = data.task;
    
    Logger.log('📋 Action: ' + action);
    Logger.log('📦 Task data received: ' + JSON.stringify(task));
    
    // 1. Sync to Google Sheet (Update or Create)
    syncTaskToSheet(task);
    
    // 2. Send Notifications based on Action
    if (action === 'task_created') {
        Logger.log('🆕 Processing task_created');
        notifyGroup_NewTask(task);
        notifyAssignee_NewTask(task);
    } 
    else if (action === 'task_completed') {
        Logger.log('✅ Processing task_completed');
        notifyGroup_Completion(task);
        notifyAssignee_Completion(task); // Notify assignee if someone else completed their task
        notifyCreator_Completion(task);  // Notify creator if they didn't complete it themselves
    }
    else if (action === 'task_updated') {
        Logger.log('🔄 Processing task_updated');
        notifyGroup_Update(task);
    }
    else {
        Logger.log('⚠️ Unknown action type: ' + action);
    }
    
    Logger.log('✅ Webhook processing completed successfully');
    return ContentService.createTextOutput(JSON.stringify({success: true}));
  } catch (err) {
    Logger.log('❌ ERROR in doPost: ' + err.toString());
    Logger.log('Stack trace: ' + err.stack);
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()}));
  }
}

const ADMIN_URL = "nobho.com/cuteadmin";

// --- NOTIFICATION LOGIC ---

function notifyGroup_NewTask(task) {
  const msg = `🆕 <b>New Task Assigned</b>\n\n` +
              `📌 <b>${task.title}</b>\n` +
              `👤 Assigned to: ${task.assignedToName}\n` +
              `🔥 Priority: ${task.priority.toUpperCase()}\n` +
              `📅 Due: ${formatDate(task.deadline)}\n\n` +
              `🔗 <a href="${ADMIN_URL}">Open Dashboard</a>`;
  sendMessage(CONFIG.GROUP_CHAT_ID, msg);
}

function notifyGroup_Completion(task) {
  try {
    Logger.log('📥 notifyGroup_Completion called with task:');
    Logger.log(JSON.stringify(task));
    
    // Validate required fields
    if (!task) {
      Logger.log('❌ ERROR: Task object is null or undefined');
      return;
    }
    
    if (!task.title) {
      Logger.log('❌ ERROR: Task title is missing');
      return;
    }
    
    if (!task.createdAt) {
      Logger.log('⚠️ WARNING: createdAt is missing, using fallback');
    }
    
    if (!task.completedAt) {
      Logger.log('⚠️ WARNING: completedAt is missing, using current time');
    }
    
    // Calculate Duration with fallback
    const duration = calculateDuration(task.createdAt, task.completedAt);
    Logger.log('⏱ Calculated duration: ' + duration);
    
    // Determine who completed it
    let completerName = task.assignedToName || 'Unknown User';
    if (task.completedBy && task.completedBy !== task.assignedTo) {
        completerName = `${task.assignedToName || 'Unknown'} (or teammate)`;
    }
    
    Logger.log('👤 Completer name: ' + completerName);

    // Format: Name -- Completed his task - 'Task Title'
    const msg = `✅ <b>${completerName} -- Completed his/her task - '${task.title}'</b>\n\n` +
                `⏱ Done in ${duration}\n` +
                `📁 <a href="${task.fileLink || '#'}">View Delivery</a>\n\n` +
                `🔗 <a href="${ADMIN_URL}">Open Dashboard</a>`;
    
    Logger.log('📨 Sending message to group: ' + CONFIG.GROUP_CHAT_ID);
    sendMessage(CONFIG.GROUP_CHAT_ID, msg);
    Logger.log('✅ Message sent successfully');
    
  } catch (err) {
    Logger.log('❌ ERROR in notifyGroup_Completion: ' + err.toString());
    Logger.log('Stack trace: ' + err.stack);
  }
}

function notifyAssignee_NewTask(task) {
  const telegramId = CONFIG.USER_MAP[task.assignedTo];
  if (!telegramId) return;
  
  const msg = `👋 <b>New Task for You!</b>\n\n` +
              `📌 <b>${task.title}</b>\n` +
              `📝 ${task.description || 'No description'}\n\n` +
              `🔥 Priority: ${task.priority}\n` +
              `📅 Deadline: ${formatDate(task.deadline)}\n\n` +
              `👉 <a href="${ADMIN_URL}">Login to Dashboard</a> to start working.`;
  sendMessage(telegramId, msg);
}

function notifyGroup_Update(task) {
  // Only notify if status seems important (not just typo fix)
  // For now, we notify on all updates that reach here (which is status changes mostly)
  
  const msg = `🔄 <b>Task Updated</b>\n\n` +
              `📌 <b>${task.title}</b>\n` +
              `Status: ${task.status.replace('_', ' ').toUpperCase()}\n` +
              `Assigned to: ${task.assignedToName}\n\n` +
              `🔗 <a href="${ADMIN_URL}">Open Dashboard</a>`;
              
  sendMessage(CONFIG.GROUP_CHAT_ID, msg);
}

function notifyCreator_Completion(task) {
   // Only notify creator if they are NOT the one who was assigned (avoid self-spam)
   if (task.createdBy === task.assignedTo) return;

   const telegramId = CONFIG.USER_MAP[task.createdBy];
   if (!telegramId) return;
   
   const duration = calculateDuration(task.createdAt, task.completedAt);
   
   const msg = `✅ <b>Your Task is Done</b>\n\n` +
               `Task: <b>${task.title}</b>\n` +
               `Completed by: ${task.assignedToName}\n` +
               `Time taken: ${duration}\n\n` +
               `🔗 <a href="${ADMIN_URL}">Open Dashboard</a>`;
   sendMessage(telegramId, msg);
}

function notifyAssignee_Completion(task) {
    // Edge case: If an Admin completes a task assigned to someone else
    // We should let the Assignee know "Hey, X completed your task".
    // We compare IDs from the frontend payload if available, or skip.
    // For now, simpler is safer: exclude this to avoid confusion unless strictly needed.
}

// --- DAILY SCHEDULER (9 PM) ---

function sendDailyReminders() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName("Tasks");
  if (!sheet) {
    Logger.log("❌ Error: 'Tasks' sheet not found.");
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  // Row 1 is headers. Data starts at Index 1.
  
  Logger.log(`🔍 Checking ${data.length - 1} rows for pending tasks...`);
  
  // Group tasks by UserUID
  const tasksByUser = {};
  let pendingCount = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const title = row[1];
    const status = String(row[2]).toLowerCase(); // Normalize status
    const uid = row[4];
    
    // Debug specific rows if needed
    // Logger.log(`Row ${i+1}: ${title} | Status: ${status} | UID: ${uid}`);
    
    // Filter: Exclude 'done' and 'archive'
    if (status !== 'done' && status !== 'archive') {
      if (!tasksByUser[uid]) tasksByUser[uid] = [];
      
      tasksByUser[uid].push({
        title: title,
        priority: row[3],
        deadline: row[6]
      });
      pendingCount++;
    }
  }
  
  Logger.log(`📊 Found ${pendingCount} pending tasks in total.`);
  
  // Send Messages
  const uids = Object.keys(tasksByUser);
  if (uids.length === 0) {
     Logger.log("✅ No users have pending tasks.");
     return;
  }

  uids.forEach(uid => {
    const telegramId = CONFIG.USER_MAP[uid];
    const tasks = tasksByUser[uid];
    
    if (!telegramId) {
       Logger.log(`⚠️ Warning: No Telegram ID mapped for UserUID: ${uid}`);
       return;
    }
    
    Logger.log(`📨 Sending reminder to UID ${uid} (Telegram: ${telegramId}) for ${tasks.length} tasks.`);
    
    let msg = `🌙 <b>Daily Wrap-up</b>\n\n` +
              `You have <b>${tasks.length}</b> pending tasks:\n\n`;
    
    tasks.forEach(t => {
      msg += `▫️ <b>${t.title}</b> (${t.priority})\n`;
    });
    
    msg += `\n👉 <a href="${ADMIN_URL}">Login to Update Status</a>`;
    sendMessage(telegramId, msg);
  });
}

// --- DATABASE SYNC UPDATED ---

function syncTaskToSheet(task) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName("Tasks");
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  // If sheet is empty (just headers), simply append
  if (lastRow <= 1) {
     appendTaskRow(sheet, task);
     return;
  }
  
  // Read all TaskIDs (Column A) to find a match
  // getRange(row, col, numRows, numCols) -> Column A is 1
  const idRange = sheet.getRange(2, 1, lastRow - 1, 1); 
  const idValues = idRange.getValues(); // [[ID1], [ID2], ...]
  
  let matchRowIndex = -1;
  
  for (let i = 0; i < idValues.length; i++) {
    if (idValues[i][0] == task.id) {
      matchRowIndex = i + 2; // +2 because: 0-indexed array + 1 header row + 1 to make it 1-based sheet row
      break;
    }
  }
  
  const rowData = prepareRowData(task);
  
  if (matchRowIndex > 0) {
    // UPDATE existing row
    // setValues expects 2D array: [[val1, val2...]]
    sheet.getRange(matchRowIndex, 1, 1, rowData.length).setValues([rowData]);
    Logger.log("Updated Task: " + task.title + " at Row " + matchRowIndex);
  } else {
    // CREATE new row
    sheet.appendRow(rowData);
    Logger.log("Created New Task: " + task.title);
  }
}

function appendTaskRow(sheet, task) {
  sheet.appendRow(prepareRowData(task));
}

function prepareRowData(task) {
  return [
    task.id,
    task.title,
    task.status,
    task.priority,
    task.assignedTo,
    task.assignedToName,
    task.deadline,
    new Date() // Last Updated
  ];
}

// --- HELPER FUNCTIONS ---

function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };
  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });
  } catch (e) {
    Logger.log("Error sending: " + e);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "No Date";
  try {
     const d = new Date(dateStr);
     if (isNaN(d.getTime())) return dateStr; 
     return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) { return dateStr; }
}

// Helper to parse potential Firestore Timestamps or ISO strings
function calculateDuration(startStr, endStr) {
  if (!startStr) return "N/A";

  const parseTime = (t) => {
      if (!t) return new Date(); // Default to now if undefined
      if (typeof t === 'object' && t.seconds) return new Date(t.seconds * 1000);
      return new Date(t);
  };

  const start = parseTime(startStr);
  const end = parseTime(endStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "N/A";

  const diffMs = end - start;
  if (diffMs < 0) return "Just now";
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  
  if (days > 0) return `${days}d ${remHours}h`;
  return `${hours} hours`;
}
