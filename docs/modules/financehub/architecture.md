---
id: architecture
title: FinanceHub Architecture
sidebar_label: Architecture
---
id: architecture
# FinanceHub Architecture

> **Multi-Currency Payment Infrastructure with DeFi & Gamification**

---

id: architecture
## 📖 Overview

FinanceHub is a comprehensive financial management module that provides:
- Multi-currency payment processing (Fiat, Crypto, Credit Points)
- Invoice management with multi-gateway support
- Digital wallet system with balance tracking
- Real-time exchange rate integration
- DeFi treasury with DEX integration
- Gamification engine for rewards

**Framework:** ABP Framework + .NET 9  
**License:** MIT (Open Source)

---

id: architecture
## 🎯 Core Capabilities

### 1. Multi-Currency System
- **Currency Types:** Fiat, Crypto, Credit Points (extensible)
- **Currency Management:** Admin activation/deactivation, contract address support
- **Multi-Tenant:** Tenant-specific currency configurations

### 2. Payment Processing
- **Payment Methods:** Gateway payments, wallet payments, crypto payments
- **Multi-Gateway:** Stripe, PayPal, ZarinPal, Parbad, and custom gateways
- **Payment Flow:** Initiate → Process → Complete/Fail → Refund support

### 3. Digital Wallets
- **Multi-Currency Wallets:** One wallet per user per currency
- **Balance Management:** Credit, debit, transfer, freeze operations
- **Transaction History:** Full audit trail with transaction types
- **Real-Time Balance:** Calculated balance with pending transactions

### 4. Invoice Management
- **Complete Lifecycle:** Draft → Pending → Paid → Cancelled
- **Line Items:** Detailed invoice items with quantity and pricing
- **Payment Tracking:** Multiple payments per invoice support
- **External References:** Link invoices to external systems (orders, subscriptions)

### 5. Exchange Rate System
- **Multi-Provider:** CoinGecko, CoinMarketCap, Manual rates
- **Path Finding:** Direct and multi-hop conversion paths
- **Auto-Update:** Background jobs for rate refresh
- **Caching:** Optimized rate lookups

### 6. DeFi Treasury
- **DEX Integration:** PancakeSwap, 1inch, UniSwap
- **Auto-Conversion:** Rule-based crypto-to-fiat conversion
- **Blockchain Support:** BNB Chain, Ethereum, Polygon
- **Gas Optimization:** Smart transaction routing

### 7. Gamification Engine
- **Rule Engine:** Event-based reward triggers
- **Reward Types:** Credit points, discounts, bonuses
- **Analytics:** User engagement tracking
- **Leaderboards:** Competitive reward systems

---

id: architecture
## 🏗️ Architecture Overview

### Architectural Patterns

FinanceHub implements:
- ✅ **Domain-Driven Design** - Bounded contexts and aggregates
- ✅ **Clean Architecture** - Clear layer separation
- ✅ **Event-Driven Architecture** - Outbox pattern for reliability
- ✅ **Pluggable Providers** - Extensible gateway/provider system
- ✅ **Multi-Tenancy** - Complete data isolation

### Layer Structure

```
┌─────────────────────────────────────────┐
│         Blazor UI Layer                 │
│  (Pages, Components, ViewModels)        │
└─────────────────────────────────────────┘
              ↓ HTTP API
┌─────────────────────────────────────────┐
│      Application Layer                  │
│  (App Services, DTOs, Event Handlers)   │
└─────────────────────────────────────────┘
              ↓ Domain Logic
┌─────────────────────────────────────────┐
│         Domain Layer                    │
│  (Entities, Domain Services, Events)    │
└─────────────────────────────────────────┘
              ↓ Persistence
┌─────────────────────────────────────────┐
│      Infrastructure Layer               │
│  (MongoDB, Providers, Background Jobs)  │
└─────────────────────────────────────────┘
```

---

id: architecture
## 📦 Bounded Contexts

### 1. Currency Context
**Aggregate Root:** `Currency`

**Entities:**
- `Currency` - Currency definition with type, symbol, decimals

**Domain Services:**
- `CurrencyValidator` - Validation logic
- `CurrencyFormatter` - Display formatting

**Responsibilities:**
- Currency lifecycle management
- Type validation and classification
- Format and display logic

---

id: architecture
### 2. Payment Context
**Aggregate Root:** `PaymentOrder`

**Entities:**
- `PaymentOrder` - Main payment record
- `PaymentAttempt` - Individual payment attempts

**Domain Services:**
- `PaymentOrchestrator` - Payment workflow coordination
- `PaymentValidator` - Payment validation
- `PaymentRouter` - Gateway selection logic

