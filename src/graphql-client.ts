import { GraphQLClient } from 'graphql-request';
import { JwtGenerator } from './jwt-generator';

export interface WalletBackendClientOptions {
  authKey?: string;
}

export class WalletBackendClient {
  private client: GraphQLClient;
  private jwtGenerator?: JwtGenerator;

  /**
   * Creates a new WalletBackendClient instance
   * @param baseUrl The GraphQL endpoint URL
   * @param options Configuration options with optional authKey for JWT authentication
   */
  constructor(
    baseUrl: string,
    options: WalletBackendClientOptions = {}
  ) {
    this.jwtGenerator = options.authKey ? new JwtGenerator(options.authKey) : undefined;
    this.client = new GraphQLClient(baseUrl);
  }

  private async getHeaders(query: string, variables?: Record<string, any>): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.jwtGenerator) {
      const jwt = await this.jwtGenerator.generateJWT(query, variables);
      headers['Authorization'] = `Bearer ${jwt}`;
    }
    
    return headers;
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
    const headers = await this.getHeaders(query, variables);
    return this.client.request<T>(query, variables, headers);
  }

  /**
   * Makes a GraphQL request and returns the full response with data, errors, status, and headers.
   * Does not throw on GraphQL errors, only on network/HTTP errors.
   * @param query The GraphQL query string
   * @param variables Optional variables for the query
   * @returns The full response object with data, errors, status, and headers
   */
  async rawRequest<T = any>(query: string, variables?: Record<string, any>): Promise<{ 
    data: T; 
    errors?: any[];
    status: number;
    headers: Headers;
  }> {
    const headers = await this.getHeaders(query, variables);
    return this.client.rawRequest<T>(query, variables, headers);
  }

  /**
   * Generate a JWT token for a given query string
   * @param query The GraphQL query string
   * @param variables Optional variables for the query
   * @returns The JWT token string
   * @throws Error if no authKey was provided during client initialization
   */
  async getJWT(query: string, variables?: Record<string, any>): Promise<string> {
    if (!this.jwtGenerator) {
      throw new Error('Cannot generate JWT: no authKey provided during client initialization');
    }
    return await this.jwtGenerator.generateJWT(query, variables);
  }
} 