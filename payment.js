// /* app.js
//    Handles:
//    - formatting & validation (Luhn)
//    - card type detection
//    - live preview updates
//    - flip on CVV focus
//    - form submission simulation
// */

// // Card brand detection rules
// const CARD_BRANDS = [
//   { name: 'visa', pattern: /^4/, cvv: 3, gaps: [4,4,4,4,3], display: 'Visa' },
//   { name: 'mastercard', pattern: /^(5[1-5]|2[2-7])/, cvv: 3, gaps: [4,4,4,4], display: 'MasterCard' },
//   { name: 'amex', pattern: /^3[47]/, cvv: 4, gaps: [4,6,5], display: 'American Express' },
//   { name: 'discover', pattern: /^(6011|65|64[4-9]|622)/, cvv: 3, gaps: [4,4,4,4], display: 'Discover' },
// ];

// const el = id => document.getElementById(id);

// // Elements
// const cardNumberInput = el('card-number');
// const expiryInput = el('expiry');
// const cvvInput = el('cvv');
// const holderInput = el('holder-name');

// const cardNumberPreview = el('card-number-preview');
// const cardHolderPreview = el('card-holder-preview');
// const cardExpiryPreview = el('card-expiry-preview');
// const cardCvvPreview = el('card-cvv-preview');
// const cardBrandEl = el('card-brand');
// const brandIcon = el('brand-icon');
// const cardBackBrand = el('card-brand-back');

// const creditCard = el('credit-card');
// const form = el('card-form');
// const submitBtn = el('submit-btn');
// const cancelBtn = el('cancel-btn');

// const errors = {
//   number: el('card-number-error'),
//   expiry: el('expiry-error'),
//   cvv: el('cvv-error'),
//   name: el('name-error'),
//   result: el('submit-result'),
// };

// // Utilities
// function stripNonDigits(s) { return (s||'').replace(/\D/g,''); }

// // Luhn check
// function luhnCheck(numStr){
//   const digits = numStr.split('').reverse().map(d => parseInt(d,10));
//   let sum = 0;
//   for(let i=0;i<digits.length;i++){
//     let val = digits[i];
//     if(i % 2 === 1){
//       val *= 2;
//       if(val > 9) val -= 9;
//     }
//     sum += val;
//   }
//   return sum % 10 === 0;
// }

// // Detect brand
// function detectBrand(num){
//   const n = stripNonDigits(num);
//   for(const b of CARD_BRANDS){
//     if(b.pattern.test(n)) return b;
//   }
//   return null;
// }

// // Format according to gaps or default to groups of 4
// function formatCardNumber(value, brand){
//   const digits = stripNonDigits(value);
//   const gaps = brand?.gaps || [4,4,4,4,3];
//   let parts = [];
//   let i=0;
//   for(const gap of gaps){
//     if(i >= digits.length) break;
//     parts.push(digits.substr(i, gap));
//     i += gap;
//   }
//   if(i < digits.length) parts.push(digits.substr(i));
//   return parts.join(' ');
// }

// // Preview masking for display (show last 4)
// function maskedNumberDisplay(value){
//   const digits = stripNonDigits(value);
//   if(!digits) return '•••• •••• •••• ••••';
//   const brand = detectBrand(digits);
//   // For Amex show format with 15 digits differently
//   let formatted = formatCardNumber(digits, brand);
//   // mask all but last 4
//   const groups = formatted.split(' ');
//   let resultGroups = groups.map((g, idx) => {
//     if(groups.join('').length - (idx === groups.length-1 ? (g.length-0) : 0) <= 4) {
//       // last part keep digits visible
//       return g.replace(/\d/g, '•');
//     }
//     if(idx === groups.length-1) {
//       // ensure last group keeps last 4 visible
//       return g.replace(/\d(?=\d{0,4}$)/g,'•');
//     }
//     return g.replace(/\d/g, '•');
//   });
//   // Better approach: show last 4 digits at end
//   const last4 = digits.slice(-4);
//   // Build display with bullets and last4
//   const bulletGroups = formatted.split(' ').map(_ => '••••');
//   const display = formatted.replace(/\d/g, '•');
//   // Replace end with last4
//   // Simpler: show bullet groups except last 4
//   const masked = formatted.replace(/\d(?=\d{4})/g,'•');
//   // If short, just keep formatted
//   return masked || formatted;
// }

