# 🔑 API Key Management (Coming Soon)

## Current Status: Development Mode

SafeTx is currently in **development/beta** phase. API keys are **optional** for local development.

---

## 📍 Where to Get Your API Key

### For Local Development (Now)

**No API key needed!** Just run the backend:

```bash
cd safetx-backend
node server.js
```

Your local API will be available at `http://localhost:5000` with no authentication required.

### For Production Use (Coming Soon)

We're building a self-service dashboard where you can:

```
┌─────────────────────────────────────────────────────────┐
│                  SafeTx Developer Portal                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Dashboard                                            │
│  ├─ View API Usage                                       │
│  ├─ Monitor Rate Limits                                  │
│  └─ Download Analytics                                   │
│                                                          │
│  🔑 API Keys                                             │
│  ├─ Create New Key                                       │
│  ├─ Rotate Existing Keys                                 │
│  ├─ Revoke Keys                                          │
│  └─ Set Per-Key Rate Limits                              │
│                                                          │
│  💳 Billing                                              │
│  ├─ Current Plan: Free                                   │
│  ├─ Upgrade to Pro ($49/mo)                              │
│  └─ View Invoices                                        │
│                                                          │
│  📖 Documentation                                        │
│  ├─ API Reference                                        │
│  ├─ Code Examples                                        │
│  └─ SDK Downloads                                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**URL**: `https://dashboard.safetx.io` (Coming Q1 2026)

---

## 🎯 Pricing Tiers

| Tier | Price | Requests/Min | Features |
|------|-------|--------------|----------|
| **Free** | $0 | 60 | Perfect for testing, personal projects |
| **Pro** | $49/mo | 600 | For production dApps, support included |
| **Business** | $199/mo | 3,000 | High-volume apps, SLA guarantee |
| **Enterprise** | Custom | Unlimited | Custom SLA, dedicated support, on-prem option |

---

## 🚀 How to Get Started Today

### Step 1: Clone & Run Backend Locally

```bash
git clone https://github.com/yourusername/neon-solana-watch.git
cd neon-solana-watch/safetx-backend
npm install
node server.js
```

✅ Your API is now running at `http://localhost:5000`

### Step 2: Test the API

```bash
# Get current metrics
curl http://localhost:5000/api/metrics

# Start SSE stream
curl http://localhost:5000/api/events/stream
```

### Step 3: Integrate with Your App

```bash
npm install @safetx/client
```

```typescript
import { SafeTxApiClient } from '@safetx/client';

const client = new SafeTxApiClient({
  baseURL: 'http://localhost:5000'
  // No apiKey needed for local development
});

const metrics = await client.getMetrics();
console.log('TPS:', metrics.tps);
```

---

## 🔐 Setting Up API Keys (For Self-Hosted/Production)

If you're deploying the backend yourself and want to add authentication:

### Backend Setup

Create a `.env` file:

```env
API_KEY=your-secret-api-key-here
PORT=5000
```

Start the server:

```bash
node server.js
```

Output:
```
🔐 API Key authentication enabled
🚀 SafeTx Backend running on http://localhost:5000
```

### Client Usage

```typescript
const client = new SafeTxApiClient({
  baseURL: 'http://localhost:5000',
  apiKey: 'your-secret-api-key-here'  // Now required
});
```

Or with curl:

```bash
curl -H "x-api-key: your-secret-api-key-here" \
  http://localhost:5000/api/metrics
```

---

## 📧 Early Access for Companies

Want production API access before public launch?

**Contact us:**
- Email: hello@safetx.io
- Subject: "SafeTx API Early Access"
- Include:
  - Your company name
  - Expected request volume
  - Use case description

We'll provide:
- ✅ Free API key during beta
- ✅ Direct support channel
- ✅ Early access to new features
- ✅ Custom rate limits if needed

---

## 🎁 Special Launch Offers

**First 100 Companies:**
- 🎉 **50% off** Pro plan for first year ($24.50/mo)
- 🎉 **3 months free** on Business plan
- 🎉 Priority feature requests
- 🎉 Logo on our website

**Sign up at**: https://safetx.io/early-access (Coming Soon)

---

## ❓ FAQ

### Q: Do I need an API key for local development?
**A:** No! API keys are optional. Just run the backend without setting `API_KEY` environment variable.

### Q: How do I generate an API key?
**A:** For local/self-hosted: Set any string as `API_KEY` in your `.env` file. For production hosted API: Use our dashboard (coming soon) or contact us.

### Q: Can I use the same API key for multiple apps?
**A:** For security, we recommend separate keys per app. You can create unlimited keys in the dashboard.

### Q: What happens if I exceed my rate limit?
**A:** You'll receive `429 Too Many Requests` responses. Free tier: 60 req/min. Pro: 600 req/min. Upgrade for higher limits.

### Q: Is the API key secure?
**A:** Yes, but treat it like a password:
- ✅ Store in environment variables
- ✅ Never commit to git
- ✅ Rotate regularly
- ✅ Use different keys per environment (dev/staging/prod)

### Q: Can I self-host without API keys?
**A:** Yes! The backend works fine without `API_KEY` set. Perfect for internal tools or private deployments.

---

## 🛠️ Technical Details

### Key Format
- Development: Any string (e.g., `my-dev-key-123`)
- Production (hosted): `sk_live_` or `sk_test_` prefix + random string

### Authentication Methods
1. **HTTP Header** (recommended):
   ```
   x-api-key: your-key-here
   ```

2. **Query Parameter** (SSE/EventSource only):
   ```
   ?key=your-key-here
   ```

### Security Features
- ✅ Rate limiting per key
- ✅ Key rotation support
- ✅ Revocation in <1 second
- ✅ Usage analytics per key
- ✅ IP whitelisting (Enterprise)

---

## 📚 Additional Resources

- [Getting Started Guide](./GETTING_STARTED.md) - Full integration tutorial
- [API Reference](./API.md) - Complete endpoint documentation
- [OpenAPI Spec](./openapi.yaml) - Machine-readable API spec
- [TypeScript SDK](../packages/safetx-client/README.md) - Official SDK docs
- [Backend README](../safetx-backend/README.md) - Self-hosting guide

---

**Ready to build?** Start with our [Getting Started Guide](./GETTING_STARTED.md)! 🚀
