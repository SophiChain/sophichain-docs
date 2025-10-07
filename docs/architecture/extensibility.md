---
id: extensibility
title: Extensibility
sidebar_label: Extensibility
---
id: extensibility
# Extensibility Patterns in SophiChain

> **Developer's Guide: How to Extend Modules Without Modifying Source Code**

---

id: extensibility
## 📖 Overview

SophiChain modules are designed to be extended by consumers without modifying the original source code. This guide covers all extensibility mechanisms provided by ABP Framework and SophiChain-specific patterns.

**Target Audience:** Module consumers, plugin developers, customization specialists

**Core Principle:** All SophiChain modules MUST be extensible using these patterns.

---

id: extensibility
## 🎯 Why Extensibility Matters

**Benefits:**
- ✅ **No Source Modification** - Extend without touching original code
- ✅ **Upgrade Safety** - Your customizations survive module updates
- ✅ **Maintainability** - Clear separation between core and customizations
- ✅ **Testability** - Test customizations independently
- ✅ **Composability** - Multiple extensions can coexist

**Use Cases:**
- Add custom properties to entities
- Override business logic
- Add custom types (e.g., "Premium" customer type)
- Extend DTOs with additional fields
- React to domain events with custom logic
- Add custom API endpoints

---

id: extensibility
## 🏗️ Extension Mechanisms

### 1. Extension Properties (IHasExtraProperties)

**Purpose:** Add dynamic properties to entities without schema changes

**When to Use:**
- Adding tenant-specific fields
- Custom metadata storage
- Temporary features before schema migration
- Plugin-specific data

**Pattern:**

```csharp
// Module ensures all entities implement IHasExtraProperties
public class Product : FullAuditedAggregateRoot<Guid>, IHasExtraProperties
{
    public ExtraPropertyDictionary ExtraProperties { get; protected set; }
    
    public Product()
    {
        ExtraProperties = new ExtraPropertyDictionary();
        this.SetDefaultsForExtraProperties();
    }
}

// Consumer extends entity
public class MyCustomizationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // No code needed - just use SetProperty()
    }
}

// Usage in consumer code
public class MyProductService : ApplicationService
{
    public async Task CustomizeProductAsync(Guid productId)
    {
        var product = await _productRepository.GetAsync(productId);
        
        // Add custom properties
        product.SetProperty("WarrantyMonths", 24);
        product.SetProperty("LoyaltyPoints", 100);
        product.SetProperty("CustomTag", "Premium");
        
        await _productRepository.UpdateAsync(product);
    }
    
    public int GetWarrantyMonths(Product product)
    {
        return product.GetProperty<int>("WarrantyMonths");
    }
}
```

**Database Storage:**
- MongoDB: Stored as nested document
- SQL: Stored as JSON column

**Benefits:**
- ✅ No schema changes required
- ✅ Type-safe access
- ✅ Automatic serialization
- ✅ Works with DTOs (see DTO Extensions)

---

id: extensibility
### 2. Service Override

**Purpose:** Replace or extend domain services and application services

**When to Use:**
- Modify business logic
- Add validation rules
- Inject custom behavior before/after operations
- Replace entire service implementation

**Pattern A: Extend and Call Base**

```csharp
// Module provides virtual methods
public class ProductManager : DomainService
{
    public virtual async Task<Product> CreateAsync(string name, decimal price)
    {
        await ValidateAsync(name, price);
        
        var product = new Product(GuidGenerator.Create(), name, price);
        return await _repository.InsertAsync(product);
    }
    
    protected virtual Task ValidateAsync(string name, decimal price)
    {
        // Default validation
        return Task.CompletedTask;
    }
}

// Consumer extends service
[Dependency(ReplaceServices = true)]
[ExposeServices(typeof(ProductManager))]
public class CustomProductManager : ProductManager
{
    private readonly ICashbackService _cashbackService;
    
    public CustomProductManager(ICashbackService cashbackService)
    {
        _cashbackService = cashbackService;
    }
    
    public override async Task<Product> CreateAsync(string name, decimal price)
    {
        // Before logic
        await _warrantyService.ValidateWarrantyEligibilityAsync(price);
        
        // Call base implementation
        var product = await base.CreateAsync(name, price);
        
        // After logic
        product.SetProperty("WarrantyMonths", await _warrantyService.CalculateMonthsAsync(price));
        
        return product;
    }
    
    protected override async Task ValidateAsync(string name, decimal price)
    {
        // Call base validation
        await base.ValidateAsync(name, price);
        
        // Add custom validation
        if (price < 0)
            throw new BusinessException("NegativePriceNotAllowed");
    }
}
```

