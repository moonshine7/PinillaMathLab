# DEPLOYMENT GUIDE - GitHub to School Mac

## Part 1: From Your MacBook (Home) to GitHub

### Step 1: Initialize Git Repository

Open Terminal on your MacBook and navigate to the project:

```bash
cd [wherever you put this folder]
cd math-dashboard
```

### Step 2: Initialize Git

```bash
git init
git add .
git commit -m "Initial commit - 7th grade math dashboard with 5 apps"
```

### Step 3: Create GitHub Repository

1. Go to https://github.com
2. Click the "+" icon → "New repository"
3. Name it: `math-dashboard` (or whatever you want)
4. Choose: **Public** or **Private** (your choice)
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Step 4: Push to GitHub

GitHub will show you commands. Use these (replace with your repo URL):

```bash
git remote add origin https://github.com/YOUR-USERNAME/math-dashboard.git
git branch -M main
git push -u origin main
```

**✅ Done! Your code is on GitHub.**

---

## Part 2: At School Mac - First Time Setup

### Step 1: Clone Repository

Open Terminal on your School Mac:

```bash
cd Desktop  # or wherever you want the project
git clone https://github.com/YOUR-USERNAME/math-dashboard.git
cd math-dashboard
```

### Step 2: Install Flask

```bash
pip3 install -r requirements.txt
```

If you get a permission error, try:
```bash
pip3 install --user -r requirements.txt
```

### Step 3: Run the App

**Option A - Using the start script:**
```bash
./start.sh
```

**Option B - Manually:**
```bash
python3 app.py
```

### Step 4: Get Your IP Address

The app will show you something like:
```
Server running on:
  → Local:   http://localhost:5000
  → Network: http://192.168.1.XXX:5000
```

**Give students the Network address!**

---

## Part 3: Daily Usage (At School)

### Starting the Server

```bash
cd Desktop/math-dashboard
python3 app.py
```

OR

```bash
cd Desktop/math-dashboard
./start.sh
```

### Stopping the Server

Press: `Ctrl + C`

### Giving Students Access

1. Make sure your Mac is connected to school WiFi
2. Start the server
3. Write the Network IP on the board: `http://192.168.1.XXX:5000`
4. Students type that in their browser
5. They see the dashboard and can click any app!

---

## Part 4: Updating Apps (Future)

### If You Make Changes at Home:

```bash
cd math-dashboard
git add .
git commit -m "Description of changes"
git push
```

### To Get Updates at School:

```bash
cd Desktop/math-dashboard
git pull
```

That's it! The new version is now on your School Mac.

---

## Troubleshooting

### Students Can't Connect

**Check 1:** Are you and students on the same network?
- You: School WiFi
- Students: School WiFi
- Must be the SAME network!

**Check 2:** Is your Mac firewall blocking connections?
1. System Preferences → Security & Privacy → Firewall
2. If Firewall is ON → Click "Firewall Options"
3. Make sure Python is allowed

**Check 3:** Is the app running?
- Look for "Server running on..." message in Terminal
- If not, run `python3 app.py` again

### "Command not found: python3"

Try `python` instead:
```bash
python app.py
```

### "No module named 'flask'"

Install Flask:
```bash
pip3 install flask
```

Or with user flag:
```bash
pip3 install --user flask
```

---

## Network Security Note

This setup only works on LOCAL network (school). Students outside school network CAN'T access it. This is intentional and secure for classroom use.

If you need internet access (outside school), you'd need to deploy to Azure (different process).

---

## Quick Reference

**Start server:** `python3 app.py`
**Stop server:** `Ctrl + C`
**Update from GitHub:** `git pull`
**Student URL:** `http://[YOUR-IP]:5000`
**Dashboard:** Shows all 5 apps with links