**Responsibilities:**
- Payment initiation and processing
- Gateway routing and failover
- Payment status tracking
- Refund processing

---

id: architecture
### 3. Wallet Context
**Aggregate Root:** `Wallet`

**Entities:**
- `Wallet` - User wallet for specific currency
- `WalletTransaction` - Transaction records (child entity)

**Domain Services:**
- `WalletManager` - Wallet operations
- `BalanceCalculator` - Balance computation

**Responsibilities:**
- Wallet creation and management
- Balance tracking and updates
- Transaction recording
- Wallet freeze/unfreeze

---

id: architecture
### 4. Invoice Context
**Aggregate Root:** `Invoice`

**Entities:**
- `Invoice` - Invoice document
- `InvoiceLineItem` - Line items (child entity)
- `InvoicePayment` - Payment records (child entity)

**Domain Services:**
- `InvoiceManager` - Invoice lifecycle
- `InvoiceCalculator` - Total calculations
- `InvoiceValidator` - Validation logic

**Responsibilities:**
- Invoice creation and management
- Line item management
- Total calculation with tax/discount
- Payment tracking

---

id: architecture
### 5. Exchange Rate Context
**Aggregate Root:** `ExchangeRate`

**Entities:**
- `ExchangeRate` - Rate record for currency pair
- `ExchangeProviderConfig` - Provider configuration

**Value Objects:**
- `ConversionPath` - Multi-hop conversion path

**Domain Services:**
- `ExchangeRateManager` - Rate management
- `ConversionPathFinder` - Path finding algorithm
- `ConversionCalculator` - Conversion calculations

**Responsibilities:**
- Exchange rate storage and retrieval
- Multi-provider rate aggregation
- Conversion path finding
- Rate history tracking

---

id: architecture
### 6. Gateway Context
**Aggregate Root:** `GatewayConfiguration`

**Entities:**
- `GatewayConfiguration` - Gateway config per tenant
- `GatewayCurrencySupport` - Supported currencies (child entity)

**Domain Services:**
- `GatewayValidator` - Configuration validation
- `GatewayHealthChecker` - Health monitoring

**Provider Interface:**
- `IPaymentGateway` - Gateway provider interface

**Responsibilities:**
- Gateway configuration management
- Provider discovery and routing
- Health monitoring
- Currency support validation

---

id: architecture
### 7. DeFi Treasury Context
**Aggregate Root:** `TreasuryConfiguration`

**Entities:**
- `TreasuryConfiguration` - Treasury settings
- `ConversionRule` - Auto-conversion rules (child entity)

**Domain Services:**
- `TreasuryManager` - Treasury management
- `ConversionOrchestrator` - DEX conversion logic

**Provider Interface:**
- `IDexProvider` - DEX provider interface

**Responsibilities:**
- Treasury configuration
- Auto-conversion rule management
- DEX provider coordination
- Blockchain transaction management

---

id: architecture
### 8. Gamification Context
**Aggregate Root:** `GamificationRule`

**Entities:**
- `GamificationRule` - Reward rule definition
- `RuleCondition` - Rule conditions (child entity)
- `RuleReward` - Reward configuration (child entity)

**Domain Services:**
- `GamificationEngine` - Rule evaluation
- `RewardCalculator` - Reward calculations

**Responsibilities:**
- Rule definition and management
- Event-based rule evaluation
- Reward calculation and distribution
- Analytics and leaderboard

---

id: architecture
## 🔄 Domain Events

### Payment Events
- `PaymentInitiatedEvent` - Payment started
- `PaymentCompletedEvent` - Payment successful
- `PaymentFailedEvent` - Payment failed
- `PaymentRefundedEvent` - Payment refunded

### Wallet Events
- `WalletCreatedEvent` - New wallet created
- `WalletCreditedEvent` - Funds added
- `WalletDebitedEvent` - Funds removed
- `WalletFrozenEvent` - Wallet frozen

### Invoice Events
- `InvoiceCreatedEvent` - Invoice created
- `InvoicePaidEvent` - Invoice paid
- `InvoiceCancelledEvent` - Invoice cancelled

### Currency Events
- `CurrencyCreatedEvent` - New currency added
- `CurrencyActivatedEvent` - Currency enabled
- `CurrencyDeactivatedEvent` - Currency disabled

### Exchange Rate Events
- `ExchangeRateUpdatedEvent` - Rate updated
- `ProviderHealthChangedEvent` - Provider status changed

---

id: architecture
## 🔌 Pluggable Providers

### Payment Gateway Providers

