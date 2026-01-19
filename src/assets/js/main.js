/**
 * ========================================================================
 * Main Application Logic
 * ========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Mobile Navigation
  const mobileNav = new MobileNav('.site-header', '.mobile-nav-toggle');
  mobileNav.init();

  // 2. Form Validation
  const inquiryForm = new FormValidator('#project-inquiry-form');
  inquiryForm.init();

  // 3. Pricing Tabs (Fiverr-Style)
  const pricingTabs = new PricingTabs();
  pricingTabs.init();

  // 4. Currency Switcher
  const currencySwitcher = new CurrencySwitcher();
  currencySwitcher.init();

});

/**
 * Class: MobileNav
 */
class MobileNav {
  constructor(headerSelector, toggleSelector) {
    this.header = document.querySelector(headerSelector);
    this.toggleButton = document.querySelector(toggleSelector);
    this.navMenu = document.querySelector('.site-header__nav');
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  init() {
    if (!this.header || !this.toggleButton || !this.navMenu) return;
    this.toggleButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleNav();
    });
  }

  toggleNav() {
    const isExpanded = this.toggleButton.getAttribute('aria-expanded') === 'true';
    isExpanded ? this.closeNav() : this.openNav();
  }

  openNav() {
    this.toggleButton.setAttribute('aria-expanded', 'true');
    this.header.classList.add('nav-open');
    document.addEventListener('click', this.handleOutsideClick);
  }

  closeNav() {
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.header.classList.remove('nav-open');
    document.removeEventListener('click', this.handleOutsideClick);
  }

  handleOutsideClick(event) {
    if (!this.navMenu.contains(event.target) && !this.toggleButton.contains(event.target)) {
      this.closeNav();
    }
  }
}

/**
 * Class: FormValidator
 */
class FormValidator {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
  }

  init() {
    if (!this.form) return;
    this.form.setAttribute('novalidate', true);
    this.form.addEventListener('submit', (event) => {
      if (!this.validateForm()) {
        event.preventDefault();
        alert('Please fill out all required fields correctly.');
      }
    });
  }

  validateForm() {
    let isValid = true;
    const fieldsToValidate = this.form.querySelectorAll('[required]');
    fieldsToValidate.forEach(field => {
      field.classList.remove('is-invalid');
      if (!this.validateField(field)) {
        isValid = false;
        field.classList.add('is-invalid');
      }
    });
    return isValid;
  }

  validateField(field) {
    if (field.value.trim() === '') return false;
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) return false;
    }
    return true;
  }
}

/**
 * Class: PricingTabs
 * Handles switching between Concept/Premium/Luxury panels
 */
class PricingTabs {
  constructor() {
    this.tabs = document.querySelectorAll('.pricing-tab');
    this.panels = document.querySelectorAll('.pricing-panel');
  }

  init() {
    if (!this.tabs.length) return;

    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');
        this.switchTab(tab, targetId);
      });
    });
  }

  switchTab(clickedTab, targetId) {
    // Remove active from all tabs
    this.tabs.forEach(t => t.classList.remove('active'));
    // Add active to clicked
    clickedTab.classList.add('active');

    // Hide all panels
    this.panels.forEach(panel => panel.classList.remove('active'));
    
    // Show target panel
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }
  }
}

/**
 * Class: CurrencySwitcher
 * Handles BDT/USD toggling via Dropdown
 */
class CurrencySwitcher {
  constructor() {
    this.currencySelect = document.getElementById('currency-select');
    this.priceElements = document.querySelectorAll('.currency-value');
    this.currentCurrency = localStorage.getItem('nobho-currency') || 'BDT';
  }

  init() {
    if (!this.currencySelect) return;
    
    this.currencySelect.value = this.currentCurrency;
    this.updatePrices(this.currentCurrency);

    this.currencySelect.addEventListener('change', (e) => {
      const newCurrency = e.target.value;
      this.updatePrices(newCurrency);
      localStorage.setItem('nobho-currency', newCurrency);
    });
  }

  updatePrices(currency) {
    this.priceElements.forEach(el => {
      const value = el.getAttribute(`data-${currency.toLowerCase()}`);
      if (value) {
        el.textContent = value;
        if (currency === 'USD') {
          el.parentElement.classList.add('usd-mode');
        } else {
          el.parentElement.classList.remove('usd-mode');
        }
      }
    });
  }
}