# 🔧 Local Development Setup

Since the Apps Script URL is now stored in **Netlify environment variables**, you need to provide it locally for development.

## Quick Setup (30 seconds)

1. Create a `.env` file in the project root:
   ```bash
   APPSCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

2. Your local copy of `_secrets.txt` has the real URL - copy it from there!

3. Run `npm start` as usual - Eleventy will read `.env` automatically

## How It Works

- **Production (Netlify)**: Reads `APPSCRIPT_URL` from Netlify environment variables
- **Local Dev**: Reads `APPSCRIPT_URL` from `.env` file (gitignored)
- **Build Time**: Eleventy generates `src/assets/js/config.js` with the URL

## Benefits

✅ **No manual config.js copying**
✅ **URL stored securely in Netlify**
✅ **Can't accidentally commit the real URL**
✅ **Team members just need to set their own `.env`**
