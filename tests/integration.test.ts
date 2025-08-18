import 'dotenv/config';
import { WalletBackendClient } from '../src/graphql-client';
import * as http from 'http';
import { Keypair } from '@stellar/stellar-sdk';

// Integration tests - these require the wallet backend server to be running
describe('WalletBackendClient Integration', () => {
  // Check required environment variables
  if (!process.env.CLIENT_AUTH_PRIVATE_KEY) {
    throw new Error('CLIENT_AUTH_PRIVATE_KEY environment variable is required for integration tests');
  }
  if (!process.env.GRAPHQL_HOST) {
    throw new Error('GRAPHQL_HOST environment variable is required for integration tests');
  }
  if (!process.env.GRAPHQL_PORT) {
    throw new Error('GRAPHQL_PORT environment variable is required for integration tests');
  }
  if (!process.env.GRAPHQL_PATH) {
    throw new Error('GRAPHQL_PATH environment variable is required for integration tests');
  }

  const testPrivateKey = process.env.CLIENT_AUTH_PRIVATE_KEY;
  const host = process.env.GRAPHQL_HOST;
  const port = parseInt(process.env.GRAPHQL_PORT, 10);
  const path = process.env.GRAPHQL_PATH;
  const testBaseUrl = `http://${host}:${port}${path}`;
  
  // Create client once since it's stateless and safe for concurrent use
  const client = new WalletBackendClient(testBaseUrl, { authKey: testPrivateKey });

  beforeAll(() => {
    // Check if server is running
    return new Promise<void>((resolve, reject) => {
      const req = http.request({
        hostname: host,
        port: port,
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

  describe('Authentication', () => {
    it('should successfully authenticate with the server using rawRequest', async () => {
      const query = 'query { __schema { queryType { name } } }';
      
      const result = await client.rawRequest(query);
      
      // Verify successful HTTP status code first
      expect(result.status).toBe(200);
      
      // Then verify response body
      expect(result.data).toBeDefined();
      expect(result.data.__schema).toBeDefined();
      expect(result.data.__schema.queryType).toBeDefined();
      expect(result.data.__schema.queryType.name).toBe('Query');
    });

    it('should successfully authenticate with the server using request', async () => {
      const query = 'query { __schema { queryType { name } } }';
      
      const result = await client.request(query);
      expect(result).toBeDefined();
      expect(result.__schema).toBeDefined();
      expect(result.__schema.queryType).toBeDefined();
      expect(result.__schema.queryType.name).toBe('Query');
    });


  });

  describe('GraphQL Queries', () => {
    it('should handle successful queries', async () => {
      const query = 'query { __schema { queryType { name } } }';
      
      const result = await client.rawRequest(query);
      
      // Verify successful HTTP status code first
      expect(result.status).toBe(200);
      
      // Then verify response body
      expect(result.data).toBeDefined();
      expect(result.data.__schema).toBeDefined();
    });

    it('should handle queries with variables', async () => {
      const query = 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }';
      const variables = { limit: 5 };
      
      const result = await client.rawRequest(query, variables);
      
      // Verify successful HTTP status code first
      expect(result.status).toBe(200);
      
      // Then verify response body
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.transactions)).toBe(true);
    });

    it('should handle GraphQL errors gracefully', async () => {
      const query = 'query { invalidField }';
      
      try {
        await client.rawRequest(query);
        fail('Expected validation error to be thrown');
      } catch (error: any) {
        // Wallet backend returns 422 for GraphQL validation errors
        expect(error.response.status).toBe(422);
        expect(error.response.errors).toBeDefined();
        expect(Array.isArray(error.response.errors)).toBe(true);
        expect(error.response.errors.length).toBeGreaterThan(0);
      }
    });

    it('should handle network errors gracefully', async () => {
      // Create a client with invalid URL to test network errors
      if (!testPrivateKey) {
        throw new Error('CLIENT_AUTH_PRIVATE_KEY environment variable is required for integration tests');
      }
      const invalidClient = new WalletBackendClient('http://localhost:9999/graphql/query', { authKey: testPrivateKey });
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
      
      // Generate a fresh Stellar key pair for testing
      const keypair = Keypair.random();
      const freshAddress = keypair.publicKey();
      
      const variables = {
        input: {
          address: freshAddress
        }
      };
      
      const result = await client.rawRequest(mutation, variables);
      
      // Verify successful HTTP status code first
      expect(result.status).toBe(200);
      
      // Then verify response body
      expect(result.data).toBeDefined();
      expect(result.data.registerAccount).toBeDefined();
      expect(typeof result.data.registerAccount.success).toBe('boolean');
      expect(result.data.registerAccount.success).toBe(true);
      if (result.data.registerAccount.account) {
        expect(result.data.registerAccount.account.address).toBeDefined();
        expect(result.data.registerAccount.account.address).toBe(freshAddress);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle rawRequest with GraphQL validation errors', async () => {
      const query = 'query { invalidField }';
      
      try {
        await client.rawRequest(query);
        fail('Expected validation error to be thrown');
      } catch (error: any) {
        // Wallet backend returns 422 for GraphQL validation errors
        expect(error.response.status).toBe(422);
        expect(error.response.errors).toBeDefined();
        expect(Array.isArray(error.response.errors)).toBe(true);
        expect(error.response.errors.length).toBeGreaterThan(0);
      }
    });

    it('should handle request with GraphQL validation errors and throw', async () => {
      const query = 'query { invalidField }';
      
      try {
        await client.request(query);
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.response.errors).toBeDefined();
        
        // The error response should have status 422 for GraphQL validation errors
        expect(error.response.status).toBe(422);
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