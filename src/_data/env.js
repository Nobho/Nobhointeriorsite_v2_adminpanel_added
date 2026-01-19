// This file reads Netlify environment variables at BUILD time
// and makes them available to Eleventy templates

module.exports = {
    // Apps Script URL (set in Netlify: APPSCRIPT_URL)
    appscriptUrl: process.env.APPSCRIPT_URL || 'https://script.google.com/macros/s/YOUR_ID/exec',

    // Environment name
    environment: process.env.CONTEXT || 'development'
};