**Interface:** `IPaymentGateway`

**Available Providers:**
- `SophiChain.FinanceHub.PaymentGateways.Stripe` - Stripe integration
- `SophiChain.FinanceHub.PaymentGateways.PayPal` - PayPal integration
- `SophiChain.FinanceHub.PaymentGateways.ZarinPal` - Iranian gateway
- `SophiChain.FinanceHub.PaymentGateways.Parbad` - Multi-gateway (Iran)
- `SophiChain.FinanceHub.PaymentGateways.Crypto` - Direct crypto payments

**Methods:**
- `InitiatePaymentAsync()` - Start payment
- `ProcessCallbackAsync()` - Handle gateway callback
- `GetPaymentStatusAsync()` - Check payment status
- `RefundPaymentAsync()` - Process refund

---

id: architecture
### Exchange Rate Providers

**Interface:** `IExchangeProvider`

**Available Providers:**
- `SophiChain.FinanceHub.ExchangeProviders.CoinGecko` - CoinGecko API
- `SophiChain.FinanceHub.ExchangeProviders.CoinMarketCap` - CMC API
- `SophiChain.FinanceHub.ExchangeProviders.Manual` - Manual rates

**Methods:**
- `GetRatesAsync()` - Fetch current rates
- `GetRateAsync()` - Get specific pair rate
- `GetSupportedPairsAsync()` - Supported currency pairs

---

id: architecture
### DEX Providers

**Interface:** `IDexProvider`

**Available Providers:**
- `SophiChain.FinanceHub.DexProviders.PancakeSwap` - PancakeSwap on BSC
- `SophiChain.FinanceHub.DexProviders.1inch` - 1inch Aggregator
- `SophiChain.FinanceHub.DexProviders.UniSwap` - UniSwap on Ethereum

**Methods:**
- `GetSwapQuoteAsync()` - Get swap quote
- `ExecuteSwapAsync()` - Execute swap
- `GetTransactionStatusAsync()` - Check transaction

---

id: architecture
## 📊 Data Models

### Domain.Shared Layer

**Location:** `SophiChain.FinanceHub.Domain.Shared`

**Contents:**
- Enums (Status types, extensible type constants)
- Constants (Max lengths, validation rules)
- Value Objects (Money)
- Error Codes

**Key Types:**
- `Money` - Value object for monetary amounts
- `CurrencyType` - String constants: Fiat, Crypto, CreditPoints
- `PaymentStatus` - Enum: Pending, Processing, Completed, Failed, Refunded
- `InvoiceStatus` - Enum: Draft, Pending, Paid, Cancelled
- `TransactionType` - String constants with provider extensibility

---

id: architecture
### Domain Layer

**Location:** `SophiChain.FinanceHub.Domain`

**Entity Base Classes:**
- `FullAuditedAggregateRoot<Guid>` - With audit fields
- `IMultiTenant` - Tenant isolation
- `IHasExtraProperties` - Dynamic properties for extensibility

**Repository Interfaces:**
All repositories use standard ABP repository pattern:
- `ICurrencyRepository`
- `IWalletRepository`
- `IInvoiceRepository`
- `IPaymentOrderRepository`
- `IExchangeRateRepository`

---

id: architecture
## 🎨 Application Layer

### Application Services

**Pattern:** All services inherit from `ApplicationService`

**Key Services:**
- `CurrencyAppService` - Public currency operations
- `AdminCurrencyAppService` - Admin currency management
- `PaymentAppService` - Payment processing
- `WalletAppService` - User wallet operations
- `AdminWalletAppService` - Admin wallet management
- `InvoiceAppService` - Invoice operations
- `ExchangeRateAppService` - Rate queries
- `GamificationAppService` - User rewards

**Features:**
- ✅ Automatic validation (Data Annotations + FluentValidation)
- ✅ Automatic authorization (Permission attributes)
- ✅ Automatic HTTP API generation
- ✅ Automatic audit logging
- ✅ Automatic UnitOfWork (transactions)

---

id: architecture
### Event Handlers

**Pattern:** Implement `ILocalEventHandler<TEvent>`

**Key Handlers:**
- `PaymentCompletedEventHandler` - Credits wallet, marks invoice paid
- `PaymentFailedEventHandler` - Releases invoice, sends notification
- `WalletCreditedEventHandler` - Updates analytics, checks thresholds
- `InvoicePaidEventHandler` - Generates receipt, notifies systems
- `ExchangeRateUpdatedEventHandler` - Invalidates cache

**Outbox Pattern:**
- All events stored in outbox table
- Background worker processes events
- Automatic retry on failure
- Idempotency guaranteed

