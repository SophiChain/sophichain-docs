# Multi-Tenancy in SophiChain

> **ABP Framework Multi-Tenancy Features**

---

## 📖 Overview

SophiChain uses ABP Framework's built-in multi-tenancy system to support multiple tenants (organizations) in a single application instance. Data isolation is automatic and transparent.

---

## 🏗️ How It Works

### IMultiTenant Interface

ABP provides automatic data filtering for entities that implement `IMultiTenant`:

```csharp
public interface IMultiTenant
{
    Guid? TenantId { get; }
}
```

**Key Points:**
- `TenantId == null` → **Host data** (shared across all tenants)
- `TenantId == {specific-guid}` → **Tenant-specific data**

---

## 🎯 Implementation

### 1. Make Entity Multi-Tenant

```csharp
// Domain/Entities/Wallet.cs
public class Wallet : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid UserId { get; private set; }
    public string Name { get; private set; }
    public decimal Balance { get; private set; }
    
    // Required by IMultiTenant
    public Guid? TenantId { get; private set; }
    
    protected Wallet()
    {
        // Required by ABP Framework
    }
    
    public Wallet(
        Guid id,
        Guid userId,
        string name,
        Guid currencyId,
        Guid? tenantId = null) : base(id)
    {
        UserId = userId;
        Name = Check.NotNullOrWhiteSpace(name, nameof(name));
        CurrencyId = currencyId;
        TenantId = tenantId; // Set from current tenant context
    }
}
```

**Rules:**
- ✅ Add `IMultiTenant` interface
- ✅ Add `Guid? TenantId { get; private set; }`
- ✅ Pass `tenantId` in constructor (optional)
- ❌ Don't set TenantId manually (ABP handles it)

---

### 2. Automatic Data Filtering

ABP automatically filters queries by current tenant:

```csharp
// Application service
public class AdminWalletAppService : FinanceHubAppService
{
    private readonly IWalletRepository _walletRepository;
    
    public virtual async Task<List<WalletDto>> GetAllAsync()
    {
        // ABP automatically adds: WHERE TenantId = CurrentTenantId
        var wallets = await _walletRepository.GetListAsync();
        return ObjectMapper.Map<List<Wallet>, List<WalletDto>>(wallets);
    }
}
```

**ABP Handles:**
- ✅ Automatically filters `WHERE TenantId = CurrentTenant.Id`
- ✅ Works with all repository methods
- ✅ Works with EF Core and MongoDB
- ✅ Uses `IDataFilter` internally (can be disabled if needed)

**Note:** Repositories must be injected - they are NOT inherited from base classes.

---

### 3. Accessing Other Tenant's Data

Sometimes you need to access data from different tenants (admin scenarios):

```csharp
public class AdminWalletAppService : FinanceHubAppService // Inherits CurrentTenant
{
    private readonly IWalletRepository _walletRepository;
    
    public virtual async Task<List<WalletDto>> GetAllTenantsWalletsAsync(Guid? targetTenantId)
    {
        // CurrentTenant available from base ApplicationService
        using (CurrentTenant.Change(targetTenantId))
        {
            var wallets = await _walletRepository.GetListAsync();
            return ObjectMapper.Map<List<Wallet>, List<WalletDto>>(wallets);
        }
    }
    
    public virtual async Task<List<WalletDto>> GetAllWalletsAcrossAllTenantsAsync()
    {
        // Query all tenants (use with caution!)
        using (CurrentTenant.Change(null))
        {
            var wallets = await _walletRepository.GetListAsync();
            return ObjectMapper.Map<List<Wallet>, List<WalletDto>>(wallets);
        }
    }
}
```

**Note:** `CurrentTenant` is available from ABP base classes (`ApplicationService`, `DomainService`, `AbpComponentBase`)

### 4. Disabling Tenant Filter (IDataFilter)

Use `IDataFilter` to temporarily disable automatic filtering:

```csharp
public class AdminWalletAppService : FinanceHubAppService
{
    private readonly IWalletRepository _walletRepository;
    
    public virtual async Task<List<WalletDto>> GetAllWalletsAsync()
    {
        // Disable multi-tenant filter temporarily
        using (DataFilter.Disable<IMultiTenant>())
        {
            var wallets = await _walletRepository.GetListAsync();
            return ObjectMapper.Map<List<Wallet>, List<WalletDto>>(wallets);
        }
    }
}
```

