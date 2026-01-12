# Development Setup Guide

Complete guide for setting up the Home Ownership Returns Calculator for local development and production deployment.

## Table of Contents

- [Quick Start](#quick-start-local-development)
- [Prerequisites](#prerequisites-for-deployment)
- [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [GitHub Secrets](#github-secrets)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [File Reference](#file-reference)
- [Best Practices](#best-practices)

## Quick Start (Local Development)

1. Clone the repository
2. Create `config.js` file with your local credentials (see [Create Configuration File](#2-create-configuration-file))
3. Open `index.html` in your browser or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```
4. Navigate to `http://localhost:8000`

## Prerequisites for Deployment

- Git
- A text editor or IDE (VS Code recommended)
- Google Chrome or another modern browser
- A Google Account (for Google Apps Script and Google Analytics)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vpattar/homeownership-returns.git
cd homeownership-returns
```

### 2. Create Configuration File

Create a `config.js` file in the project root with your local credentials:

```javascript
// config.js (DO NOT COMMIT - this file is in .gitignore)
window.GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
window.GA_TRACKING_ID = 'G-YOUR_TRACKING_ID';
```

**How to get your values:**

- **GOOGLE_APPS_SCRIPT_URL**: 
  1. Go to your Google Apps Script project
  2. Click "Deploy" → "New Deployment"
  3. Select "Web app" as the type
  4. Copy the deployment URL from the modal

- **GA_TRACKING_ID**:
  1. Go to [Google Analytics](https://analytics.google.com/)
  2. Select your property
  3. Go to Admin → Property Settings
  4. Copy the Measurement ID (format: G-XXXXXXXXXX)

### 3. Run Locally

Use any local web server to test:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

## Configuration

### Configuration File Structure

The `config.js` file contains two global variables:

```javascript
window.GOOGLE_APPS_SCRIPT_URL  // URL of your deployed Google Apps Script
window.GA_TRACKING_ID           // Your Google Analytics tracking ID
```

These variables are injected into the application before `script.js` loads.

### Environment Files

- **`.env.example`**: Reference file showing required variables (commit to repo)
- **`config.js`**: Your actual configuration (DO NOT commit - in .gitignore)

## GitHub Secrets

### Setting Up Secrets for CI/CD

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Create two new repository secrets:

#### Secret 1: GOOGLE_APPS_SCRIPT_URL
- **Name**: `GOOGLE_APPS_SCRIPT_URL`
- **Value**: Your deployed Google Apps Script URL
- **Example**: `https://script.google.com/macros/s/AKfycbxF6RqEA13RHeVlFFcyv8uq2Gt6GSo8dfXGPYOq-IsKXZkO087zjAcfYzhuGKRBOzGSZQ/exec`

#### Secret 2: GA_TRACKING_ID
- **Name**: `GA_TRACKING_ID`
- **Value**: Your Google Analytics Measurement ID
- **Example**: `G-0REE9FK2W4`

### Verifying Secrets

GitHub won't display secret values after creation. To verify they're set:

1. Go to **Settings → Secrets and variables → Actions**
2. You should see both secrets listed (values hidden)
3. Check the workflow logs after pushing to confirm they're being used

## Deployment

### Automatic Deployment (GitHub Pages + GitHub Actions)

The application automatically deploys to GitHub Pages when you push to the `main` branch.

**Process**:
1. Push code to `main` branch
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers automatically
3. Workflow reads GitHub Secrets
4. Creates `config.js` with secret values
5. Builds and deploys to GitHub Pages

**Requirements**:
- GitHub Secrets configured (see [Setting Up Secrets for CI/CD](#setting-up-secrets-for-cicd))
- GitHub Pages enabled for the repository
- `.github/workflows/deploy.yml` present in repo

### Manual Deployment

If you're deploying to a custom server:

1. Ensure `config.js` is in the project root with correct values
2. Copy all files to your hosting server (excluding `.gitignore` files)
3. The application will use the `config.js` values

## Troubleshooting

### Feedback System Not Working

**Error**: "Feedback system is not configured. Please try again later."

**Solutions**:
- Verify `config.js` exists in project root
- Check that `GOOGLE_APPS_SCRIPT_URL` is set correctly
- Confirm the Google Apps Script deployment URL is valid
- Check browser console (F12 → Console) for errors
- Verify `config.js` loads before `script.js` in HTML

### Google Analytics Not Tracking

**Issue**: Events not appearing in Google Analytics

**Solutions**:
- Verify `GA_TRACKING_ID` is correct (starts with `G-`)
- Confirm `config.js` loads before analytics code in HTML
- Check that the tracking ID exists in Google Analytics property
- Wait a few minutes for data to appear (real-time view may show events)
- Check browser console for errors

### Build/Deployment Failures

**Check these items**:
1. GitHub Secrets are configured correctly
2. `.github/workflows/deploy.yml` exists
3. GitHub Pages is enabled (Settings → Pages)
4. Recent workflow runs show errors (Actions tab)
5. Check workflow logs for specific error messages

## File Reference

### index.html
Main HTML file. Contains:
- Form inputs for user data
- Results display elements
- Script loading (`config.js` must load before `script.js`)
- Google Analytics code

### script.js
Main application logic. Contains:
- `loadConfig()` - Reads global variables from config.js
- `calculateReturns()` - Main calculation engine
- `createYearlyChart()` - Chart.js visualization
- Event handlers for feedback and form submission

### styles.css
Application styling and responsive design.

### config.js (Local Development)
Local configuration file. **Do not commit to git**.

### .github/workflows/deploy.yml
GitHub Actions workflow that:
- Reads GitHub Secrets
- Injects values into config.js
- Deploys to GitHub Pages

## Best Practices

✅ **DO**:
- Keep `config.js` in `.gitignore`
- Store secrets in GitHub Secrets
- Test locally with `config.js` before deploying
- Use HTTPS for Google Apps Script URLs
- Review workflow logs for deployment issues

❌ **DON'T**:
- Commit `config.js` with real secrets
- Hardcode URLs in HTML or JavaScript
- Share your Google Apps Script URL publicly
- Use personal API keys in the repository
- Disable `.gitignore` rules for convenience

## Additional Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Analytics Setup Guide](https://support.google.com/analytics/answer/1008015)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review GitHub Issues in the repository
3. Check browser console for error messages (F12)
4. Review GitHub Actions logs for deployment issues
