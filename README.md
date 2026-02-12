# Miles Spearman — Portfolio

## Deploy to Vercel (5 minutes)

### Step 1: Create a GitHub repo
1. Go to https://github.com/new
2. Name it `portfolio` (or whatever you want)
3. Set it to **Public** or **Private** — either works
4. Click **Create repository**

### Step 2: Push this code
Open Terminal on your Mac and run these commands one at a time:

```bash
cd ~/Downloads/miles-portfolio
git init
git add .
git commit -m "initial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Deploy on Vercel
1. Go to https://vercel.com and sign up with GitHub
2. Click **Add New → Project**
3. Import your `portfolio` repo
4. Vercel auto-detects Vite — just click **Deploy**
5. Done! Your site is live at `your-project.vercel.app`

### Step 4: Customize the URL (optional)
In Vercel dashboard → Settings → Domains → type `milesspearman` to get `milesspearman.vercel.app`

## Local Development
```bash
npm install
npm run dev
```
Opens at http://localhost:5173