// // Validate expiry (MM/YY) and not in past
// function validateExpiry(value){
//   const m = value.match(/^\s*(\d{1,2})\s*\/\s*(\d{2})\s*$/);
//   if(!m) return { ok:false, message:'Use MM/YY format' };
//   let month = parseInt(m[1],10);
//   let year = parseInt(m[2],10);
//   if(month < 1 || month > 12) return { ok:false, message:'Invalid month' };
//   // interpret year as 20YY
//   const now = new Date();
//   const fullYear = 2000 + year;
//   const expDate = new Date(fullYear, month - 1, 1);
//   // move to end of month
//   expDate.setMonth(expDate.getMonth() + 1);
//   expDate.setDate(0);
//   if(expDate < new Date()) return { ok:false, message:'Card expired' };
//   return { ok:true, month, year:fullYear };
// }

// // Update brand icon (simple inline SVGs)
// function brandSVG(name){
//   if(!name) return '';
//   const svgs = {
//     visa:<svg viewBox="0 0 48 14" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="14" rx="2" fill="white"/><text x="6" y="10" font-size="8" fill="#1a1f71" font-family="Arial, sans-serif">VISA</text></svg>,
//     mastercard:<svg viewBox="0 0 48 14" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="7" r="6" fill="#ff5f00"/><circle cx="30" cy="7" r="6" fill="#eb001b"/><text x="2" y="13" font-size="6" fill="#fff" font-family="Arial, sans-serif">MC</text></svg>,
//     amex:<svg viewBox="0 0 48 14" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="14" rx="2" fill="#2e77bb"/><text x="6" y="10" font-size="7" fill="#fff" font-family="Arial, sans-serif">AMEX</text></svg>,
//     discover:<svg viewBox="0 0 48 14" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="14" rx="2" fill="#ffb03b"/><text x="6" y="10" font-size="6" fill="#000" font-family="Arial, sans-serif">DISC</text></svg>
//   };
//   return svgs[name] || '';
// }

// // Input handlers
// function onCardNumberInput(e){
//   const raw = e.target.value;
//   const brand = detectBrand(raw);
//   const formatted = formatCardNumber(raw, brand);
//   // update input value while maintaining caret roughly (simple)
//   e.target.value = formatted;
//   // update preview masked number and brand icon
//   cardNumberPreview.textContent = formatted || '•••• •••• •••• ••••';
//   brandIcon.innerHTML = brand ? brandSVG(brand.name) : '';
//   cardBrandEl.innerHTML = brand ? brandSVG(brand.name) : '';
//   cardBackBrand.innerHTML = brand ? brandSVG(brand.name) : '';
//   // set maxlength based on possible length: common cards 16, Amex 15
//   if(brand && brand.name === 'amex'){
//     cvvInput.maxLength = 4;
//   } else {
//     cvvInput.maxLength = 3;
//   }
//   // validate partial: if digits length >= 12 check Luhn
//   const digits = stripNonDigits(formatted);
//   if(digits.length >= 12){
//     if(!luhnCheck(digits)){
//       errors.number.textContent = 'Card number failed validation (not passing Luhn).';
//     } else {
//       errors.number.textContent = '';
//     }
//   } else {
//     errors.number.textContent = '';
//   }
// }

// function onHolderInput(e){
//   const v = e.target.value.trim();
//   cardHolderPreview.textContent = v ? v.toUpperCase() : 'FULL NAME';
//   if(v.length < 2) {
//     errors.name.textContent = 'Please enter the name as printed on the card.';
//   } else {
//     errors.name.textContent = '';
//   }
// }

