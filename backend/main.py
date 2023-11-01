from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import target, get_pdb
from findpdb import get_all_pdb_entries
from chembletouni import chemble_to_uni
import pandas as pd



app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173/",  # Replace with the URL of your front-end application
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/hello")
async def read_item():

        return {"hello": "world", "message": "I'm being served from fastapi!"}
@app.get("/api/target/{target_name}")
async def handletarget(target_name):
    targets = target(target_name=target_name)
    query_pd = pd.DataFrame.from_dict(targets)
    query_pd.to_json()



    return query_pd

@app.get("/api/{targetName}/pdb/{targetLast}")
async def handletargetLast(targetName, targetLast):
    targets = target(target_name=targetName)
    query_pd = pd.DataFrame.from_dict(targets)    
    targetN = query_pd.iloc[int(targetLast)]
    mych = str(targetN['target_chembl_id'])
    uni = chemble_to_uni(mych)
    pdbs = get_all_pdb_entries(uni)
    df = pd.DataFrame(pdbs)
    df['resolution'] = df['resolution'].astype(str)
    df['length'] = df['length'].astype(str)
    df['num_chains'] = df['num_chains'].astype(str)
    #pdbs = sorted_df.to_json()
    return df

@app.get("/api/pdb/{pdb}")
async def handlePDB(pdb):
    dictt = get_pdb(pdb=pdb)
    return dictt
