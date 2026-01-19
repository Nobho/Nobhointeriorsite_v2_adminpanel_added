# 🔐 Setting up Google Sign-In

Google Sign-In is now your **primary login method**. It's more secure and easier for your team!

## Step 1: Enable Google Provider in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **"nobho-interior-design-website"**
3. Click **Authentication** in the left menu
4. Go to **Sign-in method** tab
5. Click **Add new provider**
6. Select **Google**
7. Toggle **Enable**
8. **Support email**: Use your email (e.g., `azwadriyan@gmail.com`)
9. Click **Save**

## Step 2: Authorize Your Domain

Since you're deploying to **Netlify**, you need to authorize your domain:

1. Still in **Authentication** → **Settings** → **Authorized domains**
2. Click **Add domain**
3. Add your Netlify domain: `your-site-name.netlify.app`
4. Add `localhost` (for local testing)
5. Click **Add**

## Step 3: Test It!

1. Visit your local or deployed site: `nobho.com/cuteadmin`
2. Click **"Sign in with Google"**
3. Select one of the team members' Google accounts
4. You should be logged in instantly!

---

## ✅ What You Get

- **More Secure**: No passwords to manage or leak
- **2FA Included**: If team members have Google 2FA, it applies automatically
- **One-Click Login**: No typing required
- **100% Free**: No Firebase costs

## Team Members Who Can Log In

**🔒 SECURITY: Only Whitelisted Emails**

The system has **dual-layer protection**:

1. **Firestore Check**: When someone signs in with Google, the system checks if their UID exists in the `users` collection
2. **Email Whitelist**: The code only allows these 4 emails (defined in `users.js`):
   - ✅ azwadriyan@gmail.com
   - ✅ nusaiba.mamun20@gmail.com  
   - ✅ abdullahmubasshir25@gmail.com
   - ✅ shariarhassan2002@gmail.com

**What happens if someone else tries?**
- They can click "Sign in with Google"
- Google will authenticate them
- But the app immediately **signs them out** and shows: **"Access denied. Contact admin to be added to the team."**
- Their login attempt is **logged** in your Activity Log

**To add a new team member:**
1. Add their email to `TEAM_MAPPING` in `src/assets/js/cuteadmin/users.js`
2. Redeploy your site
3. Have them sign in with Google (account will be auto-created)

---

**Note**: Email/Password login still works as a backup method!

