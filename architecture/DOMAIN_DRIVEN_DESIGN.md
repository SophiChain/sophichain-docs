# Domain-Driven Design in SophiChain

> **Developer's Guide: Tactical and Strategic DDD Patterns**

---

## 📖 Overview

This is a **prescriptive guide** for implementing Domain-Driven Design (DDD) in SophiChain modules using ABP Framework. All developers MUST follow these patterns to ensure consistency, maintainability, and extensibility across the platform.

**Target Audience:** Module developers, contributors, architects

**When to Use:** Creating any new module or bounded context in SophiChain

---

## 🎯 Core Concepts

### Bounded Contexts

Each module represents a bounded context with:
- **Clear boundaries** - Well-defined responsibilities
- **Ubiquitous language** - Domain-specific terminology
- **Independent models** - No shared entities across contexts
- **Context mapping** - Explicit relationships between contexts

**SophiChain Bounded Contexts Pattern:**
- **Module = Bounded Context** - Each module represents one bounded context
- **Clear Domain Language** - Use terms from the business domain
- **Independence** - Modules should be independently deployable
- **Integration** - Modules communicate via domain events or APIs

**Examples in SophiChain:**
- `CatalogModule` - Product domain: products, categories, inventory
- `OrderModule` - Order domain: orders, order items, shipments
- `CustomerModule` - Customer domain: customers, addresses, preferences

---

## 🏗️ Building Blocks

### 1. Entities

**Definition:** Objects with identity that persists over time

**ABP Base Classes:**
```csharp
// Simple entity with ID
public class MyEntity : Entity<Guid>
{
    // Properties
}

// Entity with audit fields
public class MyEntity : FullAuditedAggregateRoot<Guid>
{
    // CreationTime, CreatorId, LastModificationTime, etc.
}

// Multi-tenant entity
public class MyEntity : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
}
```

**Guidelines:**
- ✅ Use `Guid` for IDs (distributed system friendly)
- ✅ Inherit from ABP base classes (automatic audit trail)
- ✅ Implement `IMultiTenant` for tenant isolation
- ✅ Use private setters with public methods for business logic
- ✅ Validate in constructors and methods

**Example:**
```csharp
public class Product : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public bool IsActive { get; private set; }
    public decimal Price { get; private set; }
    public Guid? TenantId { get; set; }
    
    // Private constructor for EF Core
    private Product() { }
    
    // Public constructor with validation
    public Product(
        Guid id,
        string code,
        string name,
        decimal price,
        Guid? tenantId = null) : base(id)
    {
        Code = Check.NotNullOrWhiteSpace(code, nameof(code));
        Name = Check.NotNullOrWhiteSpace(name, nameof(name));
        Price = Check.Range(price, nameof(price), 0, decimal.MaxValue);
        IsActive = false;
        TenantId = tenantId;
    }
    
    // Business methods encapsulate state changes
    public void Activate()
    {
        if (IsActive) return;
        IsActive = true;
        AddLocalEvent(new ProductActivatedEvent { ProductId = Id });
    }
    
    public void Deactivate()
    {
        if (!IsActive) return;
        IsActive = false;
        AddLocalEvent(new ProductDeactivatedEvent { ProductId = Id });
    }
    
    public void UpdatePrice(decimal newPrice)
    {
        Check.Range(newPrice, nameof(newPrice), 0, decimal.MaxValue);
        
        var oldPrice = Price;
        Price = newPrice;
        
        AddLocalEvent(new ProductPriceChangedEvent
        {
            ProductId = Id,
            OldPrice = oldPrice,
            NewPrice = newPrice
        });
    }
}
```

---

### 2. Value Objects

**Definition:** Objects without identity, defined by their attributes

**Implementation Pattern:**
```csharp
// Use C# records for immutability
public record Address(
    string Street,
    string City,
    string PostalCode,
    string Country)
{
    // Validation in constructor
    public Address : this()
    {
        Street = Check.NotNullOrWhiteSpace(Street, nameof(Street));
        City = Check.NotNullOrWhiteSpace(City, nameof(City));
        PostalCode = Check.NotNullOrWhiteSpace(PostalCode, nameof(PostalCode));
        Country = Check.NotNullOrWhiteSpace(Country, nameof(Country));
    }
    
    // Business methods
    public bool IsInCountry(string countryCode)
    {
        return Country.Equals(countryCode, StringComparison.OrdinalIgnoreCase);
    }
    
    public override string ToString() => 
        $"{Street}, {City} {PostalCode}, {Country}";
}

// Another example: Price value object
public record Price(decimal Amount, string Currency)
{
    public Price Add(Price other)
    {
        if (Currency != other.Currency)
            throw new BusinessException("Cannot add prices with different currencies");
            
        return this with { Amount = Amount + other.Amount };
    }
    
    public Price Multiply(decimal factor) => this with { Amount = Amount * factor };
    
    public override string ToString() => $"{Amount:N2} {Currency}";
}
```

