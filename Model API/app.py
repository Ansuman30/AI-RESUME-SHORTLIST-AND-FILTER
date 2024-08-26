from flask import Flask, request, jsonify
import pickle
import re
import string
import os
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
import PyPDF2
import numpy as np


app = Flask(__name__)


ps=PorterStemmer()
with open('tfidf_vectorizer.pkl', 'rb') as file:
    tfidf = pickle.load(file)

# with open('tfidf_vectorizer.pkl', 'rb') as file:
#     tfidf = pickle.load(file)
    
with open('resume.pkl', 'rb') as file:
    rf = pickle.load(file)

with open('label_encoder.pkl', 'rb') as file:
    labelencoder = pickle.load(file) 

current_classes = labelencoder.classes_

index = np.where(current_classes == "BUSINESS-DEVELOPMENT")[0][0]

current_classes[index] = "DATA-SCIENTIST/ANALYST"

labelencoder.classes_ = current_classes


current_classes = labelencoder.classes_

index = np.where(current_classes == "INFORMATION-TECHNOLOGY")[0][0]

current_classes[index] = "WEB-DEVELOPMENT"

labelencoder.classes_ = current_classes


current_classes = labelencoder.classes_

index = np.where(current_classes == "ENGINEERING")[0][0]

current_classes[index] = "MECHANICAL/ELECTRICAL ENGINEERING"

labelencoder.classes_ = current_classes

current_classes = labelencoder.classes_

index = np.where(current_classes == "CONSTRUCTION")[0][0]

current_classes[index] = "CIVIL-ENGINEERING"

labelencoder.classes_ = current_classes


def preprocess_text(text):
    text=text.lower()
    
    pattern=re.compile('<.*?>')
    text=pattern.sub(r'',text)
    
    pattern=re.compile(r'https?://\S+|www\.\S+')
    text= pattern.sub(r'',text)
    
    text=text.translate(str.maketrans('','',string.punctuation))
    
    new_text=[]
    for words in text.split():
        if words in stopwords.words("english"):
            new_text.append('')
        else:
            new_text.append(words)
    text=" ".join(new_text)
    
    text=" ".join(ps.stem(word)for word in text.split())
    
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text


def pdf_to_text(filepath):
    with open(filepath,"rb") as file:
        reader=PyPDF2.PdfReader(file)
        text=""
        for page in range(len(reader.pages)):
            text+=reader.pages[page].extract_text()
    return text        


def predict_role(filepath):
    text=pdf_to_text(filepath)
    text=preprocess_text(text)
    text=[text]
    text=tfidf.transform(text)
    probabilities=rf.predict_proba(text)[0]
    top_1_roles=np.argsort(probabilities)
    top_1_roles=top_1_roles[-1:]
    top_1_roles=np.reshape(top_1_roles,(1,1))
    roles=[]
    for i in top_1_roles:
        roles.append(labelencoder.inverse_transform(i))
    roles=np.flip(roles)
            
    return roles[0][0]

def folder_to_file(folder_path):
    file_paths=[]
    for file_path in os.listdir(folder_path):
        file_paths.append(os.path.join(folder_path,file_path))
    return file_paths  

def screen_resume(folder_path,role,top_n_candidates=3):
    role=labelencoder.transform([role])
    probabilities_map={}
    file_paths=folder_to_file(folder_path)
    for file_path in file_paths:
      text=pdf_to_text(file_path)
      text=preprocess_text(text)
      text=[text]
      text=tfidf.transform(text)
      probabilities=rf.predict_proba(text)[0]
      role_probability=probabilities[role]
      probabilities_map[file_path]=role_probability
    sorted_resumes=sorted(probabilities_map.items(),key=lambda item:item[1],reverse=True)
    resume_links = [item[0] for item in sorted_resumes]
    return resume_links[:top_n_candidates]

@app.route('/process_file', methods=['POST'])
def process_file_route():
    data = request.json
    file_path = data.get('file_path')
    
    if not os.path.exists(file_path):
        return jsonify({"error": "File does not exist"}), 400
    
    result = predict_role(file_path)
    return jsonify({"result": result})

# Route for processing a folder
@app.route('/process_folder', methods=['POST'])
def process_folder_route():
    data = request.json
    folder_path = data.get('folder_path')
    role= data.get('role')
    
    if not os.path.exists(folder_path):
        return jsonify({"error": "Folder does not exist"}), 400
    
    result = screen_resume(folder_path,role)
    return jsonify({"result": result})


if __name__ == '__main__':
    app.run(debug=True)