/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Int64: { input: any; output: any; }
  Time: { input: any; output: any; }
  UInt32: { input: any; output: any; }
};

export type Account = {
  __typename?: 'Account';
  address: Scalars['String']['output'];
  operations?: Maybe<OperationConnection>;
  stateChanges?: Maybe<StateChangeConnection>;
  transactions?: Maybe<TransactionConnection>;
};


export type AccountOperationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type AccountStateChangesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type AccountTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type BuildTransactionInput = {
  transaction: TransactionInput;
};

export type BuildTransactionPayload = {
  __typename?: 'BuildTransactionPayload';
  success: Scalars['Boolean']['output'];
  transactionXdr: Scalars['String']['output'];
};

export type DeregisterAccountInput = {
  address: Scalars['String']['input'];
};

export type DeregisterAccountPayload = {
  __typename?: 'DeregisterAccountPayload';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  buildTransaction: BuildTransactionPayload;
  deregisterAccount: DeregisterAccountPayload;
  registerAccount: RegisterAccountPayload;
};


export type MutationBuildTransactionArgs = {
  input: BuildTransactionInput;
};


export type MutationDeregisterAccountArgs = {
  input: DeregisterAccountInput;
};


export type MutationRegisterAccountArgs = {
  input: RegisterAccountInput;
};

export type Operation = {
  __typename?: 'Operation';
  accounts: Array<Account>;
  id: Scalars['Int64']['output'];
  ingestedAt: Scalars['Time']['output'];
  ledgerCreatedAt: Scalars['Time']['output'];
  ledgerNumber: Scalars['UInt32']['output'];
  operationType: OperationType;
  operationXdr: Scalars['String']['output'];
  stateChanges?: Maybe<StateChangeConnection>;
  transaction: Transaction;
};


export type OperationStateChangesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type OperationConnection = {
  __typename?: 'OperationConnection';
  edges?: Maybe<Array<OperationEdge>>;
  pageInfo: PageInfo;
};

export type OperationEdge = {
  __typename?: 'OperationEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Operation>;
};

export enum OperationType {
  AccountMerge = 'ACCOUNT_MERGE',
  AllowTrust = 'ALLOW_TRUST',
  BeginSponsoringFutureReserves = 'BEGIN_SPONSORING_FUTURE_RESERVES',
  BumpSequence = 'BUMP_SEQUENCE',
  ChangeTrust = 'CHANGE_TRUST',
  ClaimClaimableBalance = 'CLAIM_CLAIMABLE_BALANCE',
  Clawback = 'CLAWBACK',
  ClawbackClaimableBalance = 'CLAWBACK_CLAIMABLE_BALANCE',
  CreateAccount = 'CREATE_ACCOUNT',
  CreateClaimableBalance = 'CREATE_CLAIMABLE_BALANCE',
  CreatePassiveSellOffer = 'CREATE_PASSIVE_SELL_OFFER',
  EndSponsoringFutureReserves = 'END_SPONSORING_FUTURE_RESERVES',
  ExtendFootprintTtl = 'EXTEND_FOOTPRINT_TTL',
  Inflation = 'INFLATION',
  InvokeHostFunction = 'INVOKE_HOST_FUNCTION',
  LiquidityPoolDeposit = 'LIQUIDITY_POOL_DEPOSIT',
  LiquidityPoolWithdraw = 'LIQUIDITY_POOL_WITHDRAW',
  ManageBuyOffer = 'MANAGE_BUY_OFFER',
  ManageData = 'MANAGE_DATA',
  ManageSellOffer = 'MANAGE_SELL_OFFER',
  PathPaymentStrictReceive = 'PATH_PAYMENT_STRICT_RECEIVE',
  PathPaymentStrictSend = 'PATH_PAYMENT_STRICT_SEND',
  Payment = 'PAYMENT',
  RestoreFootprint = 'RESTORE_FOOTPRINT',
  RevokeSponsorship = 'REVOKE_SPONSORSHIP',
  SetOptions = 'SET_OPTIONS',
  SetTrustLineFlags = 'SET_TRUST_LINE_FLAGS'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  accountByAddress?: Maybe<Account>;
  operationById?: Maybe<Operation>;
  operations?: Maybe<OperationConnection>;
  stateChanges?: Maybe<StateChangeConnection>;
  transactionByHash?: Maybe<Transaction>;
  transactions?: Maybe<TransactionConnection>;
};


export type QueryAccountByAddressArgs = {
  address: Scalars['String']['input'];
};


export type QueryOperationByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type QueryOperationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryStateChangesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTransactionByHashArgs = {
  hash: Scalars['String']['input'];
};