// function onExpiryInput(e){
//   // auto-insert slash
//   let v = e.target.value.replace(/\s/g,'').replace(/[^\d\/]/g,'');
//   if(v.length === 2 && !v.includes('/')) v = v + '/';
//   e.target.value = v.slice(0,5);
//   cardExpiryPreview.textContent = e.target.value || 'MM/YY';
//   // validation
//   const vstrip = e.target.value;
//   const check = validateExpiry(vstrip);
//   if(!check.ok && vstrip.length >= 4){
//     errors.expiry.textContent = check.message;
//   } else {
//     errors.expiry.textContent = '';
//   }
// }

// function onCvvInput(e){
//   const v = stripNonDigits(e.target.value).slice(0,4);
//   e.target.value = v;
//   cardCvvPreview.textContent = v ? v.replace(/\d/g,'•') : '•••';
//   if(v.length < 3){
//     errors.cvv.textContent = 'CVV must be 3 or 4 digits depending on the card.';
//   } else {
//     errors.cvv.textContent = '';
//   }
// }

// // Flip for CVV focus
// cvvInput.addEventListener('focus', () => creditCard.classList.add('flipped'));
// cvvInput.addEventListener('blur', () => creditCard.classList.remove('flipped'));

// // Also flip when hovering back area (optional)
// const cardWrap = document.querySelector('.card-wrap');
// cardWrap.addEventListener('mouseenter', () => {/no-op/});
// cardWrap.addEventListener('mouseleave', () => {/no-op/});

// // Attach listeners
// cardNumberInput.addEventListener('input', onCardNumberInput);
// holderInput.addEventListener('input', onHolderInput);
// expiryInput.addEventListener('input', onExpiryInput);
// cvvInput.addEventListener('input', onCvvInput);

// // form submit validation
// form.addEventListener('submit', (ev) => {
//   ev.preventDefault();
//   // Clear previous result
//   errors.result.textContent = '';
//   // Gather values
//   const cardNum = stripNonDigits(cardNumberInput.value);
//   const brand = detectBrand(cardNum);
//   const exp = expiryInput.value.trim();
//   const cvv = stripNonDigits(cvvInput.value);
//   const name = holderInput.value.trim();

//   // Basic validation
//   let ok = true;
//   // number length & luhn
//   if(cardNum.length < 13 || cardNum.length > 19 || !luhnCheck(cardNum)){
//     errors.number.textContent = 'Enter a valid card number (Luhn check failed).';
//     ok = false;
//   } else {
//     errors.number.textContent = '';
//   }
//   // expiry
//   const expCheck = validateExpiry(exp);
//   if(!expCheck.ok){
//     errors.expiry.textContent = expCheck.message;
//     ok = false;
//   } else {
//     errors.expiry.textContent = '';
//   }
//   // cvv
//   const expectedCvvLen = brand ? brand.cvv : 3;
//   if(cvv.length !== expectedCvvLen){
//     errors.cvv.textContent = CVV should be ${expectedCvvLen} digits for ${brand ? brand.display : 'this card'}.;
//     ok = false;
//   } else {
//     errors.cvv.textContent = '';
//   }
//   // name
//   if(name.length < 2){
//     errors.name.textContent = 'Enter the card holder name.';
//     ok = false;
//   } else {
//     errors.name.textContent = '';
//   }

//   if(!ok){
//     errors.result.textContent = 'Please fix errors above and try again.';
//     errors.result.style.color = 'var(--danger)';
//     return;
//   }

//   // Simulated processing animation & success
//   submitBtn.disabled = true;
//   submitBtn.textContent = 'Adding…';
//   errors.result.style.color = 'var(--muted)';
//   errors.result.textContent = 'Processing card securely…';

