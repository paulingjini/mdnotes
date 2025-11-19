# Deployment Guide - MDNotes Pro v2.1.0

Complete guide for deploying MDNotes Pro to production environments.

## Quick Deploy Options

### 1. GitHub Pages (Recommended for Demo)

**Setup:**
```bash
# 1. Push to GitHub
git push origin main

# 2. Enable GitHub Pages
# Go to: Settings → Pages → Source → main branch → root
```

**Result:** Your app will be available at `https://username.github.io/mdnotes`

**Pros:**
- Free hosting
- Automatic HTTPS
- CDN distribution
- Zero configuration

**Cons:**
- Public repositories only (unless Pro)
- No server-side processing

### 2. Netlify (Best for Production)

**Setup:**
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**Configuration (`netlify.toml`):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

**Pros:**
- Automatic deploys on git push
- Custom domains
- HTTPS included
- Edge CDN
- Build previews

### 3. Vercel (Alternative to Netlify)

**Setup:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
npm run build
vercel --prod
```

**Configuration (`vercel.json`):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### 4. Self-Hosted (Apache/Nginx)

**Apache Configuration:**
```apache
<VirtualHost *:80>
    ServerName mdnotes.example.com
    DocumentRoot /var/www/mdnotes

    <Directory /var/www/mdnotes>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Gzip compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
    </IfModule>

    # Cache headers
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/html "access plus 0 seconds"
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
    </IfModule>
</VirtualHost>
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name mdnotes.example.com;
    root /var/www/mdnotes;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Cache headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

### 5. Docker Container

**Dockerfile:**
```dockerfile
FROM nginx:alpine

# Copy built files
COPY dist/ /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run:**
```bash
# Build
docker build -t mdnotes:2.1.0 .

# Run
docker run -d -p 8080:80 mdnotes:2.1.0
```

## Pre-Deployment Checklist

### 1. Build Optimization

```bash
# Clean build
rm -rf dist/
npm run build

# Verify output
ls -lh dist/index.html
```

### 2. Test Locally

```bash
# Test with local server
npm run dev

# Or use Python
cd dist && python3 -m http.server 8000

# Or use PHP
cd dist && php -S localhost:8000
```

### 3. Verify Features

- [ ] Editor loads correctly
- [ ] Preview renders markdown
- [ ] Mindmap displays
- [ ] Presentations work
- [ ] Export functions (MD, HTML, PDF, DOCX, PPTX)
- [ ] File management (create, delete, switch)
- [ ] Tables are interactive
- [ ] Task lists have checkboxes
- [ ] Timeline renders correctly
- [ ] Charts display properly
- [ ] CodeMirror syntax highlighting works
- [ ] All themes work

### 4. Performance Check

```bash
# Check file size
ls -lh dist/index.html
# Target: < 250 KB

# Test load time
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/

# curl-format.txt:
# time_total: %{time_total}s
# size_download: %{size_download} bytes
```

### 5. Security Headers

Verify these headers are set:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` (optional but recommended)

## Production Best Practices

### 1. Use HTTPS

Always serve over HTTPS. Free options:
- Let's Encrypt (certbot)
- Cloudflare (free tier)
- GitHub Pages (automatic)
- Netlify/Vercel (automatic)

### 2. Enable Compression

Ensure gzip/brotli compression is enabled:
```bash
# Test compression
curl -H "Accept-Encoding: gzip" -I https://your-domain.com/
```

### 3. CDN Configuration

If using a CDN:
- Cache HTML: 0-5 minutes
- Cache JS/CSS: 1 year (immutable)
- Cache images: 1 month

### 4. Monitoring

Set up monitoring:
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry)
- Analytics (Plausible, Google Analytics)

### 5. Backup Strategy

Regular backups of:
- Source code (Git)
- User settings (if storing server-side)
- Custom configurations

## Environment-Specific Configurations

### Development

```bash
# Use watch mode
npm run watch

# Use dev server with hot reload
npm run dev
```

### Staging

```bash
# Build with source maps
npm run build

# Deploy to staging domain
netlify deploy --alias=staging
```

### Production

```bash
# Build optimized version
npm run build

# Deploy to production
netlify deploy --prod
```

## CDN vs Local Libraries

### Using CDN (Default - Current Setup)

**Pros:**
- Smaller file size (~200 KB)
- Browser caching benefits
- Faster initial load

**Current Status:** All external libraries load from CDN

### Using Local Libraries (Offline Support)

**Setup:**
```bash
# Download all libraries
npm run download-libs

# Libraries will be in libs/ directory (~6-8 MB)
```

**To enable local libraries:**
1. Modify `src/html/template.html`
2. Change CDN URLs to local paths
3. Update build script to include libs
4. Rebuild: `npm run build`

**Result:** Fully offline-capable application

## Troubleshooting

### Build Issues

**Error: Module not found**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**Large file size**
```bash
# Check individual file sizes
du -h src/js/**/*.js | sort -h

# Remove unused features
# Edit build/build.js to exclude modules
```

### Runtime Issues

**CDN libraries not loading**
- Check internet connection
- Verify CDN URLs are accessible
- Consider using local libraries

**LocalStorage quota exceeded**
- Clear old data
- Implement data cleanup
- Use IndexedDB for large files (future enhancement)

**Performance issues**
- Reduce document size
- Disable unused features
- Use lazy loading (future enhancement)

## Scaling Considerations

### For High Traffic

1. **Use CDN**
   - Cloudflare (recommended)
   - AWS CloudFront
   - Fastly

2. **Optimize Assets**
   - Minify JavaScript (done in build)
   - Compress images
   - Enable HTTP/2

3. **Cache Strategy**
   - Aggressive caching for static assets
   - Cache-Control headers properly set

### For Teams

1. **Add Authentication**
   - Integrate with OAuth (Google, GitHub)
   - Add user management

2. **Add Backend**
   - API for file storage
   - Real-time collaboration (WebSocket)
   - Version control integration

3. **Database**
   - Replace localStorage with server storage
   - Implement sync mechanism

## Post-Deployment

### 1. Announce Launch

- Update README with live demo link
- Share on social media
- Submit to product directories

### 2. Gather Feedback

- Add feedback form
- Monitor error logs
- Track user analytics

### 3. Iterate

- Regular updates
- Feature improvements
- Bug fixes

## Support

For deployment issues:
- Check [GitHub Issues](https://github.com/paulingjini/mdnotes/issues)
- Read [Documentation](README.md)
- Review [CLAUDE.md](CLAUDE.md) for architecture details

---

**Last Updated**: 2025-11-19
**Version**: 2.1.0
**Status**: Production Ready ✅
