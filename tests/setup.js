// Jest setup file for browser environment testing
// Polyfills missing browser APIs in jsdom environment

// Polyfill TextEncoder and TextDecoder
const { TextEncoder, TextDecoder } = require('text-encoding');
const crypto = require('crypto');

// Make them available globally
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Flag to detect browser environment testing
global.__BROWSER_TEST__ = true;

// Polyfill crypto.subtle if not available
if (typeof global.crypto !== 'undefined' && !global.crypto.subtle) {
  global.crypto.subtle = {
    digest: async (algorithm, data) => {
      if (algorithm.toLowerCase() === 'sha-256') {
        // Convert Uint8Array to string
        const text = new TextDecoder().decode(data);
        
        // Use Node.js crypto for SHA-256
        const hash = crypto.createHash('sha256').update(text).digest();
        
        // Convert Buffer to Uint8Array
        return new Uint8Array(hash);
      }
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  };
} 