---
id: index
title: FinanceHub
sidebar_label: FinanceHub
---
# FinanceHub - Financial Infrastructure Module

> **Multi-Currency Payment Infrastructure for Modern Applications**

**FinanceHub** is SophiChain's comprehensive financial management module that enables applications to accept and manage payments in multiple currencies (fiat, crypto, and custom credit points), handle invoicing, manage digital wallets, and provide automated currency conversion.

---

## 📋 Quick Links

- **[Business Overview & Capabilities](./capabilities))** - What FinanceHub can do for your business
- **[Technical Architecture](./architecture))** - Complete implementation guide
- **[System Flowcharts](./flowcharts))** - Visual architecture and workflows
- **[API Reference](#) <!-- API docs coming soon -->** *(Coming Soon)*
- **[Integration Guide](#) <!-- Integration docs coming soon -->** *(Coming Soon)*

---

## 🎯 What is FinanceHub?

FinanceHub is an **open-source, modular payment infrastructure** that enables ANY application to accept both **fiat and cryptocurrency payments** for invoices. Built on **ABP Framework**, it provides a complete financial platform that developers worldwide can integrate into their projects.

### Key Features

✅ **Multi-Currency by Design** - Fiat, Crypto, Credit Points  
✅ **Multi-Gateway Support** - Stripe, PayPal, ZarinPal, Parbad, Shaparak, and more  
✅ **DeFi Integration** - Direct blockchain payments via DEX swaps  
✅ **Pluggable Architecture** - Add your own gateways/providers via NuGet  
✅ **Complete Invoice System** - Ready-to-use invoice management  
✅ **Wallet System** - Built-in multi-currency wallet management  
✅ **Gamification** - Credit points and reward systems  
✅ **Open Source** - MIT License, community-driven development

---

## 🚀 Quick Start

### Installation

```bash
# Install FinanceHub NuGet package
dotnet add package SophiChain.FinanceHub

# Add module dependency in your module class
[DependsOn(typeof(FinanceHubModule))]
public class YourApplicationModule : AbpModule
{
    // Module configuration
}
```

### Basic Usage

```csharp
// Inject the invoice service
public class OrderAppService : ApplicationService
{
    private readonly IInvoiceAppService _invoiceAppService;
    
    public async Task<PaymentResult> CheckoutAsync(CreateOrderDto input)
    {
        // Create invoice for order
        var invoice = await _invoiceAppService.CreateAsync(new CreateInvoiceDto
        {
            ExternalReference = $"ORDER-{orderId}",
            Items = input.Items.Select(item => new InvoiceLineItemDto
            {
                Description = item.ProductName,
                Quantity = item.Quantity,
                UnitPrice = item.Price
            }).ToList()
        });
        
        // User can pay with ANY supported gateway
        return await _paymentAppService.InitiateAsync(new InitiatePaymentDto
        {
            InvoiceId = invoice.Id,
            GatewayId = input.PreferredGateway
        });
    }
}
```

For detailed integration steps, see [Integration Guide](#) <!-- Integration docs coming soon --> *(Coming Soon)*.

---

## 📖 Documentation

### For Business Leaders & Stakeholders

Start here to understand the business value and capabilities:

**[📊 Business Overview & Capabilities](./capabilities))**

This document covers:
- Executive summary and value propositions
- Target audience and use cases
- Core capabilities explained in business terms
- 8 detailed user stories with business impact
- ROI and cost/benefit analysis
- Getting started roadmap

**Perfect for:** CEOs, Product Managers, Business Analysts, Decision Makers

---

### For Technical Teams & Developers

Dive into the technical implementation:

**[🏗️ Technical Architecture](./architecture))**

This comprehensive document includes:
- Complete architectural approach (ABP-aligned, DDD)
- Bounded contexts and domain model design
- Domain services and repository patterns
- Application layer implementation
- Event-driven architecture with ABP Event Bus
- Pluggable provider architecture (Payment Gateways, Exchange Providers, DEX)
- UI architecture with Blazor
- Security and permissions
- Performance considerations
- Extensibility patterns

**Perfect for:** Software Architects, Backend Developers, Frontend Developers

---

### Visual Architecture & Workflows

Understand the system visually:

**[🔄 System Flowcharts](./flowcharts))**

