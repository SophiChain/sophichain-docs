---
id: flowcharts
title: FinanceHub Flowcharts
sidebar_label: Flowcharts
---
id: flowcharts
# SophiChain FinanceHub - Architecture Flowcharts

This document contains comprehensive flowcharts for understanding the FinanceHub module architecture and key workflows.

---

id: flowcharts
## Table of Contents

- [1. Module Architecture Overview](#1-module-architecture-overview)
  - [1. Module Architecture Overview](#1-module-architecture-overview)
  - [2. Payment Flow (Complete)](#2-payment-flow-complete)
  - [3. Invoice Creation \& Payment](#3-invoice-creation--payment)
  - [4. Wallet Operations](#4-wallet-operations)
  - [5. Currency Conversion Flow](#5-currency-conversion-flow)
  - [6. Exchange Rate Update Flow](#6-exchange-rate-update-flow)
  - [7. Event-Driven Architecture](#7-event-driven-architecture)
  - [8. Pluggable Provider Architecture](#8-pluggable-provider-architecture)
  - [9. DeFi Treasury Auto-Conversion](#9-defi-treasury-auto-conversion)
  - [10. Gamification Reward Flow](#10-gamification-reward-flow)
  - [Additional Diagrams](#additional-diagrams)
    - [Entity Relationship Overview](#entity-relationship-overview)
    - [Permission Hierarchy](#permission-hierarchy)
  - [Summary](#summary)

---

id: flowcharts
## 1. Module Architecture Overview

```mermaid
graph TB
    subgraph "UI Layer"
        BlazorPages[Blazor Pages/Components]
    end
    
    subgraph "Application Layer"
        AppServices[Application Services]
        EventHandlers[Event Handlers]
        DTOs[DTOs & Mapping]
    end
    
    subgraph "Domain Layer"
        Aggregates[Aggregate Roots]
        DomainServices[Domain Services]
        Repositories[Repository Interfaces]
        DomainEvents[Domain Events]
        Providers[Provider Interfaces]
    end
    
    subgraph "Domain.Shared Layer"
        Enums[Enums & Constants]
        ValueObjects[Value Objects]
        ErrorCodes[Error Codes]
    end
    
    subgraph "Infrastructure Layer"
        MongoDB[MongoDB Repositories]
        ExternalProviders[External Provider Implementations]
        BackgroundJobs[Background Jobs]
    end
    
    subgraph "Pluggable Providers"
        PaymentGateways[Payment Gateway Packages]
        ExchangeProviders[Exchange Provider Packages]
        DexProviders[DEX Provider Packages]
    end
    
    BlazorPages --> AppServices
    AppServices --> DomainServices
    AppServices --> Repositories
    AppServices --> EventHandlers
    DomainServices --> Aggregates
    DomainServices --> Repositories
    DomainServices --> Providers
    Aggregates --> DomainEvents
    Repositories --> MongoDB
    Providers --> ExternalProviders
    ExternalProviders --> PaymentGateways
    ExternalProviders --> ExchangeProviders
    ExternalProviders --> DexProviders
    
    AppServices -.uses.-> DTOs
    Aggregates -.uses.-> ValueObjects
    DomainServices -.uses.-> Enums
    AppServices -.throws.-> ErrorCodes
    
    style BlazorPages fill:#e1f5ff
    style AppServices fill:#fff4e6
    style DomainServices fill:#e8f5e9
    style Aggregates fill:#f3e5f5
    style MongoDB fill:#fce4ec
    style PaymentGateways fill:#fff9c4
    style ExchangeProviders fill:#fff9c4
    style DexProviders fill:#fff9c4
```

---

id: flowcharts
## 2. Payment Flow (Complete)

```mermaid
sequenceDiagram
    actor User
    participant UI as Blazor UI
    participant AppService as PaymentAppService
    participant Orchestrator as PaymentOrchestrator
    participant Validator as PaymentValidator
    participant Router as PaymentRouter
    participant InvoiceRepo as IInvoiceRepository
    participant GatewayRegistry as GatewayRegistry
    participant Gateway as IPaymentGateway
    participant PaymentRepo as IPaymentOrderRepository
    participant EventBus as Event Bus (Outbox)
    
    User->>UI: Click "Pay Invoice"
    UI->>AppService: InitiatePaymentAsync(invoiceId, gatewayId, amount)
    
    AppService->>Orchestrator: InitiatePaymentAsync(invoiceId, gatewayId, amount)
    
    Orchestrator->>Validator: ValidateInvoiceForPaymentAsync(invoiceId)
    Validator->>InvoiceRepo: GetAsync(invoiceId)
    InvoiceRepo-->>Validator: Invoice
    Validator->>Validator: Check Status = Pending
    Validator->>Validator: Check Amount Matches
    Validator-->>Orchestrator: Valid ✓
    
    Orchestrator->>Router: SelectGatewayAsync(currency, amount, preferredGatewayId)
    Router->>GatewayRegistry: GetGatewayByIdAsync(gatewayId)
    GatewayRegistry-->>Router: Gateway
    Router->>Validator: ValidateGatewaySupportsAsync(gateway, currency)
    Validator-->>Router: Supported ✓
    Router-->>Orchestrator: Selected Gateway
    
    Orchestrator->>Orchestrator: Create PaymentOrder Entity
    Orchestrator->>PaymentRepo: InsertAsync(paymentOrder)
    PaymentRepo-->>Orchestrator: PaymentOrder (with Id)
    
    Orchestrator->>Gateway: InitiatePaymentAsync(request)
    Gateway->>Gateway: Call External Gateway API
    Gateway-->>Orchestrator: GatewayInitResult (redirectUrl, externalId)
    
    Orchestrator->>Orchestrator: paymentOrder.AddLocalEvent(PaymentInitiatedEvent)
    Orchestrator-->>AppService: PaymentDto + redirectUrl
    
    AppService-->>UI: PaymentDto + redirectUrl
    UI->>User: Redirect to Gateway Payment Page
    
    User->>Gateway: Complete Payment on Gateway
    Gateway->>Gateway: Process Payment
    Gateway->>AppService: Callback/Webhook (externalTransactionId)
    
    AppService->>Orchestrator: CompletePaymentAsync(paymentOrderId, externalId)
    Orchestrator->>PaymentRepo: GetAsync(paymentOrderId)
    PaymentRepo-->>Orchestrator: PaymentOrder
    
    Orchestrator->>Gateway: GetPaymentStatusAsync(externalId)
    Gateway-->>Orchestrator: Status = Completed
    
    Orchestrator->>Orchestrator: paymentOrder.MarkAsCompleted()
    Orchestrator->>Orchestrator: paymentOrder.AddLocalEvent(PaymentCompletedEvent)
    Orchestrator->>PaymentRepo: UpdateAsync(paymentOrder)
    
    Orchestrator-->>AppService: Success
    AppService-->>EventBus: Publish PaymentCompletedEvent (via Outbox)
    
    EventBus-->>UI: Real-time update (SignalR)
    UI->>User: Show Success Message
    
    Note over EventBus: PaymentCompletedEvent triggers:<br/>- WalletManager.CreditAsync<br/>- InvoiceManager.MarkAsPaidAsync<br/>- GamificationEngine.EvaluateAsync<br/>- NotificationService.SendAsync
```

---

id: flowcharts
## 3. Invoice Creation & Payment

```mermaid
flowchart TD
    Start([User Creates Invoice]) --> CreateInvoice[InvoiceAppService.CreateAsync]
    
    CreateInvoice --> ValidateInput{Validate Input}
    ValidateInput -->|Invalid| ReturnError[Return 400 Bad Request]
    ValidateInput -->|Valid| CallManager[Call InvoiceManager.CreateAsync]
    
    CallManager --> GenerateNumber[Generate Invoice Number]
    GenerateNumber --> CalculateTotals[InvoiceCalculator.CalculateTotalAsync]
    
    CalculateTotals --> CreateEntity[Create Invoice Entity + Line Items]
    CreateEntity --> SaveInvoice[InvoiceRepository.InsertAsync]
    
    SaveInvoice --> PublishEvent[Invoice.AddLocalEvent<br/>InvoiceCreatedEvent]
    PublishEvent --> ReturnDto[Map to InvoiceDto & Return]
    
    ReturnDto --> EventHandler1[InvoiceCreatedEventHandler]
    EventHandler1 --> SendNotification[Send Invoice Email/SMS]
    EventHandler1 --> GeneratePDF[Queue PDF Generation Job]
    EventHandler1 --> ScheduleReminder[Schedule Due Date Reminder]
    
    ReturnDto --> UserViewsInvoice[User Views Invoice]
    
    UserViewsInvoice --> InitiatePayment[User Clicks Pay]
    InitiatePayment --> PaymentFlow[Payment Flow Starts]
    
    PaymentFlow --> PaymentCompletes{Payment<br/>Successful?}
    
    PaymentCompletes -->|Yes| PaymentCompletedEvent[PaymentCompletedEvent]
    PaymentCompletedEvent --> MarkPaid[InvoiceManager.MarkAsPaidAsync]
    MarkPaid --> UpdateStatus[Invoice.Status = Paid]
    UpdateStatus --> SaveUpdate[InvoiceRepository.UpdateAsync]
    SaveUpdate --> PublishPaidEvent[Invoice.AddLocalEvent<br/>InvoicePaidEvent]
    
    PublishPaidEvent --> PaidEventHandler[InvoicePaidEventHandler]
    PaidEventHandler --> SendReceipt[Generate & Send Receipt]
    PaidEventHandler --> WebhookNotify[Notify External Systems via Webhook]
    PaidEventHandler --> UpdateAnalytics[Update Payment Analytics]
    
    PaymentCompletes -->|No| PaymentFailedEvent[PaymentFailedEvent]
    PaymentFailedEvent --> ReleaseInvoice[Mark Invoice as Payment Failed]
    ReleaseInvoice --> NotifyFailure[Send Failure Notification]
    NotifyFailure --> SuggestAlternatives[Suggest Alternative Gateways]
    
    SendReceipt --> End([End])
    SuggestAlternatives --> End
    ReturnError --> End
    
    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style PaymentFlow fill:#fff4e6
    style CreateEntity fill:#e8f5e9
    style PublishEvent fill:#f3e5f5
    style EventHandler1 fill:#fce4ec
    style PaymentCompletedEvent fill:#f3e5f5
    style PaidEventHandler fill:#fce4ec
```

---

id: flowcharts
## 4. Wallet Operations

```mermaid
stateDiagram-v2
    [*] --> WalletCreation: User Registers
    
    WalletCreation --> Active: WalletManager.GetOrCreateWalletAsync
    
    state Active {
        [*] --> Idle
        
        Idle --> Processing_Credit: Credit Request
        Processing_Credit --> ValidateCredit: Validate Amount > 0
        ValidateCredit --> ExecuteCredit: WalletManager.CreditAsync
        ExecuteCredit --> AddTransaction: Create WalletTransaction (Credit)
        AddTransaction --> UpdateBalance: Balance += Amount
        UpdateBalance --> PublishCreditEvent: Publish WalletCreditedEvent
        PublishCreditEvent --> Idle: Success
        
        Idle --> Processing_Debit: Debit Request
        Processing_Debit --> ValidateDebit: Check Sufficient Balance
        ValidateDebit --> ExecuteDebit: WalletManager.DebitAsync
        ValidateDebit --> RejectDebit: Insufficient Balance
        RejectDebit --> Idle
        ExecuteDebit --> AddDebitTransaction: Create WalletTransaction (Debit)
        AddDebitTransaction --> DeductBalance: Balance -= Amount
        DeductBalance --> PublishDebitEvent: Publish WalletDebitedEvent
        PublishDebitEvent --> Idle: Success
        
        Idle --> Processing_Transfer: Transfer Request
        Processing_Transfer --> ValidateTransfer: Validate Both Wallets
        ValidateTransfer --> ExecuteTransfer: WalletManager.TransferAsync
        ExecuteTransfer --> DebitSource: Debit From Wallet
        DebitSource --> CreditTarget: Credit To Wallet
        CreditTarget --> PublishTransferEvent: Publish WalletTransferredEvent
        PublishTransferEvent --> Idle: Success
        
        Idle --> CheckThreshold: BalanceCalculator.CheckThresholds
        CheckThreshold --> TriggerLowBalance: Balance < Warning Level
        TriggerLowBalance --> SendWarning: Send Low Balance Alert
        SendWarning --> Idle
        CheckThreshold --> TriggerGamification: Balance > Milestone
        TriggerGamification --> EvaluateRules: GamificationEngine.EvaluateAsync
        EvaluateRules --> Idle
    }
    
    Active --> Frozen: Admin Freeze / Security Issue
    Frozen --> Active: Admin Unfreeze
    Frozen --> BlockOperations: All Operations Rejected
    BlockOperations --> Frozen
    
    Active --> Closed: User Closes Wallet
    Closed --> [*]
    
    note right of WalletCreation
        Auto-creates wallet for
        user + currency combination
        First time payment/credit
    end note
    
    note right of Frozen
        WalletFrozenEvent published
        - Cancel pending transactions
        - Send urgent notification
        - Log security event
    end note
```

---

id: flowcharts
## 5. Currency Conversion Flow

```mermaid
flowchart TD
    Start([Convert Amount Request]) --> GetRate[ExchangeRateManager.ConvertAmountAsync]
    
    GetRate --> CheckCache{Rate in<br/>Cache?}
    CheckCache -->|Yes| UseCached[Use Cached Rate]
    CheckCache -->|No| FindPath[ConversionPathFinder.FindBestPathAsync]
    
    FindPath --> CheckDirect{Direct Rate<br/>Exists?}
    CheckDirect -->|Yes| DirectPath[Use Direct Rate<br/>USD → EUR]
    CheckDirect -->|No| FindMultiHop[Find Multi-Hop Path]
    
    FindMultiHop --> SearchPaths[Graph Search Algorithm]
    SearchPaths --> Path1[Path 1: USD → BTC → EUR]
    SearchPaths --> Path2[Path 2: USD → USDT → EUR]
    SearchPaths --> Path3[Path 3: USD → ETH → EUR]
    
    Path1 --> CalculateCost1[Calculate Effective Rate + Fees]
    Path2 --> CalculateCost2[Calculate Effective Rate + Fees]
    Path3 --> CalculateCost3[Calculate Effective Rate + Fees]
    
    CalculateCost1 --> SelectBest{Select Best Path}
    CalculateCost2 --> SelectBest
    CalculateCost3 --> SelectBest
    
    SelectBest --> OptimalPath[Optimal Path Selected]
    DirectPath --> OptimalPath
    
    OptimalPath --> ExecuteConversion[ConversionCalculator.CalculateConvertedAmountAsync]
    UseCached --> ExecuteConversion
    
    ExecuteConversion --> ApplyRate[Apply Exchange Rate]
    ApplyRate --> ApplyFee[Apply Conversion Fee]
    ApplyFee --> ApplyMarkup[Apply Provider Markup]
    ApplyMarkup --> RoundAmount[Round to Currency Decimals]
    
    RoundAmount --> CreateResult[Create ConversionResult]
    CreateResult --> CacheResult[Cache Result for 5 minutes]
    CacheResult --> LogConversion[Log Conversion for Analytics]
    
    LogConversion --> ReturnResult[Return ConversionResultDto]
    ReturnResult --> End([End])
    
    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style FindMultiHop fill:#fff4e6
    style SelectBest fill:#e8f5e9
    style ExecuteConversion fill:#f3e5f5
```

**Multi-Hop Conversion Example:**
- Converting 100 USD to EUR
- Path: USD → BTC → EUR
- Step 1: 100 USD = 0.0025 BTC
- Step 2: 0.0025 BTC = 85 EUR
- Effective Rate: 1 USD = 0.85 EUR

---

id: flowcharts
## 6. Exchange Rate Update Flow

```mermaid
sequenceDiagram
    participant Scheduler as Background Job Scheduler
    participant Manager as ExchangeRateManager
    participant Registry as ExchangeProviderRegistry
    participant Provider1 as CoinGecko Provider
    participant Provider2 as CoinMarketCap Provider
    participant Provider3 as Manual Provider
    participant Cache as Distributed Cache
    participant Repo as IExchangeRateRepository
    participant EventBus as Event Bus
    
    Scheduler->>Manager: UpdateRatesFromAllProvidersAsync()
    
    Manager->>Registry: GetAllProvidersAsync()
    Registry-->>Manager: List<IExchangeProvider>
    
    par Fetch from all providers in parallel
        Manager->>Provider1: GetRatesAsync(currencyList)
        Manager->>Provider2: GetRatesAsync(currencyList)
        Manager->>Provider3: GetRatesAsync(currencyList)
    end
    
    Provider1-->>Manager: Rates (Priority: 10)
    Provider2-->>Manager: Rates (Priority: 20)
    Provider3-->>Manager: Rates (Priority: 100, Manual Override)
    
    Manager->>Manager: Merge Rates by Priority<br/>(Manual > CoinMarketCap > CoinGecko)
    
    loop For each currency pair
        Manager->>Manager: Compare with existing rate
        
        alt Rate changed by > 1%
            Manager->>Repo: UpdateAsync(exchangeRate)
            Manager->>Manager: rate.AddLocalEvent(ExchangeRateUpdatedEvent)
            Manager->>Cache: InvalidateCache(fromCurrency, toCurrency)
        else No significant change
            Manager->>Manager: Skip update
        end
    end
    
    Manager->>Repo: SaveChangesAsync()
    Manager-->>EventBus: Publish ExchangeRateUpdatedEvents (via Outbox)
    
    EventBus->>Cache: ExchangeRateUpdatedEventHandler
    Cache->>Cache: Invalidate all cached conversions
    
    EventBus->>Scheduler: Notify subscribed users of rate changes
    
    Note over Manager,EventBus: If provider fails health check:<br/>- Switch to backup provider<br/>- Send admin alert<br/>- Log incident
```

---

id: flowcharts
## 7. Event-Driven Architecture

```mermaid
flowchart TB
    subgraph "Domain Layer"
        Aggregate[Aggregate Root] -->|1. Business Logic| AddEvent[aggregate.AddLocalEvent<br/>new PaymentCompletedEvent]
        AddEvent -->|2. Store in Memory| EventList[In-Memory Event List]
    end
    
    subgraph "ABP UnitOfWork"
        SaveChanges[SaveChanges Called] -->|3. Single Transaction| DBWrite[Write Entity to Database]
        DBWrite -->|4. Same Transaction| OutboxWrite[Write Events to Outbox Table]
        OutboxWrite -->|5. Commit| TransactionCommit[COMMIT Transaction]
    end
    
    EventList -.triggers.-> SaveChanges
    
    subgraph "Background Worker"
        Worker[Outbox Worker<br/>Runs Every 5 Seconds] -->|6. Query| GetPendingEvents[SELECT * FROM Outbox<br/>WHERE Processed = false]
        GetPendingEvents -->|7. For Each Event| PublishEvent[Publish to Event Bus]
    end
    
    TransactionCommit -.eventually.-> Worker
    
    subgraph "Event Bus"
        PublishEvent -->|8. Route Event| Handler1[PaymentCompletedEventHandler]
        PublishEvent -->|8. Route Event| Handler2[WalletCreditedEventHandler]
        PublishEvent -->|8. Route Event| Handler3[InvoiceMarkedPaidHandler]
        PublishEvent -->|8. Route Event| Handler4[GamificationRewardHandler]
    end
    
    subgraph "Handler Execution"
        Handler1 -->|9. Execute| Logic1[Credit User Wallet]
        Handler2 -->|9. Execute| Logic2[Update Wallet Balance]
        Handler3 -->|9. Execute| Logic3[Mark Invoice as Paid]
        Handler4 -->|9. Execute| Logic4[Apply Gamification Rewards]
        
        Logic1 -->|10. Success| MarkProcessed1[Mark Event Processed in Outbox]
        Logic2 -->|10. Success| MarkProcessed2[Mark Event Processed in Outbox]
        Logic3 -->|10. Success| MarkProcessed3[Mark Event Processed in Outbox]
        Logic4 -->|10. Success| MarkProcessed4[Mark Event Processed in Outbox]
        
        Logic1 -->|10. Failure| RetryLater1[Log Error, Retry After Delay]
        Logic2 -->|10. Failure| RetryLater2[Log Error, Retry After Delay]
    end
    
    MarkProcessed1 --> Complete([Event Processing Complete])
    MarkProcessed2 --> Complete
    MarkProcessed3 --> Complete
    MarkProcessed4 --> Complete
    
    RetryLater1 -.automatic retry.-> Handler1
    RetryLater2 -.automatic retry.-> Handler2
    
    style Aggregate fill:#e1f5ff
    style SaveChanges fill:#fff4e6
    style Worker fill:#e8f5e9
    style Handler1 fill:#f3e5f5
    style Handler2 fill:#f3e5f5
    style Handler3 fill:#f3e5f5
    style Handler4 fill:#f3e5f5
    style Complete fill:#c8e6c9
```

**Event Processing Guarantees:**
- ✓ Events never lost (stored in outbox table)
- ✓ At-least-once delivery (automatic retries)
- ✓ Eventual consistency (handled asynchronously)
- ✓ Automatic retries on failure
- ✓ Idempotency (same event processed once)

---

id: flowcharts
## 8. Pluggable Provider Architecture

```mermaid
flowchart TB
    subgraph "Domain Layer - Interfaces"
        IGateway[IPaymentGateway Interface]
        IExchange[IExchangeProvider Interface]
        IDex[IDexProvider Interface]
    end
    
    subgraph "Consumer Application Module"
        AppModule[Application Module<br/>DependsOn FinanceHubModule]
    end
    
    subgraph "Provider Packages (Separate NuGet)"
        StripePackage[SophiChain.FinanceHub<br/>.PaymentGateways.Stripe]
        PayPalPackage[SophiChain.FinanceHub<br/>.PaymentGateways.PayPal]
        CoinGeckoPackage[SophiChain.FinanceHub<br/>.ExchangeProviders.CoinGecko]
        PancakeSwapPackage[SophiChain.FinanceHub<br/>.DexProviders.PancakeSwap]
    end
    
    StripePackage -->|implements| IGateway
    PayPalPackage -->|implements| IGateway
    CoinGeckoPackage -->|implements| IExchange
    PancakeSwapPackage -->|implements| IDex
    
    subgraph "Provider Implementation"
        StripeAdapter[StripeGatewayAdapter : IPaymentGateway]
        StripeModule[StripeModule : AbpModule]
        StripeOptions[StripeOptions Configuration]
        
        StripeModule -.registers.-> StripeAdapter
        StripeModule -.configures.-> StripeOptions
    end
    
    StripePackage --> StripeAdapter
    StripePackage --> StripeModule
    StripePackage --> StripeOptions
    
    AppModule -->|1. Installs NuGet| StripePackage
    AppModule -->|2. DependsOn| StripeModule
    AppModule -->|3. Configures appsettings.json| StripeOptions
    
    subgraph "Runtime - ABP DI Container"
        Container[Dependency Injection Container]
        Container -->|Auto-discovers| AllGateways[IEnumerable&lt;IPaymentGateway&gt;]
        Container -->|Auto-discovers| AllExchange[IEnumerable&lt;IExchangeProvider&gt;]
        Container -->|Auto-discovers| AllDex[IEnumerable&lt;IDexProvider&gt;]
    end
    
    StripeAdapter -.registered in.-> Container
    
    subgraph "Application Services Use Providers"
        PaymentService[PaymentAppService]
        Registry[GatewayRegistry]
        
        Registry -->|Injects| AllGateways
        Registry -->|4. Provides Lookup| GetByCode[GetGatewayByCodeAsync]
        Registry -->|4. Provides Lookup| GetForCurrency[GetGatewaysForCurrencyAsync]
        
        PaymentService -->|5. Uses| Registry
    end
    
    Container --> Registry
    
    subgraph "Payment Flow"
        UserRequest[User Initiates Payment] --> PaymentService
        PaymentService -->|6. Select Gateway| Registry
        Registry -->|7. Return| StripeAdapter
        PaymentService -->|8. Call| InitiatePayment[gateway.InitiatePaymentAsync]
        InitiatePayment -->|9. Calls| StripeAPI[Stripe API]
    end
    
    StripeAdapter --> InitiatePayment
    
    style IGateway fill:#e1f5ff
    style StripePackage fill:#fff4e6
    style StripeAdapter fill:#e8f5e9
    style Container fill:#f3e5f5
    style Registry fill:#fce4ec
```

**Key Benefits:**
- ✓ Zero source code changes needed to add providers
- ✓ Add providers via NuGet packages
- ✓ Auto-discovery through ABP DI
- ✓ Easy testing with mock providers
- ✓ Third-party extensibility for developers

---

id: flowcharts
## 9. DeFi Treasury Auto-Conversion

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin UI
    participant TreasuryService as TreasuryAppService
    participant TreasuryManager as TreasuryManager
    participant ConversionOrchestrator as ConversionOrchestrator
    participant DexRegistry as DexProviderRegistry
    participant PancakeSwap as PancakeSwapDexProvider
    participant Blockchain as BNB Chain
    participant WalletManager as WalletManager
    participant EventBus as Event Bus
    
    Admin->>UI: Configure Auto-Conversion Rule
    UI->>TreasuryService: CreateConversionRuleAsync(rule)
    Note over UI,TreasuryService: Rule: When USDT balance > 1000,<br/>convert 50% to BNB
    
    TreasuryService->>TreasuryManager: ConfigureAutoConversionAsync(rule)
    TreasuryManager->>TreasuryManager: Validate Rule
    TreasuryManager->>TreasuryManager: Save Rule to DB
    TreasuryManager-->>TreasuryService: Success
    TreasuryService-->>UI: Rule Created
    
    Note over TreasuryManager: Background Job monitors balances every 5 minutes
    
    TreasuryManager->>TreasuryManager: CheckAutoConversionTriggersAsync()
    TreasuryManager->>TreasuryManager: USDT Balance = 1200 > 1000 ✓
    TreasuryManager->>TreasuryManager: Trigger Conversion (600 USDT → BNB)
    
    TreasuryManager->>ConversionOrchestrator: ExecuteConversionAsync(fromToken: USDT, toToken: BNB, amount: 600)
    
    ConversionOrchestrator->>DexRegistry: SelectBestDexAsync(USDT, BNB, 600)
    
    par Get quotes from all DEX providers
        DexRegistry->>PancakeSwap: GetSwapQuoteAsync(USDT, BNB, 600)
        DexRegistry->>PancakeSwap: Estimate slippage & gas fees
    end
    
    PancakeSwap-->>DexRegistry: Quote: 600 USDT = 3.2 BNB (after fees)
    
    DexRegistry->>DexRegistry: Select Best Quote (PancakeSwap)
    DexRegistry-->>ConversionOrchestrator: Selected DEX: PancakeSwap
    
    ConversionOrchestrator->>PancakeSwap: ExecuteSwapAsync(swapRequest)
    
    PancakeSwap->>PancakeSwap: Build transaction (Router.swapExactTokensForTokens)
    PancakeSwap->>PancakeSwap: Sign transaction with private key
    PancakeSwap->>Blockchain: Send Transaction
    Blockchain-->>PancakeSwap: Transaction Hash: 0xabc123...
    
    PancakeSwap->>PancakeSwap: Wait for confirmation (3 blocks)
    
    loop Poll every 3 seconds
        PancakeSwap->>Blockchain: GetTransactionReceiptAsync(txHash)
        Blockchain-->>PancakeSwap: Status: Pending...
    end
    
    Blockchain-->>PancakeSwap: Status: Success ✓
    PancakeSwap-->>ConversionOrchestrator: SwapResult (success, 3.18 BNB received)
    
    ConversionOrchestrator->>WalletManager: DebitWalletAsync(Treasury, 600 USDT)
    ConversionOrchestrator->>WalletManager: CreditWalletAsync(Treasury, 3.18 BNB)
    
    WalletManager-->>ConversionOrchestrator: Wallets Updated
    
    ConversionOrchestrator->>ConversionOrchestrator: Create ConversionRecord (audit trail)
    ConversionOrchestrator->>EventBus: Publish TreasuryConversionCompletedEvent
    
    ConversionOrchestrator-->>TreasuryManager: Success
    TreasuryManager->>TreasuryManager: Log conversion in analytics
    
    EventBus->>Admin: Send notification: "Auto-conversion completed"
    
    Note over PancakeSwap,Blockchain: Failure Handling:<br/>- Transaction reverted → Retry with higher gas<br/>- Slippage too high → Abort conversion<br/>- Network congestion → Queue for later<br/>- Max 3 retry attempts
```

---

id: flowcharts
## 10. Gamification Reward Flow

```mermaid
flowchart TD
    Start([Payment Completed Event]) --> EventHandler[PaymentCompletedEventHandler]
    
    EventHandler --> CallEngine[GamificationEngine.EvaluateAsync]
    
    CallEngine --> GetRules[Get Active Gamification Rules<br/>Where EventType = 'Payment']
    
    GetRules --> Rule1[Rule 1: First Payment Bonus<br/>Reward: 100 Credit Points]
    GetRules --> Rule2[Rule 2: Payment Amount Milestone<br/>If Amount > $100: 50 Points]
    GetRules --> Rule3[Rule 3: Frequency Bonus<br/>5th Payment in Month: 200 Points]
    
    Rule1 --> CheckRule1{Check Conditions}
    Rule2 --> CheckRule2{Check Conditions}
    Rule3 --> CheckRule3{Check Conditions}
    
    CheckRule1 -->|Is First Payment?| YesRule1[Yes: User has 0 previous payments]
    CheckRule1 -->|Not First| SkipRule1[Skip Rule 1]
    
    CheckRule2 -->|Amount Check| YesRule2[Yes: Payment = $150]
    CheckRule2 -->|Amount < $100| SkipRule2[Skip Rule 2]
    
    CheckRule3 -->|Count Payments| YesRule3[Yes: This is 5th payment this month]
    CheckRule3 -->|Not 5th| SkipRule3[Skip Rule 3]
    
    YesRule1 --> CalcReward1[RewardCalculator.CalculateAsync<br/>Base: 100 points<br/>Multiplier: 1.0<br/>Result: 100 points]
    YesRule2 --> CalcReward2[RewardCalculator.CalculateAsync<br/>Base: 50 points<br/>Multiplier: 1.0<br/>Result: 50 points]
    YesRule3 --> CalcReward3[RewardCalculator.CalculateAsync<br/>Base: 200 points<br/>Multiplier: 1.5 VIP user<br/>Result: 300 points]
    
    CalcReward1 --> TotalRewards[Total Rewards: 450 Credit Points]
    CalcReward2 --> TotalRewards
    CalcReward3 --> TotalRewards
    
    SkipRule1 --> TotalRewards
    SkipRule2 --> TotalRewards
    SkipRule3 --> TotalRewards
    
    TotalRewards --> ApplyRewards[Apply Rewards to User]
    
    ApplyRewards --> GetCreditWallet[Get or Create Credit Points Wallet]
    GetCreditWallet --> CreditWallet[WalletManager.CreditAsync<br/>Amount: 450 CREDIT]
    
    CreditWallet --> CreateRecord[Create GamificationRuleUsage Records]
    CreateRecord --> PublishEvent[Publish RewardEarnedEvent]
    
    PublishEvent --> NotifyUser[Send Notification:<br/>'Congratulations! You earned 450 points']
    PublishEvent --> UpdateLeaderboard[Update User Leaderboard Position]
    PublishEvent --> UpdateAnalytics[Update Gamification Analytics]
    
    NotifyUser --> End([End])
    UpdateLeaderboard --> End
    UpdateAnalytics --> End
    
    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style Rule1 fill:#fff4e6
    style Rule2 fill:#fff4e6
    style Rule3 fill:#fff4e6
    style TotalRewards fill:#e8f5e9
    style CreditWallet fill:#f3e5f5
    style PublishEvent fill:#fce4ec
```

**Rule Engine Features:**
- ✓ Conditional evaluation (check multiple conditions)
- ✓ Multiple rewards per event
- ✓ Multipliers for VIP users
- ✓ Caps per rule and per user
- ✓ Time-based rules (daily, weekly, monthly)
- ✓ Complete audit trail

---

id: flowcharts
## Additional Diagrams

### Entity Relationship Overview

```mermaid
erDiagram
    Currency ||--o{ Wallet : "has many"
    Currency ||--o{ ExchangeRate : "from/to"
    Currency ||--o{ Invoice : "billed in"
    
    User ||--o{ Wallet : "owns"
    Wallet ||--o{ WalletTransaction : "has"
    
    Invoice ||--o{ InvoiceLineItem : "contains"
    Invoice ||--o{ PaymentOrder : "paid by"
    
    PaymentOrder ||--o{ PaymentAttempt : "has attempts"
    PaymentOrder }o--|| GatewayConfiguration : "via gateway"
    
    GatewayConfiguration }o--|| Currency : "supports"
    
    GamificationRule ||--o{ RuleCondition : "has conditions"
    GamificationRule ||--o{ RuleReward : "gives rewards"
    GamificationRule ||--o{ GamificationRuleUsage : "applied to"
    
    User ||--o{ GamificationRuleUsage : "earned"
    
    TreasuryConfiguration ||--o{ ConversionRule : "has rules"
    ConversionRule }o--|| Currency : "from/to"
```

---

id: flowcharts
### Permission Hierarchy

```mermaid
graph TB
    FinanceHub[FinanceHub Root Permission]
    
    FinanceHub --> Currency[Currency Permissions]
    FinanceHub --> Payment[Payment Permissions]
    FinanceHub --> Wallet[Wallet Permissions]
    FinanceHub --> Invoice[Invoice Permissions]
    FinanceHub --> Gateway[Gateway Permissions]
    FinanceHub --> ExchangeRate[Exchange Rate Permissions]
    FinanceHub --> Gamification[Gamification Permissions]
    FinanceHub --> Treasury[Treasury Permissions]
    
    Currency --> CurrencyDefault[Currency.Default]
    Currency --> CurrencyCreate[Currency.Create]
    Currency --> CurrencyUpdate[Currency.Update]
    Currency --> CurrencyDelete[Currency.Delete]
    Currency --> CurrencyAdmin[Currency.Admin]
    
    Payment --> PaymentDefault[Payment.Default]
    Payment --> PaymentCreate[Payment.Create]
    Payment --> PaymentRefund[Payment.Refund]
    Payment --> PaymentAdmin[Payment.Admin]
    
    Wallet --> WalletMyWallets[Wallet.MyWallets]
    Wallet --> WalletCreate[Wallet.Create]
    Wallet --> WalletTransfer[Wallet.Transfer]
    Wallet --> WalletAdminCredit[Wallet.AdminCredit]
    Wallet --> WalletAdminFreeze[Wallet.AdminFreeze]
    
    Invoice --> InvoiceDefault[Invoice.Default]
    Invoice --> InvoiceCreate[Invoice.Create]
    Invoice --> InvoiceDelete[Invoice.Delete]
    Invoice --> InvoiceAdmin[Invoice.Admin]
    Invoice --> InvoiceMarkPaid[Invoice.AdminMarkPaid]
    
    style FinanceHub fill:#e1f5ff
    style Currency fill:#fff4e6
    style Payment fill:#e8f5e9
    style Wallet fill:#f3e5f5
    style Invoice fill:#fce4ec
```

---

id: flowcharts
## Summary

These flowcharts illustrate:

1. **Layered Architecture** - Clear separation between UI, Application, Domain, and Infrastructure
2. **Event-Driven Design** - Outbox pattern ensures reliable event processing
3. **Pluggable Providers** - NuGet packages extend functionality without source changes
4. **Complex Workflows** - Payment, conversion, and treasury operations
5. **Domain Services** - Orchestration of business logic across aggregates
6. **ABP Integration** - Leveraging ABP's built-in features for UnitOfWork, events, DI

All flows follow **ABP Framework best practices** and implement **Domain-Driven Design** principles.

---


id: flowcharts