**Pattern B: Complete Replacement**

```csharp
[Dependency(ReplaceServices = true)]
[ExposeServices(typeof(IProductAppService))]
public class CustomProductAppService : IProductAppService
{
    // Completely replace implementation
    // Use when base implementation is not suitable
}
```

**Guidelines:**
- ✅ Module developers: Mark methods as `virtual`
- ✅ Consumers: Call `base.Method()` unless intentionally replacing
- ✅ Use `[Dependency(ReplaceServices = true)]`
- ✅ Use `[ExposeServices(typeof(OriginalType))]`

---

id: extensibility
### 3. Domain Event Subscriptions

**Purpose:** Extend behavior by reacting to domain events

**When to Use:**
- Add side effects without modifying core logic
- Integrate with external systems
- Track custom analytics
- Trigger custom workflows

**Pattern:**

```csharp
// Module publishes events
public class Product : AggregateRoot<Guid>
{
    public void Activate()
    {
        IsActive = true;
        AddLocalEvent(new ProductActivatedEvent { ProductId = Id });
    }
}

// Consumer subscribes to events
public class CashbackProductActivatedHandler 
    : ILocalEventHandler<ProductActivatedEvent>,
      ITransientDependency
{
    private readonly ICashbackService _cashbackService;
    
    public async Task HandleEventAsync(ProductActivatedEvent eventData)
    {
        // Add custom logic without modifying Product entity
        await _cashbackService.EnableCashbackAsync(eventData.ProductId);
    }
}

// Multiple handlers can subscribe to same event
public class AnalyticsProductActivatedHandler 
    : ILocalEventHandler<ProductActivatedEvent>,
      ITransientDependency
{
    public async Task HandleEventAsync(ProductActivatedEvent eventData)
    {
        // Track in analytics system
        await _analyticsService.TrackActivationAsync(eventData.ProductId);
    }
}
```

**Benefits:**
- ✅ No modification to original code
- ✅ Multiple handlers per event
- ✅ Loosely coupled
- ✅ Easy to test

---

id: extensibility
### 4. Provider Pattern

**Purpose:** Add implementations for pluggable interfaces

**When to Use:**
- Add external service providers
- Add data source providers
- Add notification channels
- Add storage providers

**Pattern:**

```csharp
// Module defines interface
public interface IExternalServiceProvider
{
    string ProviderCode { get; }
    Task<ServiceResult> ProcessAsync(ServiceRequest request);
}

// Module auto-discovers implementations
public class ExternalService
{
    private readonly IEnumerable<IExternalServiceProvider> _providers;
    
    public ExternalService(IEnumerable<IExternalServiceProvider> providers)
    {
        _providers = providers; // All implementations injected
    }
}

// Consumer creates implementation
public class CustomProvider : IExternalServiceProvider, ITransientDependency
{
    public string ProviderCode => "MyCustomProvider";
    
    public async Task<ServiceResult> ProcessAsync(ServiceRequest request)
    {
        // Custom implementation
    }
}

// Consumer registers via module dependency
[DependsOn(typeof(CoreModule))]
public class MyAppModule : AbpModule
{
    // CustomProvider auto-discovered via ITransientDependency
}
```

**See:** [Pluggable Providers Guide](./pluggable-providers) for details

---

id: extensibility
### 5. DTO Extensions

**Purpose:** Add properties to DTOs without modifying contracts

**When to Use:**
- Add UI-specific fields
- Add calculated fields
- Add tenant-specific fields
- Extend third-party module DTOs

**Pattern:**

