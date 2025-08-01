import { Keypair } from '@stellar/stellar-sdk';
import { UniversalBuffer, hashString } from './crypto-utils';

export interface JwtHeader {
  alg: string;
  typ: string;
  kid: string;
}

export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  jti: string;
  bodyHash: string;
  methodAndPath: string;
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
      iss: this.publicKey,
      sub: this.publicKey,
      aud: [audience], // Array of strings as expected by Go server
      iat: now,
      exp: now + 3, // 3 seconds expiration (within 5s limit)
      jti: this.generateRandomHex(16),
      bodyHash: bodyHash,
      methodAndPath: methodAndPath
    };
  }

  private generateRandomHex(length: number): string {
    const array = new Uint8Array(length);
    if (typeof window === 'undefined') {
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
    if (typeof window === 'undefined') {
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
    const body = JSON.stringify({ query, variables });
    const bodyHash = await this.hashBody(body);
    const header = this.createJwtHeader();
    const payload = this.createJwtPayload(audience, 'POST /graphql/query', bodyHash);
    
    return this.signJwt(header, payload);
  }

  public getPublicKey(): string {
    return this.publicKey;
  }
} 