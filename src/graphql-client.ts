import { GraphQLClient } from 'graphql-request';
import { JwtGenerator } from './jwt-generator';

export class WalletBackendClient {
  private client: GraphQLClient;
  private jwtGenerator: JwtGenerator;
  private audience: string;

  /**
   * Creates a new WalletBackendClient instance
   * @param privateKey The Stellar private key for JWT authentication
   * @param baseUrl The GraphQL endpoint URL
   * @param audience The JWT audience (e.g., 'api' for local Docker, hostname for production)
   */
  constructor(
    privateKey: string, 
    baseUrl: string,
    audience: string
  ) {
    this.jwtGenerator = new JwtGenerator(privateKey);
    this.audience = audience;
    this.client = new GraphQLClient(baseUrl);
  }

  private async getAuthHeaders(query: string, variables?: Record<string, any>): Promise<Record<string, string>> {
    const jwt = await this.jwtGenerator.generateJWT(query, variables, this.audience);
    return {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Makes a GraphQL request and returns just the data.
   * If there are GraphQL errors, throws an error that includes the response data.
   * You can access errors from the catch block via error.response.errors
   * @param query The GraphQL query string
   * @param variables Optional variables for the query
   * @returns The response data
   * @throws Error with response data if GraphQL errors occur
   */
  async request<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    const headers = await this.getAuthHeaders(query, variables);
    return this.client.request<T>(query, variables, headers);
  }

  /**
   * Makes a GraphQL request and returns the full response with data and errors.
   * Does not throw on GraphQL errors, only on network/HTTP errors.
   * @param query The GraphQL query string
   * @param variables Optional variables for the query
   * @returns The full response object with data and errors
   */
  async rawRequest<T = any>(query: string, variables?: Record<string, any>): Promise<{ data: T; errors?: any[] }> {
    const headers = await this.getAuthHeaders(query, variables);
    return this.client.rawRequest<T>(query, variables, headers);
  }

  /**
   * Generate a JWT token for a given query string
   * The audience is set in the constructor
   * @param query The GraphQL query string
   * @param variables Optional variables for the query
   * @returns The JWT token string
   */
  async getJWT(query: string, variables?: Record<string, any>): Promise<string> {
    return await this.jwtGenerator.generateJWT(query, variables, this.audience);
  }
} 