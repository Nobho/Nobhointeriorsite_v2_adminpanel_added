// Company Settings Module - Configurable Company Profile for Invoices
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from './ui.js';

const db = getFirestore();
const SETTINGS_DOC = "settings/company";

// Default company settings
const DEFAULT_SETTINGS = {
    name: "NOBHO",
    tagline: "Interior Design Studio",
    email: "hello@nobho.com",
    phone: "+880 1XXX-XXXXXX",
    address: "Rajshahi, Bangladesh",
    website: "www.nobho.com",
    logoUrl: "/assets/images/logo-placeholder.svg",
    taxId: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankBranch: "",
    defaultTerms: "Payment due within 30 days of invoice date.",
    defaultCurrency: "BDT",
    currencySymbol: "৳"
};

// Cached settings
let cachedSettings = null;

/**
 * Get company settings (with caching)
 * @param {boolean} forceRefresh - Force refresh from Firestore
 * @returns {Promise<Object>}
 */
export async function getCompanySettings(forceRefresh = false) {
    if (cachedSettings && !forceRefresh) {
        return { ...cachedSettings };
    }

    try {
        const docRef = doc(db, SETTINGS_DOC);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            cachedSettings = { ...DEFAULT_SETTINGS, ...docSnap.data() };
        } else {
            // Initialize with defaults
            cachedSettings = { ...DEFAULT_SETTINGS };
            await setDoc(docRef, {
                ...DEFAULT_SETTINGS,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }

        return { ...cachedSettings };
    } catch (error) {
        console.error("Error fetching company settings:", error);
        return { ...DEFAULT_SETTINGS };
    }
}

/**
 * Update company settings (Admin only)
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>}
 */
export async function updateCompanySettings(updates) {
    try {
        if (window.CuteState?.role !== 'admin') {
            showToast("Only admins can update company settings", "error");
            return false;
        }

        const docRef = doc(db, SETTINGS_DOC);
        await setDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        }, { merge: true });

        // Clear cache
        cachedSettings = null;

        showToast("Company settings updated", "success");
        return true;
    } catch (error) {
        console.error("Error updating company settings:", error);
        showToast(`Failed to update settings: ${error.message}`, "error");
        return false;
    }
}

/**
 * Render Company Settings Page (Admin only)
 */
