from flask import Flask, render_template, request, url_for, redirect, send_from_directory, jsonify, abort
from backend import app
from backend.model import target, get_pdb
from backend.findpdb import get_all_pdb_entries
from backend.chembletouni import chemble_to_uni
import pandas as pd

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