This document provides:
- Module architecture overview
- Complete payment flow (sequence diagram)
- Invoice creation & payment flow
- Wallet operations state diagram
- Currency conversion flow
- Exchange rate update flow
- Event-driven architecture visualization
- Pluggable provider architecture
- DeFi treasury auto-conversion
- Gamification reward flow
- Entity relationships
- Permission hierarchy

**Perfect for:** All technical roles, System Designers, QA Engineers

---

## 🏗️ Architecture Highlights

### Layered Architecture (ABP/DDD)

```
┌─────────────────────────────────────┐
│       Blazor UI (Components)        │
├─────────────────────────────────────┤
│    Application Services (DTOs)      │
├─────────────────────────────────────┤
│  Domain Services & Aggregates       │
├─────────────────────────────────────┤
│   Repository Interfaces (Domain)    │
├─────────────────────────────────────┤
│ Infrastructure (MongoDB/Providers)  │
└─────────────────────────────────────┘
```

### Core Bounded Contexts

1. **Currencies** - Multi-type currency management (Fiat, Crypto, Credit Points)
2. **Payments** - Payment orchestration and gateway integration
3. **Wallets** - Multi-currency digital wallets
4. **Invoices** - Invoice lifecycle management
5. **Exchange Rates** - Real-time currency conversion
6. **Gateways** - Payment gateway configuration
7. **DeFi Treasury** - Automated crypto treasury management
8. **Gamification** - Reward rules and credit points

### Pluggable Providers

FinanceHub uses a **hexagonal architecture** for external integrations:

**Payment Gateways** (Separate NuGet packages):
- `SophiChain.FinanceHub.PaymentGateways.Stripe`
- `SophiChain.FinanceHub.PaymentGateways.PayPal`
- `SophiChain.FinanceHub.PaymentGateways.ZarinPal`
- `SophiChain.FinanceHub.PaymentGateways.Shaparak`
- `SophiChain.FinanceHub.PaymentGateways.Crypto`

**Exchange Rate Providers**:
- `SophiChain.FinanceHub.ExchangeProviders.CoinGecko`
- `SophiChain.FinanceHub.ExchangeProviders.CoinMarketCap`
- `SophiChain.FinanceHub.ExchangeProviders.Wallex` (IRR pricing)
- `SophiChain.FinanceHub.ExchangeProviders.Manual`

**DEX Providers** (DeFi):
- `SophiChain.FinanceHub.DexProviders.PancakeSwap`
- `SophiChain.FinanceHub.DexProviders.1inch`
- `SophiChain.FinanceHub.DexProviders.UniSwap`

---

## 💼 Use Cases

### E-Commerce Platform

Accept payments from global customers in their preferred currency, with automatic conversion to your base currency.

```csharp
// Customer sees prices in EUR, you receive USD
var invoice = await _invoiceManager.CreateAsync(new CreateInvoiceDto
{
    Currency = "EUR",
    Items = products,
    CustomerEmail = "customer@example.com"
});
// FinanceHub handles all currency conversion automatically
```

### SaaS Subscription Billing

Automate recurring billing with flexible payment options.

```csharp
// Create monthly invoice, customer can pay with any method
var subscription = await _subscriptionService.CreateAsync(new SubscriptionDto
{
    PlanId = planId,
    BillingCycle = BillingCycle.Monthly,
    Amount = 99,
    Currency = "USD"
});
```

### Marketplace with Escrow

Hold payments in escrow until work is completed.

```csharp
// Hold payment in escrow wallet
await _walletManager.CreateEscrowAsync(new EscrowDto
{
    Amount = 500,
    Currency = "USD",
    ReleaseCondition = "work_approved"
});
```

### Crypto Payment Integration

Accept cryptocurrency payments with automatic conversion.

