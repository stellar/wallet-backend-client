import { UniversalBuffer, hashString, getCryptoUtils, CryptoUtils } from '../src/crypto-utils';

describe('crypto-utils', () => {
  describe('UniversalBuffer', () => {
    describe('from()', () => {
      it('should convert string to Uint8Array', () => {
        const result = UniversalBuffer.from('test', 'utf8');
        expect(result).toBeInstanceOf(Uint8Array);
        // In Node.js, this returns a Buffer which is also a Uint8Array
        expect(result).toEqual(expect.any(Uint8Array));
        expect(Array.from(result)).toEqual([116, 101, 115, 116]);
      });

      it('should handle Uint8Array input', () => {
        const input = new Uint8Array([116, 101, 115, 116]); // 'test'
        const result = UniversalBuffer.from(input);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(Array.from(result)).toEqual(Array.from(input));
      });

      it('should handle empty string', () => {
        const result = UniversalBuffer.from('', 'utf8');
        expect(result).toBeInstanceOf(Uint8Array);
        expect(Array.from(result)).toEqual([]);
      });
    });

    describe('toString()', () => {
      it('should convert to hex string', () => {
        const input = new Uint8Array([116, 101, 115, 116]); // 'test'
        const result = UniversalBuffer.toString(input, 'hex');
        expect(result).toBe('74657374');
      });

      it('should convert to base64url string', () => {
        const input = new Uint8Array([116, 101, 115, 116]); // 'test'
        const result = UniversalBuffer.toString(input, 'base64url');
        expect(result).toBe('dGVzdA');
      });

      it('should convert to utf8 string', () => {
        const input = new Uint8Array([116, 101, 115, 116]); // 'test'
        const result = UniversalBuffer.toString(input, 'utf8');
        expect(result).toBe('test');
      });

      it('should handle empty buffer', () => {
        const input = new Uint8Array(0);
        const result = UniversalBuffer.toString(input, 'hex');
        expect(result).toBe('');
      });
    });
  });

  describe('hashString()', () => {
    it('should hash a string correctly', async () => {
      const result = await hashString('test');
      expect(result).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
    });

    it('should hash empty string', async () => {
      const result = await hashString('');
      expect(result).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('should hash complex string', async () => {
      const result = await hashString('{"query":"test","variables":{"id":"123"}}');
      expect(result).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
      expect(result.length).toBe(64);
    });

    it('should produce consistent results', async () => {
      const input = 'test string';
      const result1 = await hashString(input);
      const result2 = await hashString(input);
      expect(result1).toBe(result2);
    });

    it('should handle special characters', async () => {
      const result = await hashString('test\n\r\t');
      expect(result).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
      expect(result.length).toBe(64);
    });
  });

  describe('getCryptoUtils()', () => {
    it('should return crypto utils instance', () => {
      const cryptoUtils = getCryptoUtils();
      expect(cryptoUtils).toBeDefined();
      expect(typeof cryptoUtils.randomBytes).toBe('function');
      expect(typeof cryptoUtils.createHash).toBe('function');
    });

    it('should return different implementations for different environments', () => {
      const cryptoUtils = getCryptoUtils();
      
      // Test randomBytes
      const randomBytes = cryptoUtils.randomBytes(16);
      expect(randomBytes).toBeInstanceOf(Uint8Array);
      expect(randomBytes.length).toBe(16);
      
      // Test createHash
      const hash = cryptoUtils.createHash('sha256');
      expect(hash).toBeDefined();
      expect(typeof hash.update).toBe('function');
      expect(typeof hash.digest).toBe('function');
    });
  });

  describe('CryptoUtils interface', () => {
    it('should have required methods', () => {
      const cryptoUtils: CryptoUtils = getCryptoUtils();
      
      expect(typeof cryptoUtils.randomBytes).toBe('function');
      expect(typeof cryptoUtils.createHash).toBe('function');
    });
  });

  describe('Cross-platform compatibility', () => {
    it('should work in Node.js environment', () => {
      // This test simulates Node.js environment
      const originalWindow = (global as any).window;
      delete (global as any).window;
      
      try {
        const cryptoUtils = getCryptoUtils();
        const randomBytes = cryptoUtils.randomBytes(8);
        expect(randomBytes).toBeInstanceOf(Uint8Array);
        expect(randomBytes.length).toBe(8);
      } finally {
        // Restore window
        (global as any).window = originalWindow;
      }
    });

    it('should work in browser environment', () => {
      // This test simulates browser environment
      const originalWindow = (global as any).window;
      (global as any).window = {};
      
      try {
        const cryptoUtils = getCryptoUtils();
        const randomBytes = cryptoUtils.randomBytes(8);
        expect(randomBytes).toBeInstanceOf(Uint8Array);
        expect(randomBytes.length).toBe(8);
      } finally {
        // Restore window
        (global as any).window = originalWindow;
      }
    });
  });

  describe('Error handling', () => {
    it('should handle invalid hash algorithm', () => {
      const cryptoUtils = getCryptoUtils();
      expect(() => {
        cryptoUtils.createHash('invalid-algorithm');
      }).toThrow('Digest method not supported');
    });

    it('should handle null/undefined inputs gracefully', async () => {
      // Test with empty string (should be handled by standard crypto)
      await expect(hashString('')).resolves.toBeDefined();
    });
  });

  describe('Standard SHA-256 hashing', () => {
    it('should produce standard SHA-256 hash', async () => {
      const input = 'test string';
      
      // Our implementation
      const ourHash = await hashString(input);
      
      // Expected SHA-256 hash for "test string"
      const expectedHash = 'd5579c46dfcc7f18207013e65b44e4cb4e2c2298f4ac457ba8f82743f31e930b';
      
      expect(ourHash).toBe(expectedHash);
    });

    it('should handle various input types consistently', async () => {
      const testCases = [
        '',
        'a',
        'test',
        '{"query":"test"}',
        'special chars: !@#$%^&*()',
        'unicode: 🚀🌟',
        'newlines\nand\rtabs\t'
      ];

      for (const testCase of testCases) {
        const result = await hashString(testCase);
        expect(result).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
        expect(result.length).toBe(64);
      }
    });
  });
}); 