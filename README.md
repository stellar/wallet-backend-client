# @stellar/wallet-backend-client

A universal TypeScript GraphQL client for the Stellar Wallet Backend with optional JWT authentication. Works seamlessly in Node.js, browsers, React, and React Native environments.

## Installation

```bash
npm install @stellar/wallet-backend-client
```

## Quick Start

```typescript
import { WalletBackendClient } from '@stellar/wallet-backend-client';

// With authentication (when wallet backend requires it)
const client = new WalletBackendClient(
  'http://localhost:8001/graphql/query',
  { authKey: 'your-stellar-private-key' }
);

// Without authentication (when wallet backend doesn't require it)
const client = new WalletBackendClient(
  'http://localhost:8001/graphql/query'
);

// Make paginated requests
const result = await client.request(`
  query {
    transactions(first: 10) {
      edges {
        node {
          hash
          ledgerNumber
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);
```

## Features

- 🔐 **Optional JWT Authentication** - Uses your Stellar Ed25519 keypair for secure requests when needed
- 📄 **Cursor-based Pagination** - Full support for GraphQL connection-based pagination
- 🌐 **Universal Compatibility** - Works in Node.js, browsers, React, and React Native
- 📝 **Full TypeScript Support** - Complete type safety with generated GraphQL types
- 🚀 **Simple API** - Easy-to-use interface for GraphQL queries and mutations
- 📦 **Zero Dependencies** - Lightweight with no Node.js engine requirements

## Usage Examples

### Query Transactions with Pagination

```typescript
const GET_TRANSACTIONS = `
  query GetTransactions($first: Int, $after: String) {
    transactions(first: $first, after: $after) {
      edges {
        node {
          hash
          ledgerNumber
          ledgerCreatedAt
          operations {
            id
            operationType
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const data = await client.request(GET_TRANSACTIONS, { first: 10 });
console.log(data.transactions.edges.map(edge => edge.node));
```

### Query Account Information with Pagination

```typescript
const GET_ACCOUNT = `
  query GetAccount($address: String!, $first: Int) {
    account(address: $address) {
      address
      transactions(first: $first) {
        edges {
          node {
            hash
            ledgerNumber
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      operations(first: $first) {
        edges {
          node {
            id
            operationType
          }
          cursor
        }
      }
    }
  }
`;

const account = await client.request(GET_ACCOUNT, { 
  address: 'GABC123...', 
  first: 10 
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

The client supports optional JWT authentication using your Stellar private key. When authentication is configured, each request includes:

- **Automatic JWT Generation** - Uses your Ed25519 keypair
- **Request Body Hashing** - Ensures request integrity
- **Universal Crypto Support** - Works across all environments
- **Secure Headers** - Proper Authorization headers

Authentication is only required when the wallet backend has public keys configured. If no public keys are configured on the backend, the client can be used without authentication.

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
  baseUrl: string,                    // GraphQL endpoint URL
  options?: { authKey?: string }      // Optional authentication key
)
```

### Methods

- `request(query, variables?)` - Make GraphQL requests (authenticated if authKey provided)
- `rawRequest(query, variables?)` - Get raw response with errors, status, and headers
- `getJWT(query, variables?)` - Generate JWT for custom requests (requires authKey)

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