```csharp
// Accept Bitcoin payment, convert to stablecoin
var payment = await _paymentOrchestrator.InitiateAsync(new PaymentRequest
{
    Amount = 100,
    Currency = "BTC",
    AutoConvertTo = "USDT"
});
```

For more detailed use cases, see [Business Capabilities Document](./capabilities)).

---

## 🎓 Implementation Guide

### Phase 1: Setup (Week 1)

1. Install FinanceHub module
2. Configure database connections
3. Run migrations
4. Set up basic currencies

### Phase 2: Gateway Configuration (Week 2)

1. Install gateway provider packages
2. Configure API keys and settings
3. Test payment flows in sandbox
4. Enable production gateways

### Phase 3: Invoice Integration (Week 3)

1. Create invoice templates
2. Integrate with your order system
3. Configure email notifications
4. Test invoice generation and payment

### Phase 4: Advanced Features (Week 4+)

1. Set up wallet system for users
2. Configure exchange rate providers
3. Implement gamification rules
4. Set up DeFi treasury (if using crypto)

For complete implementation details, see [Technical Architecture](./architecture)).

---

## 🔌 Available Integrations

### Payment Gateways

| Gateway | Region | Currencies | Status |
|---------|--------|------------|--------|
| Stripe | Global | USD, EUR, GBP, 135+ | ✅ Available |
| PayPal | Global | 25+ currencies | ✅ Available |
| ZarinPal | Iran | IRR | ✅ Available |
| Shaparak | Iran | IRR | ✅ Available |
| Parbad | Iran | IRR (Multi-bank) | ✅ Available |
| Crypto Wallet | Global | BTC, ETH, BNB, USDT | 🟡 Beta |

### Exchange Rate Providers

| Provider | Data Source | Update Frequency | Status |
|----------|-------------|------------------|--------|
| CoinGecko | Crypto + Fiat | Every 5 min | ✅ Available |
| CoinMarketCap | Crypto | Every 5 min | ✅ Available |
| Wallex | IRR/Crypto | Every 1 min | ✅ Available |
| Manual Entry | Admin input | On-demand | ✅ Available |

### DEX Integrations

| DEX | Blockchain | Tokens | Status |
|-----|------------|--------|--------|
| PancakeSwap | BNB Chain | BEP-20 | 🟡 Beta |
| 1inch | Multi-chain | 100+ | 🔴 Planned |
| UniSwap | Ethereum | ERC-20 | 🔴 Planned |

---

id: index
## 🛡️ Security & Compliance

### Security Features

- ✅ **Multi-Tenant Isolation** - Complete data separation between tenants
- ✅ **Role-Based Access Control** - Granular permission system
- ✅ **Audit Logging** - Every transaction tracked
- ✅ **Encrypted Storage** - Sensitive data encrypted at rest
- ✅ **Secure API Keys** - Never store private keys in application
- ✅ **PCI DSS Ready** - Payment data handling best practices

### Compliance

- ✅ **GDPR Ready** - Data privacy and user rights
- ✅ **Financial Auditing** - Complete transaction trails
- ✅ **Tax Reporting** - Export data for tax filing
- ✅ **Multi-Currency Reporting** - Handle complex FX scenarios

---

id: index
## 📊 Current Status

**Version:** 1.0.0-alpha  
**Status:** 🟡 Active Development

### What's Implemented ✅

- ✅ Multi-currency management (Fiat, Crypto, Credit Points)
- ✅ Complete invoice system
- ✅ Multi-currency wallet system
- ✅ Exchange rate integration (5 providers)
- ✅ Payment gateway framework
- ✅ Gamification engine
- ✅ DeFi treasury management
- ✅ Event-driven architecture
- ✅ Admin and user portals (Blazor)

### In Progress 🟡

- 🟡 Namespace reorganization (ABP best practices)
- 🟡 Domain service extraction
- 🟡 Event handler implementation
- 🟡 UI component decomposition
- 🟡 Comprehensive testing
- 🟡 API documentation

### Planned 🔴

