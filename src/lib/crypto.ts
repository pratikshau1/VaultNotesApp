import CryptoJS from 'crypto-js';

/**
 * Derives a 256-bit key from a password and salt using PBKDF2.
 * @param password - User's password
 * @param salt - Random salt
 * @returns Derived key as a WordArray
 */
export const deriveKey = (password: string, salt: string) => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000, // High iteration count for security
  });
};

/**
 * Generates a random salt.
 */
export const generateSalt = () => {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
};

/**
 * Encrypts data using AES-256 with a random IV.
 * @param data - The plaintext string or object (will be JSON stringified)
 * @param key - The derived key (WordArray)
 * @returns JSON string containing { iv, ciphertext }
 */
export const encryptData = (data: any, key: any) => {
  try {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Generate a random 16-byte IV
    const iv = CryptoJS.lib.WordArray.random(16);
    
    const encrypted = CryptoJS.AES.encrypt(stringData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Return a JSON string containing both IV and Ciphertext
    return JSON.stringify({
      iv: CryptoJS.enc.Hex.stringify(iv),
      ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64)
    });
  } catch (e) {
    console.error("Encryption failed", e);
    throw e;
  }
};

/**
 * Decrypts data using AES-256.
 * @param encryptedWrapper - The JSON string containing { iv, ciphertext }
 * @param key - The derived key (WordArray)
 * @returns Decrypted data (parsed JSON if possible, else string)
 */
export const decryptData = (encryptedWrapper: string, key: any) => {
  try {
    let iv: any;
    let ciphertext: string;

    try {
      const parsed = JSON.parse(encryptedWrapper);
      // Check if it matches our expected format
      if (parsed.iv && parsed.ciphertext) {
        iv = CryptoJS.enc.Hex.parse(parsed.iv);
        ciphertext = parsed.ciphertext;
      } else {
        // Handle legacy/malformed data gracefully
        return null;
      }
    } catch (e) {
      console.error("Failed to parse encrypted wrapper", e);
      return null;
    }

    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) return null;

    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};