export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type RegisterAccountInput = {
  address: Scalars['String']['input'];
};

export type RegisterAccountPayload = {
  __typename?: 'RegisterAccountPayload';
  account?: Maybe<Account>;
  success: Scalars['Boolean']['output'];
};

export type SimulationResultInput = {
  error?: InputMaybe<Scalars['String']['input']>;
  events?: InputMaybe<Array<Scalars['String']['input']>>;
  latestLedger?: InputMaybe<Scalars['Int']['input']>;
  minResourceFee?: InputMaybe<Scalars['String']['input']>;
  results?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionData?: InputMaybe<Scalars['String']['input']>;
};

export type StateChange = {
  __typename?: 'StateChange';
  accountId: Scalars['String']['output'];
  amount?: Maybe<Scalars['String']['output']>;
  claimableBalanceId?: Maybe<Scalars['String']['output']>;
  flags: Array<Scalars['String']['output']>;
  ingestedAt: Scalars['Time']['output'];
  keyValue?: Maybe<Scalars['String']['output']>;
  ledgerCreatedAt: Scalars['Time']['output'];
  ledgerNumber: Scalars['UInt32']['output'];
  liquidityPoolId?: Maybe<Scalars['String']['output']>;
  offerId?: Maybe<Scalars['String']['output']>;
  operation?: Maybe<Operation>;
  signerAccountId?: Maybe<Scalars['String']['output']>;
  signerWeights?: Maybe<Scalars['String']['output']>;
  spenderAccountId?: Maybe<Scalars['String']['output']>;
  sponsorAccountId?: Maybe<Scalars['String']['output']>;
  sponsoredAccountId?: Maybe<Scalars['String']['output']>;
  stateChangeCategory: StateChangeCategory;
  stateChangeReason?: Maybe<StateChangeReason>;
  thresholds?: Maybe<Scalars['String']['output']>;
  tokenId?: Maybe<Scalars['String']['output']>;
  transaction: Transaction;
};

export enum StateChangeCategory {
  Allowance = 'ALLOWANCE',
  Authorization = 'AUTHORIZATION',
  Burn = 'BURN',
  Contract = 'CONTRACT',
  Credit = 'CREDIT',
  Debit = 'DEBIT',
  Flags = 'FLAGS',
  Liability = 'LIABILITY',
  Metadata = 'METADATA',
  Mint = 'MINT',
  SignatureThreshold = 'SIGNATURE_THRESHOLD',
  Signer = 'SIGNER',
  Sponsorship = 'SPONSORSHIP',
  TrustlineFlags = 'TRUSTLINE_FLAGS',
  Unsupported = 'UNSUPPORTED'
}

export type StateChangeConnection = {
  __typename?: 'StateChangeConnection';
  edges?: Maybe<Array<StateChangeEdge>>;
  pageInfo: PageInfo;
};

export type StateChangeEdge = {
  __typename?: 'StateChangeEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<StateChange>;
};

export enum StateChangeReason {
  Add = 'ADD',
  Buy = 'BUY',
  Clear = 'CLEAR',
  Consume = 'CONSUME',
  DataEntry = 'DATA_ENTRY',
  Deploy = 'DEPLOY',
  High = 'HIGH',
  HomeDomain = 'HOME_DOMAIN',
  Invoke = 'INVOKE',
  Low = 'LOW',
  Medium = 'MEDIUM',
  Remove = 'REMOVE',
  Sell = 'SELL',
  Set = 'SET',
  Update = 'UPDATE'
}

export type Transaction = {
  __typename?: 'Transaction';
  accounts: Array<Account>;
  envelopeXdr: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  ingestedAt: Scalars['Time']['output'];
  ledgerCreatedAt: Scalars['Time']['output'];
  ledgerNumber: Scalars['UInt32']['output'];
  metaXdr: Scalars['String']['output'];
  operations?: Maybe<OperationConnection>;
  resultXdr: Scalars['String']['output'];
  stateChanges?: Maybe<StateChangeConnection>;
};


export type TransactionOperationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type TransactionStateChangesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type TransactionConnection = {
  __typename?: 'TransactionConnection';
  edges?: Maybe<Array<TransactionEdge>>;
  pageInfo: PageInfo;
};

export type TransactionEdge = {
  __typename?: 'TransactionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Transaction>;
};

export type TransactionInput = {
  operations: Array<Scalars['String']['input']>;
  simulationResult?: InputMaybe<SimulationResultInput>;
  timeout: Scalars['Int']['input'];
};
