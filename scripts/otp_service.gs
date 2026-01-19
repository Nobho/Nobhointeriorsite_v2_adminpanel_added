/**
 * 🔐 CuteAdmin OTP Authentication Service
 * =========================================
 * 
 * Handles email-based One-Time Password (OTP) verification
 * for two-factor authentication on login.
 * 
 * SETUP:
 * 1. Deploy as Web App (Anyone can access)
 * 2. Add Script Property: ALLOWED_DOMAIN = "nobho.com" (optional, for email validation)
 */

// --- CONFIGURATION ---
const scriptProperties = PropertiesService.getScriptProperties();
const ALLOWED_DOMAIN = scriptProperties.getProperty('ALLOWED_DOMAIN') || null; // Optional: restrict to specific domain
const OTP_EXPIRY_MINUTES = 10;

// --- WEBHOOK HANDLER ---
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'send_otp') {
        return handleSendOTP(data.email);
    }
    
    if (action === 'verify_otp') {
        return handleVerifyOTP(data.email, data.code);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
        success: false, 
        error: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    Logger.log('Error: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
        success: false, 
        error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- OTP GENERATION & SENDING ---
function handleSendOTP(email) {
  try {
    // Validate email format
    if (!email || !email.includes('@')) {
      return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid email address'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Optional: Check allowed domain
    if (ALLOWED_DOMAIN && !email.endsWith('@' + ALLOWED_DOMAIN)) {
      return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Email domain not authorized'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in cache (expires in 10 minutes)
    const cache = CacheService.getScriptCache();
    const cacheKey = 'otp_' + email;
    cache.put(cacheKey, code, OTP_EXPIRY_MINUTES * 60);
    
    // Send email
    const subject = '🔐 Your CuteAdmin Login Code';
    const body = `
Hello,

Your verification code for CuteAdmin is:

    ${code}

This code will expire in ${OTP_EXPIRY_MINUTES} minutes.

If you didn't request this code, please ignore this email.

---
CuteAdmin Security System
Nobho Interior Design
    `.trim();
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: body
    });
    
    Logger.log(`OTP sent to ${email}`);
    
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Verification code sent to your email'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    Logger.log('Send OTP Error: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to send verification code'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- OTP VERIFICATION ---
function handleVerifyOTP(email, code) {
  try {
    if (!email || !code) {
      return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Email and code required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Retrieve stored code from cache
    const cache = CacheService.getScriptCache();
    const cacheKey = 'otp_' + email;
    const storedCode = cache.get(cacheKey);
    
    if (!storedCode) {
      return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Code expired or not found. Please request a new code.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Compare codes
    if (storedCode === code.toString().trim()) {
      // Valid! Remove from cache to prevent reuse
      cache.remove(cacheKey);
      
      Logger.log(`OTP verified successfully for ${email}`);
      
      return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Verification successful'
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      Logger.log(`Invalid OTP attempt for ${email}`);
      
      return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid verification code'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (err) {
    Logger.log('Verify OTP Error: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Verification failed'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
