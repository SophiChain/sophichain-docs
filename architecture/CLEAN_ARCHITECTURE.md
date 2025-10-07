# Clean Architecture Layers in SophiChain

> **ABP Framework Layer Organization**

---

## 📖 Overview

SophiChain follows ABP Framework's layered architecture based on Domain-Driven Design principles. Each layer has specific responsibilities and dependency rules.

---

## 🏗️ Layer Structure

### Layer Hierarchy

```
┌─────────────────────────────────────┐
│       Presentation Layer            │
│  (Blazor, HttpApi, HttpApi.Client) │
└─────────────────────────────────────┘
              ↓ depends on
┌─────────────────────────────────────┐
│       Application Layer             │
│  (Application, Application.Contracts)│
└─────────────────────────────────────┘
              ↓ depends on
┌─────────────────────────────────────┐
│         Domain Layer                │
│  (Domain, Domain.Shared)            │
└─────────────────────────────────────┘
              ↑ implemented by
┌─────────────────────────────────────┐
│     Infrastructure Layer            │
│  (EntityFrameworkCore, MongoDB)     │
└─────────────────────────────────────┘
```

---

## 📦 Layer Responsibilities

### 1. Domain Layer

**Projects:** `*.Domain`, `*.Domain.Shared`

**Contains:**
- Entities and Aggregates
- Value Objects
- Domain Services
- Repository Interfaces
- Domain Events
- Business Logic and Invariants

**Example:**
```csharp
public class Wallet : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid UserId { get; private set; }
    public decimal Balance { get; private set; }
    public Guid? TenantId { get; private set; }
    
    public void Credit(decimal amount)
    {
        if (amount <= 0)
            throw new BusinessException("AmountMustBePositive");
        Balance += amount;
        AddLocalEvent(new WalletCreditedEvent { WalletId = Id, Amount = amount });
    }
}
```

**Rules:**
- ✅ Pure business logic
- ✅ Framework-independent (except ABP base classes)
- ✅ No dependencies on other layers
- ❌ No UI logic
- ❌ No database access
- ❌ No external service calls

---

### 2. Application Layer

**Projects:** `*.Application`, `*.Application.Contracts`

**Contains:**
- Application Services
- DTOs (Data Transfer Objects)
- Input/Output models
- Permission definitions
- Application logic (orchestration)

**Example:**
```csharp
[Authorize(FinanceHubPermissions.Admin.Wallets.Default)]
public class AdminWalletAppService : FinanceHubAppService, IAdminWalletAppService
{
    private readonly IWalletRepository _walletRepository;
    
    public virtual async Task<WalletDto> GetAsync(Guid id)
    {
        var wallet = await _walletRepository.GetAsync(id);
        return ObjectMapper.Map<Wallet, WalletDto>(wallet);
    }
    
    [Authorize(FinanceHubPermissions.Admin.Wallets.Create)]
    public virtual async Task<WalletDto> CreateAsync(CreateWalletDto input)
    {
        var wallet = new Wallet(GuidGenerator.Create(), input.UserId, input.Name);
        await _walletRepository.InsertAsync(wallet);
        return ObjectMapper.Map<Wallet, WalletDto>(wallet);
    }
}
```

**Rules:**
- ✅ Thin orchestration layer
- ✅ Input validation
- ✅ Permission checks
- ✅ DTO mapping
- ❌ No business logic (delegate to Domain)
- ❌ No direct database queries (use repositories)

---

### 3. Infrastructure Layer

**Projects:** `*.EntityFrameworkCore`, `*.MongoDB`

**Contains:**
- Repository implementations
- Database context
- Database migrations
- External service integrations

**Example:**
```csharp
public class EfCoreWalletRepository : EfCoreRepository<DbContext, Wallet, Guid>, IWalletRepository
{
    public virtual async Task<List<Wallet>> GetUserWalletsAsync(Guid userId)
    {
        var dbSet = await GetDbSetAsync();
        return await dbSet.Where(w => w.UserId == userId).ToListAsync();
    }
}
```

