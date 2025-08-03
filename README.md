# @stellar/wallet-backend-client

A universal TypeScript GraphQL client for the Stellar Wallet Backend with built-in JWT authentication support. Works in Node.js, browsers, React, and React Native environments with zero Node.js dependencies.

## Installation

```bash
npm install @stellar/wallet-backend-client
```

## Quick Start

```typescript
import { WalletBackendClient } from '@stellar/wallet-backend-client';

// Initialize the client
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

- 🔐 **Built-in JWT Authentication** - Automatic JWT generation using Stellar Ed25519 keypairs
- 🌐 **Universal Compatibility** - Works in Node.js, browsers, React, and React Native
- 📝 **TypeScript Support** - Full type safety with generated GraphQL types
- 🚀 **GraphQL Request Integration** - Built on `graphql-request` for optimal performance
- 🧪 **Comprehensive Testing** - Unit and integration tests included
- 📦 **Zero Node.js Dependencies** - Lightweight and truly universal
- 🔄 **Async/Await Ready** - Modern JavaScript patterns throughout

## Environment Support

This client works in all JavaScript environments with **no Node.js engine requirements**:

- ✅ **Node.js** - Server-side applications
- ✅ **Browser** - React, Vue, Angular, vanilla JS
- ✅ **React Native** - Mobile applications
- ✅ **Next.js** - Server-side rendering and client-side
- ✅ **Electron** - Desktop applications
- ✅ **Deno** - Modern JavaScript runtime
- ✅ **Bun** - Fast JavaScript runtime

## Solution Overview

The project uses GraphQL Code Generator with a local schema file to generate TypeScript types and client code. The client includes automatic JWT authentication using Stellar Ed25519 keypairs with universal crypto support.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the codegen to generate the TypeScript client:
   ```bash
   npm run codegen
   ```

## How it works

The project uses GraphQL Code Generator with a local schema file:

- `schema.graphql`: Contains the GraphQL schema extracted from the wallet-backend project
- `codegen.ts`: GraphQL Code Generator configuration
- `src/gql/`: Generated TypeScript client code
- `src/graphql-client.ts`: Client wrapper with JWT authentication
- `src/jwt-generator.ts`: JWT generation utility

## Files

- `codegen.ts`: GraphQL Code Generator configuration
- `schema.graphql`: Local GraphQL schema file
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project dependencies and scripts
- `src/gql/`: Generated TypeScript client files
- `src/graphql-client.ts`: GraphQL client with JWT authentication
- `src/jwt-generator.ts`: JWT generation utility
- `tests/`: Unit and integration tests

## Testing

The project includes comprehensive unit and integration tests:

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- `tests/jwt-generator.test.ts`: Unit tests for JWT generation
- `tests/graphql-client.test.ts`: Unit tests for GraphQL client
- `tests/integration.test.ts`: Integration tests with real server

### Test Coverage

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test with the actual wallet backend server
- **Error Handling**: Test various error scenarios
- **Authentication**: Test JWT generation and validation

### Integration Test Configuration

Integration tests require a running wallet backend server and proper authentication. To configure:

1. **Create a `.env` file** in the project root:
   ```bash
   CLIENT_AUTH_PRIVATE_KEY=your-stellar-private-key-here
   GRAPHQL_BASE_URL=http://localhost:8001/graphql/query
   JWT_AUDIENCE=api
   ```

2. **Start the wallet backend server** on `http://localhost:8001`

3. **Run integration tests**:
   ```bash
   npm test
   ```

**Note**: All environment variables are required for integration tests to run.

## Generated Client

The generated client includes:

- TypeScript types for all GraphQL types (Account, Transaction, Operation, etc.)
- Enums for OperationType, StateChangeCategory, StateChangeReason
- Input types for mutations
- Proper scalar type mappings

## Usage

The client provides a simple interface for making authenticated GraphQL requests to the wallet-backend API.

### Basic Usage Examples

#### 1. Initialize the Client

```typescript
import { WalletBackendClient } from '@stellar/wallet-backend-client';

// Initialize with your Stellar private key, baseUrl, and audience
const client = new WalletBackendClient(
  'your-stellar-private-key', 
  'http://localhost:8001/graphql/query',
  'api'
);

// For production environments, use the hostname as audience
const prodClient = new WalletBackendClient(
  'your-stellar-private-key',
  'https://api.example.com/graphql/query',
  'api.example.com'
);
```

#### 2. Query a Transaction by Hash

```typescript
import { WalletBackendClient } from '@stellar/wallet-backend-client';

const GET_TRANSACTION = `
  query GetTransaction($hash: String!) {
    transactionByHash(hash: $hash) {
      hash
      envelopeXdr
      resultXdr
      metaXdr
      ledgerNumber
      ledgerCreatedAt
      ingestedAt
      operations {
        id
        operationType
        operationXdr
        ledgerNumber
        ledgerCreatedAt
        ingestedAt
      }
      accounts {
        address
      }
      stateChanges {
        id
        accountId
        stateChangeCategory
        stateChangeReason
        ledgerNumber
        ledgerCreatedAt
        ingestedAt
      }
    }
  }
`;

async function getTransaction(hash: string) {
  const client = new WalletBackendClient(
    'your-stellar-private-key',
    'http://localhost:8001/graphql/query',
    'api'
  );
  
  try {
    const data = await client.request(GET_TRANSACTION, { hash });
    return data.transactionByHash;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}
```

#### 3. Query Recent Transactions

