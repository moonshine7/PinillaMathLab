# PINILLA MATH LAB - PROJECT NOTES & PROGRESS LOG
**Last Updated:** February 27, 2026 - 12:00 AM
**Teacher:** Eric Luna (Dallas ISD, 6th Grade Technology Applications)
**Project:** 7th Grade Interactive Math Apps Dashboard

---

## 🎯 PROJECT STATUS: LIVE & IN USE BY STUDENTS

**Production Site:** https://pinillamathlab.azurewebsites.net (5 apps - STABLE)
**Test Site:** https://pinillamathlabtest.azurewebsites.net (10 apps - TESTING)
**Login Password:** mathlab7
**GitHub:** https://github.com/moonshine7/PinillaMathLab

---

## 📊 CURRENT APP LINEUP

### Production (LIVE - 5 apps):
1. 🔄 Transformations - Coordinate plane transformations
2. 📐 Pythagorean Theorem - Right triangle practice
3. 📦 Volume of Shapes - 3D shape calculations
4. △ Angles & Triangles - Triangle properties
5. ✖️ Solving Equations - Equations and inequalities

### Test Site (10 apps):
Same 5 above PLUS:
6. 🔍 Dilation - Scaling transformations
7. 🔢 Real Numbers - Real number system
8. 📊 Scatter Plots - Data visualization
9. 🔬 Scientific Notation - Powers of 10
10. 📏 Surface Area - 3D geometry

---

## 🛠️ TECH STACK

**Backend:** Flask 3.0.0, Gunicorn (WSGI server)
**Frontend:** React 19, TypeScript, Vite
**Hosting:** Azure App Service (Free F1 tier)
**Region:** Central US
**Version Control:** GitHub
**Machines:** MacBook Pro 2015 (users: supernova5, cielo7)

---

## 📅 SESSION HISTORY

### Session 1 - February 17, 2026
**Location:** Home Mac → School PC
**Accomplished:**
- Built initial 5 apps from Gemini zips
- Created Flask dashboard with password login
- Set up GitHub repository
- Deployed to Azure (after multiple troubleshooting rounds)
- Site went LIVE for classroom use

**Key Issues Solved:**
- Vite base path configuration (must match Flask routes)
- requirements.txt corruption (had instructions as text)
- Port 5000 blocked by AirPlay (switched to 8000)
- Azure build failures (fixed requirements.txt)

### Session 2 - February 26-27, 2026
**Location:** MacBook Pro 2015 (supernova5 → cielo7)
**Accomplished:**
- Updated Pythagoras app with newer version
- Built 6 new apps in batch
- Created TEST staging environment
- Deployed 10-app version to TEST site
- Documented comprehensive workflows

**Key Issues Solved:**
- Accidentally copied entire Downloads folder to source (2GB of junk)
- Git push failed with HTTP 400 (fixed with buffer increase)
- Azure TEST deployment failures (took 3+ attempts)

---

## 🔄 WORKFLOW: ADDING NEW APPS FROM GEMINI

### Quick Reference

**1. Extract and Build**
```bash
mkdir -p ~/Documents/temp_builds
cd ~/Documents/temp_builds
unzip -q ~/Downloads/newApps/app-name.zip -d app-name
cd app-name

# CRITICAL: Set correct base path
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/app-name/',
  plugins: [react()],
  server: { port: 3000, host: '0.0.0.0' }
})
EOF

npm install
npm run build
```

**2. Copy to Repo**
```bash
cd /path/to/PinillaMathLab

# Copy ONLY the built files
cp -r ~/Documents/temp_builds/app-name/dist static/app-name

# Copy ONLY source files (NOT entire Downloads!)
mkdir -p source/app-name
cp ~/Documents/temp_builds/app-name/*.{json,ts,tsx,html} source/app-name/
cp -r ~/Documents/temp_builds/app-name/src source/app-name/
```

**3. Update app.py**
Add to MATH_APPS list:
```python
{
    'id': 'app-name',
    'title': 'Display Name',
    'description': 'What it does',
    'icon': '🎯',
    'path': '/app-name'
}
```

**4. Deploy to TEST**
```bash
git add .
git commit -m "Added app-name"
git push
az webapp up --name PinillaMathLabTest --resource-group math-apps-rg --runtime "PYTHON:3.11" --sku F1
```

**5. Deploy to LIVE (when TEST is perfect)**
```bash
az webapp up --name PinillaMathLab --resource-group math-apps-rg --runtime "PYTHON:3.11" --sku F1
```

---

## ⚠️ CRITICAL MISTAKES TO AVOID

### ❌ NEVER DO THIS:
```bash
cp -r ~/Downloads/* source/app-name/
```
**Why:** Copies EVERYTHING in Downloads (DMGs, EXEs, videos, etc.)
**Result:** 2GB+ repo, GitHub rejects push, Azure deployment fails

### ✅ ALWAYS DO THIS:
```bash
cp -r ~/Documents/temp_builds/app-name/dist static/app-name
```
**Why:** Only copies the built app files
**Result:** Clean repo, fast deployments

---

## 🔧 AZURE CONFIGURATION

**Resource Group:** math-apps-rg
**App Service Plan:** eriluna_asp_3193
**Pricing Tier:** F1 (Free - $0/month forever)
**Runtime:** Python 3.11
**Startup Command:** `gunicorn --bind=0.0.0.0:8000 app:app`

