import pandas as pd
import chembl_webresource_client.new_client as nc
#from rdkit import Chem
#from rdkit.Chem import PandasTools, AllChem
import requests
from bs4 import BeautifulSoup
from backend.chembletouni import chemble_to_uni
from backend.findpdb import get_pdb_with_best_resolution, get_all_pdb_entries
from backend.openbabel import run_openbabel
from prody import *
#from pylab import *



def target(target_name):
    tr = nc.new_client.target
    query = tr.search(target_name).only('target_chembl_id', 'organism', 'pref_name')

    return query

def targetPDB(targetLast, targetName):
    try:
        tr = nc.new_client.target
        query = tr.search(targetName).only('target_chembl_id', 'organism', 'pref_name')
        targetsDf = pd.DataFrame.from_dict(query)     
        target = targetsDf.iloc[int(targetLast)]
        chemble = str(target['target_chembl_id'])
        uni = chemble_to_uni(chemble)
        df = get_all_pdb_entries(uni)
        return df
    except Exception as e:
        return({"error": f"An error uccured you maynot entered target, {str(e)}"})


def get_pdb(pdb):
    try:
        atoms = parsePDB(pdb)
        hetero = atoms.select('not water and not protein')
        ligands = hetero.getHierView().iterResidues()
        list_ligs = []
        list_of_ligs = []
        for i, residue in enumerate(ligands, start=1):
            list_of_ligs.append(i)
            list_ligs.append(str(residue))
            writePDB(f'{str(pdb)}_ligand_{i}', residue)
        if list_of_ligs:
            for i in list_of_ligs:
                run_openbabel(input_file=f'{str(pdb)}_ligand_{i}.pdb', input_format='pdb', output_file=f'{str(pdb)}_ligand_{i}.smi', output_format='smi')
            smiles_l = []
            for i in list_of_ligs:    
                with open(f'{str(pdb)}_ligand_{i}.smi', 'r') as file:
                    content = file.read()
                    smiles, filename = content.split()
                    smiles_l.append(smiles)
            smile_dict = dict(zip(list_ligs, smiles_l))
            return smile_dict
        else:
            return ({"error": "No ligands found"})

    except Exception as e:
        return({"error": f"An error occured, {str(e)}"})