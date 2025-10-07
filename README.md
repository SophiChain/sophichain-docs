# SophiChain Documentation

> **The Modular Backbone for Modern Enterprise Applications**

Welcome to SophiChain's comprehensive documentation. This guide will help you understand, implement, and extend the SophiChain platform.

---

## 📖 What is SophiChain?

**SophiChain** is a modular, multi-tenant enterprise platform built on **.NET/ABP Framework** that provides shared back-office services and pluggable business modules. It's designed to help teams launch vertical applications fast while maintaining enterprise-grade quality, security, and scalability.

### Core Philosophy

- ✅ **Practical First** - Modular, multi-tenant backbone for rapid vertical app development
- ✅ **Payments Simplified** - Web3 for crypto + custodial fiat via Shaparak (IRR) and Stripe (USD/EUR)
- ✅ **AI-Ready, Not AI-Heavy** - Optional shared AI services when they add value
- ✅ **Iran-Friendly & Global-Ready** - Same codebase for domestic and international markets
- ✅ **Open & Modular** - Shared hubs power features across modules without frontend lock-in

---

## 🏗️ Architecture Overview

### Foundation Stack

- **Framework:** .NET Core 9/10 with ABP Framework (DDD layers)
- **UI:** Blazor (React/others supported)
- **Databases:** 
  - MongoDB for catalogs, analytics, and document storage
  - SQL Server/PostgreSQL + EF Core for transactional data (wallets, invoices, ledger)
- **Deployment:** Docker + Kubernetes 

### Key Architectural Patterns

- **Microservices & Multi-Tenancy** - Independently deployable modules with data isolation
- **Domain-Driven Design** - Clear bounded contexts and separation of concerns
- **Event-Driven Architecture** - Distributed workers and async processing
- **Pluggable Providers** - Extensible via NuGet packages

---

## 🎯 Core Modules

### Shared Service Hubs

1. **[FinanceHub](./modules/financehub/README.md)** - Multi-currency payments, invoicing, wallets, treasury
2. **[AIHub](./modules/aihub/README.md)** *(Coming Soon)* - LLM connectors, embeddings, knowledge bases
3. **[CommHub](./modules/commhub/README.md)** *(Coming Soon)* - Multi-channel messaging (email, SMS, push, webhooks)

### Business Modules

1. **[E-Commerce](./modules/ecommerce/README.md)** *(Coming Soon)* - Multi-tenant marketplace (B2B/B2C)
2. **[HelpDesk](./modules/helpdesk/README.md)** *(Coming Soon)* - Omni-channel ticketing with AI integration
3. **[CRM](./modules/crm/README.md)** *(Coming Soon)* - Contact management, pipelines, AI-assisted scoring
4. **[Queue Manager](./modules/queue-manager/README.md)** *(Coming Soon)* - Ticketing and turn management

---

## 🚀 Quick Start

### Prerequisites

- .NET 9 SDK or later
- Docker Desktop
- MongoDB 7.0+
- SQL Server 2022+ or PostgreSQL 15+

## 📚 Documentation Structure

### By Role

- **Business Users** - [FinanceHub Capabilities](./modules/financehub/CAPABILITIES.md) for non-technical overview
- **Developers** - [Architecture Guides](./architecture/README.md) for technical implementation
- **DevOps** - [Deployment Guide](./deployment/README.md) *(Coming Soon)* for infrastructure
- **Contributors** - [Contributing Guide](./CONTRIBUTING.md) for how to contribute

### By Module

- **[FinanceHub Documentation](./modules/financehub/README.md)** - Complete financial infrastructure ✅
  - [Business Capabilities](./modules/financehub/CAPABILITIES.md) - Features & use cases
  - [Technical Architecture](./modules/financehub/ARCHITECTURE.md) - Implementation details
  - [System Flowcharts](./modules/financehub/FLOWCHARTS.md) - Visual diagrams
- **[AIHub Documentation](./modules/aihub/README.md)** *(Preview Available)*
- **[CommHub Documentation](./modules/commhub/README.md)** *(Preview Available)*
- **E-Commerce, HelpDesk, CRM, Queue Manager** *(Coming Soon)*

### By Topic

- **[Architecture](./architecture/README.md)** ✅ - System design and patterns
  - [Domain-Driven Design](./architecture/DOMAIN_DRIVEN_DESIGN.md)
  - [Event-Driven Architecture](./architecture/EVENT_DRIVEN_ARCHITECTURE.md)
  - [Clean Architecture](./architecture/CLEAN_ARCHITECTURE.md)
  - [Pluggable Providers](./architecture/PLUGGABLE_PROVIDERS.md)
  - [Extensibility Patterns](./architecture/EXTENSIBILITY.md)
  - [Multi-Tenancy](./architecture/MULTI_TENANCY.md)
  - [Security & Authorization](./architecture/SECURITY.md)
  - [Performance & Caching](./architecture/PERFORMANCE.md)
  - [API Design](./architecture/API_DESIGN.md)
  - [Testing Strategy](./architecture/TESTING.md)
- **[Security Best Practices](./security/README.md)** ✅ - Security guidelines
- **[Getting Started](./getting-started/README.md)** ✅ - Quick start guide
- **[Deployment](./deployment/README.md)** *(Coming Soon)* - Production deployment guides

---

## 🔑 Key Features

### Identity & SSO

- **Authentication:** OIDC/OpenIddict (email/password, OTP, SSO)
- **Web3 Integration:** Optional wallet linking after OIDC login (SIWE-style)
- **Security:** Address storage only - never private keys
- **Multi-Wallet:** WalletConnect + browser wallet support

