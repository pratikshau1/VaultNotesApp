# Netlify Deployment Guide

This guide explains how to deploy VaultNotesApp to Netlify and ensure SPA routing works correctly.

## 🚀 Quick Setup

### 1. Connect Repository to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure build settings:
   - **Build command**: `npm run build` or `npx vite build`
   - **Publish directory**: `dist`
   - **Node version**: `20` (set in netlify.toml)

### 2. Environment Variables (if needed)

If you have any environment variables:
1. Go to Site settings → Environment variables
2. Add your variables (e.g., `VITE_FIREBASE_API_KEY`)

### 3. Deploy

Netlify will automatically deploy when you push to your repository.

## 🔧 SPA Routing Configuration

The app is configured to handle Single Page Application (SPA) routing correctly. This prevents 404 errors when refreshing pages.

### Files Configured

1. **`netlify.toml`** - Contains redirect rule:
   ```toml
   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

2. **`public/_redirects`** - Netlify redirects file:
   ```
   /*    /index.html   200
   ```

### How It Works

- When a user visits `/dashboard` or `/auth`, Netlify serves `index.html` instead of looking for those files
- React Router then handles the routing on the client side
- Status code 200 (not 301/302) ensures the URL stays the same

## ✅ Verification

After deployment, test these scenarios:

1. **Direct URL Access**: Visit `https://your-site.netlify.app/dashboard` directly
   - ✅ Should load the dashboard (not 404)

2. **Refresh on Route**: Navigate to `/dashboard` and refresh the page
   - ✅ Should stay on `/dashboard` (not 404)

3. **Deep Links**: Share a link to `/auth` or any route
   - ✅ Should work correctly

4. **Browser Back/Forward**: Use browser navigation
   - ✅ Should work correctly

## 🐛 Troubleshooting

### Issue: Still getting 404 errors

**Solution 1**: Check that `_redirects` file is in `dist` folder
- The file should be copied automatically by Vite
- Verify in Netlify deploy logs that the file exists

**Solution 2**: Verify `netlify.toml` is in the root
- Netlify reads this file automatically
- Check deploy logs for any configuration errors

**Solution 3**: Clear Netlify cache
- Go to Site settings → Build & deploy → Clear cache and retry deploy

### Issue: Redirects not working

**Check**:
1. `public/_redirects` file exists and has correct format
2. `netlify.toml` has redirect rule
3. Build is successful (check deploy logs)
4. File is copied to `dist` folder

### Issue: Assets not loading (404 for JS/CSS)

**Solution**: The redirect rule should only apply to non-file requests. If assets are 404:
- Check that build completed successfully
- Verify `dist` folder contains all assets
- Check browser console for specific file paths

## 📝 File Structure

```
VaultNotesApp/
├── netlify.toml          # Netlify configuration
├── public/
│   └── _redirects        # SPA redirects file (copied to dist)
├── dist/                 # Build output (generated)
│   ├── index.html
│   ├── _redirects        # Copied from public/
│   └── assets/           # JS, CSS, images
└── ...
```

## 🔄 Continuous Deployment

Netlify automatically deploys when you:
- Push to main/master branch
- Merge pull requests
- Trigger manual deploy

### Manual Deploy

1. Go to Netlify dashboard
2. Click "Trigger deploy" → "Deploy site"
3. Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

## 🌐 Custom Domain

To add a custom domain:

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. **Important**: Add the domain to Firebase Authorized domains (see FIREBASE_SETUP.md)

## 📊 Build Settings Summary

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `20`
- **Framework**: Vite + React

## 🎯 Best Practices

1. **Always test locally first**: Run `npm run build && npm run preview`
2. **Check deploy logs**: Look for any warnings or errors
3. **Test all routes**: Verify SPA routing works after each deploy
4. **Monitor build times**: Optimize if builds take too long
5. **Use environment variables**: Don't commit secrets to repository

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Need help?** Check the main README.md or FIREBASE_SETUP.md for more information.

