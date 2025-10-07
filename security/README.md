# Security & Compliance

> **SophiChain Security Architecture & Best Practices**

---

## 📖 Overview

SophiChain uses ABP Framework's built-in security features to provide enterprise-grade authentication, authorization, and data protection across all modules.

**For detailed security implementation, see:** [Architecture > Security](../architecture/SECURITY.md)

---

## 🔐 Core Security Features

### 1. Authentication

**Identity Management:**
- JWT token-based authentication
- OpenIddict/OAuth 2.0 support
- Multi-factor authentication (MFA)
- External login providers (Google, Microsoft, etc.)

**Web3 Integration:**
- Wallet-based authentication (SIWE - Sign-In With Ethereum)
- Blockchain identity verification
- Hybrid auth (traditional + Web3)

```csharp
// JWT Authentication configured by ABP
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* ABP configures automatically */ });
```

---

### 2. Authorization

**Permission-Based System:**
- Hierarchical permissions (Parent → Child)
- Role-based access control (RBAC)
- Tenant-level permission isolation
- Dynamic permission checks

**Example:**
```csharp
[Authorize(FinanceHubPermissions.Admin.Wallets.View)]
public async Task<WalletDto> GetAsync(Guid id)
{
    var wallet = await _repository.GetAsync(id);
    return ObjectMapper.Map<Wallet, WalletDto>(wallet);
}
```

**See:** [Architecture > Security](../architecture/SECURITY.md) for detailed permission patterns.

---

### 3. Multi-Tenancy Security

**Data Isolation:**
- Automatic tenant filtering via `IMultiTenant`
- Separate databases per tenant (optional)
- Tenant context switching with permission checks

**Example:**
```csharp
using (CurrentTenant.Change(tenantId))
{
    // All queries automatically filtered by tenantId
    var data = await _repository.GetListAsync();
}
```

**See:** [Architecture > Multi-Tenancy](../architecture/MULTI_TENANCY.md) for tenant isolation patterns.

---

### 4. Data Security

**Encryption:**
- HTTPS/TLS for data in transit
- Database encryption at rest
- Sensitive field encryption (passwords, API keys)
- ABP `IStringEncryptionService` for secrets

**Data Protection:**
```csharp
public class SecureDataService : ApplicationService
{
    private readonly IStringEncryptionService _encryption;
    
    public async Task<string> EncryptSensitiveDataAsync(string data)
    {
        return _encryption.Encrypt(data);
    }
}
```

---

### 5. Audit Logging

**Automatic Tracking:**
- User actions logged automatically
- Entity changes tracked (Creation/Update/Delete)
- Failed login attempts recorded
- API access logs

**ABP Features:**
- `IAuditingStore` - Audit data persistence
- `FullAuditedAggregateRoot` - Automatic entity auditing
- Audit log filtering and search

---

## 🛡️ Security Best Practices

### API Security
- ✅ Always use HTTPS in production
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use `[Authorize]` attributes on all endpoints
- ✅ Never expose sensitive data in error messages

### Authentication
- ✅ Enforce strong password policies
- ✅ Enable MFA for admin accounts
- ✅ Use short-lived JWT tokens
- ✅ Implement refresh token rotation
- ❌ Don't store passwords in plain text
- ❌ Don't log authentication tokens

### Authorization
- ✅ Check permissions at service level, not just UI
- ✅ Use fine-grained permissions
- ✅ Implement least privilege principle
- ❌ Don't rely on client-side authorization
- ❌ Don't hardcode permission strings

### Data Protection
- ✅ Encrypt sensitive data at rest
- ✅ Use parameterized queries (prevent SQL injection)
- ✅ Sanitize user inputs
- ✅ Implement data retention policies
- ❌ Don't expose internal IDs
- ❌ Don't log sensitive data (PII, passwords, tokens)

---

## 🔑 Secrets Management

**Configuration:**
```json
{
  "ConnectionStrings": {
    "Default": "Server=...;Database=...;User Id=...;Password=***;"
  },
  "Authentication": {
    "JwtBearer": {
      "Authority": "https://your-auth-server",
      "Audience": "YourApp"
    }
  },
  "ExternalProviders": {
    "Stripe": {
      "ApiKey": "sk_***" // Store in Azure Key Vault or AWS Secrets Manager
    }
  }
}
```

**Best Practices:**
- ✅ Use environment variables for secrets
- ✅ Store secrets in Azure Key Vault / AWS Secrets Manager
- ✅ Rotate API keys regularly
- ✅ Use different credentials per environment
- ❌ Don't commit secrets to Git
- ❌ Don't hardcode API keys in code

---

## ✅ Compliance

### GDPR Compliance
- ✅ User consent management
- ✅ Right to erasure (delete user data)
- ✅ Data portability (export user data)
- ✅ Audit logs for data access
- ✅ Data retention policies

### PCI DSS (Payment Processing)
- ✅ Never store credit card CVV
- ✅ Tokenize card data (use Stripe/payment gateways)
- ✅ Encrypt cardholder data
- ✅ Implement access controls
- ✅ Regular security testing

### Data Retention
- ✅ Define retention policies per data type
- ✅ Automatic data purging
- ✅ Secure deletion (soft delete + hard delete)
- ✅ Backup retention policies

---

## 🔒 Security Testing

**Recommended Tools:**
- **OWASP ZAP** - Security vulnerability scanning
- **SonarQube** - Code security analysis
- **Dependabot** - Dependency vulnerability alerts
- **Burp Suite** - API penetration testing

**Testing Checklist:**
- [ ] Authentication bypass attempts
- [ ] Authorization escalation tests
- [ ] SQL injection tests
- [ ] XSS vulnerability tests
- [ ] CSRF protection verification
- [ ] Rate limiting validation
- [ ] Sensitive data exposure checks

---

## 📚 References

### SophiChain Documentation
- [Architecture > Security](../architecture/SECURITY.md) - Detailed permission system
- [Architecture > Multi-Tenancy](../architecture/MULTI_TENANCY.md) - Tenant isolation
- [Architecture > API Design](../architecture/API_DESIGN.md) - API security patterns

### ABP Framework
- [ABP Authorization](https://abp.io/docs/latest/framework/fundamentals/authorization)
- [ABP Audit Logging](https://abp.io/docs/latest/framework/infrastructure/audit-logging)
- [ABP Data Filtering](https://abp.io/docs/latest/framework/infrastructure/data-filtering)
- [ABP String Encryption](https://abp.io/docs/latest/framework/infrastructure/string-encryption)

### Standards & Compliance
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GDPR Compliance](https://gdpr.eu/)
- [PCI DSS Standards](https://www.pcisecuritystandards.org/)

---

## 🚨 Incident Response

**If you discover a security vulnerability:**

1. **Do NOT** disclose publicly
2. Email: security@sophichain.com
3. Include detailed description and reproduction steps
4. Wait for acknowledgment before disclosure

**Response Time:** We aim to acknowledge within 24 hours and provide a fix within 7 days for critical issues.

---

[Back to Main Documentation](../README.md)