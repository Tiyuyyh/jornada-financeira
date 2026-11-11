/**
 * crypto.js
 * Utilitários de identidade e segurança.
 *
 * ID público  — gerado pelo app, identifica o usuário sem expor nada
 * Chave privada — criada pelo usuário, nunca sai do dispositivo
 * Hash de senha — bcrypt-like via PBKDF2 (nativo no browser)
 */

const Crypto = (() => {

  /** Gera um ID público legível: 4 blocos de 4 chars (ex: A3F2-9KX1-BZ74-M2QP) */
  function generatePublicId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0,O,1,I pra não confundir
    const block = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return [block(), block(), block(), block()].join('-');
  }

  /**
   * Faz hash de uma senha usando PBKDF2 (SHA-256, 100k iterações).
   * Retorna string "salt:hash" em hex.
   */
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const salt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBytes, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial,
      256
    );

    const hashHex = Array.from(new Uint8Array(bits))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    return `${salt}:${hashHex}`;
  }

  /**
   * Verifica se uma senha bate com o hash armazenado.
   */
  async function verifyPassword(password, stored) {
    const [saltHex, storedHash] = stored.split(':');
    const saltBytes = new Uint8Array(saltHex.match(/.{2}/g).map(h => parseInt(h, 16)));
    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBytes, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial,
      256
    );

    const hashHex = Array.from(new Uint8Array(bits))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex === storedHash;
  }

  /** Avalia força de senha: 'fraca' | 'media' | 'forte' */
  function passwordStrength(password) {
    if (!password || password.length < 6) return 'fraca';
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNum   = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const score = [hasUpper, hasLower, hasNum, hasSymbol].filter(Boolean).length;
    if (password.length >= 14 && score >= 3) return 'forte';
    if (password.length >= 8  && score >= 2) return 'media';
    return 'fraca';
  }

  return { generatePublicId, hashPassword, verifyPassword, passwordStrength };

})();
