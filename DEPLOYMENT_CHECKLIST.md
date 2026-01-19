# 🚀 Pre-Deployment Checklist

Run this checklist before pushing to GitHub and deploying to Netlify.

## ✅ Security Audit (PASSED)

- [x] **No hardcoded secrets in source code**
  - `final_telegram_bot.gs` uses `PropertiesService` ✓
  - `otp_service.gs` uses `PropertiesService` ✓
  - Frontend uses `config.js` (gitignored) ✓

- [x] **Gitignore configured correctly**
  - `src/assets/js/config.js` (contains real URL) - IGNORED ✓
  - `_secrets.txt` (contains tokens) - IGNORED ✓
  - `node_modules` - IGNORED ✓

- [x] **Safe files to commit**
  - `config.example.js` (template with placeholder) ✓
  - `final_telegram_bot.gs` (uses ScriptProperties) ✓
  - All frontend code (no secrets) ✓

## 📋 Deployment Steps

### 1. Firebase Console Setup (5 min)
- [ ] Enable **Google Sign-In** provider
  - Go to Firebase Console → Authentication → Sign-in method
  - Add Google provider
  - Set support email
- [ ] Add authorized domain
  - Add your Netlify domain: `your-site.netlify.app`

### 2. Google Apps Script Setup (10 min)

**For Telegram Bot**:
- [ ] Deploy `scripts/final_telegram_bot.gs` as Web App
- [ ] Set Script Properties:
  - `BOT_TOKEN` = (from `_secrets.txt`)
  - `GROUP_CHAT_ID` = (from `_secrets.txt`)
  - `SHEET_ID` = (from `_secrets.txt`)
- [ ] Setup daily trigger (9 PM) for `sendDailyReminders`

**For OTP Service** (if you decide to use it later):
- [ ] Deploy `scripts/otp_service.gs` as Web App
- [ ] No properties needed (uses MailApp)

### 3. Netlify Environment Variables (2 min)
- [ ] Go to Netlify Dashboard → Site Settings → Environment Variables
- [ ] Add variable:
  - **Key**: `APPSCRIPT_URL`
  - **Value**: (Your Apps Script Web App URL from step 2)
- [ ] Click "Save"

**How it works**: During build, Eleventy reads this env var and generates `/assets/js/config.js` automatically

### 4. Git & Netlify (5 min)
- [ ] Commit and push to GitHub
  ```bash
  git add .
  git commit -m "feat: Google Sign-In, Telegram integration, Nobho branding"
  git push origin main
  ```
- [ ] Netlify auto-deploys (or trigger manual build)
- [ ] Visit `your-site.netlify.app/cuteadmin`

### 5. Test Login (2 min)
- [ ] Try "Sign in with Google"
- [ ] Verify one of the 4 team emails works
- [ ] Verify unauthorized email gets rejected
- [ ] Check Activity Log shows login

### 6. Test Telegram (2 min)
- [ ] Create a test task
- [ ] Verify group gets notified
- [ ] Mark task complete
- [ ] Verify completion message

## 🔐 What's Protected

**Ignored (NOT in Git):**
- Real Apps Script URL (`config.js`)
- Bot Token, Chat IDs, Sheet ID (`_secrets.txt`)
- Build output (`_site/`)

**Committed (SAFE in Git):**
- Template config (`config.example.js`)
- Apps Script code (uses PropertiesService)
- All frontend JS/CSS/HTML

## 🎯 Post-Deployment

After successful deployment:
1. Delete `_secrets.txt` from your local machine (or keep it backed up securely offline)
2. Script Properties in Google Apps Script are the ONLY source of truth for tokens
3. To update tokens: Apps Script → Settings → Script Properties

---

**Ready to deploy!** 🚀
