/**
 * storage.js
 * Abstração sobre o localStorage.
 * Todos os dados do app passam por aqui.
 */

const Storage = (() => {

  const PREFIX = 'jf_';

  function key(name) {
    return PREFIX + name;
  }

  function get(name, fallback = null) {
    try {
      const raw = localStorage.getItem(key(name));
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function set(name, value) {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function remove(name) {
    try {
      localStorage.removeItem(key(name));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Apaga TODOS os dados do app (exceto chave de identidade).
   * Mantém apenas jf_identity para que o ID público continue existindo.
   */
  function wipeData() {
    try {
      const identity = get('identity');
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX) && k !== key('identity')) {
          keysToRemove.push(k);
        }
      }

      keysToRemove.forEach(k => localStorage.removeItem(k));

      // Regrava identity zerado — ID existe mas sem dados
      if (identity) {
        set('identity', { id: identity.id, createdAt: identity.createdAt });
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifica se o localStorage está disponível (pode ser bloqueado em private mode).
   */
  function isAvailable() {
    try {
      const test = '__jf_test__';
      localStorage.setItem(test, '1');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  return { get, set, remove, wipeData, isAvailable };

})();
