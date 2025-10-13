# 🚀 Deployment Guide

## Prerequisites

- Node.js 18+ installed on server
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Backend Deployment

### Option 1: Railway (Recommended - Easy & Free Tier)

1. **Create Railway account:** https://railway.app
2. **New Project → Deploy from GitHub**
3. **Add environment variables:**
   ```
   PORT=5000
   NODE_ENV=production
   ```
4. **Configure Start Command:**
   ```bash
   cd safetx-backend && node server.js
   ```
5. **Generate domain** or add custom domain
6. **Update frontend `.env`:**
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

### Option 2: DigitalOcean VPS

1. **Create Droplet** (Ubuntu 22.04, $4/mo)

2. **SSH into server:**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

5. **Clone your repo:**
   ```bash
   git clone https://github.com/yourusername/neon-solana-watch.git
   cd neon-solana-watch/safetx-backend
   npm install
   ```

6. **Start with PM2:**
   ```bash
   pm2 start server.js --name safetx-backend
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx reverse proxy:**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/safetx
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable:
   ```bash
   sudo ln -s /etc/nginx/sites-available/safetx /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

### Option 3: Vercel Serverless

1. **Create `api/` folder in root**
2. **Move backend logic to `api/metrics.js`:**
   ```javascript
   export default async function handler(req, res) {
     // Your metrics logic here
   }
   ```
3. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Build frontend:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Add environment variables in Vercel dashboard:**
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

5. **Redeploy after env changes:**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set environment variables:**
   ```bash
   netlify env:set VITE_API_URL https://your-backend-url.com
   ```

### Option 3: GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to `package.json`:**
   ```json
   {
     "homepage": "https://yourusername.github.io/neon-solana-watch",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Update base in `vite.config.ts`:**
   ```typescript
   export default defineConfig({
     base: '/neon-solana-watch/',
     // ...
   })
   ```

## Post-Deployment Checklist

### Backend
- [ ] Backend is accessible via HTTPS
- [ ] `/api/health` endpoint returns 200
- [ ] `/api/metrics` returns valid JSON
- [ ] CORS configured for frontend domain
- [ ] PM2 or process manager running
- [ ] Logs are accessible
- [ ] Auto-restart on crashes configured

### Frontend
- [ ] Frontend loads without errors
- [ ] Environment variables set correctly
- [ ] API calls succeed (check Network tab)
- [ ] Wallet connection works
- [ ] Live data toggle functions
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] SEO meta tags added

## Environment Variables Summary

### Backend `.env` (optional)
```env
PORT=5000
NODE_ENV=production
```

### Frontend `.env`
```env
VITE_API_URL=https://your-backend-domain.com
```

## Monitoring Setup

### 1. UptimeRobot (Free)
- Add monitor for `https://your-backend.com/api/health`
- Email alerts on downtime

### 2. Sentry (Error Tracking)

**Backend:**
```bash
npm install @sentry/node
```

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

**Frontend:**
```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### 3. Google Analytics (Optional)
Add to `index.html`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## Custom Domain Setup

### Frontend (Vercel/Netlify)
1. Add domain in platform settings
2. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Value: your-app.vercel.app
   ```

### Backend (DigitalOcean/Railway)
1. Add A record pointing to server IP
   ```
   Type: A
   Name: api
   Value: your-server-ip
   ```
2. Setup SSL with Let's Encrypt (if VPS)

## Performance Optimization

### Backend
- [ ] Enable compression middleware
- [ ] Add Redis caching for RPC responses
- [ ] Implement rate limiting
- [ ] Use CDN for static assets

### Frontend
- [ ] Enable Vite build optimizations
- [ ] Lazy load routes
- [ ] Compress images
- [ ] Use CDN for fonts

## Security Hardening

### Backend
```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

### Frontend
- Add CSP headers
- Enable HTTPS only
- Validate all user inputs
- Use secure cookie settings

## Rollback Strategy

### Quick Rollback (Vercel/Netlify)
1. Go to deployments dashboard
2. Select previous working deployment
3. Click "Promote to Production"

### VPS Rollback
```bash
# View PM2 logs
pm2 logs safetx-backend

# Restart app
pm2 restart safetx-backend

# If needed, git checkout previous commit
git log --oneline
git checkout <commit-hash>
npm install
pm2 restart safetx-backend
```

## Cost Breakdown (Production)

| Service | Provider | Cost/Month |
|---------|----------|------------|
| Backend | Railway Free Tier | $0 |
| Frontend | Vercel Free Tier | $0 |
| Domain | Namecheap | $1/month |
| SSL | Let's Encrypt | $0 |
| **Total** | | **$1/month** |

**Upgrade Path:**
- Railway Pro: $5/month
- Vercel Pro: $20/month
- DigitalOcean VPS: $4-6/month

## Troubleshooting

### Backend 500 errors
```bash
# Check logs
pm2 logs safetx-backend

# Check Solana RPC connection
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### Frontend blank page
- Check browser console for errors
- Verify VITE_API_URL is set correctly
- Check Network tab for failed API calls
- Clear browser cache

### CORS errors
- Add frontend domain to CORS whitelist in backend
- Ensure backend is using `cors()` middleware

---

**Need help?** Open an issue on GitHub or check logs with `pm2 logs` (backend) or browser DevTools (frontend).
