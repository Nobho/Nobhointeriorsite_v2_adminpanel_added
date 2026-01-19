# 🤖 Setting up Your Telegram Bot & Scheduler

Since you wanted a scheduled system (daily reminders) and instant notifications, we are using **Google Apps Script** + **Google Sheets** as the backend.

### Step 1: Create the Database (Google Sheet)
1.  Go to [Google Sheets](https://sheets.new) and create a new sheet.
2.  Name it **"QuestAdmin Database"**.
3.  Rename the bottom tab from "Sheet1" to **"Tasks"**.
4.  Copy the **Sheet ID** from the URL:
    *   URL: `https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqrStuVsWyYz/edit`
    *   ID: `1aBcDeFgHiJkLmNoPqrStuVsWyYz`
5.  (Optional but recommended) Add header row: `TaskID`, `Title`, `Status`, `Priority`, `AssignedToUID`, `AssignedToName`, `Deadline`, `LastUpdated`.

### Step 2: Deploy the Script
1.  Go to [Google Apps Script](https://script.google.com/home/start).
2.  Click **New Project**.
3.  Name it **"QuestAdmin Bot"**.
4.  Delete any code in `Code.gs`.
5.  Open `scripts/final_telegram_bot.gs` from your project folder and copy **ALL** the code.
6.  Paste it into the Google Apps Script editor.

### Step 3: Configure the Script (Secure Method)
Since the code no longer contains your tokens, you must set them in the Project Settings.

1.  In Apps Script, click the **Settings (Gear Icon)** on the left.
2.  Scroll down to **Script Properties**.
3.  Click **Add script property** for each of these:
    *   **Property**: `BOT_TOKEN` -> **Value**: (Your Bot Token)
    *   **Property**: `GROUP_CHAT_ID` -> **Value**: (Your Group Chat ID)
    *   **Property**: `SHEET_ID` -> **Value**: (Your Sheet ID)
4.  Click **Save**.

### Step 4: Publish as Web App
1.  Click **Deploy** (blue button) -> **New deployment**.
2.  Select **type**: "Web app".
3.  **Description**: "v1".
4.  **Execute as**: "Me" (your email).
5.  **Who has access**: **"Anyone"** (This is important so your dashboard can talk to it).
6.  Click **Deploy**.
7.  Copy the **Web App URL** provided (it ends in `/exec`).

### Step 5: Connect Dashboard
1.  Rename `src/assets/js/config.example.js` to `config.js` (if not done).
2.  Paste your **Web App URL** into the `config.js` file.
    *   *Note: `config.js` is ignored by Git, so your URL stays private.*

### Step 6: Activate Daily Reminders
1.  Back in Google Apps Script, click the **Clock Icon (Triggers)** on the left sidebar.
2.  Click **+ Add Trigger**.
3.  Choose function: `sendDailyReminders`.
4.  Event source: **Time-driven**.
5.  Type: **Day timer**.
6.  Time: **9pm to 10pm**.
7.  Click **Save**.

---
**Done!** 🚀
- New tasks will instantly notify the group + user.
- Tasks will be saved to your Sheet.
- Every night at 9 PM, users get a DM if they have pending work.
