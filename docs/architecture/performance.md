---
id: performance
title: Performance
sidebar_label: Performance
---
id: performance
# Performance & Caching in SophiChain

> **ABP Framework Caching Features**

---

id: performance
## 📖 Overview

SophiChain uses ABP's `IDistributedCache` for caching to improve performance and reduce database load.

---

id: performance
## 🏗️ Distributed Caching

### 1. Inject IDistributedCache

```csharp
public class ExchangeRateService : ITransientDependency
{
    private readonly IDistributedCache _cache;
    private readonly IExchangeRateRepository _repository;
    
    private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(5);
}
```

---

id: performance
### 2. Cache Usage Patterns

**Set Cache:**
```csharp
var cacheKey = $"Rate:{from}:{to}";
await _cache.SetStringAsync(
    cacheKey,
    JsonSerializer.Serialize(data),
    new DistributedCacheEntryOptions 
    { 
        AbsoluteExpirationRelativeToNow = _cacheDuration 
    });
```

**Get from Cache:**
```csharp
var cached = await _cache.GetStringAsync(cacheKey);
if (cached != null)
    return JsonSerializer.Deserialize<RateDto>(cached);
```

**Cache-Aside Pattern:**
```csharp
public async Task<decimal> GetRateAsync(string from, string to)
{
    var key = $"Rate:{from}:{to}";
    var cached = await _cache.GetStringAsync(key);
    if (cached != null)
        return JsonSerializer.Deserialize<decimal>(cached);
    
    var rate = await _repository.GetRateAsync(from, to);
    await _cache.SetStringAsync(key, JsonSerializer.Serialize(rate));
    return rate;
}
```

**Invalidate Cache:**
```csharp
await _cache.RemoveAsync($"Rate:{from}:{to}");
```

---

id: performance
## ⚙️ Cache Configuration

### Redis (Production)

```csharp
public override void ConfigureServices(ServiceConfigurationContext context)
{
    context.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = "localhost:6379";
        options.InstanceName = "SophiChain:";
    });
}
```

### In-Memory (Development)

```csharp
context.Services.AddDistributedMemoryCache();
```

---

id: performance
## 🎯 Caching Strategies

### Cache-Aside (Most Common)

```csharp
public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory)
{
    var cached = await _cache.GetStringAsync(key);
    if (cached != null)
        return JsonSerializer.Deserialize<T>(cached);
    
    var value = await factory();
    await _cache.SetStringAsync(key, JsonSerializer.Serialize(value));
    return value;
}
```

### Write-Through

```csharp
await _repository.InsertAsync(rate);
await _cache.SetStringAsync(key, JsonSerializer.Serialize(rate));
```

---

id: performance
## ✅ Best Practices

### When to Cache
- ✅ Frequently accessed data
- ✅ Rarely changing data (e.g., exchange rates, currencies)
- ✅ Expensive queries
- ✅ External API responses
- ❌ User-specific data (unless short TTL)
- ❌ Rapidly changing data
- ❌ Large objects

### Cache Keys
- ✅ Use descriptive prefixes: `ExchangeRate:USD:EUR`
- ✅ Include tenant ID for multi-tenant: `Tenant:{id}:Rate:{from}:{to}`
- ✅ Use consistent naming convention
- ❌ Don't use user-generated content in keys
- ❌ Don't use special characters

### Cache Expiration
- ✅ Set appropriate TTL based on data volatility
- ✅ Use shorter TTL for frequently changing data
- ✅ Use longer TTL for static data
- ✅ Implement cache warming for critical data
- ❌ Don't cache forever
- ❌ Don't use same TTL for all data

### Cache Invalidation
- ✅ Invalidate on data updates
- ✅ Use cache tags for group invalidation
- ✅ Log cache operations
- ❌ Don't forget to invalidate after updates
- ❌ Don't invalidate too frequently

---

id: performance
## 📊 Query Optimization

**Filter at database level:**
```csharp
// ❌ Bad
var all = await _repository.GetListAsync();
var active = all.Where(w => w.IsActive).ToList();

// ✅ Good
var query = await _repository.GetQueryableAsync();
var active = await AsyncExecuter.ToListAsync(query.Where(w => w.IsActive));
```

**Best Practices:**
- ✅ Use indexes on frequently queried columns
- ✅ Use `WithDetails()` for eager loading
- ✅ Apply pagination for large datasets
- ❌ Don't load entire collections unnecessarily

---

id: performance
## 📖 References

- [ABP Caching](https://abp.io/docs/latest/framework/infrastructure/caching)
- [Distributed Cache](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed)
- [Redis Cache](https://redis.io/docs/manual/client-side-caching/)

---

id: performance
