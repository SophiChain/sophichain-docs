---
id: index
title: Architecture Overview
sidebar_label: Architecture Overview
---
# SophiChain Architecture

> **Developer's Guide: System Design & Technical Architecture**

---

## 📖 Overview

This section contains **prescriptive architectural guidelines** for building SophiChain modules. All developers and contributors MUST follow these patterns to ensure consistency, quality, and maintainability across the platform.

**Target Audience:** Module developers, architects, contributors

---

## 📚 Core Architecture Guides

### ✅ Essential Reading

**MUST READ before creating any module:**

1. **[Domain-Driven Design](/architecture/domain-driven-design)** - Tactical DDD patterns
   - Entities, Value Objects, Aggregates
   - Domain Services, Repositories
   - Bounded Contexts, Events

2. **[Event-Driven Architecture](/architecture/event-driven-architecture)** - Async processing patterns
   - Local vs Distributed Events
   - Outbox Pattern implementation
   - Event Handler best practices

3. **[Pluggable Provider Pattern](/architecture/pluggable-providers)** - External integrations
   - Provider interface design
   - NuGet package structure
   - Auto-discovery patterns

4. **[Extensibility Patterns](/architecture/extensibility)** - Module customization without source modification
   - IHasExtraProperties for dynamic properties
   - Service override and replacement
   - DTO extensions and Object Extensions
   - Repository customization patterns

5. **[Clean Architecture Layers](/architecture/clean-architecture)** - Layer responsibilities and dependencies
   - Domain, Application, Infrastructure, Presentation layers
   - Dependency rules and layer boundaries
   - Module structure template

6. **[Multi-Tenancy Patterns](/architecture/multi-tenancy)** - Data isolation and tenant management
   - IMultiTenant implementation
   - Automatic data filtering
   - Tenant context switching

7. **[API Design Guidelines](/architecture/api-design)** - RESTful API conventions
   - Application Services pattern
   - DTOs and Auto API Controllers
   - Best practices

8. **[Security Architecture](/architecture/security)** - Authentication, authorization, data protection
   - Permission system
   - Authorization patterns
   - JWT authentication

9. **[Performance Optimization](/architecture/performance)** - Caching, indexing, query optimization
   - IDistributedCache usage
   - Caching strategies
   - Query optimization

10. **[Testing Strategy](/architecture/testing)** - Unit, integration, and E2E testing
    - Test structure and patterns
    - Arrange-Act-Assert
    - Shouldly assertions

---

## 🎯 Quick Start for Developers

### Creating a New Module

Follow this sequence:

1. **Define Bounded Context** - Identify domain boundaries
2. **Design Entities & Aggregates** - Follow [DDD Guide](/architecture/domain-driven-design)
3. **Define Domain Events** - Use [Event-Driven Guide](/architecture/event-driven-architecture)
4. **Create Repositories** - One per aggregate root
5. **Implement Domain Services** - Multi-entity coordination
6. **Build Application Services** - Use cases and DTOs
7. **Add Event Handlers** - React to domain events
8. **Create Provider Interfaces** - Follow [Provider Pattern](/architecture/pluggable-providers)
9. **Build UI Components** - Blazor pages and components

### Checklist for Code Review

#### Domain Layer
- [ ] All entities inherit from ABP base classes
- [ ] `IMultiTenant` implemented for tenant isolation
- [ ] `IHasExtraProperties` implemented for extensibility
- [ ] Business logic in domain layer, not application layer
- [ ] Domain events published for state changes
- [ ] Repository interfaces defined (one per aggregate root)

#### Application Layer
- [ ] Event handlers are idempotent
- [ ] Application services use interface (`IMyAppService`)
- [ ] All methods are `virtual` for extensibility

#### Extensibility
- [ ] Provider interfaces in Domain layer
- [ ] All public methods marked `virtual`
- [ ] DTOs support extra properties
- [ ] Type providers for extensible enums

#### Infrastructure
- [ ] Repository implementations in Infrastructure layer
- [ ] Repository methods are `virtual`

#### Testing & Documentation
- [ ] Comprehensive unit tests
- [ ] API follows RESTful conventions
- [ ] Extension points documented

---

## 📦 Module Structure Template

```
SophiChain.{ModuleName}/
├── src/
│   ├── SophiChain.{ModuleName}.Domain.Shared/
│   │   ├── {Context}/
│   │   │   ├── Enums/
│   │   │   ├── Constants/
│   │   │   └── ValueObjects/
│   │   └── ErrorCodes.cs
│   │
│   ├── SophiChain.{ModuleName}.Domain/
│   │   ├── {Context}/
│   │   │   ├── Entities/
│   │   │   ├── DomainServices/
│   │   │   └── Events/
│   │   └── Repositories/
│   │
│   ├── SophiChain.{ModuleName}.Application.Contracts/
│   │   ├── {Context}/
│   │   │   ├── Dtos/
│   │   │   └── I{Context}AppService.cs
│   │   └── Permissions/
│   │
│   ├── SophiChain.{ModuleName}.Application/
│   │   ├── {Context}/
│   │   │   ├── {Context}AppService.cs
│   │   │   ├── EventHandlers/
│   │   │   └── AutoMapperProfile.cs
│   │
│   ├── SophiChain.{ModuleName}.MongoDB/
│   │   ├── Repositories/
│   │   └── {ModuleName}MongoDbContext.cs
│   │
│   └── SophiChain.{ModuleName}.Blazor/
│       ├── Pages/
│       └── Components/
│
└── test/
    ├── SophiChain.{ModuleName}.Domain.Tests/
    ├── SophiChain.{ModuleName}.Application.Tests/
    └── SophiChain.{ModuleName}.TestBase/
```

---

## 🔍 Applying These Patterns

### When Building New Modules

**Follow these architectural patterns:**
- Define clear bounded contexts for your domain
- Design aggregates with proper invariants
- Use domain services for complex business logic
- Implement pluggable providers for external services
- Publish domain events for side effects
- Keep entities and value objects in Domain layer
- **Apply event-driven architecture consistently**

**Module Structure Template:**
- `Domain` - Entities, value objects, domain services, repository interfaces
- `Application` - Application services, DTOs, mappers
- `HttpApi` - Controllers (thin pass-through)
- `MongoDB` / `EntityFrameworkCore` - Repository implementations
- `Blazor` - UI components
- **Separate provider packages** - External integrations

---

## 🎓 Learning Resources

### ABP Framework Documentation
- [ABP Framework Docs](https://abp.io/docs/latest)
- [DDD Book](https://abp.io/books/implementing-domain-driven-design)
- [Best Practices](https://abp.io/docs/latest/framework/architecture/best-practices)

### Domain-Driven Design
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Implementing DDD](https://vaughnvernon.com/books/)
- [DDD Reference](https://www.domainlanguage.com/ddd/reference/)

### Architecture Patterns
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)

---

## 🤝 Contributing

See: [Contributing Guide](/contributing)

**Architecture Review Process:**
1. Submit architectural design document (ADD)
2. Core team review (DDD compliance, ABP patterns)
3. Approved → Implementation
4. Code review (pattern compliance)
5. Merge

---

## 📞 Support

- **Questions:** [GitHub Discussions](https://github.com/sophichain/discussions)
- **Architecture Review:** Tag `@architecture` in PR
- **Best Practices:** See individual guide documents

---

[Back to Main Documentation](../)

