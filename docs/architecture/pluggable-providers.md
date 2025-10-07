---
id: pluggable-providers
title: Pluggable Providers
sidebar_label: Pluggable Providers
---
id: pluggable-providers
# Pluggable Provider Pattern in SophiChain

> **Hexagonal Architecture for External Integrations**

---

id: pluggable-providers
## 📖 Overview

SophiChain uses the Pluggable Provider pattern to enable extensible integration with external systems without modifying core code. Providers are distributed as separate NuGet packages that plug into the application automatically.

---

id: pluggable-providers
## 🎯 Why Pluggable Providers?

**Benefits:**
- ✅ **Zero Core Changes** - Add providers without touching module code
- ✅ **NuGet Distribution** - Install via package manager
- ✅ **Auto-Discovery** - ABP DI automatically finds implementations
- ✅ **Versioning** - Independent provider versions
- ✅ **Third-Party** - Community can create providers
- ✅ **Testing** - Mock providers for testing
- ✅ **Swapping** - Easy to switch providers (ProviderA → ProviderB)

**Use Cases:**
- External service integrations (API providers, third-party services)
- Data source providers (multiple data APIs)
- Storage providers (different storage backends)
- Notification providers (email, SMS, push notifications)
- Authentication providers (OAuth, SAML, custom)
- Search providers (Elasticsearch, Algolia, custom)

---

id: pluggable-providers
## 🏗️ Architecture Pattern

### Core Concept

```
┌─────────────────────────────────────┐
│     Module Domain Layer             │
│  Defines: IProvider Interface       │
└─────────────────────────────────────┘
            ↑ implements
┌─────────────────────────────────────┐
│  Provider NuGet Package #1          │
│  (ExternalAPI A, etc.)              │
└─────────────────────────────────────┘
            ↑ implements
┌─────────────────────────────────────┐
│  Provider NuGet Package #2          │
│  (ExternalAPI B, etc.)              │
└─────────────────────────────────────┘
            ↑ uses
┌─────────────────────────────────────┐
│   Application (Consumer)            │
│   Installs packages as needed       │
└─────────────────────────────────────┘
```

---

id: pluggable-providers
## 📦 Provider Package Structure

### Example: External Service Provider

**Package Name:** `SophiChain.{Module}.Providers.ExternalApi`

**Directory Structure:**
```
SophiChain.{Module}.Providers.ExternalApi/
├── ExternalApiProvider.cs          # Implements IExternalServiceProvider
├── ExternalApiOptions.cs            # Configuration options
├── ExternalApiModule.cs             # ABP Module
├── ExternalApiWebhookHandler.cs     # Webhook handling (if needed)
├── README.md                        # Setup instructions
├── LICENSE                          # MIT License
└── SophiChain.{Module}.Providers.ExternalApi.csproj
```

**Key Files:**

**1. Provider Implementation**
```csharp
public class ExternalApiProvider : IExternalServiceProvider, ITransientDependency
{
    private readonly ExternalApiOptions _options;
    private readonly ILogger<ExternalApiProvider> _logger;
    private readonly HttpClient _httpClient;
    
    public string ProviderCode => "ExternalApi";
    
    public ExternalApiProvider(
        IOptions<ExternalApiOptions> options,
        ILogger<ExternalApiProvider> logger,
        IHttpClientFactory httpClientFactory)
    {
        _options = options.Value;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
    }
    
    public async Task<ServiceResult> ProcessAsync(
        ServiceRequest request)
    {
        try
        {
            // Call external API
            var response = await _httpClient.PostAsJsonAsync(
                $"{_options.ApiBaseUrl}/process",
                new
                {
                    data = request.Data,
                    apiKey = _options.ApiKey
                });
            
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<ApiResponse>();
            
            return new ServiceResult
            {
                Success = true,
                ExternalId = result.TransactionId,
                Data = result.Data
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "External API call failed");
            return new ServiceResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
    
    // Implement other interface methods...
}
```

**2. Options Class**
```csharp
public class ExternalApiOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string ApiBaseUrl { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 30;
}
```

**3. ABP Module**
```csharp
[DependsOn(
    typeof(CoreDomainModule),
    typeof(AbpHttpClientModule))]
public class ExternalApiModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        
        // Configure options
        context.Services.Configure<ExternalApiOptions>(
            configuration.GetSection("ExternalProviders:ExternalApi"));
        
        // Register provider (auto-discovered via ITransientDependency)
        // No explicit registration needed!
        
        // Configure HttpClient
        context.Services.AddHttpClient();
    }
}
```

---

id: pluggable-providers
## 🎯 Provider Interface Design

### General Pattern

