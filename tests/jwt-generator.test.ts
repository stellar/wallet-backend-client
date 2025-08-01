import { JwtGenerator } from '../src/jwt-generator';

describe('JwtGenerator', () => {
  let jwtGenerator: JwtGenerator;
  const testPrivateKey = 'SDFCVJQCCN3BVKHYS5MIE6OJCAGCE3KCZWZDXD2AMZUJ5Z4J7YTOPSOC';
  const expectedPublicKey = 'GBJU5TE456SV7TTXVDQFLYFRLUHWFBPMUAFCECRI6DD3OF7IKRMMZUI5';

  beforeEach(() => {
    jwtGenerator = new JwtGenerator(testPrivateKey);
  });

  describe('constructor', () => {
    it('should create a JWT generator with the correct public key', () => {
      expect(jwtGenerator.getPublicKey()).toBe(expectedPublicKey);
    });

    it('should throw error for invalid private key', () => {
      expect(() => new JwtGenerator('invalid-key')).toThrow();
    });
  });

  describe('generateJWT', () => {
    it('should generate a valid JWT for a simple query', async () => {
      const query = 'query { __schema { queryType { name } } }';
      const jwt = await jwtGenerator.generateJWT(query);

      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
      expect(jwt.split('.')).toHaveLength(3); // header.payload.signature
    });

    it('should generate different JWTs for different queries', async () => {
      const query1 = 'query { __schema { queryType { name } } }';
      const query2 = 'query { transactions { hash } }';
      
      const jwt1 = await jwtGenerator.generateJWT(query1);
      const jwt2 = await jwtGenerator.generateJWT(query2);

      expect(jwt1).not.toBe(jwt2);
    });

    it('should generate different JWTs for same query with different variables', async () => {
      const query = 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }';
      const variables1 = { limit: 5 };
      const variables2 = { limit: 10 };
      
      const jwt1 = await jwtGenerator.generateJWT(query, variables1);
      const jwt2 = await jwtGenerator.generateJWT(query, variables2);

      expect(jwt1).not.toBe(jwt2);
    });

    it('should use custom audience when provided', async () => {
      const query = 'query { __schema { queryType { name } } }';
      const customAudience = 'custom-audience';
      const jwt = await jwtGenerator.generateJWT(query, undefined, customAudience);

      // Decode JWT to check audience
      const parts = jwt.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      
      expect(payload.aud).toContain(customAudience);
    });

    it('should use default audience when not provided', async () => {
      const query = 'query { __schema { queryType { name } } }';
      const jwt = await jwtGenerator.generateJWT(query);

      // Decode JWT to check audience
      const parts = jwt.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      
      expect(payload.aud).toContain('api');
    });
  });

  describe('JWT structure', () => {
    it('should generate JWT with correct header structure', async () => {
      const query = 'query { __schema { queryType { name } } }';
      const jwt = await jwtGenerator.generateJWT(query);

      const parts = jwt.split('.');
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());

      expect(header).toEqual({
        alg: 'EdDSA',
        typ: 'JWT',
        kid: expectedPublicKey
      });
    });

    it('should generate JWT with correct payload structure', async () => {
      const query = 'query { __schema { queryType { name } } }';
      const jwt = await jwtGenerator.generateJWT(query);

      const parts = jwt.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      expect(payload).toMatchObject({
        iss: expectedPublicKey,
        sub: expectedPublicKey,
        aud: expect.arrayContaining(['api']),
        iat: expect.any(Number),
        exp: expect.any(Number),
        jti: expect.any(String),
        bodyHash: expect.any(String),
        methodAndPath: 'POST /graphql/query'
      });
    });

    it('should have expiration time within 5 seconds', async () => {
      const query = 'query { __schema { queryType { name } } }';
      const jwt = await jwtGenerator.generateJWT(query);

      const parts = jwt.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      const now = Math.floor(Date.now() / 1000);
      const timeDiff = payload.exp - now;

      expect(timeDiff).toBeGreaterThan(0);
      expect(timeDiff).toBeLessThanOrEqual(5);
    });

    it('should hash the correct body content', async () => {
      const query = 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }';
      const variables = { limit: 5 };
      const jwt = await jwtGenerator.generateJWT(query, variables);

      const parts = jwt.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      // The body hash should match the hash of the JSON body
      const expectedBody = JSON.stringify({ query, variables });
      const crypto = require('crypto');
      const expectedHash = crypto.createHash('sha256').update(expectedBody).digest('hex');

      expect(payload.bodyHash).toBe(expectedHash);
    });
  });
}); 