```csharp
// Consumer configures DTO extensions
public class MyAppModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        PreConfigure<IMvcBuilder>(mvcBuilder =>
        {
            mvcBuilder.AddApplicationPartIfNotExists(typeof(MyAppModule).Assembly);
        });
        
        // Add property to DTO
        ObjectExtensionManager.Instance
            .AddOrUpdateProperty<ProductDto, int>(
                "WarrantyMonths",
                options =>
                {
                    options.DefaultValue = 12;
                    options.Attributes.Add(new RangeAttribute(0, 120));
                });
        
        ObjectExtensionManager.Instance
            .AddOrUpdateProperty<ProductDto, string>(
                "CustomCategory");
    }
}

// Module DTOs automatically include extraProperties
public class ProductDto : EntityDto<Guid>
{
    public string Name { get; set; }
    public decimal Price { get; set; }
    // extraProperties dictionary automatically added by ABP
}

// API response includes extensions
// {
//   "id": "...",
//   "name": "Product A",
//   "price": 99.99,
//   "extraProperties": {
//     "WarrantyMonths": 24,
//     "CustomCategory": "Premium"
//   }
// }

// Usage in consumer code
public class MyProductAppService : ApplicationService
{
    public async Task<ProductDto> GetWithExtensionsAsync(Guid id)
    {
        var product = await _productRepository.GetAsync(id);
        var dto = ObjectMapper.Map<Product, ProductDto>(product);
        
        // Extra properties automatically mapped from entity
        // Or manually set:
        dto.SetProperty("WarrantyMonths", product.GetProperty<int>("WarrantyMonths"));
        
        return dto;
    }
}
```

**Benefits:**
- ✅ API automatically includes `extraProperties`
- ✅ Swagger documentation updated
- ✅ Client proxies include extensions
- ✅ No contract modification needed

---

id: extensibility
### 6. Repository Customization

**Purpose:** Add custom query methods to repositories

**When to Use:**
- Add domain-specific queries
- Optimize frequently used queries
- Add complex filtering logic

**Pattern:**

```csharp
// Module provides base repository
public interface IProductRepository : IRepository<Product, Guid>
{
    Task<List<Product>> GetActiveAsync();
}

// Consumer creates custom repository interface
public interface ICustomProductRepository : IProductRepository
{
    Task<List<Product>> GetProductsWithWarrantyAsync();
    Task<List<Product>> GetPremiumProductsAsync();
    Task<int> GetAverageWarrantyMonthsAsync();
}

// Consumer implements custom repository
[Dependency(ReplaceServices = true)]
[ExposeServices(typeof(IProductRepository), typeof(ICustomProductRepository))]
public class CustomProductRepository 
    : MongoProductRepository, 
      ICustomProductRepository
{
    public CustomProductRepository(
        IMongoDbContextProvider<MyDbContext> dbContextProvider)
        : base(dbContextProvider)
    {
    }
    
    public virtual async Task<List<Product>> GetProductsWithWarrantyAsync()
    {
        return await (await GetMongoQueryableAsync())
            .Where(p => p.GetProperty<int>("WarrantyMonths") > 0)
            .ToListAsync();
    }
    
    public virtual async Task<List<Product>> GetPremiumProductsAsync()
    {
        return await (await GetMongoQueryableAsync())
            .Where(p => p.GetProperty<string>("CustomTag") == "Premium")
            .ToListAsync();
    }
    
    public virtual async Task<int> GetAverageWarrantyMonthsAsync()
    {
        var products = await GetListAsync();
        return (int)products
            .Select(p => p.GetProperty<int>("WarrantyMonths"))
            .Average();
    }
}

// Usage
public class MyProductService : ApplicationService
{
    private readonly ICustomProductRepository _repository;
    
    public MyProductService(ICustomProductRepository repository)
    {
        _repository = repository; // Custom repository injected
    }
    
    public async Task<List<ProductDto>> GetWarrantyProductsAsync()
    {
        var products = await _repository.GetProductsWithWarrantyAsync();
        return ObjectMapper.Map<List<Product>, List<ProductDto>>(products);
    }
}
```

---

id: extensibility
### 7. Type Provider Pattern

**Purpose:** Extend enumeration-like types with custom values

**When to Use:**
- Add custom resource types
- Add custom status types
- Add custom notification channels
- Extend any string-based type system

**Pattern:**

