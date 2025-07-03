# GitHub Repository Setup Guide

## Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `kenya-bus-travel`
3. Make it Public
4. Don't initialize with README (we already have files)
5. Click "Create repository"

## Step 2: Connect Local Repository
After creating the repository, GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/kenya-bus-travel.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Deploy automatically

## Alternative: Use GitHub CLI (if working)
```bash
gh auth login
gh repo create kenya-bus-travel --public --source=. --remote=origin --push
``` 