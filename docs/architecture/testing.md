---
id: testing
title: Testing
sidebar_label: Testing
---
id: testing
# Testing in SophiChain

> **ABP Framework Testing Patterns**

---

id: testing
## 📖 Overview

SophiChain uses ABP's testing infrastructure with xUnit, Shouldly, and built-in test base classes.

---

id: testing
## 🏗️ Test Structure

### Application Tests

```csharp
public class WalletAppService_Tests : FinanceHubApplicationTestBase
{
    private readonly IWalletAppService _walletAppService;
    private readonly IWalletRepository _walletRepository;
    
    public WalletAppService_Tests()
    {
        _walletAppService = GetRequiredService<IWalletAppService>();
        _walletRepository = GetRequiredService<IWalletRepository>();
    }
    
    [Fact]
    public async Task Should_Create_Wallet()
    {
        await WithUnitOfWorkAsync(async () =>
        {
            // Arrange
            var input = new CreateWalletDto
            {
                UserId = Guid.NewGuid(),
                Name = "Test Wallet"
            };
            
            // Act
            var result = await _walletAppService.CreateAsync(input);
            
            // Assert
            result.ShouldNotBeNull();
            result.Name.ShouldBe("Test Wallet");
        });
    }
}
```

---

id: testing
## 🎯 Test Patterns

### Arrange-Act-Assert

```csharp
[Fact]
public async Task Should_Update_Wallet()
{
    await WithUnitOfWorkAsync(async () =>
    {
        // Arrange
        var wallet = new Wallet(Guid.NewGuid(), Guid.NewGuid(), "Original");
        await _repository.InsertAsync(wallet);
        
        // Act
        await _service.UpdateAsync(wallet.Id, new UpdateDto { Name = "Updated" });
        
        // Assert
        var updated = await _repository.GetAsync(wallet.Id);
        updated.Name.ShouldBe("Updated");
    });
}
```

### Testing with Shouldly

```csharp
// Equality
result.ShouldBe(expected);
result.ShouldNotBe(unexpected);

// Null checks
result.ShouldBeNull();
result.ShouldNotBeNull();

// Collections
list.ShouldContain(item);
list.ShouldNotContain(item);
list.ShouldAllBe(x => x.IsActive);

// Numeric
count.ShouldBeGreaterThan(0);
amount.ShouldBeLessThanOrEqualTo(100);

// Boolean
isActive.ShouldBeTrue();
isDeleted.ShouldBeFalse();
```

---

id: testing
## 🧪 Test Base Classes

### Application Test Base

```csharp
public abstract class MyModuleApplicationTestBase<TStartupModule> 
    : MyModuleTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{
    // Inherits:
    // - WithUnitOfWorkAsync()
    // - GetRequiredService<T>()
    // - GetService<T>()
}
```

### Domain Test Base

```csharp
public abstract class MyModuleDomainTestBase<TStartupModule> 
    : MyModuleTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{
    // Test domain logic and entities
}
```

---

id: testing
## ⚙️ Test Configuration

### Test Module

```csharp
[DependsOn(
    typeof(MyModuleApplicationModule),
    typeof(AbpTestBaseModule)
)]
public class MyModuleApplicationTestModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpUnitOfWorkDefaultOptions>(options =>
        {
            options.TransactionBehavior = UnitOfWorkTransactionBehavior.Disabled;
        });
        
        // Bypass authorization for tests
        context.Services.AddAlwaysAllowAuthorization();
    }
}
```

---

id: testing
## 🎨 Common Test Scenarios

### Test Pagination

```csharp
[Fact]
public async Task Should_Paginate_Results()
{
    await WithUnitOfWorkAsync(async () =>
    {
        // Arrange: Create 5 items
        for (int i = 0; i < 5; i++)
            await _repository.InsertAsync(new Item());
        
        // Act
        var result = await _service.GetListAsync(new PagedInput 
        { 
            SkipCount = 0, 
            MaxResultCount = 3 
        });
        
        // Assert
        result.TotalCount.ShouldBeGreaterThanOrEqualTo(5);
        result.Items.Count.ShouldBeLessThanOrEqualTo(3);
    });
}
```

### Test Filtering

```csharp
[Fact]
public async Task Should_Filter_By_User()
{
    await WithUnitOfWorkAsync(async () =>
    {
        var userId = Guid.NewGuid();
        await _repository.InsertAsync(new Item { UserId = userId });
        await _repository.InsertAsync(new Item { UserId = Guid.NewGuid() });
        
        var result = await _service.GetListAsync(new GetInput { UserId = userId });
        
        result.Items.ShouldAllBe(x => x.UserId == userId);
    });
}
```

### Test Business Logic

```csharp
[Fact]
public async Task Should_Throw_When_Insufficient_Balance()
{
    var wallet = new Wallet();
    
    await Should.ThrowAsync<BusinessException>(async () =>
    {
        wallet.Debit(100); // Balance is 0
    });
}
```

---

id: testing
## ✅ Best Practices

### Test Naming
- ✅ Use `Should_Expected_Behavior` pattern
- ✅ Be descriptive: `Should_Create_Wallet_With_Initial_Balance`
- ❌ Don't use generic names: `Test1`, `TestMethod`

### Test Structure
- ✅ One assertion concept per test
- ✅ Use Arrange-Act-Assert pattern
- ✅ Keep tests independent
- ✅ Use `WithUnitOfWorkAsync` for database operations
- ❌ Don't depend on test execution order

### Test Data
- ✅ Create test data in each test
- ✅ Use helper methods for common setup
- ✅ Clean up is automatic (transaction rollback)
- ❌ Don't rely on seed data

### Assertions
- ✅ Use Shouldly for readable assertions
- ✅ Assert specific values, not just "not null"
- ✅ Test edge cases
- ❌ Don't use multiple unrelated assertions

---

id: testing
## 📖 References

- [ABP Testing](https://abp.io/docs/latest/framework/testing)
- [xUnit Documentation](https://xunit.net/)
- [Shouldly Documentation](https://docs.shouldly.org/)

---

id: testing
