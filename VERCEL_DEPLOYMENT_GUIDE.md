# Vercel Environment Variables Setup Guide

## Step 1: Create MongoDB Atlas (Cloud Database)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a free cluster
4. Get your connection string (looks like: mongodb+srv://username:password@cluster.mongodb.net/database)

## Step 2: Add to Vercel
Go to your Vercel project → Settings → Environment Variables

Add these variables:

### Database
- Name: `MONGODB_URI`
- Value: `mongodb+srv://username:password@cluster.mongodb.net/college_app`

### Authentication
- Name: `JWT_SECRET`
- Value: (use your JWT_SECRET from backend/.env)

### API Keys
- Name: `GEMINI_API_KEY`
- Value: (use your GEMINI_API_KEY from backend/.env)

### Node Environment
- Name: `NODE_ENV`
- Value: `production`

## Step 3: Click Deploy
After adding all variables, click the Deploy button in Vercel.

Your frontend + backend will deploy automatically!