**Rules:**
- ✅ Implement repository interfaces
- ✅ Database-specific code
- ✅ Override `WithDetails()` for eager loading
- ❌ No business logic
- ❌ Don't expose IQueryable to Application layer

---

### 4. Presentation Layer

**Projects:** `*.Blazor`, `*.HttpApi`, `*.HttpApi.Client`

**Contains:**
- UI Components (Blazor)
- Controllers (HttpApi)
- HTTP Client proxies

**Example:**
```csharp
[Route("api/wallets")]
public class WalletController : AbpController, IWalletAppService
{
    private readonly IWalletAppService _appService;
    
    [HttpGet("{id}")]
    public Task<WalletDto> GetAsync(Guid id) => _appService.GetAsync(id);
}
```

**Rules:**
- ✅ Thin pass-through to Application layer
- ✅ Use ABP's Auto API Controllers when possible
- ❌ No business logic
- ❌ No direct repository access

---

## 🔄 Dependency Rules

### Allowed Dependencies

```
Domain.Shared ← Domain ← Application.Contracts ← Application
                              ↑
                         Infrastructure
                              ↑
                        Presentation
```

**Key Rules:**
1. **Domain** has no dependencies (except ABP framework)
2. **Application** depends on Domain and Application.Contracts
3. **Infrastructure** implements Domain repository interfaces
4. **Presentation** depends on Application.Contracts only

---

## 🎯 Module Template

```
SophiChain.{ModuleName}/
├── src/
│   ├── SophiChain.{ModuleName}.Domain.Shared/
│   │   ├── Enums/
│   │   ├── Consts/
│   │   └── Localization/
│   │
│   ├── SophiChain.{ModuleName}.Domain/
│   │   ├── Entities/
│   │   ├── Events/
│   │   ├── Services/
│   │   └── Repositories/
│   │
│   ├── SophiChain.{ModuleName}.Application.Contracts/
│   │   ├── DTOs/
│   │   ├── AppServices/
│   │   └── Permissions/
│   │
│   ├── SophiChain.{ModuleName}.Application/
│   │   ├── AppServices/
│   │   ├── Events/
│   │   └── Services/
│   │
│   ├── SophiChain.{ModuleName}.EntityFrameworkCore/
│   │   ├── EntityFrameworkCore/
│   │   └── Repositories/
│   │
│   ├── SophiChain.{ModuleName}.MongoDB/
│   │   ├── MongoDB/
│   │   └── Repositories/
│   │
│   ├── SophiChain.{ModuleName}.HttpApi/
│   │   └── Controllers/
│   │
│   ├── SophiChain.{ModuleName}.HttpApi.Client/
│   │
│   └── SophiChain.{ModuleName}.Blazor/
│       ├── Pages/
│       └── Components/
│
└── test/
    ├── SophiChain.{ModuleName}.Domain.Tests/
    ├── SophiChain.{ModuleName}.Application.Tests/
    ├── SophiChain.{ModuleName}.EntityFrameworkCore.Tests/
    └── SophiChain.{ModuleName}.TestBase/
```

---

## ✅ Best Practices

### Domain Layer
- ✅ Keep entities focused on business rules
- ✅ Use private setters for properties
- ✅ Provide business methods (not just getters/setters)
- ✅ Publish domain events for state changes

### Application Layer
- ✅ Keep services thin - delegate to Domain
- ✅ Use authorization attributes
- ✅ Map entities to DTOs
- ✅ Use `virtual` methods for extensibility

### Infrastructure Layer
- ✅ Keep repositories focused on data access
- ✅ Override `WithDetails()` for includes
- ✅ Use ABP's repository base classes
- ✅ Don't expose IQueryable

### Presentation Layer
- ✅ Keep controllers as thin pass-through
- ✅ Use ABP's Auto API Controllers
- ✅ Let ABP handle routing conventions

---

## 📖 References

- [ABP Architecture](https://abp.io/docs/latest/framework/architecture)
- [Domain-Driven Design](./DOMAIN_DRIVEN_DESIGN.md)
- [Application Services](https://abp.io/docs/latest/framework/architecture/domain-driven-design/application-services)

---