//   // Simulate a short processing delay (no external connections)
//   setTimeout(() => {
//     submitBtn.disabled = false;
//     submitBtn.textContent = 'Add card';
//     errors.result.style.color = 'green';
//     errors.result.textContent = Card added — ${brand ? brand.display : 'Card'} ending in ${cardNum.slice(-4)}.;
//     // Optional: clear form or keep it
//     // form.reset(); update previews:
//     cardNumberPreview.textContent = '•••• •••• •••• ••••';
//     cardHolderPreview.textContent = 'FULL NAME';
//     cardExpiryPreview.textContent = 'MM/YY';
//     cardCvvPreview.textContent = '•••';
//     brandIcon.innerHTML = '';
//     cardBrandEl.innerHTML = '';
//     cardBackBrand.innerHTML = '';
//   }, 900);
// });

// // cancel button
// cancelBtn.addEventListener('click', () => {
//   form.reset();
//   errors.number.textContent = '';
//   errors.expiry.textContent = '';
//   errors.cvv.textContent = '';
//   errors.name.textContent = '';
//   errors.result.textContent = 'Cancelled';
//   cardNumberPreview.textContent = '•••• •••• •••• ••••';
//   cardHolderPreview.textContent = 'FULL NAME';
//   cardExpiryPreview.textContent = 'MM/YY';
//   cardCvvPreview.textContent = '•••';
//   brandIcon.innerHTML = '';
//   cardBrandEl.innerHTML = '';
//   cardBackBrand.innerHTML = '';
// });

// // small accessibility: submit on Enter from inputs
// [cardNumberInput, expiryInput, cvvInput, holderInput].forEach(i => {
//   i.addEventListener('keydown', (ev) => {
//     if(ev.key === 'Enter'){
//       ev.preventDefault();
//       submitBtn.click();
//     }
//   });
// });








// Get elements
const form = document.getElementById('card-form');
const cardNumberInput = document.getElementById('card-number');
const cardHolderInput = document.getElementById('card-holder');
const cardExpiryInput = document.getElementById('card-expiry');
const cardCvvInput = document.getElementById('card-cvv');
const errors = {
  number: document.getElementById('error-number'),
  name: document.getElementById('error-name'),
  expiry: document.getElementById('error-expiry'),
  cvv: document.getElementById('error-cvv'),
  result: document.getElementById('submit-result')
};
const submitBtn = document.getElementById('submit-btn');

// Helper: validate expiry (MM/YY)
function isValidExpiry(expiry) {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1]);
  const year = parseInt(match[2]) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiryDate = new Date(year, month);
  return expiryDate > now;
}

// Helper: show error
function showError(field, message) {
  errors[field].textContent = message;
  errors[field].style.color = 'red';
}

// Helper: clear all errors
function clearErrors() {
  Object.values(errors).forEach(el => (el.textContent = ''));
}

// Handle form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors();

  const cardNum = cardNumberInput.value.replace(/\s+/g, '');
  const cardName = cardHolderInput.value.trim();
  const expiry = cardExpiryInput.value.trim();
  const cvv = cardCvvInput.value.trim();

  let isValid = true;

  // Validate card number
  if (!/^\d{16}$/.test(cardNum)) {
    showError('number', 'Card number must be 16 digits');
    isValid = false;
  }

  // Validate name
  if (cardName.length < 3) {
    showError('name', 'Please enter your full name');
    isValid = false;
  }

  // Validate expiry
  if (!isValidExpiry(expiry)) {
    showError('expiry', 'Invalid expiry date (use MM/YY and ensure it’s not expired)');
    isValid = false;
  }

  // Validate CVV
  if (!/^\d{3,4}$/.test(cvv)) {
    showError('cvv', 'CVV must be 3 or 4 digits');
    isValid = false;
  }

  // Stop here if invalid
  if (!isValid) {
    errors.result.style.color = 'red';
    errors.result.textContent = 'Please fix the errors above before continuing.';
    return;
  }

  // If all is valid → simulate success and redirect
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add card';
    errors.result.style.color = 'green';
    errors.result.textContent = 'Card added successfully — ${cardNum.slice(-4)}. Redirecting...';

    // Optional: fade effect
    document.body.style.transition = 'opacity 0.6s ease';
    document.body.style.opacity = '0.4';

    // Redirect to confirmation page
    setTimeout(() => {
      window.location.href = 'confirm.html';
    }, 1000);
  }, 900);})