```csharp
// Module defines type constants and provider
public static class ResourceType
{
    public const string Standard = "Standard";
    public const string Premium = "Premium";
    public const string Enterprise = "Enterprise";
}

public interface IResourceTypeProvider
{
    List<ResourceTypeDefinition> GetTypes();
}

public class DefaultResourceTypeProvider : IResourceTypeProvider
{
    public List<ResourceTypeDefinition> GetTypes()
    {
        return new List<ResourceTypeDefinition>
        {
            new() { Code = ResourceType.Standard, Name = "Standard Resource" },
            new() { Code = ResourceType.Premium, Name = "Premium Resource" },
            new() { Code = ResourceType.Enterprise, Name = "Enterprise Resource" }
        };
    }
}

// Consumer creates custom provider
public class CustomResourceTypeProvider : IResourceTypeProvider, ITransientDependency
{
    public List<ResourceTypeDefinition> GetTypes()
    {
        return new List<ResourceTypeDefinition>
        {
            new() 
            { 
                Code = "Trial", 
                Name = "Trial Resource",
                Description = "Limited trial access"
            },
            new() 
            { 
                Code = "Educational", 
                Name = "Educational Resource" 
            }
        };
    }
}

// Module aggregates all providers
public class ResourceTypeRegistry : ISingletonDependency
{
    private readonly IEnumerable<IResourceTypeProvider> _providers;
    
    public ResourceTypeRegistry(IEnumerable<IResourceTypeProvider> providers)
    {
        _providers = providers;
    }
    
    public List<ResourceTypeDefinition> GetAllTypes()
    {
        return _providers
            .SelectMany(p => p.GetTypes())
            .DistinctBy(t => t.Code)
            .ToList();
    }
    
    public bool IsValidType(string code)
    {
        return GetAllTypes().Any(t => t.Code == code);
    }
}
```

**Benefits:**
- ✅ Extensible type system
- ✅ No enum modifications needed
- ✅ Multiple providers can coexist
- ✅ Type-safe string constants

---

id: extensibility
### 8. Controller Override

**Purpose:** Extend or replace API endpoints

**When to Use:**
- Add custom endpoints
- Modify request/response
- Add custom authorization
- Change routing

**Pattern:**

```csharp
// Module provides controller
[Area("app")]
[RemoteService(Name = "Product")]
[Route("api/app/products")]
public class ProductController : AbpController, IProductAppService
{
    private readonly IProductAppService _productAppService;
    
    [HttpGet]
    [Route("{id}")]
    public virtual async Task<ProductDto> GetAsync(Guid id)
    {
        return await _productAppService.GetAsync(id);
    }
}

// Consumer extends controller
[Dependency(ReplaceServices = true)]
[ExposeServices(typeof(ProductController))]
public class CustomProductController : ProductController
{
    private readonly ICashbackService _cashbackService;
    
    public CustomProductController(ICashbackService cashbackService)
    {
        _cashbackService = cashbackService;
    }
    
    // Override existing endpoint
    public override async Task<ProductDto> GetAsync(Guid id)
    {
        var dto = await base.GetAsync(id);
        
        // Add custom data
        dto.SetProperty("CashbackRate", 
            await _cashbackService.GetCashbackRateAsync(id));
        
        return dto;
    }
    
    // Add new endpoint
    [HttpGet]
    [Route("{id}/cashback-details")]
    public async Task<CashbackDetailsDto> GetCashbackDetailsAsync(Guid id)
    {
        return await _cashbackService.GetDetailsAsync(id);
    }
}
```

---

id: extensibility
## 📋 Extension Checklist for Module Developers

When creating a module, ensure:

### Entities
- [ ] All entities implement `IHasExtraProperties`
- [ ] Entity constructors call `this.SetDefaultsForExtraProperties()`
- [ ] Properties use `private set` (encapsulation)

### Domain Services
- [ ] All public methods are `virtual`
- [ ] Complex methods have `protected virtual` template methods
- [ ] Methods follow Template Method pattern

### Application Services
- [ ] All methods are `virtual`
- [ ] Services use interface (`IMyAppService`)
- [ ] DTOs support extra properties

### Events
- [ ] All state changes publish domain events
- [ ] Events contain minimal data (IDs + key fields)
- [ ] Event names use past tense

### Providers
- [ ] Provider interfaces defined in Domain layer
- [ ] Registry services for auto-discovery
- [ ] Provider interfaces have health check methods