**Guidelines:**
- ✅ Use C# `record` types for immutability
- ✅ Validate in constructor
- ✅ Provide business operations as methods
- ✅ Override `ToString()` for display
- ❌ No identity or lifecycle

---

### 3. Aggregates

**Definition:** Cluster of entities with one root, transactional boundary

**Pattern:**
```csharp
// Aggregate Root
public class Order : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public string OrderNumber { get; private set; }
    public OrderStatus Status { get; private set; }
    public decimal TotalAmount { get; private set; }
    public Guid? TenantId { get; set; }
    
    // Child entities as collection
    public virtual ICollection<OrderItem> Items { get; protected set; }
    
    // Private constructor for EF Core
    private Order() 
    { 
        Items = new Collection<OrderItem>(); 
    }
    
    // Factory method for creating new aggregates
    public static Order Create(Guid id, string orderNumber, Guid? tenantId = null)
    {
        var order = new Order 
        { 
            Id = id, 
            OrderNumber = orderNumber,
            Status = OrderStatus.Draft,
            TenantId = tenantId
        };
        
        // Publish domain event
        order.AddLocalEvent(new OrderCreatedEvent { OrderId = id });
        return order;
    }
    
    // Business methods manage children - NEVER expose collection directly
    public void AddItem(Guid productId, string productName, int quantity, decimal unitPrice)
    {
        // Validation
        if (Status != OrderStatus.Draft)
            throw new BusinessException("CannotModifyNonDraftOrder");
            
        Check.Range(quantity, nameof(quantity), 1, int.MaxValue);
        Check.Range(unitPrice, nameof(unitPrice), 0, decimal.MaxValue);
        
        // Create child entity
        var item = new OrderItem(GuidGenerator.Create())
        {
            ProductId = productId,
            ProductName = productName,
            Quantity = quantity,
            UnitPrice = unitPrice
        };
        
        Items.Add(item);
        RecalculateTotal();
    }
    
    public void RemoveItem(Guid itemId)
    {
        if (Status != OrderStatus.Draft)
            throw new BusinessException("CannotModifyNonDraftOrder");
            
        var item = Items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            Items.Remove(item);
            RecalculateTotal();
        }
    }
    
    public void Submit()
    {
        if (Status != OrderStatus.Draft)
            throw new BusinessException("OrderAlreadySubmitted");
            
        if (!Items.Any())
            throw new BusinessException("CannotSubmitEmptyOrder");
            
        Status = OrderStatus.Submitted;
        AddLocalEvent(new OrderSubmittedEvent { OrderId = Id, TotalAmount = TotalAmount });
    }
    
    // Private business logic
    private void RecalculateTotal()
    {
        TotalAmount = Items.Sum(i => i.Quantity * i.UnitPrice);
    }
}

// Child entity - only accessed through aggregate root
public class OrderItem : Entity<Guid>
{
    public Guid ProductId { get; internal set; }
    public string ProductName { get; internal set; }
    public int Quantity { get; internal set; }
    public decimal UnitPrice { get; internal set; }
    
    // Internal constructor - can only be created by aggregate root
    internal OrderItem(Guid id) : base(id) { }
}
```

**Guidelines:**
- ✅ Only aggregate root has repository
- ✅ Children accessed only through root
- ✅ Transaction boundary = aggregate boundary
- ✅ Use `internal` constructors for child entities
- ✅ Publish domain events from aggregate root

---

### 4. Domain Services

**Definition:** Stateless services for domain logic that doesn't fit in entities

**Pattern:**
```csharp
public class OrderFulfillmentService : DomainService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IShippingRepository _shippingRepository;
    
    public OrderFulfillmentService(
        IOrderRepository orderRepository,
        IInventoryRepository inventoryRepository,
        IShippingRepository shippingRepository)
    {
        _orderRepository = orderRepository;
        _inventoryRepository = inventoryRepository;
        _shippingRepository = shippingRepository;
    }
    
    public virtual async Task<ShipmentResult> ProcessFulfillmentAsync(Guid orderId)
    {
        // Multi-entity coordination
        var order = await _orderRepository.GetAsync(orderId);
        
        // Complex business validation
        if (order.Status != OrderStatus.Paid)
            throw new BusinessException("OrderNotPaid");
            
        // Check inventory availability
        foreach (var item in order.Items)
        {
            var available = await _inventoryRepository.CheckAvailabilityAsync(
                item.ProductId, 
                item.Quantity);
                
            if (!available)
                throw new BusinessException("InsufficientInventory")
                    .WithData("ProductId", item.ProductId);
        }
        
        // Reserve inventory
        await ReserveInventoryAsync(order);
        
        // Create shipment
        var shipment = await CreateShipmentAsync(order);
        
        // Update order status
        order.MarkAsShipped(shipment.Id);
        await _orderRepository.UpdateAsync(order);
        
        return new ShipmentResult { ShipmentId = shipment.Id };
    }
    
    // Private helper methods
    private async Task ReserveInventoryAsync(Order order)
    {
        foreach (var item in order.Items)
        {
            await _inventoryRepository.ReserveAsync(
                item.ProductId,
                item.Quantity,
                order.Id);
        }
    }
    
    private async Task<Shipment> CreateShipmentAsync(Order order)
    {
        var shipment = new Shipment(GuidGenerator.Create(), order.Id);
        return await _shippingRepository.InsertAsync(shipment);
    }
}
```

