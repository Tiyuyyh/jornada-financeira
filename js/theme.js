/**
 * theme.js
 * Gerencia o tema visual: escuro, claro ou automático (por horário).
 *
 * Modos:
 *   "dark"  — sempre escuro
 *   "light" — sempre claro
 *   "auto"  — escuro das 19h às 6h, claro o resto
 */

const Theme = (() => {

  const STORAGE_KEY = 'theme';
  const DEFAULT = 'dark';

  function getStored() {
    return Storage.get(STORAGE_KEY, DEFAULT);
  }

  function set(mode) {
    Storage.set(STORAGE_KEY, mode);
    apply(mode);
  }

  function resolveAuto() {
    const hour = new Date().getHours();
    return (hour >= 19 || hour < 6) ? 'dark' : 'light';
  }

  function apply(mode) {
    const resolved = mode === 'auto' ? resolveAuto() : mode;
    document.documentElement.setAttribute('data-theme', resolved);
  }

  function init() {
    const stored = getStored();
    apply(stored);

    // Se auto, reavalia a cada minuto
    if (stored === 'auto') {
      setInterval(() => apply('auto'), 60_000);
    }
  }

  function current() {
    return getStored();
  }

  return { init, set, current };

})();
