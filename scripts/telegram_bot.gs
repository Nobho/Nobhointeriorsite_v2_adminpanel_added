// Google Apps Script code for CuteAdmin Telegram Bot
// ==========================================
// 1. Go to https://script.google.com/
// 2. Create New Project -> Paste this code.
// 3. Run 'setup' function once.
// 4. Deploy as Web App (for receiving webhooks)
// 5. To schedule daily messages: Clock Icon (Triggers) -> Add Trigger -> sendDailyBriefing -> Time-driven -> Day timer.
// ==========================================

var BOT_TOKEN = "8383594429:AAHVKXmA7gQorAmGts3oaCrlKXI9sl_ryMY"; 

// CHANNELS
var GROUP_CHAT_ID = "-1003002056685"; // The Nobho Group

// INDIVIDUAL ADMINS (For Daily Briefings)
var ADMIN_IDS = [
  "1367897356", // Shariar
  "5243994015", // Abdullah
  "1617312734", // Nusaiba
  "1276130679"  // Azwad
];

// --- CORE FUNCTIONS ---

function sendMessage(chatId, text) {
  var url = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage";
  var payload = {
    'chat_id': chatId,
    'text': text,
    'parse_mode': 'HTML'
  };
  var options = { 'method': 'post', 'payload': payload, 'muteHttpExceptions': true };
  try {
    UrlFetchApp.fetch(url, options);
  } catch(e) {
    Logger.log("Failed to send to " + chatId + ": " + e);
  }
}

function broadcastToAdmins(text) {
  ADMIN_IDS.forEach(function(id) {
    sendMessage(id, text);
  });
}

// --- DAILY TRIGGER ---

function sendDailyBriefing() {
  // 1. Message for the Group
  sendMessage(GROUP_CHAT_ID, "🌅 <b>Good Morning Team Nobho!</b>\n\nDon't forget to check your tasks in <a href='https://www.nobhho.com/cuteadmin'>CuteAdmin</a> today.");

  // 2. Personal Message for Admins
  broadcastToAdmins("👋 <b>Daily Reminder:</b>\nPlease review pending approvals and check the audit logs for any unusual activity.\n\n<a href='https://www.nobhho.com/cuteadmin'>Open Dashboard</a>");
}

// --- WEBHOOK HANDLER (For Real-time alerts from App) ---

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Type: 'task_update' - Sent when a task changes status
    if (data.type === 'task_update') {
      var msg = "📝 <b>Task Update</b>\n" + 
                "Task: " + data.taskName + "\n" +
                "Action: " + data.action + "\n" +
                "By: " + data.user;
      
      sendMessage(GROUP_CHAT_ID, msg);
    }
    
    return ContentService.createTextOutput(JSON.stringify({'status': 'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({'status': 'error', 'message': error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function setup() {
  Logger.log("Configuration Loaded.");
  sendMessage(GROUP_CHAT_ID, "🤖 <b>Nobho HR Bot connected.</b> System is online.");
}
