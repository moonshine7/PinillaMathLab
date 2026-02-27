from flask import Flask, render_template, send_from_directory, request, session, redirect, url_for
from functools import wraps
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

app.secret_key = 'pinilla-math-2024-changeme'
CLASS_PASSWORD = 'mathlab7'

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

MATH_APPS = [
    {
        'id': 'transformations',
        'title': 'Transformations',
        'description': 'Explore geometric transformations on a coordinate plane',
        'icon': '🔄',
        'path': '/transformations'
    },
    {
        'id': 'pythagoras-new',
        'title': 'Pythagorean Theorem',
        'description': 'Master the Pythagorean theorem and applications',
        'icon': '📐',
        'path': '/pythagoras-new'
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
    },
    {
        'id': 'dilation',
        'title': 'Dilation',
        'description': 'Explore dilation and scaling transformations',
        'icon': '🔍',
        'path': '/dilation'
    },
    {
        'id': 'real-number',
        'title': 'Real Numbers',
        'description': 'Understand the real number system',
        'icon': '🔢',
        'path': '/real-number'
    },
    {
        'id': 'scatter-plot',
        'title': 'Scatter Plots',
        'description': 'Create and analyze scatter plots',
        'icon': '📊',
        'path': '/scatter-plot'
    },
    {
        'id': 'scientific-notation',
        'title': 'Scientific Notation',
        'description': 'Master powers of 10 and scientific notation',
        'icon': '🔬',
        'path': '/scientific-notation'
    },
    {
        'id': 'surface-area',
        'title': 'Surface Area',
        'description': 'Calculate surface area of 3D shapes',
        'icon': '📏',
        'path': '/surface-area'
    }
]

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form.get('password') == CLASS_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('dashboard'))
        else:
            error = 'Wrong password, try again!'
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/')
@login_required
def dashboard():
    return render_template('dashboard.html', apps=MATH_APPS)

@app.route('/<app_name>')
@app.route('/<app_name>/<path:filename>')
@login_required
def serve_app(app_name, filename=None):
    valid_apps = [a['id'] for a in MATH_APPS]
    if app_name not in valid_apps:
        return "App not found", 404
    if filename is None:
        return send_from_directory(os.path.join(app.static_folder, app_name), 'index.html')
    return send_from_directory(os.path.join(app.static_folder, app_name), filename)

if __name__ == '__main__':
    import socket
    hostname = socket.gethostname()
    try:
        local_ip = socket.gethostbyname(hostname)
    except:
        local_ip = '127.0.0.1'
    print("\n" + "="*60)
    print("🎓 7TH GRADE MATH DASHBOARD")
    print("="*60)
    print(f"  → Local:   http://localhost:8000")
    print(f"  → Network: http://{local_ip}:8000")
    print(f"  → Password: {CLASS_PASSWORD}")
    print("="*60 + "\n")
    app.run(host='0.0.0.0', port=8000, debug=False)