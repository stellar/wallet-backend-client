import { WalletBackendClient } from '../src/graphql-client';
import { GraphQLClient } from 'graphql-request';

// Mock graphql-request
jest.mock('graphql-request');

describe('WalletBackendClient', () => {
  let client: WalletBackendClient;
  const testPrivateKey = 'SDFCVJQCCN3BVKHYS5MIE6OJCAGCE3KCZWZDXD2AMZUJ5Z4J7YTOPSOC';
  const testBaseUrl = 'http://localhost:8001/graphql/query';
  const testAudience = 'api';

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock GraphQLClient constructor
    (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mockImplementation(() => ({
      request: jest.fn(),
      rawRequest: jest.fn(),
    } as any));

    client = new WalletBackendClient(testPrivateKey, testBaseUrl, testAudience);
  });

  describe('constructor', () => {
    it('should create a client with the provided parameters', () => {
      expect(client).toBeInstanceOf(WalletBackendClient);
    });

    it('should initialize GraphQLClient with the correct URL', () => {
      expect(GraphQLClient).toHaveBeenCalledWith(testBaseUrl);
    });
  });

  describe('getJWT', () => {
    it('should generate a JWT for a query', async () => {
      const query = 'query { __schema { queryType { name } } }';
      const jwt = await client.getJWT(query);

      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
      expect(jwt.split('.')).toHaveLength(3);
    });

    it('should generate a JWT for a query with variables', async () => {
      const query = 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }';
      const variables = { limit: 5 };
      const jwt = await client.getJWT(query, variables);

      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
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
    it('should make a GraphQL request with authentication', async () => {
      const mockGraphQLClient = (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mock.results[0].value as any;
      const mockRequest = mockGraphQLClient.request as jest.MockedFunction<any>;
      
      const query = 'query { __schema { queryType { name } } }';
      const expectedData = { __schema: { queryType: { name: 'Query' } } };
      
      mockRequest.mockResolvedValue(expectedData);

      const result = await client.request(query);

      expect(mockRequest).toHaveBeenCalledWith(query, undefined, expect.objectContaining({
        'Authorization': expect.stringMatching(/^Bearer /),
        'Content-Type': 'application/json',
      }));
      expect(result).toEqual(expectedData);
    });

    it('should make a GraphQL request with variables', async () => {
      const mockGraphQLClient = (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mock.results[0].value as any;
      const mockRequest = mockGraphQLClient.request as jest.MockedFunction<any>;
      
      const query = 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }';
      const variables = { limit: 5 };
      const expectedData = { transactions: [{ hash: 'test-hash' }] };
      
      mockRequest.mockResolvedValue(expectedData);

      const result = await client.request(query, variables);

      expect(mockRequest).toHaveBeenCalledWith(query, variables, expect.objectContaining({
        'Authorization': expect.stringMatching(/^Bearer /),
        'Content-Type': 'application/json',
      }));
      expect(result).toEqual(expectedData);
    });

    it('should throw error when GraphQL request fails', async () => {
      const mockGraphQLClient = (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mock.results[0].value as any;
      const mockRequest = mockGraphQLClient.request as jest.MockedFunction<any>;
      
      const query = 'query { invalid }';
      const error = new Error('GraphQL Error');
      mockRequest.mockRejectedValue(error);

      await expect(client.request(query)).rejects.toThrow('GraphQL Error');
    });
  });

  describe('rawRequest', () => {
    it('should make a raw GraphQL request with authentication', async () => {
      const mockGraphQLClient = (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mock.results[0].value as any;
      const mockRawRequest = mockGraphQLClient.rawRequest as jest.MockedFunction<any>;
      
      const query = 'query { __schema { queryType { name } } }';
      const expectedResponse = {
        data: { __schema: { queryType: { name: 'Query' } } },
        errors: undefined
      };
      
      mockRawRequest.mockResolvedValue(expectedResponse);

      const result = await client.rawRequest(query);

      expect(mockRawRequest).toHaveBeenCalledWith(query, undefined, expect.objectContaining({
        'Authorization': expect.stringMatching(/^Bearer /),
        'Content-Type': 'application/json',
      }));
      expect(result).toEqual(expectedResponse);
    });

    it('should make a raw GraphQL request with variables', async () => {
      const mockGraphQLClient = (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mock.results[0].value as any;
      const mockRawRequest = mockGraphQLClient.rawRequest as jest.MockedFunction<any>;
      
      const query = 'query GetTransactions($limit: Int) { transactions(limit: $limit) { hash } }';
      const variables = { limit: 5 };
      const expectedResponse = {
        data: { transactions: [{ hash: 'test-hash' }] },
        errors: undefined
      };
      
      mockRawRequest.mockResolvedValue(expectedResponse);

      const result = await client.rawRequest(query, variables);

      expect(mockRawRequest).toHaveBeenCalledWith(query, variables, expect.objectContaining({
        'Authorization': expect.stringMatching(/^Bearer /),
        'Content-Type': 'application/json',
      }));
      expect(result).toEqual(expectedResponse);
    });

    it('should return response with errors when GraphQL has errors', async () => {
      const mockGraphQLClient = (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mock.results[0].value as any;
      const mockRawRequest = mockGraphQLClient.rawRequest as jest.MockedFunction<any>;
      
      const query = 'query { invalid }';
      const expectedResponse = {
        data: null,
        errors: [{ message: 'Field "invalid" of type "Query" does not exist.' }]
      };
      
      mockRawRequest.mockResolvedValue(expectedResponse);

      const result = await client.rawRequest(query);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('authentication headers', () => {
    it('should include Authorization header with Bearer token', async () => {
      const mockGraphQLClient = (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mock.results[0].value as any;
      const mockRequest = mockGraphQLClient.request as jest.MockedFunction<any>;
      
      const query = 'query { __schema { queryType { name } } }';
      mockRequest.mockResolvedValue({});

      await client.request(query);

      expect(mockRequest).toHaveBeenCalledWith(
        query,
        undefined,
        expect.objectContaining({
          'Authorization': expect.stringMatching(/^Bearer eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/),
          'Content-Type': 'application/json',
        })
      );
    });

    it('should generate different tokens for different queries', async () => {
      const mockGraphQLClient = (GraphQLClient as jest.MockedClass<typeof GraphQLClient>).mock.results[0].value as any;
      const mockRequest = mockGraphQLClient.request as jest.MockedFunction<any>;
      
      const query1 = 'query { __schema { queryType { name } } }';
      const query2 = 'query { transactions { hash } }';
      
      mockRequest.mockResolvedValue({});

      await client.request(query1);
      const headers1 = mockRequest.mock.calls[0][2];
      
      await client.request(query2);
      const headers2 = mockRequest.mock.calls[1][2];

      expect(headers1.Authorization).not.toBe(headers2.Authorization);
    });
  });
}); 