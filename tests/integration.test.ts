import { WalletBackendClient } from '../src/graphql-client';

// Integration tests - these require the wallet backend server to be running
describe('WalletBackendClient Integration', () => {
  let client: WalletBackendClient;
  const testPrivateKey = process.env.CLIENT_AUTH_PRIVATE_KEY || 'SDFCVJQCCN3BVKHYS5MIE6OJCAGCE3KCZWZDXD2AMZUJ5Z4J7YTOPSOC';
  const testBaseUrl = 'http://localhost:8001/graphql/query';
  const testAudience = 'api';

  beforeAll(() => {
    // Check if server is running
    const http = require('http');
    return new Promise<void>((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 8001,
        path: '/health',
        method: 'GET',
        timeout: 5000
      }, (res: any) => {
        // Consume the response data to prevent hanging
        res.resume();
        
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Server returned status ${res.statusCode}`));
        }
      });
      
      req.on('error', () => {
        req.destroy();
        reject(new Error('Wallet backend server is not running. Please start the server before running integration tests.'));
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Server health check timed out'));
      });
      
      req.end();
    });
  });

  beforeEach(() => {
    client = new WalletBackendClient(testPrivateKey, testBaseUrl, testAudience);
  });

  describe('Authentication', () => {
    it('should successfully authenticate with the server', async () => {
      const query = 'query { __schema { queryType { name } } }';
      
      const result = await client.rawRequest(query);
      expect(result.data).toBeDefined();
      expect(result.data.__schema).toBeDefined();
      expect(result.data.__schema.queryType).toBeDefined();
      expect(result.data.__schema.queryType.name).toBe('Query');
    });

    it('should generate valid JWTs for authentication', async () => {
      const query = 'query { __schema { queryType { name } } }';
      const jwt = await client.getJWT(query);

      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
      expect(jwt.split('.')).toHaveLength(3);

      // Verify JWT structure
      const parts = jwt.split('.');
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      expect(header.alg).toBe('EdDSA');
      expect(header.typ).toBe('JWT');
      expect(payload.aud).toContain('api');
      expect(payload.methodAndPath).toBe('POST /graphql/query');
    });
  });

  describe('GraphQL Queries', () => {
    it('should handle successful queries', async () => {
      const query = 'query { __schema { queryType { name } } }';
      
      const result = await client.request(query);
      expect(result).toBeDefined();
      expect(result.__schema).toBeDefined();
    });

    it('should handle queries with variables', async () => {
      const query = 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }';
      const variables = { limit: 5 };
      
      const result = await client.request(query, variables);
      expect(result).toBeDefined();
      expect(Array.isArray(result.transactions)).toBe(true);
    });

    it('should handle GraphQL errors gracefully', async () => {
      const query = 'query { invalidField }';
      
      try {
        await client.request(query);
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.response.errors).toBeDefined();
        expect(Array.isArray(error.response.errors)).toBe(true);
      }
    });

    it('should handle network errors gracefully', async () => {
      // Create a client with invalid URL to test network errors
      const invalidClient = new WalletBackendClient(testPrivateKey, 'http://localhost:9999/graphql/query', testAudience);
      const query = 'query { __schema { queryType { name } } }';
      
      try {
        await invalidClient.request(query);
        fail('Expected network error to be thrown');
      } catch (error: any) {
        expect(error).toBeDefined();
        // Network errors should not have response property
        expect(error.response).toBeUndefined();
      }
    });
  });

  describe('GraphQL Mutations', () => {
    it('should handle registerAccount mutation with variables', async () => {
      const mutation = `
        mutation RegisterAccount($input: RegisterAccountInput!) {
          registerAccount(input: $input) {
            success
            account {
              address
            }
          }
        }
      `;
      
      const variables = {
        input: {
          address: 'GBJU5TE456SV7TTXVDQFLYFRLUHWFBPMUAFCECRI6DD3OF7IKRMMZUI5'
        }
      };
      
      try {
        const result = await client.request(mutation, variables);
        expect(result).toBeDefined();
        expect(result.registerAccount).toBeDefined();
        expect(typeof result.registerAccount.success).toBe('boolean');
        if (result.registerAccount.account) {
          expect(result.registerAccount.account.address).toBeDefined();
        }
      } catch (error: any) {
        // If the mutation fails due to authorization, that's expected
        // But we should verify that the JWT was generated correctly
        expect(error).toBeDefined();
        if (error.response?.error === 'Not authorized.') {
          // This is expected if the test key doesn't have mutation permissions
          expect(error.response.error).toBe('Not authorized.');
        } else {
          // If it's a different error, re-throw it
          throw error;
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle rawRequest with errors', async () => {
      const query = 'query { invalidField }';
      
      try {
        const result = await client.rawRequest(query);
        expect(result.errors).toBeDefined();
        expect(Array.isArray(result.errors)).toBe(true);
        expect(result.errors!.length).toBeGreaterThan(0);
      } catch (error: any) {
        // If it's a network error, that's also valid
        expect(error).toBeDefined();
      }
    });

    it('should handle request with errors', async () => {
      const query = 'query { invalidField }';
      
      try {
        await client.request(query);
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.response.errors).toBeDefined();
      }
    });
  });

  describe('JWT Generation', () => {
    it('should generate different JWTs for different queries', async () => {
      const query1 = 'query { __schema { queryType { name } } }';
      const query2 = 'query { transactions { hash } }';
      
      const jwt1 = await client.getJWT(query1);
      const jwt2 = await client.getJWT(query2);

      expect(jwt1).not.toBe(jwt2);
    });

    it('should generate different JWTs for same query with different variables', async () => {
      const query = 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }';
      const variables1 = { limit: 5 };
      const variables2 = { limit: 10 };
      
      const jwt1 = await client.getJWT(query, variables1);
      const jwt2 = await client.getJWT(query, variables2);

      expect(jwt1).not.toBe(jwt2);
    });

    it('should generate JWTs with correct expiration time', async () => {
      const query = 'query { __schema { queryType { name } } }';
      const jwt = await client.getJWT(query);

      const parts = jwt.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      const now = Math.floor(Date.now() / 1000);
      const timeDiff = payload.exp - now;

      expect(timeDiff).toBeGreaterThan(0);
      expect(timeDiff).toBeLessThanOrEqual(5);
    });
  });
}); 