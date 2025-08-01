// Universal crypto utilities that work in both Node.js and browser environments

export interface CryptoUtils {
  randomBytes(length: number): Uint8Array;
  createHash(algorithm: string): Hash;
}

export interface Hash {
  update(data: string): Hash;
  digest(encoding: string): string;
}

// Browser-compatible crypto implementation
class BrowserCryptoUtils implements CryptoUtils {
  randomBytes(length: number): Uint8Array {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  createHash(algorithm: string): Hash {
    if (algorithm !== 'sha256') {
      throw new Error(`Unsupported hash algorithm: ${algorithm}`);
    }

    return {
      update(data: string): Hash {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        return crypto.subtle.digest('SHA-256', dataBuffer).then(hashBuffer => {
          const hashArray = new Uint8Array(hashBuffer);
          const hashHex = Array.from(hashArray)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          
          return {
            update: () => this,
            digest: () => hashHex
          };
        }) as any;
      },
      digest(encoding: string): string {
        throw new Error('Browser hash implementation requires async digest');
      }
    };
  }
}

// Node.js crypto implementation
class NodeCryptoUtils implements CryptoUtils {
  private crypto: any;

  constructor() {
    this.crypto = require('crypto');
  }

  randomBytes(length: number): Uint8Array {
    return this.crypto.randomBytes(length);
  }

  createHash(algorithm: string): Hash {
    return this.crypto.createHash(algorithm);
  }
}

// Universal buffer utilities
export class UniversalBuffer {
  static from(data: string | Uint8Array, encoding?: string): Uint8Array {
    if (typeof window === 'undefined') {
      // Node.js environment
      const { Buffer } = require('buffer');
      return Buffer.from(data, encoding as any);
    } else {
      // Browser environment
      if (typeof data === 'string') {
        const encoder = new TextEncoder();
        return encoder.encode(data);
      }
      return new Uint8Array(data);
    }
  }

  static toString(buffer: Uint8Array, encoding: string): string {
    if (typeof window === 'undefined') {
      // Node.js environment
      const { Buffer } = require('buffer');
      return Buffer.from(buffer).toString(encoding);
    } else {
      // Browser environment
      if (encoding === 'base64url') {
        // Convert to base64url
        const base64 = btoa(String.fromCharCode(...buffer));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      } else if (encoding === 'hex') {
        return Array.from(buffer)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      } else {
        const decoder = new TextDecoder();
        return decoder.decode(buffer);
      }
    }
  }
}

// Detect environment and provide appropriate crypto implementation
export function getCryptoUtils(): CryptoUtils {
  if (typeof window === 'undefined') {
    // Node.js environment
    return new NodeCryptoUtils();
  } else {
    // Browser environment
    return new BrowserCryptoUtils();
  }
}

// Synchronous hash function for browser compatibility
export async function hashString(data: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Node.js environment
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  } else {
    // Browser environment
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    return Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
} 