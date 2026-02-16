# 7th Grade Math Apps Dashboard

Interactive math applications for 7th grade students, aligned with TEKS standards.

## Apps Included

1. **Transformations** - Explore geometric transformations on a coordinate plane
2. **Pythagorean Theorem** - Learn and practice the Pythagorean theorem
3. **Volume of Shapes** - Calculate volumes of 3D geometric shapes
4. **Angles & Triangles** - Study angles and triangle properties
5. **Solving Equations** - Practice solving equations and inequalities

## Quick Start (School Mac)

### One-Time Setup

1. Clone this repository:
```bash
git clone [your-repo-url]
cd math-dashboard
```

2. Install Flask (if not already installed):
```bash
pip3 install -r requirements.txt
```

### Running the Server

```bash
python3 app.py
```

The server will display:
- **Local URL**: `http://localhost:5000` (for testing on your Mac)
- **Network URL**: `http://192.168.x.x:5000` (give this to students)

Students on the same network can access the apps using the Network URL.

### Stopping the Server

Press `Ctrl+C` in the terminal

## Project Structure

```
math-dashboard/
├── app.py                  # Flask application
├── requirements.txt        # Python dependencies
├── templates/
│   └── dashboard.html     # Main dashboard page
├── static/                # Built React apps (production-ready)
│   ├── transformations/
│   ├── pythagoras/
│   ├── volume-shapes/
│   ├── angles-triangles/
│   └── solving-equations/
└── source/                # Original React source code (for future edits)
    ├── transformations/
    ├── pythagoras/
    ├── volume-shapes/
    ├── angles-triangles/
    └── solving-equations/
```

## Modifying Apps

If you need to modify an app in the future:

1. Navigate to the app's source folder: `cd source/[app-name]`
2. Install dependencies: `npm install`
3. Make your changes to the React code
4. Build: `npm run build`
5. Copy the new `dist` folder to `static/[app-name]`
6. Commit and push changes to GitHub

## Network Requirements

- Mac and student devices must be on the same network
- Mac should not go to sleep during class
- Check firewall settings if students can't connect

## Troubleshooting

**Students can't access the app:**
- Verify Mac and student devices are on same network
- Check Mac's firewall settings (System Preferences → Security & Privacy → Firewall)
- Make sure the app is running (check terminal)

**App not loading:**
- Clear browser cache
- Try different browser
- Check terminal for errors

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: CSS3
- **Deployment**: Local network (school Mac)

## License

Educational use for classroom instruction.
