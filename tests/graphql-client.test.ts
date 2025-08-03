import { WalletBackendClient } from '../src/graphql-client';
import { GraphQLClient } from 'graphql-request';
import * as crypto from 'crypto';

// Mock graphql-request
jest.mock('graphql-request');

describe('WalletBackendClient', () => {
  let client: WalletBackendClient;
  
  // Unit tests use arbitrary values since they don't interact with real backend
  const testPrivateKey = 'SDFCVJQCCN3BVKHYS5MIE6OJCAGCE3KCZWZDXD2AMZUJ5Z4J7YTOPSOC';
  const testBaseUrl = 'http://test.example.com:1234/graphql/query';
  const testAudience = 'test-audience';

  let mockRequest: jest.MockedFunction<any>;
  let mockRawRequest: jest.MockedFunction<any>;

  // Helper function to validate JWT body hash
  const validateJwtBodyHash = (mockCall: any, query: string, variables?: any, operationName?: string) => {
    const authHeader = mockCall.mock.calls[0][2]['Authorization'];
    const jwt = authHeader.replace('Bearer ', '');
    const parts = jwt.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    const expectedBody = JSON.stringify({ query, ...(variables && { variables }), ...(operationName && { operationName }) });
    const expectedHash = crypto.createHash('sha256').update(expectedBody).digest('hex');
    expect(payload.bodyHash).toBe(expectedHash);
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock GraphQLClient constructor
    (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mockImplementation(() => ({
      request: jest.fn(),
      rawRequest: jest.fn(),
    } as any));

    client = new WalletBackendClient(testPrivateKey, testBaseUrl, testAudience);
    
    // Get references to the mocked methods
    const mockGraphQLClient = (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mock.results[0].value as any;
    mockRequest = mockGraphQLClient.request;
    mockRawRequest = mockGraphQLClient.rawRequest;
  });



  describe('getJWT', () => {
    it.each([
      {
        name: 'anonymous query',
        query: 'query { __schema { queryType { name } } }',
        variables: undefined
      },
      {
        name: 'named query with variables',
        query: 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }',
        variables: { limit: 5 }
      }
    ])('should generate a JWT for $name', async ({ query, variables }) => {
      const jwt = await client.getJWT(query, variables);

      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
      expect(jwt.split('.')).toHaveLength(3);
    });

    it('should generate different JWTs for different queries', async () => {
      const query1 = 'query { __schema { queryType { name } } }';
      const query2 = 'query { transactions { hash } }';
      
      const jwt1 = await client.getJWT(query1);
      const jwt2 = await client.getJWT(query2);

      expect(jwt1).not.toBe(jwt2);
    });
  });

  describe('request', () => {
    it.each([
      {
        name: 'anonymous query',
        query: 'query { __schema { queryType { name } } }',
        variables: undefined,
        operationName: undefined,
        expectedData: { __schema: { queryType: { name: 'Query' } } }
      },
      {
        name: 'named query with variables',
        query: 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }',
        variables: { limit: 5 },
        operationName: 'GetTransactions',
        expectedData: { transactions: [{ hash: 'test-hash' }] }
      }
    ])('should make a GraphQL request with authentication for $name', async ({ query, variables, operationName, expectedData }) => {
      mockRequest.mockResolvedValue(expectedData);

      const result = await client.request(query, variables);

      expect(mockRequest).toHaveBeenCalledWith(query, variables, expect.objectContaining({
        'Authorization': expect.stringMatching(/^Bearer /),
        'Content-Type': 'application/json',
      }));
      
      validateJwtBodyHash(mockRequest, query, variables, operationName);
      expect(result).toEqual(expectedData);
    });

    it('should throw error when GraphQL request fails', async () => {
      const query = 'query { invalid }';
      const error = new Error('GraphQL Error');
      mockRequest.mockRejectedValue(error);

      await expect(client.request(query)).rejects.toThrow('GraphQL Error');
    });
  });

  describe('rawRequest', () => {
    it.each([
      {
        name: 'anonymous query',
        query: 'query { __schema { queryType { name } } }',
        variables: undefined,
        operationName: undefined,
        expectedResponse: {
          data: { __schema: { queryType: { name: 'Query' } } },
          errors: undefined
        }
      },
      {
        name: 'named query with variables',
        query: 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }',
        variables: { limit: 5 },
        operationName: 'GetTransactions',
        expectedResponse: {
          data: { transactions: [{ hash: 'test-hash' }] },
          errors: undefined
        }
      },
      {
        name: 'query with errors',
        query: 'query { invalid }',
        variables: undefined,
        operationName: undefined,
        expectedResponse: {
          data: null,
          errors: [{ message: 'Field "invalid" of type "Query" does not exist.' }]
        }
      }
    ])('should make a raw GraphQL request with authentication for $name', async ({ query, variables, operationName, expectedResponse }) => {
      mockRawRequest.mockResolvedValue(expectedResponse);

      const result = await client.rawRequest(query, variables);

      expect(mockRawRequest).toHaveBeenCalledWith(query, variables, expect.objectContaining({
        'Authorization': expect.stringMatching(/^Bearer /),
        'Content-Type': 'application/json',
      }));
      
      validateJwtBodyHash(mockRawRequest, query, variables, operationName);
      expect(result).toEqual(expectedResponse);
    });
  });


}); 