---

id: architecture
## 🎨 UI Architecture

### Blazor Pages

**Pattern:** Inherit from `AbpCrudPageBase` for CRUD operations

**Admin Pages:**
- `/admin/currencies` - Currency management
- `/admin/payments` - Payment monitoring
- `/admin/wallets` - Wallet administration
- `/admin/invoices` - Invoice management
- `/admin/exchange-rates` - Rate configuration
- `/admin/gateways` - Gateway configuration
- `/admin/gamification` - Reward rules

**User Pages:**
- `/dashboard` - User dashboard
- `/wallets` - My wallets
- `/invoices` - My invoices
- `/payments` - Payment history

---

id: architecture
### Reusable Components

**Component Structure:**
```
Components/
├── Shared/
│   ├── CurrencyPicker.razor
│   ├── AmountInput.razor
│   └── MoneyDisplay.razor
├── Payments/
│   ├── PaymentFlow/
│   │   ├── AmountEntry.razor
│   │   ├── GatewaySelection.razor
│   │   └── PaymentComplete.razor
│   └── PaymentGrid.razor
└── Wallets/
    ├── WalletCard.razor
    ├── WalletBalance.razor
    └── TransactionList.razor
```

---

id: architecture
## 🔐 Security & Permissions

### Permission Structure

```
FinanceHub
├── Currency
│   ├── Default (View)
│   ├── Create
│   ├── Update
│   ├── Delete
│   └── Admin
├── Payment
│   ├── Default (View own)
│   ├── Create
│   ├── Complete
│   ├── Refund
│   └── Admin (View all)
├── Wallet
│   ├── MyWallets
│   ├── Create
│   ├── Transfer
│   ├── AdminCredit
│   ├── AdminDebit
│   └── AdminFreeze
└── Invoice
    ├── Default (View own)
    ├── Create
    ├── Delete
    ├── AdminMarkPaid
    └── Admin (View all)
```

---

id: architecture
## 📈 Performance Considerations

### Caching Strategy
- Exchange rates cached (5-15 minute TTL)
- Currency list cached (invalidate on changes)
- Gateway configurations cached per tenant

### Database Optimization
- Indexes on frequently queried fields
- Compound indexes for multi-field queries
- Aggregation pipelines for analytics

### Background Jobs
- Exchange rate updates (scheduled)
- Gamification rule evaluation (event-driven)
- Payment status checks (retry queue)
- DeFi treasury conversions (scheduled)

---

id: architecture
## 🧩 Extensibility

See: [ABP Extensibility Patterns](./architecture)/extensibility) for general patterns

### FinanceHub-Specific Extension Points

**1. Add Custom Currency Type**
```csharp
public class CashbackCurrencyTypeProvider : ICurrencyTypeProvider
{
    public List<CurrencyTypeDefinition> GetTypes()
    {
        return new List<CurrencyTypeDefinition>
        {
            new() { Code = "Cashback", Name = "Cashback Points" }
        };
    }
}
```

**2. Add Custom Payment Gateway**
```csharp
// Create separate NuGet package
public class MyCustomGateway : IPaymentGateway
{
    public async Task<GatewayInitResult> InitiatePaymentAsync(...)
    {
        // Implementation
    }
}
```

**3. Subscribe to Domain Events**
```csharp
public class CustomPaymentHandler : ILocalEventHandler<PaymentCompletedEvent>
{
    public async Task HandleEventAsync(PaymentCompletedEvent e)
    {
        // Custom logic
    }
}
```

**4. Extend Entities with Extra Properties**
```csharp
currency.SetProperty("CashbackRate", 0.05m);
currency.SetProperty("MaxCashback", 100m);
```

---

id: architecture
## 📚 Related Documentation

- **[Capabilities & Use Cases](./capabilities))** - Business features and scenarios
- **[Architecture Flowcharts](./flowcharts))** - Visual system diagrams
- **[Domain-Driven Design](./architecture)/domain-driven-design)** - DDD patterns used
- **[Event-Driven Architecture](./architecture)/event-driven-architecture)** - Event patterns
- **[Pluggable Providers](./architecture)/pluggable-providers)** - Provider pattern
- **[Extensibility Guide](./architecture)/extensibility)** - How to extend FinanceHub

---

id: architecture
## 🤝 Contributing

See: [Contributing to FinanceHub](/contributing)

**Areas for Contribution:**
- New payment gateway providers
- New exchange rate providers
- New DEX providers
- UI component improvements
- Documentation enhancements
- Test coverage improvements

---

id: architecture
