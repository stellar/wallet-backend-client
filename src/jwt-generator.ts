import { Keypair } from '@stellar/stellar-sdk';
import { UniversalBuffer, hashString } from './crypto-utils';

export interface JwtHeader {
  alg: string;
  typ: string;
  kid: string;
}

export interface JwtPayload {
  // Custom claims that match the wallet backend
  bodyHash: string;
  methodAndPath: string;
  // Standard JWT claims (matching Go JWT library)
  iss: string;  // Issuer
  sub: string;  // Subject
  aud: string[]; // Audience
  iat: number;  // Issued At
  exp: number;  // Expiration Time
  jti: string;  // JWT ID
}

export class JwtGenerator {
  private keypair: Keypair;
  private publicKey: string;

  constructor(privateKey: string) {
    this.keypair = Keypair.fromSecret(privateKey);
    this.publicKey = this.keypair.publicKey();
  }

  private createJwtHeader(): JwtHeader {
    return {
      alg: 'EdDSA',
      typ: 'JWT',
      kid: this.publicKey
    };
  }

  private createJwtPayload(audience: string, methodAndPath: string, bodyHash: string): JwtPayload {
    const now = Math.floor(Date.now() / 1000);
    return {
      // Custom claims
      bodyHash: bodyHash,
      methodAndPath: methodAndPath,
      // Standard JWT claims
      iss: this.publicKey,
      sub: this.publicKey,
      aud: [audience],
      iat: now,
      exp: now + 3, // 3 seconds expiration (within 5s limit)
      jti: this.generateRandomHex(16)
    };
  }

  private generateRandomHex(length: number): string {
    const array = new Uint8Array(length);
    if (typeof globalThis !== 'undefined' && typeof globalThis.window === 'undefined') {
      // Node.js environment
      const crypto = require('crypto');
      crypto.randomFillSync(array);
    } else {
      // Browser environment
      crypto.getRandomValues(array);
    }
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async hashBody(body: string): Promise<string> {
    return await hashString(body);
  }

  private signJwt(header: JwtHeader, payload: JwtPayload): string {
    const headerB64 = UniversalBuffer.toString(
      UniversalBuffer.from(JSON.stringify(header)), 
      'base64url'
    );
    const payloadB64 = UniversalBuffer.toString(
      UniversalBuffer.from(JSON.stringify(payload)), 
      'base64url'
    );
    
    const data = `${headerB64}.${payloadB64}`;
    
    // Convert to Buffer for Stellar SDK compatibility
    let dataBuffer: Buffer;
    if (typeof globalThis !== 'undefined' && typeof globalThis.window === 'undefined') {
      // Node.js environment
      const { Buffer } = require('buffer');
      dataBuffer = Buffer.from(data, 'utf8');
    } else {
      // Browser environment - convert Uint8Array to Buffer-like object
      const uint8Array = UniversalBuffer.from(data, 'utf8');
      dataBuffer = uint8Array as any; // Type assertion for browser compatibility
    }
    
    const signature = this.keypair.sign(dataBuffer);
    const signatureB64 = UniversalBuffer.toString(signature, 'base64url');
    
    return `${data}.${signatureB64}`;
  }

  public async generateJWT(query: string, variables?: Record<string, any>, audience: string = 'api'): Promise<string> {
    // Create the JSON body that will be sent in the request
    // Match exactly what graphql-request sends: { query, variables, operationName }
    
    // Extract operation name from query or mutation
    let operationName: string | undefined;
    try {
      // Simple regex to extract operation name from "query OperationName(...)" or "mutation OperationName(...)"
      const match = query.trim().match(/^(query|mutation)\s+(\w+)/);
      operationName = match ? match[2] : undefined;
    } catch (err) {
      // If parsing fails, operationName will be undefined
    }
    
    // Build the body object matching graphql-request format
    const bodyObj: any = { query };
    if (variables !== undefined) {
      bodyObj.variables = variables;
    }
    if (operationName !== undefined) {
      bodyObj.operationName = operationName;
    }
    
    const body = JSON.stringify(bodyObj);
    const bodyHash = await this.hashBody(body);
    const header = this.createJwtHeader();
    const payload = this.createJwtPayload(audience, 'POST /graphql/query', bodyHash);
    
    return this.signJwt(header, payload);
  }

  public getPublicKey(): string {
    return this.publicKey;
  }
} 