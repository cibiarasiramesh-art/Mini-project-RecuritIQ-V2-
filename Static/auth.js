/**
 * RecruitIQ v2 — auth.js
 * Shared utilities for login.html and register.html
 */

/* ── Theme ─────────────────────────────────────── */
(function() {
  const saved = localStorage.getItem('riq-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('riq-theme', next);
  });
}

/* ── Password eye toggle ───────────────────────── */
const pwToggle = document.getElementById('pwToggle');
const pwInput  = document.getElementById('password');

if (pwToggle && pwInput) {
  pwToggle.addEventListener('click', () => {
    const isText = pwInput.type === 'text';
    pwInput.type = isText ? 'password' : 'text';
    const showEl = pwToggle.querySelector('.eye-show');
    const hideEl = pwToggle.querySelector('.eye-hide');
    if (showEl) showEl.style.display = isText ? '' : 'none';
    if (hideEl) hideEl.style.display = isText ? 'none' : '';
  });
}

/* ── Alert helpers ─────────────────────────────── */
function showAlert(msg) {
  const box = document.getElementById('authAlert');
  const txt = document.getElementById('alertMsg');
  if (box && txt) {
    txt.textContent = msg;
    box.style.display = 'flex';
  }
}

function clearAlert() {
  const box = document.getElementById('authAlert');
  if (box) box.style.display = 'none';
}

/* ── Loading state helper ──────────────────────── */
function setBusy(btn, on) {
  if (!btn) return;
  btn.disabled = on;
  const txt = btn.querySelector('.submit-text');
  const ld  = btn.querySelector('.submit-loading');
  if (txt) txt.style.display = on ? 'none' : 'flex';
  if (ld)  ld.style.display  = on ? 'flex' : 'none';
}
