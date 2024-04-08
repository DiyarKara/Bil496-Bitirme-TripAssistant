import os

import pandas as pd
import matplotlib.pyplot as plt
from transformers import GPT2TokenizerFast
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


# Initialize these components when your app starts

root_dir = "/Users/ahmetkucukdag/Desktop/bitirme/Bil496-Bitirme-TripAssistant/_webApp/romePdf/"
loader = DirectoryLoader(f'{root_dir}', glob="./*.pdf", loader_cls=PyPDFLoader)
pages = loader.load_and_split()
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(pages, embeddings)


def similarity_search(query):
    results = db.similarity_search(query)
    formatted_results = []
    for result in results:
        formatted_result = {
            'content': result.page_content,
            'metadata': result.metadata
        }
        formatted_results.append(formatted_result)
    return formatted_results