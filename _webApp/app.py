import re
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text
from flask_migrate import Migrate
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.document_loaders import DirectoryLoader
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
import atexit
from flask.sessions import SessionInterface

from chatbot import similarity_search
import requests

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
    print("index pageeeeee")
    return render_template('index.html')

@app.route('/chat')
def chat():
    print("ROUTE IS CHAT")
    if 'user_id' not in session:
        flash('You must be logged in to view the chat.')
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    print("USER ID IS: ", user_id)
    chat_logs = ChatLog.query.filter_by(user_id=user_id).all()
    print("chat logs are: ", chat_logs)
    return render_template('chat.html', chat_logs=chat_logs)

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please log in to access the dashboard.')
        return redirect(url_for('login'))
    return render_template('dashboard.html')


@app.route('/get_chats')
def get_chats():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    user_id = session['user_id']
    chat_logs = ChatLog.query.filter_by(user_id=user_id).all()
    # Convert chat logs to a JSON format
    chats = [{'id': log.id, 'messages': log.messages} for log in chat_logs]
    return jsonify(chats)

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
            session['username'] = user.username
            return redirect(url_for('dashboard'))
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
    chat_log_id = request.json.get('chat_log_id')  # Get chat log ID
    print("chat log id in save: ", chat_log_id)
    if chat_log_id:
        print("in if")
        # Update existing chat log
        chat_log = ChatLog.query.get(chat_log_id)
        print("chat log query: ", chat_log)
        if chat_log and chat_log.user_id == user_id:
            print("chat_log.user_id: ", chat_log.user_id)
            chat_log.messages = messages
        else:
            return jsonify({'error': 'Chat log not found'}), 404
    else:
        # Create a new chat log
        print("create new chat log")
        chat_log = ChatLog(user_id=user_id, messages=messages)
        db.session.add(chat_log)

    db.session.commit()
    return jsonify({'success': 'Chat saved', 'chat_log_id': chat_log.id})

@app.route('/routes')
def routes():
    if 'user_id' not in session:
        flash('You must be logged in to view the routes.')
        return redirect(url_for('login'))

    user_id = session['user_id']
    return render_template('routes.html')


def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def get_text_chunks(text):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1400,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    return chunks

def get_vectorstore(text_chunks):
    embeddings = OpenAIEmbeddings()
    # embeddings = HuggingFaceInstructEmbeddings(model_name="hkunlp/instructor-xl")
    vectorstore = FAISS.from_texts(texts=text_chunks, embedding=embeddings)
    return vectorstore

def get_conversation_chain(vectorstore):
    llm = ChatOpenAI()
    # llm = HuggingFaceHub(repo_id="google/flan-t5-xxl", model_kwargs={"temperature":0.5, "max_length":512})

    memory = ConversationBufferMemory(
        memory_key='chat_history', return_messages=True)
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory
    )
    return conversation_chain

pdf_docs = ["C:\\Users\\diyar\\Desktop\\bil496\\webapp\\romePdf\\rome_guide.pdf", "C:\\Users\\diyar\\Desktop\\bil496\\webapp\\romePdf\\WhereRome-AUG2020Web.pdf"]  # PDF file paths
raw_text = get_pdf_text(pdf_docs)
text_chunks = get_text_chunks(raw_text)
print("text chunk len: ", len(text_chunks))
vectorstore = get_vectorstore(text_chunks)
conversation_chain = get_conversation_chain(vectorstore)


@app.route('/process_message', methods=['POST'])
def process_message():
    print("its in process message")
    message = request.json.get('message')

    try:
        response = conversation_chain({'question': message})
        print("response is: ", response)
        # Assuming the last message in chat_history is the system's response
        last_message = response['chat_history'][-1].content if response['chat_history'] else 'No response'
        print("last message: ", last_message)
        return jsonify({'response': last_message})
    except Exception as e:
        # Handle potential exceptions
        print("Error processing message:", e)
        return jsonify({'error': str(e)}), 500
    

@app.route('/delete_chat', methods=['POST'])
def delete_chat():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    chat_log_id = request.json.get('chat_log_id')
    chat_log = ChatLog.query.get(chat_log_id)
    if chat_log and chat_log.user_id == session['user_id']:
        db.session.delete(chat_log)
        db.session.commit()
        return jsonify({'success': 'Chat deleted'})
    else:
        return jsonify({'error': 'Chat log not found or unauthorized'}), 404
    

@app.route('/translate')
def translate():
    if 'user_id' not in session:
        flash('You must be logged in to view the translate.')
        return redirect(url_for('login'))
    return render_template('translate.html')


API_KEY = "AIzaSyBy7-Dv-9Sq0stiPpCcAy-ztRu3sO997Yw" # Replace with your actual API key

@app.route('/translate_text', methods=['POST'])
def translate_text():
    data = request.json
    source_text = data['text']
    source_lang = data['sourceLang']
    target_lang = data['targetLang']

    url = "https://translation.googleapis.com/language/translate/v2"
    
    # Parameters for the API request
    params = {
        'q': source_text,
        'source': source_lang,
        'target': target_lang,
        'key': API_KEY
    }

    # Making the request to the Google Translate API
    response = requests.get(url, params=params)
    
    # Check if the request was successful
    if response.status_code == 200:
        translation_data = response.json()
        translation = translation_data['data']['translations'][0]['translatedText']
        return jsonify({'translation': translation})
    else:
        # Handle the error or return a message to the frontend
        return jsonify({'error': 'Failed to translate text'}), response.status_code



if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
