import re
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://diyar:1234@localhost/TripAssistantDb'
app.config['SECRET_KEY'] = '123456'

db = SQLAlchemy(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(40), nullable=False)

class ChatLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    messages = db.Column(db.JSON, nullable=False)  # Storing messages as JSON

@app.route('/')
def index():
    return render_template('index.html')
@app.route('/chat')
def chat():
    if 'user_id' not in session:
        flash('You must be logged in to view the chat.')
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    chat_logs = ChatLog.query.filter_by(user_id=user_id).all()
    return render_template('chat.html', chat_logs=chat_logs)

@app.route('/about')
def about():
    return 'About Us Page Content'

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        existing_user = User.query.filter_by(username=username).first()
        existing_mail = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Username already exists. Please choose a different one.')
            return redirect(url_for('register'))
        if existing_mail:
            flash('Email already exists. Please choose a different one')
            return redirect(url_for('register'))
        if not is_valid_email(email):
            flash('Invalid email format.')
            return redirect(url_for('register'))
        
        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    # If user is already logged in, log them out before showing the login screen.
    if 'user_id' in session:
        session.clear()
        flash('You have been logged out.')

    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username, password=password).first()
        if user:
            session['user_id'] = user.id  # Store the user's ID in the session
            return redirect(url_for('chat'))
        else:
            flash('Invalid username or password. Please try again.')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

def is_valid_email(email):
    regex = r'^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w+$'
    return re.match(regex, email)

@app.route('/test_db')
def test_db():
    try:
        # Use text() for raw SQL execution
        with db.engine.connect() as connection:
            result = connection.execute(text('SELECT 1'))
            return 'Database connected!'
    except Exception as e:
        return 'Error: ' + str(e)
    
@app.route('/save_chat', methods=['POST'])
def save_chat():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    user_id = session['user_id']
    messages = request.json.get('messages')

    new_chat_log = ChatLog(user_id=user_id, messages=messages)
    db.session.add(new_chat_log)
    db.session.commit()

    return jsonify({'success': 'Chat saved', 'chat_log_id': new_chat_log.id})

@app.route('/routes')
def routes():
    return render_template('routes.html')


if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