### Payment Flexibility

- **Domestic (IRR):** Shaparak/Parbad IPG for Iranian market
- **International:** Stripe for USD/EUR and other currencies
- **Crypto:** On-chain treasury with Web3 wallet integration
- **Hybrid:** Mix fiat and crypto payments for single invoice

### AI Capabilities

- **LLM Integration:** OpenAI, DeepSeek, self-hosted models
- **Vector Search:** Embeddings-based knowledge retrieval
- **Multi-Tenant:** Isolated knowledge bases per tenant
- **Usage Controls:** Quota management via FinanceHub

### Communication Hub

- **Channels:** Email, SMS, Telegram, live chat, push notifications
- **AI Templates:** Auto-generate channel-specific templates
- **Centralized:** Single message broker for all modules
- **Rate Limiting:** Tenant-level policies and controls

---

## 🎓 Learning Path

### For Business Leaders

1. Start with [FinanceHub Capabilities](./modules/financehub/CAPABILITIES.md) - Understand business value
2. Review [Use Cases & User Stories](./modules/financehub/CAPABILITIES.md#-user-stories) - See real-world scenarios
3. Explore [System Flowcharts](./modules/financehub/FLOWCHARTS.md) - Visual system overview

### For Developers

1. Read [Architecture Overview](./architecture/README.md) - System design principles
2. Study [Domain-Driven Design](./architecture/DOMAIN_DRIVEN_DESIGN.md) - Core patterns
3. Review [Event-Driven Architecture](./architecture/EVENT_DRIVEN_ARCHITECTURE.md) - Async processing
4. Follow [Getting Started Guide](./getting-started/README.md) - Quick start
5. Deep dive into [FinanceHub Architecture](./modules/financehub/ARCHITECTURE.md) - Reference implementation

### For DevOps

1. Follow [Getting Started Guide](./getting-started/README.md) - Local setup
2. Review [Deployment Guide](./deployment/README.md) *(Coming Soon)* - Production deployment
3. Study [Performance Guide](./architecture/PERFORMANCE.md) - Caching & optimization
4. Review [Security Guide](./security/README.md) - Security best practices

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- How to contribute
- Reporting bugs and requesting features
- Creating provider packages
- Writing tests
- Improving documentation
- Code style guidelines *(Coming Soon)*

---

## 📊 Project Status

### Current Release: Alpha

| Module | Status | Documentation | Tests |
|--------|--------|--------------|-------|
| **FinanceHub** | 🟡 Active Development | ✅ Complete | 🟡 In Progress |
| **AIHub** | 🟡 Active Development | 🟡 Preview Available | 🟡 In Progress |
| **CommHub** | 🔴 Planning | 🟡 Preview Available | 🔴 Not Started |
| **E-Commerce** | 🔴 Planning | 🟡 Preview Available | 🔴 Not Started |
| **HelpDesk** | 🔴 Planning | 🟡 Preview Available | 🔴 Not Started |
| **CRM** | 🔴 Planning | 🟡 Preview Available | 🔴 Not Started |
| **Queue Manager** | 🔴 Planning | 🟡 Preview Available | 🔴 Not Started |
| **Architecture Guides** | ✅ Complete | ✅ Complete | N/A |

Legend: ✅ Complete | 🟡 In Progress | 🔴 Not Started

---

## 🗓️ Roadmap

### 2026 H1 - Foundation

- ✅ SophiChain Core (AIHub, FinanceHub, CommHub) Alpha
- ✅ Multi-tenant skeleton applications
- ✅ Baseline observability and monitoring

### 2026 H2 - Initial Launch

- 🎯 E-Commerce + HelpDesk GA
- 🎯 Public documentation release
- 🎯 Initial open-source community setup

### 2027 H1 - Expansion

- 🎯 CRM + Queue Manager GA
- 🎯 AIHub advanced connectors
- 🎯 Module marketplace launch

### 2027+ - Ecosystem

- 🎯 Additional vertical modules
- 🎯 Enhanced knowledge base ingestion
- 🎯 Advanced analytics and reporting
- 🎯 Community governance model

*(Dates are planning targets and subject to change)*

---

## 🌟 Related Projects

### Tradino

**SophiChain** powers **[Tradino](https://tradino.ir)** - a B2B/B2C tourism-commerce platform for travel agencies:

- FinanceHub manages custodial wallets and mixed payment methods
- AIHub provides smart search and agentic support
- CommHub handles multi-channel customer outreach
- Token economics (TCT/TGT) layer for rewards and governance

---

## 📞 Support & Community

- **Documentation:** You're reading it!
- **GitHub Issues:** [Report bugs or request features](https://github.com/sophichain/sophichain/issues)
- **Discussions:** [Community forum](https://github.com/sophichain/sophichain/discussions)
- **Discord:** *(Coming Soon)*
- **Commercial Support:** Contact [SophiLabs](mailto:info@sophilabs.ir)

---

## 📄 License

SophiChain is released under the **MIT License**. See [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:

- [ABP Framework](https://abp.io) - Application framework
- [.NET](https://dotnet.microsoft.com) - Platform and runtime
- [MongoDB](https://mongodb.com) - Document database
- [Blazor](https://blazor.net) - Web UI framework
- And many other amazing open-source projects

---

**Ready to get started?** Jump to [Getting Started Guide](./getting-started/README.md) or explore [FinanceHub](./modules/financehub/README.md) documentation!