**When to Use Domain Services:**
- ✅ Multi-entity operations
- ✅ Complex business logic
- ✅ Domain calculations
- ❌ Simple CRUD (use application services)
- ❌ Infrastructure concerns (use infrastructure services)

**Guidelines:**
- ✅ Inherit from ABP's `DomainService`
- ✅ Make methods `virtual` for extensibility
- ✅ Inject repository interfaces, not implementations
- ✅ Keep stateless (no fields except injected dependencies)
- ✅ Use meaningful method names (business language)

---

### 5. Domain Events

**Definition:** Events representing something that happened in the domain

**Pattern:**
```csharp
// 1. Define event (Domain layer)
public class OrderShippedEvent
{
    public Guid OrderId { get; set; }
    public Guid ShipmentId { get; set; }
    public Guid CustomerId { get; set; }
    public DateTime ShippedAt { get; set; }
}

// 2. Publish from aggregate (Domain layer)
public class Order : AggregateRoot<Guid>
{
    public OrderStatus Status { get; private set; }
    public Guid? ShipmentId { get; private set; }
    
    public void MarkAsShipped(Guid shipmentId)
    {
        if (Status != OrderStatus.Paid)
            throw new BusinessException("CannotShipUnpaidOrder");
            
        Status = OrderStatus.Shipped;
        ShipmentId = shipmentId;
        
        // Publish domain event
        AddLocalEvent(new OrderShippedEvent
        {
            OrderId = Id,
            ShipmentId = shipmentId,
            CustomerId = CustomerId,
            ShippedAt = Clock.Now
        });
    }
}

// 3. Handle event (Application layer)
public class OrderShippedEventHandler 
    : ILocalEventHandler<OrderShippedEvent>,
      ITransientDependency
{
    private readonly INotificationService _notificationService;
    private readonly IInventoryRepository _inventoryRepository;
    
    public virtual async Task HandleEventAsync(OrderShippedEvent eventData)
    {
        // Send notification to customer
        await _notificationService.SendAsync(
            eventData.CustomerId,
            "OrderShipped",
            new { OrderId = eventData.OrderId });
        
        // Update inventory tracking
        await _inventoryRepository.MarkAsShippedAsync(eventData.OrderId);
    }
}
```

**Guidelines:**
- ✅ Use for important domain events
- ✅ Publish via `AddLocalEvent()` or `AddDistributedEvent()`
- ✅ Keep event data minimal (IDs + key data)
- ✅ Use outbox pattern for reliability
- ✅ Make handlers idempotent

---

### 6. Repositories

**Definition:** Abstraction for data access, one per aggregate root

**Pattern:**
```csharp
// Interface in Domain layer
public interface IProductRepository : IRepository<Product, Guid>
{
    Task<Product?> FindBySkuAsync(string sku);
    Task<List<Product>> GetActiveAsync();
    Task<List<Product>> GetByCategoryAsync(Guid categoryId);
    Task<List<Product>> SearchByNameAsync(string searchTerm);
}

// Implementation in Infrastructure layer (MongoDB example)
public class MongoProductRepository 
    : MongoDbRepository<Product, Guid>, 
      IProductRepository
{
    public MongoProductRepository(
        IMongoDbContextProvider<MyModuleMongoDbContext> dbContextProvider)
        : base(dbContextProvider)
    {
    }
    
    public virtual async Task<Product?> FindBySkuAsync(string sku)
    {
        return await (await GetMongoQueryableAsync())
            .FirstOrDefaultAsync(p => p.Sku == sku);
    }
    
    public virtual async Task<List<Product>> GetActiveAsync()
    {
        return await (await GetMongoQueryableAsync())
            .Where(p => p.IsActive)
            .ToListAsync();
    }
    
    public virtual async Task<List<Product>> GetByCategoryAsync(Guid categoryId)
    {
        return await (await GetMongoQueryableAsync())
            .Where(p => p.CategoryId == categoryId && p.IsActive)
            .ToListAsync();
    }
    
    public virtual async Task<List<Product>> SearchByNameAsync(string searchTerm)
    {
        return await (await GetMongoQueryableAsync())
            .Where(p => p.Name.Contains(searchTerm))
            .ToListAsync();
    }
}
```

