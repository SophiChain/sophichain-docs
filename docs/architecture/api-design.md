---
id: api-design
title: API Design
sidebar_label: API Design
---
# API Design in SophiChain

> **ABP Framework Auto API & Application Services**

---

## 📖 Overview

SophiChain uses ABP's Application Services pattern, which automatically exposes services as HTTP APIs without writing controllers manually.

---

## 🏗️ Application Service Pattern

### 1. Define Service Interface

```csharp
// Application.Contracts/AppServices/IAdminWalletAppService.cs
public interface IAdminWalletAppService : IApplicationService
{
    Task<PagedResultDto<WalletDto>> GetAllAsync(GetWalletsInput input);
    Task<WalletDto> GetWalletAsync(Guid id);
    Task<WalletDto> CreateWalletForUserAsync(CreateWalletForUserDto input);
    Task<WalletDto> UpdateWalletAsync(Guid id, UpdateWalletDto input);
    Task DeleteWalletAsync(Guid id);
}
```

**Naming Conventions:**
- `GetAsync` → GET
- `Get{Entity}Async` → `GET /{id}`
- `CreateAsync` → POST
- `UpdateAsync` → PUT
- `DeleteAsync` → DELETE

---

### 2. Implement Service

```csharp
[Authorize(FinanceHubPermissions.Admin.Wallets.Default)]
public class AdminWalletAppService : FinanceHubAppService, IAdminWalletAppService
{
    private readonly IWalletRepository _walletRepository;
    
    [Authorize(FinanceHubPermissions.Admin.Wallets.View)]
    public virtual async Task<WalletDto> GetWalletAsync(Guid id)
    {
        var wallet = await _walletRepository.GetAsync(id);
        return ObjectMapper.Map<Wallet, WalletDto>(wallet);
    }
    
    [Authorize(FinanceHubPermissions.Admin.Wallets.Create)]
    public virtual async Task<WalletDto> CreateWalletAsync(CreateWalletDto input)
    {
        var wallet = new Wallet(GuidGenerator.Create(), input.UserId, input.Name);
        await _walletRepository.InsertAsync(wallet);
        return ObjectMapper.Map<Wallet, WalletDto>(wallet);
    }
}
```

**Note:** `ObjectMapper`, `GuidGenerator`, `AsyncExecuter` available from base `ApplicationService`

---

## 🎯 DTOs (Data Transfer Objects)

### Input DTOs

```csharp
public class GetWalletsInput : PagedAndSortedResultRequestDto
{
    public Guid? UserId { get; set; }
    public string? SearchText { get; set; }
}

public class CreateWalletDto
{
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    [StringLength(128)]
    public string Name { get; set; }
}
```

### Output DTOs

```csharp
public class WalletDto : EntityDto<Guid>
{
    public Guid UserId { get; set; }
    public string Name { get; set; }
    public decimal Balance { get; set; }
    public bool IsActive { get; set; }
}
```

---

## 🔗 Auto API Controllers

ABP automatically creates HTTP APIs for application services:

**Service Method:**
```csharp
Task<WalletDto> GetWalletAsync(Guid id);
```

**Generated API:**
```
GET /api/financehub/admin-wallet/{id}
```

### URL Convention

```
/api/{module-name}/{service-name}/{method-name}
```

**Examples:**
- `IAdminWalletAppService.GetWalletAsync(id)` →  
  `GET /api/financehub/admin-wallet/{id}`
  
- `IAdminWalletAppService.GetAllAsync(input)` →  
  `GET /api/financehub/admin-wallet?userId=...&skip=0&max=10`
  
- `IAdminWalletAppService.CreateWalletForUserAsync(dto)` →  
  `POST /api/financehub/admin-wallet/create-wallet-for-user`

---

## 🎨 Manual Controllers (Optional)

When you need custom routing or behavior:

```csharp
[Route("api/wallets")]
public class WalletController : AbpController, IWalletAppService
{
    private readonly IWalletAppService _walletAppService;
    
    [HttpGet("{id}")]
    public Task<WalletDto> GetAsync(Guid id) => _walletAppService.GetAsync(id);
    
    [HttpPost]
    public Task<WalletDto> CreateAsync(CreateWalletDto input) => _walletAppService.CreateAsync(input);
}
```

---

## ✅ Best Practices

### Service Design
- ✅ Inherit from base `ApplicationService` or custom base
- ✅ Use `virtual` for extensibility
- ✅ Add `[Authorize]` attributes for permissions
- ✅ Keep services thin - delegate to Domain
- ✅ Return DTOs, not entities
- ❌ Don't put business logic in services
- ❌ Don't return IQueryable

### DTO Design
- ✅ Use separate DTOs for input/output
- ✅ Use `EntityDto<TKey>` for entities
- ✅ Use validation attributes (`[Required]`, `[StringLength]`)
- ✅ Use computed properties (e.g., `AvailableBalance`)
- ❌ Don't expose entity references directly
- ❌ Don't reuse entity classes as DTOs

### Pagination
- ✅ Use `PagedAndSortedResultRequestDto` for input
- ✅ Return `PagedResultDto<T>`
- ✅ Always include total count
- ✅ Apply sorting and filtering
- ❌ Don't return entire collections without paging

### Error Handling
- ✅ Throw `BusinessException` with error codes
- ✅ Throw `EntityNotFoundException` for not found
- ✅ Let ABP handle exception translation
- ❌ Don't return error DTOs
- ❌ Don't catch and swallow exceptions

---

## 📖 References

- [Application Services](https://abp.io/docs/latest/framework/architecture/domain-driven-design/application-services)
- [Auto API Controllers](https://abp.io/docs/latest/framework/api-development/auto-api-controllers)
- [Data Transfer Objects](https://abp.io/docs/latest/framework/architecture/domain-driven-design/data-transfer-objects)

---

