# @stellar/wallet-backend-client

A universal TypeScript GraphQL client for the Stellar Wallet Backend with built-in JWT authentication. Works seamlessly in Node.js, browsers, React, and React Native environments.

## Installation

```bash
npm install @stellar/wallet-backend-client
```

## Quick Start

```typescript
import { WalletBackendClient } from '@stellar/wallet-backend-client';

// Initialize the client with your Stellar private key
const client = new WalletBackendClient(
  'your-stellar-private-key', 
  'http://localhost:8001/graphql/query',
  'api'
);

// Make authenticated requests
const result = await client.request(`
  query {
    transactions(limit: 10) {
      hash
      ledgerNumber
    }
  }
`);
```

## Features

- 🔐 **Automatic JWT Authentication** - Uses your Stellar Ed25519 keypair for secure requests
- 🌐 **Universal Compatibility** - Works in Node.js, browsers, React, and React Native
- 📝 **Full TypeScript Support** - Complete type safety with generated GraphQL types
- 🚀 **Simple API** - Easy-to-use interface for GraphQL queries and mutations
- 📦 **Zero Dependencies** - Lightweight with no Node.js engine requirements

## Usage Examples

### Query Transactions

```typescript
const GET_TRANSACTIONS = `
  query GetTransactions($limit: Int) {
    transactions(limit: $limit) {
      hash
      ledgerNumber
      ledgerCreatedAt
      operations {
        id
        operationType
      }
    }
  }
`;

const data = await client.request(GET_TRANSACTIONS, { limit: 10 });
console.log(data.transactions);
```

### Query Account Information

```typescript
const GET_ACCOUNT = `
  query GetAccount($address: String!) {
    account(address: $address) {
      address
      transactions {
        hash
        ledgerNumber
      }
      operations {
        id
        operationType
      }
    }
  }
`;

const account = await client.request(GET_ACCOUNT, { 
  address: 'GABC123...' 
});
```

### Register an Account (Mutation)

```typescript
const REGISTER_ACCOUNT = `
  mutation RegisterAccount($input: RegisterAccountInput!) {
    registerAccount(input: $input) {
      success
      account {
        address
      }
    }
  }
`;

const result = await client.request(REGISTER_ACCOUNT, {
  input: { address: 'GABC123...' }
});
```

### Handle Errors

```typescript
try {
  const data = await client.request(query, variables);
  return data;
} catch (error) {
  console.error('GraphQL request failed:', error);
  throw error;
}
```

## Environment Support

Works in all JavaScript environments:

- ✅ **Node.js** - Server applications
- ✅ **Browser** - React, Vue, Angular, vanilla JS
- ✅ **React Native** - Mobile applications
- ✅ **Next.js** - SSR and client-side
- ✅ **Electron** - Desktop applications

## Authentication

The client automatically handles JWT authentication using your Stellar private key. Each request includes:

- **Automatic JWT Generation** - Uses your Ed25519 keypair
- **Request Body Hashing** - Ensures request integrity
- **Universal Crypto Support** - Works across all environments
- **Secure Headers** - Proper Authorization headers

## Type Safety

Full TypeScript support with generated types:

```typescript
import { Transaction, Operation, Account } from '@stellar/wallet-backend-client';

function processTransaction(tx: Transaction) {
  console.log(`Transaction ${tx.hash} at ledger ${tx.ledgerNumber}`);
  
  tx.operations.forEach((op: Operation) => {
    console.log(`Operation ${op.id} of type ${op.operationType}`);
  });
}
```

## API Reference

### WalletBackendClient

```typescript
new WalletBackendClient(
  privateKey: string,    // Your Stellar private key
  baseUrl: string,       // GraphQL endpoint URL
  audience: string       // JWT audience (usually 'api')
)
```

### Methods

- `request(query, variables?)` - Make authenticated GraphQL requests
- `rawRequest(query, variables?)` - Get raw response with errors
- `getJWT(query, variables?)` - Generate JWT for custom requests

## Development

### Setup

```bash
npm install
npm run codegen  # Generate TypeScript types
```

### Testing

```bash
npm test                    # Run all tests
npm run test:coverage      # Run with coverage
npm run test:integration   # Run integration tests
```

## License

MIT 