**Subscription:** Azure subscription 1 (Dallas ISD)
**Subscription ID:** 3548c294-c260-4a9f-b1d3-7abf97c60ac8
**Free Trial:** 30 days from Feb 17, 2026

---

## 📁 PROJECT STRUCTURE

```
PinillaMathLab/
├── app.py                    # Flask server
├── requirements.txt          # Flask==3.0.0, gunicorn
├── devtools.sh              # Deployment shortcuts
├── templates/
│   ├── dashboard.html       # Main student UI
│   └── login.html           # Password login
├── static/                  # Built React apps
│   ├── transformations/
│   ├── pythagoras/
│   ├── volume-shapes/
│   ├── angles-triangles/
│   ├── solving-equations/
│   ├── dilation/
│   ├── pythagoras-new/
│   ├── real-number/
│   ├── scatter-plot/
│   ├── scientific-notation/
│   └── surface-area/
├── source/                  # React source code
│   └── [same apps as static/]
├── ProjNotes/
│   └── PROJECT-NOTES.md     # This file
└── README.md
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "ModuleNotFoundError: No module named 'app'"
**Cause:** Flask not installed during Azure build
**Solution:** 
```bash
# Verify requirements.txt is clean
cat requirements.txt
# Should show ONLY:
Flask==3.0.0
gunicorn

# Redeploy
az webapp up --name [AppName] --resource-group math-apps-rg --runtime "PYTHON:3.11" --sku F1
```

### Issue: Apps show blank/white screen
**Cause:** Wrong base path in vite.config.ts
**Solution:**
```javascript
// vite.config.ts MUST have:
export default defineConfig({
  base: '/app-name/',  // Must match Flask route!
  // ...
})
```

### Issue: Git push fails with HTTP 400
**Cause:** Push too large or has files >100MB
**Solution:**
```bash
# Increase buffer
git config http.postBuffer 524288000

# Remove large files
find . -type f -size +50M

# Try again
git push
```

### Issue: Azure deployment hangs
**Cause:** F1 tier is slow, or deployment stuck
**Solution:**
- Wait 10+ minutes (F1 is SLOW)
- Check logs: `az webapp log tail --name [AppName] --resource-group math-apps-rg`
- Restart: `az webapp restart --name [AppName] --resource-group math-apps-rg`

---

## 💻 MACHINE DETAILS

**MacBook Pro 2015**
- Users: supernova5, cielo7
- OneDrive sync enabled (cielo7 account)
- Node.js: v24.13.1
- npm: 11.8.0
- Python: 3.9
- Azure CLI: Installed via pipx

**Paths:**
- supernova5: `/Users/supernova5/Documents/myDevtools3/PinillaMathapps/PinillaMathLab`
- cielo7: `/Users/cielo7/OneDrive - Nonameyet/PinillaMathLab`

---

## 🎯 NEXT SESSION TASKS

**Immediate:**
1. Debug wonky apps on TEST site
2. Fix vite.config.ts for broken apps
3. Rebuild and redeploy
4. Test all 10 apps thoroughly
5. Deploy to LIVE when perfect

**Future:**
1. Add .gitignore to each app source folder
2. Create student quick reference card
3. Document TEKS standards per app
4. Consider GitHub Actions auto-deploy
5. Student progress tracking (long-term)

---

## 📝 KEY LEARNINGS

1. **Azure F1 is slow but FREE** - Perfect for classroom use
2. **TEST environment is ESSENTIAL** - Don't test on LIVE!
3. **Vite base paths are critical** - Must match Flask routes exactly
4. **Git buffer size matters** - Increase for large repos
5. **Clean source directories** - Never copy from Downloads directly
6. **Batch building saves time** - 6 apps in 10 minutes
7. **OneDrive sync is handy** - Easy machine switching
8. **Document EVERYTHING** - Future you will thank you

---

## 🔗 IMPORTANT LINKS

- **LIVE Site:** https://pinillamathlab.azurewebsites.net
- **TEST Site:** https://pinillamathlabtest.azurewebsites.net
- **GitHub:** https://github.com/moonshine7/PinillaMathLab
- **Azure Portal:** https://portal.azure.com
- **Flask Docs:** https://flask.palletsprojects.com/
- **Vite Docs:** https://vitejs.dev/

---

## 🚨 EMERGENCY PROCEDURES

### If LIVE site goes down:
```bash
# Check status
az webapp show --name PinillaMathLab --resource-group math-apps-rg --query state

# View logs
az webapp log tail --name PinillaMathLab --resource-group math-apps-rg

# Restart
az webapp restart --name PinillaMathLab --resource-group math-apps-rg

# Rollback (if needed)
git log --oneline -10
git checkout [previous-working-commit]
git push -f
az webapp up --name PinillaMathLab --resource-group math-apps-rg --runtime "PYTHON:3.11" --sku F1
```

### If locked out:
- Password: mathlab7 (changeable in app.py line ~11)
- Secret key: pinilla-math-2024-changeme (should change this!)

---

## 📊 DEPLOYMENT TIMELINE

**Feb 17, 2026:** Initial deployment (5 apps) - LIVE  
**Feb 26, 2026:** Updated Pythagoras - LIVE  
**Feb 27, 2026:** 10 apps deployed - TEST (in progress)  
**TBD:** 10 apps to LIVE (pending testing)

---

**END OF PROJECT NOTES**
**Version:** 2.0
**Last Session:** February 26-27, 2026
**Status:** TEST site running, debugging in progress