**Note:** `DataFilter` is also available from ABP base classes. See [ABP Data Filtering](https://abp.io/docs/latest/framework/infrastructure/data-filtering) for more details.

**Comparison:**
- `CurrentTenant.Change(tenantId)` → Switch to specific tenant
- `CurrentTenant.Change(null)` → Switch to host (null tenant)  
- `DataFilter.Disable<IMultiTenant>()` → Disable filtering completely

---

## 🔄 Tenant Resolution

ABP resolves current tenant from multiple sources (in order):

1. **Query String:** `?__tenant={tenantId}`
2. **HTTP Header:** `__tenant: {tenantId}`
3. **Cookie:** `__tenant={tenantId}`
4. **Subdomain:** `{tenant}.yourdomain.com`
5. **Custom resolver:** Implement `ITenantResolveContributor`

---

## 🎯 Host vs Tenant Data

### Host Data (Shared)

Some entities should be shared across all tenants:

```csharp
// This entity is NOT multi-tenant
public class Currency : FullAuditedAggregateRoot<Guid>
{
    public string Code { get; private set; } // USD, EUR, BTC
    public string Name { get; private set; }
    
    // NO TenantId property
    // Available to all tenants
}
```

**Use Cases:**
- System settings
- Predefined currencies
- Lookup tables
- Global configuration

### Tenant-Specific Data

Data that belongs to a specific tenant:

```csharp
// This entity IS multi-tenant
public class Wallet : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid UserId { get; private set; }
    public decimal Balance { get; private set; }
    public Guid? TenantId { get; private set; } // ← Tenant isolation
}
```

**Use Cases:**
- User data
- Transactions
- Wallets
- Invoices

---

## 🗄️ Database Strategies

ABP supports multiple multi-tenancy database strategies:

### 1. Single Database (Default)

All tenants share one database with automatic filtering:

```
Database: SophiChain
├── Wallets (TenantId column)
├── Transactions (TenantId column)
└── Currencies (No TenantId - shared)
```

**Pros:** Simple, efficient
**Cons:** All data in one database

### 2. Database Per Tenant

Each tenant has its own database:

```
Database: SophiChain_Tenant1
├── Wallets
└── Transactions

Database: SophiChain_Tenant2
├── Wallets
└── Transactions
```

**Pros:** Better isolation, scalability
**Cons:** More complex management

**Configuration:**
```json
{
  "ConnectionStrings": {
    "Default": "Server=...;Database=SophiChain;",
    "Tenant1": "Server=...;Database=SophiChain_Tenant1;",
    "Tenant2": "Server=...;Database=SophiChain_Tenant2;"
  }
}
```

---

## ✅ Best Practices

### Entity Design
- ✅ Add `IMultiTenant` to tenant-specific entities
- ✅ Keep host entities without `IMultiTenant` (shared data)
- ✅ Let ABP set `TenantId` automatically
- ❌ Don't manually filter by `TenantId` in queries
- ❌ Don't set `TenantId` manually after creation

### Repository Usage
- ✅ Always inject repositories (not inherited from base classes)
- ✅ Use standard repository methods (filtering is automatic)
- ✅ Use `CurrentTenant.Change()` to access other tenant data
- ✅ Use `DataFilter.Disable<IMultiTenant>()` when needed
- ✅ Always restore context with `using` statement
- ❌ Don't bypass tenant filtering unless necessary

### Security
- ✅ Always check permissions before changing tenant context
- ✅ Log tenant context changes
- ✅ Use `ICurrentTenant.Change(null)` only in admin scenarios
- ❌ Never expose tenant IDs to unauthorized users

---

## 🧪 Testing

```csharp
public class Wallet_Tests : FinanceHubDomainTestBase // Inherits CurrentTenant
{
    [Fact]
    public async Task Should_Filter_By_Tenant()
    {
        var tenant1Id = Guid.NewGuid();
        
        using (CurrentTenant.Change(tenant1Id))
        {
            var wallet = new Wallet(Guid.NewGuid(), Guid.NewGuid(), "Wallet", Guid.NewGuid());
            await _walletRepository.InsertAsync(wallet);
            
            var wallets = await _walletRepository.GetListAsync();
            wallets.Count.ShouldBe(1);
        }
    }
}
```

---

## 📖 References

- [ABP Multi-Tenancy](https://abp.io/docs/latest/framework/architecture/multi-tenancy)
- [Tenant Management](https://abp.io/docs/latest/modules/tenant-management)
- [Data Filtering](https://abp.io/docs/latest/framework/infrastructure/data-filtering)

---
