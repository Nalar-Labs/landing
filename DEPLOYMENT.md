# Deployment Guide

The Nalar Labs landing page can be deployed to multiple platforms. **Netlify is recommended** as the default choice.

## Platform Comparison

| Platform | Setup Time | Cold Starts | Pricing | Best For |
|----------|-----------|------------|---------|----------|
| **Netlify** | ~2 min | <100ms | Free tier (generous) | Recommended |
| Vercel | ~2 min | <100ms | Free tier (limited) | Vercel ecosystem |
| Cloudflare Pages | ~3 min | <50ms | Free (with limits) | DDoS protection |
| GitHub Pages | ~5 min | Variable | Free | GitHub-only |
| AWS S3 + CloudFront | ~10 min | <100ms | Pay-as-you-go | Scale & custom domain |

---

## Netlify (Recommended)

### 1. Connect GitHub

1. Go to [netlify.com](https://netlify.com)
2. Click **"New site from Git"**
3. Authorize GitHub and select the **Nalar-Labs/landing** repository
4. Leave build settings as default (Netlify auto-detects `netlify.toml`)
5. Click **"Deploy site"**

### 2. Custom Domain

1. In Netlify dashboard, go to **Site settings > Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `nalar.com`)
4. Update your DNS registrar's nameservers to Netlify's (provided in dashboard)
5. Verify DNS propagation (~24 hours)

### 3. Environment & Build

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: Auto-detected from `package.json` (>= 18.18)

---

## Vercel

### 1. Connect GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Authorize GitHub and select **Nalar-Labs/landing**
4. Vercel auto-detects build settings from `vercel.json`
5. Click **"Deploy"**

### 2. Custom Domain

1. In Vercel dashboard, go to **Settings > Domains**
2. Click **"Add"** and enter your domain
3. Vercel provides nameservers; update your DNS registrar
4. Verify within your registrar's dashboard

### 3. Environment & Build

- **Build command**: Auto-detected (`npm run build`)
- **Output directory**: `dist`
- **Function region**: Global (default)

---

## Cloudflare Pages

### 1. Connect GitHub

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) (requires existing Cloudflare account)
2. Select your domain and navigate to **Workers & Pages**
3. Click **"Create application > Pages > Connect to Git"**
4. Authorize GitHub and select **Nalar-Labs/landing**
5. Set build command to `npm run build`, publish to `dist`
6. Click **"Save and deploy"**

### 2. Custom Domain

1. In Cloudflare dashboard, add your domain via **DNS**
2. Pages auto-routes traffic; no additional nameserver changes needed
3. Enable **Full SSL/TLS** in Cloudflare settings (recommended)

---

## GitHub Pages

### 1. Deploy via GitHub Actions

1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install && npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. Push to `main`; Actions workflow runs automatically
3. In repository **Settings > Pages**, ensure **Source** is set to `gh-pages` branch

### 2. Custom Domain

1. In repository **Settings > Pages**, enter your custom domain
2. Update your DNS registrar to point to GitHub's IP (provided in Settings)
3. GitHub auto-provisions SSL certificate

---

## AWS S3 + CloudFront

### 1. Create S3 Bucket

```bash
aws s3 mb s3://nalar-landing-prod
aws s3 sync dist/ s3://nalar-landing-prod --delete
aws s3 website s3://nalar-landing-prod --index-document index.html --error-document index.html
```

### 2. Create CloudFront Distribution

1. In AWS CloudFront console, click **"Create Distribution"**
2. Set **Origin** to your S3 bucket
3. Enable **Compress objects automatically**
4. Set **Cache policy** to `CachingOptimized`
5. Add custom domain under **Alternate domain names (CNAMEs)**
6. Provision SSL via ACM (AWS Certificate Manager)
7. Click **"Create distribution"**

### 3. DNS Configuration

Update your DNS registrar's CNAME record:
```
nalar.com CNAME d12345.cloudfront.net
```

---

## Monitoring & Maintenance

### Post-Deployment Checklist

- [ ] Test homepage load speed ([GTmetrix](https://gtmetrix.com))
- [ ] Verify 3D globe renders in production
- [ ] Check mobile responsiveness
- [ ] Test "Step inside the globe" button
- [ ] Verify email links (`mailto:hello@nalarlabs.com`) work
- [ ] Monitor error rates in deployment platform's dashboard

### Rollback

All platforms above support one-click rollback to previous deployments. No manual rebuilds needed.

---

## Environment Variables

If needed in the future, add to your platform:

```
VITE_API_URL=https://api.example.com
```

See your platform's docs for how to set env vars (usually in Settings → Environment Variables).