```csharp
public interface IMyProvider
{
    /// <summary>
    /// Unique code identifying this provider
    /// </summary>
    string ProviderCode { get; }
    
    /// <summary>
    /// Priority for provider selection (higher = preferred)
    /// </summary>
    int Priority => 0;
    
    /// <summary>
    /// Main operation methods
    /// </summary>
    Task<Result> DoSomethingAsync(Request request);
    
    /// <summary>
    /// Health check
    /// </summary>
    Task<HealthCheckResult> HealthCheckAsync();
    
    /// <summary>
    /// Get capabilities/supported features
    /// </summary>
    Task<ProviderCapabilities> GetCapabilitiesAsync();
}
```

### Example: External Service Provider Interface

```csharp
public interface IExternalServiceProvider
{
    /// <summary>
    /// Unique provider identifier (e.g., "ProviderA", "ProviderB")
    /// </summary>
    string ProviderCode { get; }
    
    /// <summary>
    /// Provider priority (higher number = higher priority)
    /// </summary>
    int Priority => 0;
    
    /// <summary>
    /// Process service request
    /// </summary>
    Task<ServiceResult> ProcessAsync(
        ServiceRequest request);
    
    /// <summary>
    /// Process provider callback/webhook
    /// </summary>
    Task<CallbackResult> ProcessCallbackAsync(
        Dictionary<string, string> parameters);
    
    /// <summary>
    /// Check service status
    /// </summary>
    Task<ServiceStatus> GetStatusAsync(
        string externalId);
    
    /// <summary>
    /// Cancel/rollback operation
    /// </summary>
    Task<CancellationResult> CancelAsync(
        CancellationRequest request);
    
    /// <summary>
    /// Get supported features
    /// </summary>
    Task<List<string>> GetSupportedFeaturesAsync();
    
    /// <summary>
    /// Validate configuration
    /// </summary>
    Task<bool> ValidateConfigurationAsync(
        ProviderConfiguration config);
    
    /// <summary>
    /// Health check
    /// </summary>
    Task<HealthCheckResult> HealthCheckAsync();
}
```

---

id: pluggable-providers
## 🔍 Provider Discovery & Registration

### Automatic Discovery

**ABP automatically discovers providers via dependency injection:**

```csharp
// In your application service
public class ExternalService : ApplicationService
{
    // ABP injects ALL implementations
    private readonly IEnumerable<IExternalServiceProvider> _providers;
    
    public ExternalService(IEnumerable<IExternalServiceProvider> providers)
    {
        _providers = providers;
    }
    
    public List<string> GetAvailableProviders()
    {
        return _providers.Select(p => p.ProviderCode).ToList();
    }
}
```

### Provider Registry Pattern

**Create registry for easier access:**

```csharp
public class ProviderRegistry : ISingletonDependency
{
    private readonly IEnumerable<IExternalServiceProvider> _providers;
    
    public ProviderRegistry(IEnumerable<IExternalServiceProvider> providers)
    {
        _providers = providers;
    }
    
    public IExternalServiceProvider? GetByCode(string providerCode)
    {
        return _providers.FirstOrDefault(p => 
            p.ProviderCode.Equals(providerCode, StringComparison.OrdinalIgnoreCase));
    }
    
    public IExternalServiceProvider? GetBestProvider(string feature)
    {
        return _providers
            .Where(p => p.GetSupportedFeaturesAsync()
                .Result.Contains(feature))
            .OrderByDescending(p => p.Priority)
            .FirstOrDefault();
    }
    
    public List<IExternalServiceProvider> GetAll()
    {
        return _providers.ToList();
    }
    
    public async Task<List<IExternalServiceProvider>> GetHealthyProvidersAsync()
    {
        var healthy = new List<IExternalServiceProvider>();
        
        foreach (var provider in _providers)
        {
            var health = await provider.HealthCheckAsync();
            if (health.IsHealthy)
                healthy.Add(provider);
        }
        
        return healthy;
    }
}
```

---

id: pluggable-providers
## 💡 Consumer Usage

### 1. Install Provider Package

```bash
dotnet add package SophiChain.{Module}.Providers.ExternalApi
```

### 2. Add Module Dependency

```csharp
[DependsOn(
    typeof(CoreApplicationModule),
    typeof(ExternalApiModule)  // ← Add this
)]
public class MyAppModule : AbpModule
{
}
```

### 3. Configure in appsettings.json

```json
{
  "ExternalProviders": {
    "ExternalApi": {
      "ApiKey": "key_...",
      "ApiBaseUrl": "https://api.external-provider.com",
      "WebhookSecret": "whsec_...",
      "TimeoutSeconds": 30
    }
  }
}
```

