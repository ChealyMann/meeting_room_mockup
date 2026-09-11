// Toast Notification Layout Component - Disabled per user request
window.NBC = window.NBC || {};
window.NBC.layouts = window.NBC.layouts || {};
window.NBC.layouts.toast = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('toast-container');
    if (container) {
      container.remove();
    }
  },

  _onToast() {
    // Disabled
  },

  showToast() {
    // Disabled: toasts removed
  },

  show() {
    // Disabled: toasts removed
  }
};

// Immediate cleanup on load
(function() {
  const container = document.getElementById('toast-container');
  if (container) container.remove();
  document.querySelectorAll('[id^="toast-"]').forEach(el => el.remove());
})();
