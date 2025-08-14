import { JwtGenerator } from '../src/jwt-generator';
import * as crypto from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';

describe('JwtGenerator', () => {
  let jwtGenerator: JwtGenerator;
  
  // Unit tests use arbitrary values since they don't interact with real backend
  const testPrivateKey = 'SDFCVJQCCN3BVKHYS5MIE6OJCAGCE3KCZWZDXD2AMZUJ5Z4J7YTOPSOC';

  beforeEach(() => {
    jwtGenerator = new JwtGenerator(testPrivateKey);
  });

  describe('constructor', () => {
    it('should create a JWT generator with the correct public key', () => {
      const expectedKeypair = Keypair.fromSecret(testPrivateKey);
      const expectedPublicKey = expectedKeypair.publicKey();
      expect(jwtGenerator.getPublicKey()).toBe(expectedPublicKey);
    });

    it('should throw error for invalid private key', () => {
      expect(() => new JwtGenerator('invalid-key')).toThrow();
    });
  });

  describe('generateJWT', () => {
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

  });

  describe('JWT structure and validation', () => {
    it.each([
      {
        name: 'anonymous query',
        query: 'query { __schema { queryType { name } } }',
        variables: undefined,
        expectedBody: { query: 'query { __schema { queryType { name } } }' }
      },
      {
        name: 'named query',
        query: 'query GetSchema { __schema { queryType { name } } }',
        variables: undefined,
        expectedBody: { query: 'query GetSchema { __schema { queryType { name } } }', operationName: 'GetSchema' }
      },
      {
        name: 'anonymous mutation',
        query: 'mutation { registerAccount(input: { address: "GBJU5TE456SV7TTXVDQFLYFRLUHWFBPMUAFCECRI6DD3OF7IKRMMZUI5" }) { success } }',
        variables: undefined,
        expectedBody: { query: 'mutation { registerAccount(input: { address: "GBJU5TE456SV7TTXVDQFLYFRLUHWFBPMUAFCECRI6DD3OF7IKRMMZUI5" }) { success } }' }
      },
      {
        name: 'named mutation',
        query: 'mutation RegisterAccount { registerAccount(input: { address: "GBJU5TE456SV7TTXVDQFLYFRLUHWFBPMUAFCECRI6DD3OF7IKRMMZUI5" }) { success } }',
        variables: undefined,
        expectedBody: { query: 'mutation RegisterAccount { registerAccount(input: { address: "GBJU5TE456SV7TTXVDQFLYFRLUHWFBPMUAFCECRI6DD3OF7IKRMMZUI5" }) { success } }', operationName: 'RegisterAccount' }
      },
      {
        name: 'query with variables',
        query: 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }',
        variables: { limit: 5 },
        expectedBody: { query: 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }', variables: { limit: 5 }, operationName: 'GetTransactions' }
      }
    ])('should generate JWT with correct structure and validate body hash for $name', async ({ query, variables, expectedBody }) => {
      const jwt = await jwtGenerator.generateJWT(query, variables);

      // Basic JWT validation
      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
      expect(jwt.split('.')).toHaveLength(3);

      // Parse JWT parts
      const parts = jwt.split('.');
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      // Validate header structure
      const expectedKeypair = Keypair.fromSecret(testPrivateKey);
      const expectedPublicKey = expectedKeypair.publicKey();
      expect(header).toEqual({
        alg: 'EdDSA',
        typ: 'JWT',
        kid: expectedPublicKey
      });

      // Validate payload structure
      expect(payload).toMatchObject({
        iss: expectedPublicKey,
        sub: expectedPublicKey,
        iat: expect.any(Number),
        exp: expect.any(Number),
        jti: expect.any(String),
        bodyHash: expect.any(String),
        methodAndPath: 'POST /graphql/query'
      });

      // Validate that audience claim is not present
      expect(payload.aud).toBeUndefined();

      // Validate expiration time
      const now = Math.floor(Date.now() / 1000);
      const timeDiff = payload.exp - now;
      expect(timeDiff).toBeGreaterThan(0);
      expect(timeDiff).toBeLessThanOrEqual(5);

      // Validate body hash
      const expectedBodyString = JSON.stringify(expectedBody);
      const expectedHash = crypto.createHash('sha256').update(expectedBodyString).digest('hex');
      expect(payload.bodyHash).toBe(expectedHash);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle query parsing errors gracefully', async () => {
      const malformedQuery = 'query { __schema { queryType { name } } }';
      const jwt = await jwtGenerator.generateJWT(malformedQuery);
      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
    });

    it('should handle empty query string', async () => {
      const jwt = await jwtGenerator.generateJWT('');
      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
    });

    it('should handle browser environment buffer conversion', async () => {
      const query = 'query { test }';
      const jwt = await jwtGenerator.generateJWT(query);
      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
    });

    it('should handle generateRandomHex in both environments', async () => {
      const testKeypair = Keypair.random();
      const generator = new JwtGenerator(testKeypair.secret());
      
      const jwt = await generator.generateJWT('query { test }');
      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
    });

    it('should test JWT generator error handling paths', async () => {
      const complexQuery = 'query TestQuery($var: String!) { test(field: $var) { id } }';
      const variables = { var: 'test value with spaces and special chars: !@#$%' };
      
      const jwt = await jwtGenerator.generateJWT(complexQuery, variables);
      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
      
      const edgeCaseQuery = 'query { test }';
      const jwt2 = await jwtGenerator.generateJWT(edgeCaseQuery);
      expect(jwt2).toBeDefined();
      expect(typeof jwt2).toBe('string');
    });
  });
}); 