### 4. Use Provider

```csharp
public class BusinessService : ApplicationService
{
    private readonly ProviderRegistry _providerRegistry;
    
    public async Task<ServiceResult> ProcessRequestAsync(
        string data, 
        string preferredProvider = "ExternalApi")
    {
        // Get provider
        var provider = _providerRegistry.GetByCode(preferredProvider);
        if (provider == null)
            throw new BusinessException("Provider not found");
        
        // Use provider
        var result = await provider.ProcessAsync(new ServiceRequest
        {
            Data = data
        });
        
        return result;
    }
}
```

---

id: pluggable-providers
## 🎨 Advanced Patterns

### 1. Provider Selection Strategy

```csharp
public interface IProviderSelectionStrategy
{
    Task<IExternalServiceProvider?> SelectProviderAsync(
        ServiceContext context);
}

public class SmartProviderSelector : IProviderSelectionStrategy
{
    public async Task<IExternalServiceProvider?> SelectProviderAsync(
        ServiceContext context)
    {
        // Select based on:
        // - Feature requirements
        // - Data type
        // - User location
        // - Provider performance
        // - Success rate history
        // - Current health status
    }
}
```

### 2. Provider Failover

```csharp
public class ResilientExternalService
{
    private readonly IEnumerable<IExternalServiceProvider> _providers;
    
    public async Task<ServiceResult> ProcessWithFailoverAsync(
        ServiceRequest request)
    {
        var orderedProviders = _providers
            .OrderByDescending(p => p.Priority)
            .ToList();
        
        foreach (var provider in orderedProviders)
        {
            try
            {
                var result = await provider.ProcessAsync(request);
                if (result.Success)
                    return result;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, 
                    "Provider {Provider} failed, trying next", 
                    provider.ProviderCode);
                continue;
            }
        }
        
        throw new BusinessException("All providers failed");
    }
}
```

### 3. Provider Health Monitoring

```csharp
public class ProviderHealthCheckService : BackgroundService
{
    private readonly IEnumerable<IExternalServiceProvider> _providers;
    
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            foreach (var provider in _providers)
            {
                var health = await provider.HealthCheckAsync();
                
                if (!health.IsHealthy)
                {
                    await _alertService.SendAlertAsync(
                        $"Provider {provider.ProviderCode} is unhealthy: {health.Message}");
                }
            }
            
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
}
```

---

id: pluggable-providers
## ✅ Provider Development Best Practices

### Do's
- ✅ Implement interface completely
- ✅ Handle all exceptions gracefully
- ✅ Log extensively (Info, Warning, Error)
- ✅ Validate configuration on startup
- ✅ Provide health check implementation
- ✅ Use retry logic with exponential backoff
- ✅ Support cancellation tokens
- ✅ Write comprehensive tests
- ✅ Document configuration options
- ✅ Provide usage examples

### Don'ts
- ❌ Don't throw on provider-specific errors (return error result)
- ❌ Don't block async calls
- ❌ Don't store state (make stateless)
- ❌ Don't hardcode timeouts (make configurable)
- ❌ Don't expose provider SDK types in interface
- ❌ Don't forget to dispose resources

### Example: Robust Provider

```csharp
public class RobustExternalProvider : IExternalServiceProvider, IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly ILogger _logger;
    private readonly ProviderOptions _options;
    
    public async Task<ServiceResult> ProcessAsync(
        ServiceRequest request)
    {
        try
        {
            // Validate
            ValidateRequest(request);
            
            // Retry policy
            var result = await Policy
                .Handle<HttpRequestException>()
                .WaitAndRetryAsync(3, 
                    retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)))
                .ExecuteAsync(async () =>
                {
                    _logger.LogInformation(
                        "Processing request: Data={Data}",
                        request.Data);
                    
                    var response = await _httpClient.PostAsJsonAsync(
                        "/process", 
                        request);
                    
                    response.EnsureSuccessStatusCode();
                    return await response.Content.ReadFromJsonAsync<ApiResponse>();
                });
            
            _logger.LogInformation("Request processed successfully: {ExternalId}", 
                result.ExternalId);
            
            return new ServiceResult
            {
                Success = true,
                ExternalId = result.ExternalId
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Request processing failed");
            
            return new ServiceResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
    
    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}
```

---

id: pluggable-providers
---

id: pluggable-providers
## 📖 References

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [ABP Dependency Injection](https://abp.io/docs/latest/framework/fundamentals/dependency-injection)
- [Plugin Architecture Patterns](https://martinfowler.com/articles/plugins.html)

---

id: pluggable-providers