```typescript
import { WalletBackendClient } from '@stellar/wallet-backend-client';

const GET_TRANSACTIONS = `
  query GetTransactions($limit: Int) {
    transactions(limit: $limit) {
      hash
      envelopeXdr
      resultXdr
      metaXdr
      ledgerNumber
      ledgerCreatedAt
      ingestedAt
      operations {
        id
        operationType
        operationXdr
      }
      accounts {
        address
      }
    }
  }
`;

async function getRecentTransactions(limit: number = 10) {
  const client = new WalletBackendClient(
    'your-stellar-private-key',
    'http://localhost:8001/graphql/query',
    'api'
  );
  
  try {
    const data = await client.request(GET_TRANSACTIONS, { limit });
    return data.transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}
```

#### 4. Query Account Information

```typescript
import { WalletBackendClient } from '@stellar/wallet-backend-client';

const GET_ACCOUNT = `
  query GetAccount($address: String!) {
    account(address: $address) {
      address
      transactions {
        hash
        ledgerNumber
        ledgerCreatedAt
        operations {
          id
          operationType
        }
      }
      operations {
        id
        operationType
        ledgerNumber
        ledgerCreatedAt
      }
      stateChanges {
        id
        stateChangeCategory
        stateChangeReason
        ledgerNumber
        ledgerCreatedAt
      }
    }
  }
`;

async function getAccountInfo(address: string) {
  const client = new WalletBackendClient(
    'your-stellar-private-key',
    'http://localhost:8001/graphql/query',
    'api'
  );
  
  try {
    const data = await client.request(GET_ACCOUNT, { address });
    return data.account;
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
}
```

#### 5. Query Recent Operations

```typescript
import { WalletBackendClient } from '@stellar/wallet-backend-client';

const GET_OPERATIONS = `
  query GetOperations($limit: Int) {
    operations(limit: $limit) {
      id
      operationType
      operationXdr
      ledgerNumber
      ledgerCreatedAt
      ingestedAt
      transaction {
        hash
        ledgerNumber
      }
      accounts {
        address
      }
      stateChanges {
        id
        stateChangeCategory
        stateChangeReason
      }
    }
  }
`;

async function getRecentOperations(limit: number = 10) {
  const client = new WalletBackendClient(
    'your-stellar-private-key',
    'http://localhost:8001/graphql/query',
    'api'
  );
  
  try {
    const data = await client.request(GET_OPERATIONS, { limit });
    return data.operations;
  } catch (error) {
    console.error('Error fetching operations:', error);
    throw error;
  }
}
```

#### 6. Register an Account (Mutation)

```typescript
import { WalletBackendClient } from '@stellar/wallet-backend-client';

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

async function registerAccount(address: string) {
  const client = new WalletBackendClient(
    'your-stellar-private-key',
    'http://localhost:8001/graphql/query',
    'api'
  );
  
  try {
    const data = await client.request(REGISTER_ACCOUNT, { 
      input: { address } 
    });
    return data.registerAccount;
  } catch (error) {
    console.error('Error registering account:', error);
    throw error;
  }
}
```

#### 7. Raw Request with Error Handling

```typescript
import { WalletBackendClient } from '@stellar/wallet-backend-client';

const GET_TRANSACTION = `
  query GetTransaction($hash: String!) {
    transactionByHash(hash: $hash) {
      hash
      ledgerNumber
    }
  }
`;

async function getTransactionWithErrors(hash: string) {
  const client = new WalletBackendClient(
    'your-stellar-private-key',
    'http://localhost:8001/graphql/query',
    'api'
  );
  
  try {
    const result = await client.rawRequest(GET_TRANSACTION, { hash });
    
    if (result.errors && result.errors.length > 0) {
      console.error('GraphQL errors:', result.errors);
      throw new Error('GraphQL query failed');
    }
    
    return result.data.transactionByHash;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}
```

### Type Safety

The generated client provides full TypeScript type safety:

```typescript
import { Transaction, Operation, Account, OperationType } from '@stellar/wallet-backend-client';

// All types are properly typed
function processTransaction(tx: Transaction) {
  console.log(`Transaction ${tx.hash} at ledger ${tx.ledgerNumber}`);
  
  tx.operations.forEach((op: Operation) => {
    console.log(`Operation ${op.id} of type ${op.operationType}`);
  });
  
  tx.accounts.forEach((account: Account) => {
    console.log(`Account ${account.address}`);
  });
}

// Enums are also typed
function isPaymentOperation(operationType: OperationType): boolean {
  return operationType === OperationType.Payment;
}
```

### JWT Authentication

The client automatically handles JWT authentication with universal crypto support:

```typescript
import { WalletBackendClient, JwtGenerator } from '@stellar/wallet-backend-client';

// The client automatically generates JWTs for each request
const client = new WalletBackendClient(
  'your-stellar-private-key',
  'http://localhost:8001/graphql/query',
  'api'
);

// You can also generate JWTs manually if needed
// The audience is set in the constructor
const jwt = await client.getJWT('your-query-string');

// Or access the JWT generator directly for more control
const jwtGenerator = new JwtGenerator('your-stellar-private-key');
const jwt = await jwtGenerator.generateJWT('your-query-string', undefined, 'api');
const publicKey = jwtGenerator.getPublicKey();
```

## Authentication

The client automatically generates JWTs using your Stellar private key for each request. The JWT includes:

- **Header**: EdDSA algorithm with your public key as the key ID
- **Payload**: Issuer, subject, audience, timestamps, and body hash
- **Signature**: Ed25519 signature using your private key
- **Universal Crypto**: Works in Node.js, browsers, and React Native

The JWT is automatically included in the Authorization header for all requests to the wallet-backend GraphQL endpoint at `http://localhost:8001/graphql/query`. 