### Repositories
- [ ] Repository methods are `virtual`
- [ ] Interfaces allow custom implementations
- [ ] Query methods support extension

---

id: extensibility
## 📋 Extension Checklist for Consumers

When extending a module:

### Planning
- [ ] Identify extension points
- [ ] Review module documentation
- [ ] Check if extension mechanism exists

### Implementation
- [ ] Use appropriate extension mechanism
- [ ] Call `base` methods when overriding (unless replacing)
- [ ] Make your extensions `virtual` too (chain extensibility)
- [ ] Write tests for your extensions

### Testing
- [ ] Test extension independently
- [ ] Test with module updates
- [ ] Test interaction with other extensions

---

id: extensibility
## 🎯 Real-World Examples

### Example 1: Loyalty Program Extension

```csharp
// Extend Product entity with rating properties
product.SetProperty("AverageRating", 4.5m);
product.SetProperty("ReviewCount", 127);

// Override product creation to initialize ratings
public class RatingProductManager : ProductManager
{
    public override async Task<Product> CreateAsync(string name, decimal price)
    {
        var product = await base.CreateAsync(name, price);
        
        // Initialize rating properties
        product.SetProperty("AverageRating", 0m);
        product.SetProperty("ReviewCount", 0);
        
        return product;
    }
}

// React to review events
public class ReviewSubmittedHandler 
    : ILocalEventHandler<ReviewSubmittedEvent>
{
    public async Task HandleEventAsync(ReviewSubmittedEvent e)
    {
        await _ratingService.UpdateAverageRatingAsync(e.ProductId, e.Rating);
    }
}
```

### Example 2: Custom External Service Provider

```csharp
// Implement external service provider
public class CustomNotificationProvider : INotificationProvider, ITransientDependency
{
    public string ProviderCode => "CustomNotification";
    
    public async Task<NotificationResult> SendAsync(NotificationRequest request)
    {
        // Custom notification sending logic
    }
}

// Auto-discovered by the module, no registration needed
```

### Example 3: Dynamic Pricing

```csharp
// Extend DTO with dynamic pricing
ObjectExtensionManager.Instance
    .AddOrUpdateProperty<ProductDto, decimal>("BasePrice")
    .AddOrUpdateProperty<ProductDto, decimal>("SeasonalDiscount")
    .AddOrUpdateProperty<ProductDto, decimal>("VolumeDiscount");

// Override pricing logic
public class DynamicPricingService : PricingService
{
    public override async Task<decimal> CalculatePriceAsync(
        Guid productId, 
        int quantity)
    {
        var product = await _repository.GetAsync(productId);
        var basePrice = product.GetProperty<decimal>("BasePrice");
        var seasonalDiscount = product.GetProperty<decimal>("SeasonalDiscount");
        var volumeDiscount = quantity > 10 ? 0.1m : 0m;
        
        var price = basePrice * (1 - seasonalDiscount) * (1 - volumeDiscount);
        return price * quantity;
    }
}
```

---

id: extensibility
## ✅ Best Practices

### Do's
- ✅ Use extension properties for custom data
- ✅ Override services to extend behavior
- ✅ Subscribe to events for side effects
- ✅ Create providers for pluggable features
- ✅ Call `base` methods when overriding
- ✅ Make your extensions extensible too (virtual methods)
- ✅ Document your extensions
- ✅ Test extensions independently

### Don'ts
- ❌ Don't modify module source code
- ❌ Don't fork the module
- ❌ Don't break encapsulation
- ❌ Don't create tight coupling
- ❌ Don't skip base method calls (unless intentional)
- ❌ Don't forget to handle upgrades

---

id: extensibility
## 📚 References

- [ABP Object Extensions](https://abp.io/docs/latest/framework/fundamentals/object-extensions)
- [ABP Customizing Modules](https://abp.io/docs/latest/framework/architecture/modularity/extending/customizing-application-modules-overriding-services)
- [ABP Dependency Injection](https://abp.io/docs/latest/framework/fundamentals/dependency-injection)
- [Event Bus](./event-driven-architecture)
- [Provider Pattern](./pluggable-providers)

---

id: extensibility
---

id: extensibility
