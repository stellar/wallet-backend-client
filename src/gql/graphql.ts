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
  BigInt: { input: any; output: any; }
  Time: { input: any; output: any; }
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
  id: Scalars['String']['output'];
  ingestedAt: Scalars['Time']['output'];
  ledgerCreatedAt: Scalars['Time']['output'];
  ledgerNumber: Scalars['Int']['output'];
  operationType: OperationType;
  operationXdr: Scalars['String']['output'];
  stateChanges: Array<StateChange>;
  transaction: Transaction;
};

export enum OperationType {
  AccountMerge = 'ACCOUNT_MERGE',
  AllowTrust = 'ALLOW_TRUST',
  BeginSponsoringFutureReserves = 'BEGIN_SPONSORING_FUTURE_RESERVES',
  BumpFootprintExpiration = 'BUMP_FOOTPRINT_EXPIRATION',
  BumpSequence = 'BUMP_SEQUENCE',
  ChangeTrust = 'CHANGE_TRUST',
  ClaimClaimableBalance = 'CLAIM_CLAIMABLE_BALANCE',
  Clawback = 'CLAWBACK',
  ClawbackClaimableBalance = 'CLAWBACK_CLAIMABLE_BALANCE',
  CreateAccount = 'CREATE_ACCOUNT',
  CreateClaimableBalance = 'CREATE_CLAIMABLE_BALANCE',
  CreatePassiveSellOffer = 'CREATE_PASSIVE_SELL_OFFER',
  EndSponsoringFutureReserves = 'END_SPONSORING_FUTURE_RESERVES',
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
  ledgerNumber: Scalars['Int']['output'];
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
  AccountCreated = 'ACCOUNT_CREATED',
  AccountRemoved = 'ACCOUNT_REMOVED',
  AccountUpdated = 'ACCOUNT_UPDATED',
  ClaimableBalanceClaimed = 'CLAIMABLE_BALANCE_CLAIMED',
  ClaimableBalanceCreated = 'CLAIMABLE_BALANCE_CREATED',
  ClaimableBalanceRemoved = 'CLAIMABLE_BALANCE_REMOVED',
  ConfigSettingCreated = 'CONFIG_SETTING_CREATED',
  ConfigSettingRemoved = 'CONFIG_SETTING_REMOVED',
  ConfigSettingUpdated = 'CONFIG_SETTING_UPDATED',
  ContractCodeCreated = 'CONTRACT_CODE_CREATED',
  ContractCodeRemoved = 'CONTRACT_CODE_REMOVED',
  ContractCodeUpdated = 'CONTRACT_CODE_UPDATED',
  ContractDataCreated = 'CONTRACT_DATA_CREATED',
  ContractDataRemoved = 'CONTRACT_DATA_REMOVED',
  ContractDataUpdated = 'CONTRACT_DATA_UPDATED',
  DataCreated = 'DATA_CREATED',
  DataRemoved = 'DATA_REMOVED',
  DataUpdated = 'DATA_UPDATED',
  ExpirationCreated = 'EXPIRATION_CREATED',
  ExpirationRemoved = 'EXPIRATION_REMOVED',
  ExpirationUpdated = 'EXPIRATION_UPDATED',
  LiquidityPoolCreated = 'LIQUIDITY_POOL_CREATED',
  LiquidityPoolRemoved = 'LIQUIDITY_POOL_REMOVED',
  LiquidityPoolUpdated = 'LIQUIDITY_POOL_UPDATED',
  OfferCreated = 'OFFER_CREATED',
  OfferRemoved = 'OFFER_REMOVED',
  OfferUpdated = 'OFFER_UPDATED',
  SignerCreated = 'SIGNER_CREATED',
  SignerRemoved = 'SIGNER_REMOVED',
  SignerUpdated = 'SIGNER_UPDATED',
  TrustlineCreated = 'TRUSTLINE_CREATED',
  TrustlineRemoved = 'TRUSTLINE_REMOVED',
  TrustlineUpdated = 'TRUSTLINE_UPDATED'
}

export enum StateChangeReason {
  AccountMergeFrom = 'ACCOUNT_MERGE_FROM',
  AccountMergeTo = 'ACCOUNT_MERGE_TO',
  ClaimableBalanceClaimant = 'CLAIMABLE_BALANCE_CLAIMANT',
  ClaimableBalanceCreated = 'CLAIMABLE_BALANCE_CREATED',
  ClaimableBalanceUpdated = 'CLAIMABLE_BALANCE_UPDATED',
  ConfigSettingCreated = 'CONFIG_SETTING_CREATED',
  ConfigSettingRemoved = 'CONFIG_SETTING_REMOVED',
  ConfigSettingUpdated = 'CONFIG_SETTING_UPDATED',
  ContractCodeCreated = 'CONTRACT_CODE_CREATED',
  ContractCodeRemoved = 'CONTRACT_CODE_REMOVED',
  ContractCodeUpdated = 'CONTRACT_CODE_UPDATED',
  ContractDataCreated = 'CONTRACT_DATA_CREATED',
  ContractDataRemoved = 'CONTRACT_DATA_REMOVED',
  ContractDataUpdated = 'CONTRACT_DATA_UPDATED',
  ExpirationCreated = 'EXPIRATION_CREATED',
  ExpirationRemoved = 'EXPIRATION_REMOVED',
  ExpirationUpdated = 'EXPIRATION_UPDATED',
  LiquidityPoolCreated = 'LIQUIDITY_POOL_CREATED',
  LiquidityPoolRemoved = 'LIQUIDITY_POOL_REMOVED',
  LiquidityPoolUpdated = 'LIQUIDITY_POOL_UPDATED',
  OfferCreated = 'OFFER_CREATED',
  OfferRemoved = 'OFFER_REMOVED',
  OfferUpdated = 'OFFER_UPDATED',
  PaymentFrom = 'PAYMENT_FROM',
  PaymentTo = 'PAYMENT_TO',
  TrustlineCreated = 'TRUSTLINE_CREATED',
  TrustlineRemoved = 'TRUSTLINE_REMOVED',
  TrustlineUpdated = 'TRUSTLINE_UPDATED'
}

export type Transaction = {
  __typename?: 'Transaction';
  accounts: Array<Account>;
  envelopeXdr: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  ingestedAt: Scalars['Time']['output'];
  ledgerCreatedAt: Scalars['Time']['output'];
  ledgerNumber: Scalars['Int']['output'];
  metaXdr: Scalars['String']['output'];
  operations: Array<Operation>;
  resultXdr: Scalars['String']['output'];
  stateChanges: Array<StateChange>;
};
