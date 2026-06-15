// Local-only admin preview helper
// Place this file at web/public/local/admin-preview.js on your machine.
// Keep it out of source control (it's added to .gitignore by the helper script).

(function () {
  if (typeof window === 'undefined') return;

  var KEY = 'preview_view';

  function setPreview(view) {
    try {
      localStorage.setItem(KEY, view);
      window.location.reload();
    } catch (e) {
      console.warn('admin-preview: failed to set preview', e);
    }
  }

  function clearPreview() {
    try {
      localStorage.removeItem(KEY);
      window.location.reload();
    } catch (e) {
      console.warn('admin-preview: failed to clear preview', e);
    }
  }

  function getPreview() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  // Expose a simple API on window. Header will detect this object.
  window.__imperium_admin_preview = {
    setPreview: setPreview,
    clearPreview: clearPreview,
    getPreview: getPreview,
    shouldShowEye: true,
  };
})();
