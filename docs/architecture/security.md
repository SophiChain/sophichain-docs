---
id: security
title: Security
sidebar_label: Security
---
id: security
# Security & Authorization in SophiChain

> **ABP Framework Permission System**

---

id: security
## 📖 Overview

SophiChain uses ABP's permission-based authorization system with hierarchical permissions and localization support.

---

id: security
## 🏗️ Permission System

### 1. Define Permissions

```csharp
// Application.Contracts/Permissions/FinanceHubPermissionDefinitionProvider.cs
public class FinanceHubPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var financeHubGroup = context.AddGroup(
            FinanceHubPermissions.GroupName, 
            L("Permission:FinanceHub"));

        // Admin root permission
        var adminRoot = financeHubGroup.AddPermission(
            FinanceHubPermissions.Admin.Default, 
            L("Permission:AdminRoot"));

        // Admin.Wallets permissions
        var adminWallets = adminRoot.AddChild(
            FinanceHubPermissions.Admin.Wallets.Default, 
            L("Permission:Admin.Wallets"));
            
        adminWallets.AddChild(
            FinanceHubPermissions.Admin.Wallets.View, 
            L("Permission:Admin.Wallets.View"));
            
        adminWallets.AddChild(
            FinanceHubPermissions.Admin.Wallets.Create, 
            L("Permission:Admin.Wallets.Create"));
            
        adminWallets.AddChild(
            FinanceHubPermissions.Admin.Wallets.Update, 
            L("Permission:Admin.Wallets.Update"));
            
        adminWallets.AddChild(
            FinanceHubPermissions.Admin.Wallets.Delete, 
            L("Permission:Admin.Wallets.Delete"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<FinanceHubResource>(name);
    }
}
```

### 2. Permission Constants

```csharp
// Application.Contracts/Permissions/FinanceHubPermissions.cs
public static class FinanceHubPermissions
{
    public const string GroupName = "FinanceHub";

    public static class Admin
    {
        public const string Default = GroupName + ".Admin";

        public static class Wallets
        {
            public const string Default = Admin.Default + ".Wallets";
            public const string View = Default + ".View";
            public const string Create = Default + ".Create";
            public const string Update = Default + ".Update";
            public const string Delete = Default + ".Delete";
            public const string Manage = Default + ".Manage";
            public const string AdjustBalance = Default + ".AdjustBalance";
        }

        public static class Invoices
        {
            public const string Default = Admin.Default + ".Invoices";
            public const string View = Default + ".View";
            public const string Create = Default + ".Create";
            public const string Update = Default + ".Update";
            public const string Delete = Default + ".Delete";
        }
    }

    public static class User
    {
        public const string Default = GroupName + ".User";

        public static class Wallets
        {
            public const string Default = User.Default + ".Wallets";
            public const string View = Default + ".View";
        }
    }
}
```

---

id: security
## 🎯 Authorization

### Service-Level Authorization

```csharp
// Class-level authorization
[Authorize(FinanceHubPermissions.Admin.Wallets.Default)]
public class AdminWalletAppService : FinanceHubAppService
{
    // Method-level authorization
    [Authorize(FinanceHubPermissions.Admin.Wallets.View)]
    public virtual async Task<WalletDto> GetWalletAsync(Guid id)
    {
        var wallet = await _walletRepository.GetAsync(id);
        return ObjectMapper.Map<Wallet, WalletDto>(wallet);
    }

    [Authorize(FinanceHubPermissions.Admin.Wallets.Create)]
    public virtual async Task<WalletDto> CreateWalletAsync(CreateWalletDto input)
    {
        // Implementation
    }

    [Authorize(FinanceHubPermissions.Admin.Wallets.Delete)]
    public virtual async Task DeleteWalletAsync(Guid id)
    {
        await _walletRepository.DeleteAsync(id);
    }
}
```

### Imperative Authorization

```csharp
public class WalletService : DomainService // Inherits AuthorizationService
{
    public async Task<bool> CanUserAccessWalletAsync(Guid walletId)
    {
        var result = await AuthorizationService.AuthorizeAsync(
            FinanceHubPermissions.Admin.Wallets.View);
        return result.Succeeded;
    }
    
    public async Task ProcessWalletAsync(Guid walletId)
    {
        await AuthorizationService.CheckAsync(
            FinanceHubPermissions.Admin.Wallets.Manage);
        // Process wallet
    }
}
```

---

id: security
## 🔐 Authentication

### JWT Token Authentication

ABP uses JWT tokens for authentication:

**Login Request:**
```http
POST /api/account/login
Content-Type: application/json

{
  "userNameOrEmailAddress": "admin",
  "password": "1q2w3E*"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "encryptedAccessToken": "...",
  "expireInSeconds": 3600,
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Using Token:**
```http
GET /api/financehub/wallets/{id}
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

id: security
## 👥 Users & Roles

### Assigning Permissions to Roles

```csharp
// In your seed data or admin UI
public class FinanceHubDataSeedContributor : IDataSeedContributor
{
    public async Task SeedAsync(DataSeedContext context)
    {
        // Create admin role with permissions
        var adminRole = new IdentityRole(
            id: Guid.NewGuid(),
            name: "FinanceAdmin",
            tenantId: context.TenantId
        );

        await _roleRepository.InsertAsync(adminRole);

        // Grant permissions to role
        await _permissionManager.SetForRoleAsync(
            adminRole.Name,
            FinanceHubPermissions.Admin.Wallets.Default,
            true
        );
    }
}
```

---

id: security
## ✅ Best Practices

### Permission Design
- ✅ Use hierarchical permissions (Parent → Child)
- ✅ Define granular permissions (View, Create, Update, Delete)
- ✅ Use localized permission names
- ✅ Group related permissions
- ❌ Don't create too many permissions
- ❌ Don't hardcode permission strings

### Authorization
- ✅ Use `[Authorize]` attributes on services
- ✅ Check permissions at service level, not UI
- ✅ Use method-level authorization for fine-grained control
- ✅ Use `IAuthorizationService` for complex logic
- ❌ Don't rely on UI-only authorization
- ❌ Don't check permissions in Domain layer

### Security
- ✅ Always validate user input
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Log security events
- ✅ Use strong passwords
- ❌ Don't expose sensitive data in APIs
- ❌ Don't log passwords or tokens

---

id: security
## 📖 References

- [ABP Authorization](https://abp.io/docs/latest/framework/fundamentals/authorization)
- [Permission Management](https://abp.io/docs/latest/modules/permission-management)
- [Identity Module](https://abp.io/docs/latest/modules/identity)

---

id: security
