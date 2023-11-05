from flask import Flask, render_template, request, url_for, redirect, send_from_directory, jsonify, abort
from backend import app
from backend.model import target, get_pdb
from backend.findpdb import get_all_pdb_entries
from backend.chembletouni import chemble_to_uni
from backend.webscraping import webScrape as webScraping
import pandas as pd
import time
import threading

@app.route('/')
def index():
	return app.send_static_file('index.html')



@app.route('/api/target/<target_name>')
def get_target(target_name):
    targets = target(target_name)
    query_pd = pd.DataFrame.from_dict(targets)
    return query_pd.to_json()

@app.route('/api/<target_name>/pdb/<targetLast>')
def handle_target(target_name, targetLast):
    targets = target(target_name)
    query_pd = pd.DataFrame.from_dict(targets)    
    targetN = query_pd.iloc[int(targetLast)]
    mych = str(targetN['target_chembl_id'])
    uni = chemble_to_uni(mych)
    pdbs = get_all_pdb_entries(uni)
    df = pd.DataFrame(pdbs)
    df['resolution'] = df['resolution'].astype(str)
    df['length'] = df['length'].astype(str)
    df['num_chains'] = df['num_chains'].astype(str)
    return df.to_json()

@app.route('/api/pdb/<pdb>')
def handlePBD(pdb):
    dictt = get_pdb(pdb=pdb)
    print(dictt)
    return jsonify(dictt)

global results
results = {}

@app.route('/api/smiles/<smilelast>')
def handleSmiles(smilelast):
    job_id = str(time.time())  # Create a unique job ID
    results[job_id] = None  # Initialize the result to None
    # Start the processing in a new thread
    threading.Thread(target=webScrape, args=(smilelast, job_id)).start()
    # Immediately return the job ID to the client
    return jsonify(job_id=job_id)

def webScrape(smilelast, job_id):
    data = webScraping(smilelast)
    df = pd.DataFrame(data)
    results[job_id] = df

@app.route('/api/results/<job_id>')
def getResults(job_id):
    result = results.get(job_id)
    if result is None:
        return 'Processing...', 202  # Return a 202 Accepted status code if processing is not yet complete
    else:
        print(type(result))
        return result.to_json()