- 🔴 Additional payment gateway providers
- 🔴 Advanced reporting and analytics
- 🔴 Subscription management
- 🔴 Recurring billing automation
- 🔴 Multi-language support (UI)
- 🔴 Mobile app integration

---

id: index
## 🤝 Contributing

We welcome contributions to FinanceHub! Ways to contribute:

### Provider Packages

Create provider packages for:
- Regional payment gateways
- Exchange rate sources
- DEX integrations
- Blockchain networks

### Core Features

- Bug fixes and improvements
- Performance optimizations
- New features and capabilities
- Documentation improvements

### Testing

- Unit tests
- Integration tests
- Performance tests
- Security audits

See [Contributing Guide](/contributing) *(Coming Soon)* for details.

---

id: index
## 📞 Support

### Documentation

- **Business:** [Capabilities Document](./capabilities))
- **Technical:** [Architecture](./architecture))
- **Visual:** [Flowcharts](./flowcharts))
- **API:** [API Reference](#) <!-- API docs coming soon --> *(Coming Soon)*

### Community

- **GitHub Issues:** [Report bugs](https://github.com/sophichain/issues)
- **Discussions:** [Ask questions](https://github.com/sophichain/discussions)
- **Discord:** *(Coming Soon)*

### Commercial

- **Professional Services:** Custom development and consulting
- **Priority Support:** SLA-backed support plans
- **Training:** Team training and workshops

Contact: [info@sophilabs.ir](mailto:info@sophilabs.ir)

---

id: index
## 📄 License

FinanceHub is part of SophiChain and is released under the **MIT License**.

This means you can:
- ✅ Use commercially
- ✅ Modify the source code
- ✅ Distribute
- ✅ Use privately
- ✅ No warranty

---

id: index
## 🙏 Built With

- [ABP Framework](https://abp.io) - Application framework and DDD infrastructure
- [.NET 9](https://dotnet.microsoft.com) - Runtime and libraries
- [MongoDB](https://mongodb.com) - Document database
- [Blazor](https://blazor.net) - Web UI framework
- [MediatR](https://github.com/jbogard/MediatR) - In-process messaging
- [AutoMapper](https://automapper.org) - Object mapping

---

id: index
## 🗺️ Roadmap

### 2026 Q1 - Alpha Release ✅

- Core architecture complete
- Basic payment flows working
- Initial provider packages
- Alpha documentation

### 2026 Q2 - Beta Release

- 🎯 Namespace refactor complete
- 🎯 Domain services extracted
- 🎯 Event-driven architecture implemented
- 🎯 UI components refactored
- 🎯 Comprehensive testing (80%+ coverage)

### 2026 Q3 - Version 1.0

- 🎯 Production-ready release
- 🎯 Complete API documentation
- 🎯 5+ payment gateway providers
- 🎯 Advanced reporting and analytics
- 🎯 Subscription management

### 2026 Q4 - Ecosystem Growth

- 🎯 Community provider marketplace
- 🎯 Additional DEX integrations
- 🎯 Mobile SDK
- 🎯 Advanced gamification features

---

id: index
## 📚 Learn More

### Next Steps

1. **Business Leaders:** Start with [Capabilities Document](./capabilities))
2. **Developers:** Read [Technical Architecture](./architecture))
3. **Visual Learners:** Explore [System Flowcharts](./flowcharts))
4. **Get Started:** Follow [Integration Guide](#) <!-- Integration docs coming soon --> *(Coming Soon)*

### Related Documentation

- [SophiChain Overview](../../)
- [AIHub Documentation](/modules/aihub) *(Coming Soon)*
- [CommHub Documentation](/modules/commhub) *(Coming Soon)*
- [Deployment Guide](/deployment) *(Coming Soon)*

---

id: index
**Ready to revolutionize your payment infrastructure?**  
Start with the [Business Capabilities Document](./capabilities)) or dive into the [Technical Architecture](./architecture))!

---

id: index
*Last Updated: October 7, 2025*  
*Module Version: 1.0.0-alpha*  
*Documentation Version: 1.0*

