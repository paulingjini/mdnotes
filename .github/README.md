# GitHub Configuration

This directory contains GitHub-specific configuration files for MDNotes Pro.

## Workflows

### deploy.yml
Automated deployment workflow for GitHub Pages.

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Actions:**
1. Checkout code
2. Setup Node.js 18
3. Build application (`npm run build`)
4. Verify build output
5. Deploy to GitHub Pages (on main branch only)

**Result:** Automatic deployment to `https://username.github.io/mdnotes`

## Setup Instructions

1. **Enable GitHub Pages:**
   - Go to: Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` → root
   - Save

2. **First Deploy:**
   ```bash
   git push origin main
   ```

3. **Monitor Deployment:**
   - Go to: Actions tab
   - Watch the workflow run
   - Check deployment status

## Secrets Required

No secrets required for public repositories with GitHub Pages.

For private repositories:
- Ensure GitHub Actions are enabled
- GITHUB_TOKEN is automatically provided

## Customization

To modify the deployment:
1. Edit `.github/workflows/deploy.yml`
2. Commit and push changes
3. Workflow will use new configuration

## Support

For issues with GitHub Actions:
- Check workflow logs in Actions tab
- Review [GitHub Actions documentation](https://docs.github.com/en/actions)
- Check [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
