from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# Math apps configuration
MATH_APPS = [
    {
        'id': 'transformations',
        'title': 'Transformations',
        'description': 'Explore geometric transformations on a coordinate plane',
        'icon': '🔄',
        'path': '/transformations'
    },
    {
        'id': 'pythagoras',
        'title': 'Pythagorean Theorem',
        'description': 'Learn and practice the Pythagorean theorem',
        'icon': '📐',
        'path': '/pythagoras'
    },
    {
        'id': 'volume-shapes',
        'title': 'Volume of Shapes',
        'description': 'Calculate volumes of 3D geometric shapes',
        'icon': '📦',
        'path': '/volume-shapes'
    },
    {
        'id': 'angles-triangles',
        'title': 'Angles & Triangles',
        'description': 'Study angles and triangle properties',
        'icon': '△',
        'path': '/angles-triangles'
    },
    {
        'id': 'solving-equations',
        'title': 'Solving Equations',
        'description': 'Practice solving equations and inequalities',
        'icon': '✖️',
        'path': '/solving-equations'
    }
]

@app.route('/')
def dashboard():
    """Main dashboard showing all available apps"""
    return render_template('dashboard.html', apps=MATH_APPS)

# Serve each math app
@app.route('/<app_name>')
@app.route('/<app_name>/<path:filename>')
def serve_app(app_name, filename=None):
    """Serve math apps and their assets"""
    # Check if this is a valid app
    valid_apps = [app['id'] for app in MATH_APPS]
    if app_name not in valid_apps:
        return "App not found", 404
    
    # Serve the index.html or requested file
    if filename is None:
        return send_from_directory(os.path.join(app.static_folder, app_name), 'index.html')
    else:
        return send_from_directory(os.path.join(app.static_folder, app_name), filename)

if __name__ == '__main__':
    # Get local IP for easier student access
    import socket
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    
    print("\n" + "="*60)
    print("🎓 7TH GRADE MATH DASHBOARD")
    print("="*60)
    print(f"\nServer running on:")
    print(f"  → Local:   http://localhost:8000")
    print(f"  → Network: http://{local_ip}:8000")
    print("\nGive students the Network address to access apps!")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