export async function renderCompanySettingsPage() {
    const content = document.getElementById('mainContentArea');
    if (!content) return;

    if (window.CuteState?.role !== 'admin') {
        content.innerHTML = `
            <div class="ims-page">
                <div class="empty-state-ims">
                    <i class="material-icons-round">lock</i>
                    <h3>Access Denied</h3>
                    <p>Only administrators can access company settings.</p>
                </div>
            </div>
        `;
        return;
    }

    const settings = await getCompanySettings(true);

    content.innerHTML = `
        <div class="ims-page settings-page">
            <div class="page-header-ims">
                <div class="header-left">
                    <h2><i class="material-icons-round">business</i> Company Settings</h2>
                    <p class="subtitle">Configure your company profile for invoices</p>
                </div>
            </div>
            
            <form id="companySettingsForm" class="ims-form settings-form">
                <!-- Company Identity -->
                <div class="settings-section">
                    <h3><i class="material-icons-round">badge</i> Company Identity</h3>
                    <div class="form-row">
                        <div class="input-group-ims">
                            <label>Company Name <span class="required">*</span></label>
                            <input type="text" id="companyName" value="${settings.name}" required>
                        </div>
                        <div class="input-group-ims">
                            <label>Tagline</label>
                            <input type="text" id="companyTagline" value="${settings.tagline || ''}" placeholder="e.g. Interior Design Studio">
                        </div>
                    </div>
                    <div class="input-group-ims">
                        <label>Logo URL</label>
                        <div style="display: flex; gap: 1rem; align-items: flex-start;">
                            <div style="flex: 1;">
                                <input type="text" id="companyLogo" value="${settings.logoUrl || ''}" placeholder="/assets/images/logo.svg">
                                <small style="color: #64748b;">Enter the path (e.g. /assets/images/logo.svg) or URL to your logo</small>
                            </div>
                            <div id="logoPreviewContainer" style="width: 100px; height: 100px; border: 1px dashed #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f8fafc; overflow: hidden;">
                                ${settings.logoUrl ? `<img src="${settings.logoUrl}" id="logoPreview" style="max-width: 100%; max-height: 100%; object-fit: contain;">` : '<i class="material-icons-round" style="color: #cbd5e1; font-size: 2rem;">image</i>'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Contact Information -->
                <div class="settings-section">
                    <h3><i class="material-icons-round">contact_phone</i> Contact Information</h3>
                    <div class="form-row">
                        <div class="input-group-ims">
                            <label>Email</label>
                            <input type="email" id="companyEmail" value="${settings.email || ''}" placeholder="hello@company.com">
                        </div>
                        <div class="input-group-ims">
                            <label>Phone</label>
                            <input type="tel" id="companyPhone" value="${settings.phone || ''}" placeholder="+880 1XXX-XXXXXX">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="input-group-ims">
                            <label>Website</label>
                            <input type="text" id="companyWebsite" value="${settings.website || ''}" placeholder="www.company.com">
                        </div>
                        <div class="input-group-ims">
                            <label>Tax ID / VAT Number</label>
                            <input type="text" id="companyTaxId" value="${settings.taxId || ''}" placeholder="Optional">
                        </div>
                    </div>
                    <div class="input-group-ims">
                        <label>Address</label>
                        <textarea id="companyAddress" rows="2" placeholder="Full business address">${settings.address || ''}</textarea>
                    </div>
                </div>
                
                <!-- Bank Details -->
                <div class="settings-section">
                    <h3><i class="material-icons-round">account_balance</i> Bank Details</h3>
                    <div class="form-row">
                        <div class="input-group-ims">
                            <label>Bank Name</label>
                            <input type="text" id="bankName" value="${settings.bankName || ''}" placeholder="e.g. BRAC Bank">
                        </div>
                        <div class="input-group-ims">
                            <label>Account Name</label>
                            <input type="text" id="bankAccountName" value="${settings.bankAccountName || ''}" placeholder="Account holder name">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="input-group-ims">
                            <label>Account Number</label>
                            <input type="text" id="bankAccountNumber" value="${settings.bankAccountNumber || ''}" placeholder="XXXX-XXXX-XXXX">
                        </div>
                        <div class="input-group-ims">
                            <label>Branch</label>
                            <input type="text" id="bankBranch" value="${settings.bankBranch || ''}" placeholder="Branch name">
                        </div>
                    </div>
                </div>
                
                <!-- Invoice Defaults -->
                <div class="settings-section">
                    <h3><i class="material-icons-round">receipt_long</i> Invoice Defaults</h3>
                    <div class="form-row">
                        <div class="input-group-ims">
                            <label>Currency</label>
                            <select id="defaultCurrency">
                                <option value="BDT" ${settings.defaultCurrency === 'BDT' ? 'selected' : ''}>৳ BDT (Taka)</option>
                                <option value="USD" ${settings.defaultCurrency === 'USD' ? 'selected' : ''}>$ USD (Dollar)</option>
                                <option value="EUR" ${settings.defaultCurrency === 'EUR' ? 'selected' : ''}>€ EUR (Euro)</option>
                            </select>
                        </div>
                        <div class="input-group-ims">
                            <label>Currency Symbol</label>
                            <input type="text" id="currencySymbol" value="${settings.currencySymbol || '৳'}" maxlength="3">
                        </div>
                    </div>
                    <div class="input-group-ims">
                        <label>Default Terms & Conditions</label>
                        <textarea id="defaultTerms" rows="3" placeholder="Payment terms, conditions, etc.">${settings.defaultTerms || ''}</textarea>
                    </div>
                </div>
                
                <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--ims-border);">
                    <button type="submit" class="btn-primary-ims">
                        <i class="material-icons-round">save</i> Save Settings
                    </button>
                </div>
            </form>
        </div>
    `;

    // Form submission
    document.getElementById('companySettingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const updates = {
            name: document.getElementById('companyName').value.trim(),
            tagline: document.getElementById('companyTagline').value.trim(),
            logoUrl: document.getElementById('companyLogo').value.trim(),
            email: document.getElementById('companyEmail').value.trim(),
            phone: document.getElementById('companyPhone').value.trim(),
            website: document.getElementById('companyWebsite').value.trim(),
            taxId: document.getElementById('companyTaxId').value.trim(),
            address: document.getElementById('companyAddress').value.trim(),
            bankName: document.getElementById('bankName').value.trim(),
            bankAccountName: document.getElementById('bankAccountName').value.trim(),
            bankAccountNumber: document.getElementById('bankAccountNumber').value.trim(),
            bankBranch: document.getElementById('bankBranch').value.trim(),
            defaultCurrency: document.getElementById('defaultCurrency').value,
            currencySymbol: document.getElementById('currencySymbol').value.trim(),
            defaultTerms: document.getElementById('defaultTerms').value.trim()
        };

        await updateCompanySettings(updates);
    });

    // Logo preview listener
    const logoInput = document.getElementById('companyLogo');
    const previewContainer = document.getElementById('logoPreviewContainer');
    if (logoInput && previewContainer) {
        logoInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val) {
                previewContainer.innerHTML = `<img src="${val}" id="logoPreview" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.parentElement.innerHTML='<i class=\'material-icons-round\' style=\'color: #ef4444; font-size: 2rem;\'>error_outline</i>'">`;
            } else {
                previewContainer.innerHTML = '<i class="material-icons-round" style="color: #cbd5e1; font-size: 2rem;">image</i>';
            }
        });
    }
}