**Guidelines:**
- ✅ One repository per aggregate root only
- ✅ Interface in Domain, implementation in Infrastructure
- ✅ Inherit from ABP repository base classes
- ✅ Add domain-specific query methods
- ✅ Use `virtual` methods for extensibility
- ❌ Don't create repositories for child entities

---

## 📐 Layered Architecture

### Layer Responsibilities

```
┌──────────────────────────────────────┐
│   Domain.Shared                      │
│   (Enums, Constants, Value Objects)  │
└──────────────────────────────────────┘
              ↑
┌──────────────────────────────────────┐
│   Domain                             │
│   (Entities, Aggregates, Services)   │
└──────────────────────────────────────┘
              ↑
┌──────────────────────────────────────┐
│   Application                        │
│   (App Services, DTOs, Handlers)     │
└──────────────────────────────────────┘
              ↑
┌──────────────────────────────────────┐
│   Infrastructure                     │
│   (Repositories, External Services)  │
└──────────────────────────────────────┘
```

### Dependency Rules

- ✅ **Domain.Shared** - No dependencies (pure C#)
- ✅ **Domain** - Depends only on Domain.Shared
- ✅ **Application** - Depends on Domain + Domain.Shared
- ✅ **Infrastructure** - Depends on Domain (implements interfaces)
- ❌ **Never** - Domain depends on Application or Infrastructure

---

## 🎨 Naming Conventions

### Namespaces (Follow This Pattern)
```csharp
// Domain.Shared (no .Domain prefix)
namespace SophiChain.{ModuleName}.{Context};
// Example: namespace SophiChain.Catalog.Products;

// Domain
namespace SophiChain.{ModuleName}.Domain.{Context};
// Example: namespace SophiChain.Catalog.Domain.Products;

// Domain Services subdirectory
namespace SophiChain.{ModuleName}.Domain.{Context}.DomainServices;
// Example: namespace SophiChain.Catalog.Domain.Products.DomainServices;

// Application
namespace SophiChain.{ModuleName}.Application.{Context};
// Example: namespace SophiChain.Catalog.Application.Products;
```

### Files (Naming Conventions)
- Entities: `Product.cs`, `Order.cs`, `Customer.cs`
- Value Objects: `Money.cs`, `Address.cs`, `DateRange.cs`
- Domain Services: `OrderFulfillmentService.cs`, `PricingCalculator.cs`
- Repositories: `IProductRepository.cs`, `IOrderRepository.cs`
- Events: `OrderShippedEvent.cs`, `ProductCreatedEvent.cs`

---

## ✅ Best Practices

### Entity Design
- ✅ Encapsulate state with private setters
- ✅ Provide business methods, not just properties
- ✅ Validate in constructor and methods
- ✅ Use `Check` helper for validation
- ✅ Publish domain events for state changes

### Aggregate Design
- ✅ Keep aggregates small
- ✅ Reference other aggregates by ID only
- ✅ One aggregate per transaction
- ✅ Children cannot be accessed directly
- ✅ Use domain events for cross-aggregate communication

### Domain Service Design
- ✅ Stateless operations only
- ✅ Multi-entity coordination
- ✅ Complex business logic
- ✅ Virtual methods for extensibility
- ❌ Don't put CRUD logic here

### Repository Design
- ✅ One per aggregate root
- ✅ Interface in Domain
- ✅ Custom query methods
- ✅ Return domain objects
- ❌ Don't expose IQueryable in interface

---

## 📚 ABP Framework Features

### Built-in DDD Support

**Entity Base Classes:**
- `Entity<TKey>` - Basic entity
- `AggregateRoot<TKey>` - Aggregate root
- `FullAuditedEntity<TKey>` - With audit fields
- `FullAuditedAggregateRoot<TKey>` - Aggregate + audit

**Interfaces:**
- `IMultiTenant` - Multi-tenancy support
- `IHasExtraProperties` - Dynamic properties
- `ISoftDelete` - Soft delete support

**Helpers:**
- `Check.NotNull()` - Validation helpers
- `GuidGenerator.Create()` - GUID generation
- `Clock.Now` - Time abstraction

---

## 📖 References

- [ABP DDD Documentation](https://abp.io/docs/latest/framework/architecture/domain-driven-design)
- [Implementing DDD Book](https://abp.io/books/implementing-domain-driven-design)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)

---

## 🎯 Next Steps

**Apply these patterns when creating your own modules:**
- Define your bounded contexts
- Identify aggregates and entities
- Create domain services for complex logic
- Publish domain events for state changes
- Write repository interfaces

---
