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
  operations: Array<Operation>;
  stateChanges: Array<StateChange>;
  transactions: Array<Transaction>;
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
  deregisterAccount: DeregisterAccountPayload;
  registerAccount: RegisterAccountPayload;
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
  stateChanges: Array<StateChange>;
  transaction: Transaction;
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

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  operations: Array<Operation>;
  stateChanges: Array<StateChange>;
  transactionByHash?: Maybe<Transaction>;
  transactions: Array<Transaction>;
};


export type QueryAccountArgs = {
  address: Scalars['String']['input'];
};


export type QueryOperationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryStateChangesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTransactionByHashArgs = {
  hash: Scalars['String']['input'];
};


export type QueryTransactionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type RegisterAccountInput = {
  address: Scalars['String']['input'];
};

export type RegisterAccountPayload = {
  __typename?: 'RegisterAccountPayload';
  account?: Maybe<Account>;
  success: Scalars['Boolean']['output'];
};

export type StateChange = {
  __typename?: 'StateChange';
  accountId: Scalars['String']['output'];
  amount?: Maybe<Scalars['String']['output']>;
  claimableBalanceId?: Maybe<Scalars['String']['output']>;
  flags: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  ingestedAt: Scalars['Time']['output'];
  keyValue?: Maybe<Scalars['String']['output']>;
  ledgerCreatedAt: Scalars['Time']['output'];
  ledgerNumber: Scalars['UInt32']['output'];
  liquidityPoolId?: Maybe<Scalars['String']['output']>;
  offerId?: Maybe<Scalars['String']['output']>;
  operation: Operation;
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
  operations: Array<Operation>;
  resultXdr: Scalars['String']['output'];
  stateChanges: Array<StateChange>;
};
