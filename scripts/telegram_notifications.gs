// QuestAdmin Telegram Notification System
// ========================================
// Deploy this as a Google Apps Script Web App
// Then call it from your frontend when creating tasks

// Configuration
const TELEGRAM_BOT_TOKEN = "8433146609:AAFxM2j9nW4skPWqFWkHV0yT2dbqxa3toNk";
const GROUP_CHAT_ID = "-4721085848"; // Your group chat ID

// User Telegram IDs (from your team data)
const USER_TELEGRAM_IDS = {
  "VZe8mdHhVbYQpZ1i32h0CaTPCmW2": "1276130679", // Azwad
  "m8Mg8bQcSjdAH4OvLdM6p8FYA9f1": "1617312734", // Nusaiba
  "3Ab4SgapYHagUHhQFRq4StqeYbx2": "5243994015", // Abdullah
  "xvFe6Fc2DuX6HlfQFm7cLOv3nIg1": "1367897356"  // Shariar
};

/**
 * Handle POST requests from QuestAdmin
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === "task_created") {
      sendTaskNotifications(data.task);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Notifications sent"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Unknown action"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Send task creation notifications
 */
function sendTaskNotifications(task) {
  // 1. Send to group
  sendGroupNotification(task);
  
  // 2. Send DM to each assigned user
  if (task.assignedUsers && task.assignedUsers.length > 0) {
    task.assignedUsers.forEach(user => {
      sendUserDM(user.uid, task);
    });
  }
}

/**
 * Send notification to Telegram group
 */
function sendGroupNotification(task) {
  const assignedNames = task.assignedUsers.map(u => u.name).join(", ");
  const priorityEmoji = {
    "high": "🔴",
    "medium": "🟡",
    "low": "🟢"
  };
  
  const deadline = new Date(task.deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  let message = `📋 *New Task Created*\n\n`;
  message += `*Title:* ${task.title}\n`;
  message += `*Description:* ${task.description}\n\n`;
  message += `👥 *Assigned to:* ${assignedNames}\n`;
  message += `${priorityEmoji[task.priority]} *Priority:* ${task.priority.toUpperCase()}\n`;
  message += `📅 *Deadline:* ${deadline}\n`;
  message += `👤 *Created by:* ${task.createdByName}\n`;
  
  if (task.referenceLinks && task.referenceLinks.length > 0) {
    message += `\n🔗 *Reference Links:*\n`;
    task.referenceLinks.forEach((link, index) => {
      message += `${index + 1}. ${link}\n`;
    });
  }
  
  sendTelegramMessage(GROUP_CHAT_ID, message);
}

/**
 * Send DM to individual user
 */
function sendUserDM(userUid, task) {
  const telegramId = USER_TELEGRAM_IDS[userUid];
  
  if (!telegramId) {
    console.log(`No Telegram ID found for user: ${userUid}`);
    return;
  }
  
  const priorityEmoji = {
    "high": "🔴",
    "medium": "🟡",
    "low": "🟢"
  };
  
  const deadline = new Date(task.deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  let message = `✨ *You have been assigned a new task!*\n\n`;
  message += `📋 *${task.title}*\n`;
  message += `${task.description}\n\n`;
  message += `${priorityEmoji[task.priority]} *Priority:* ${task.priority.toUpperCase()}\n`;
  message += `📅 *Due:* ${deadline}\n`;
  message += `👤 *Assigned by:* ${task.createdByName}\n`;
  
  if (task.assignedUsers.length > 1) {
    const otherAssignees = task.assignedUsers
      .filter(u => u.uid !== userUid)
      .map(u => u.name)
      .join(", ");
    message += `👥 *Also assigned to:* ${otherAssignees}\n`;
  }
  
  if (task.referenceLinks && task.referenceLinks.length > 0) {
    message += `\n🔗 *References:*\n`;
    task.referenceLinks.forEach((link, index) => {
      message += `${index + 1}. ${link}\n`;
    });
  }
  
  message += `\n💼 Login to QuestAdmin to view details and update status.`;
  
  sendTelegramMessage(telegramId, message);
}

/**
 * Send message via Telegram Bot API
 */
function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown"
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (!result.ok) {
      console.error("Telegram API error:", result);
    }
    
    return result;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return null;
  }
}

/**
 * Test function - call this to test notifications
 */
function testNotification() {
  const testTask = {
    title: "Test Task - 3D Rendering",
    description: "This is a test task to verify Telegram notifications are working correctly.",
    priority: "high",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdByName: "System Test",
    assignedUsers: [
      {
        uid: "VZe8mdHhVbYQpZ1i32h0CaTPCmW2",
        name: "MD. Azwad Riyan"
      },
      {
        uid: "m8Mg8bQcSjdAH4OvLdM6p8FYA9f1",
        name: "Nusaiba Binte Mamun"
      }
    ],
    referenceLinks: [
      "https://example.com/reference1",
      "https://example.com/reference2"
    ]
  };
  
  sendTaskNotifications(testTask);
  Logger.log("Test notifications sent!");
}
