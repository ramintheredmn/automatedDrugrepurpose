import argparse
import csv
import os
import requests
import pandas as pd
import subprocess


def get_pdb_with_best_resolution(uniprot_id):
    url = f"https://www.uniprot.org/uniprot/{uniprot_id}.txt"
    response = requests.get(url)

    if response.ok:
        data_lines = response.text.splitlines()
        best_pdb_id = None
        best_resolution = float('inf')
        best_length = 0

        for line in data_lines:
            if line.startswith("DR   PDB; "):
                pdb_id, method, resolution, length, chains = parse_pdb_line(line)
                if length > best_length or (length == best_length and resolution < best_resolution):
                    best_pdb_id = pdb_id
                    best_resolution = resolution
                    best_length = length
                    chains = line.strip().split("; ")[4]
        if best_pdb_id:
            return best_pdb_id, best_length, best_resolution, chains
        else:
            return "NULL", "NULL", "NULL", "NULL"
    else:
        print(f"Failed to retrieve data from Uniprot for UniProt ID: {uniprot_id}")
        return None

def extract_numeric_length(length_str):
    numeric_length = ''
    for char in length_str:
        if char.isdigit():
            numeric_length += char
    return int(numeric_length)

def parse_pdb_line(line):
    line_parts = line.strip().split("; ")
    pdb_id = line_parts[1]
    method = line_parts[2]
    resolution_str = line_parts[3].split(" ")[0]
    resolution = None
    if resolution_str != '-':
        resolution = float(resolution_str)
    length_parts = line_parts[4].split("=")[1].split("-")
    length = extract_numeric_length(length_parts[1]) - extract_numeric_length(length_parts[0]) + 1
    chain_ids = line_parts[4]
    return pdb_id, method, resolution, length, chain_ids

def get_all_pdb_entries(uniprot_id):
    url = f"https://www.uniprot.org/uniprot/{uniprot_id}.txt"
    response = requests.get(url)

    if response.ok:
        data_lines = response.text.splitlines()
        pdb_entries = []

        for line in data_lines:
            if line.startswith("DR   PDB; "):
                pdb_id, method, resolution, length, chains = parse_pdb_line(line)
                num_chains = len(chains.split(','))  # Assuming chains are comma-separated
                pdb_entries.append({
                    'pdb_id': pdb_id,
                    'method': method,
                    'resolution': resolution,
                    'length': length,
                    'num_chains': num_chains
                })

        if pdb_entries:
            # Sort by length (descending), number of chains (descending), and resolution (ascending)
            return pdb_entries
        else:
            print(f"No PDB entries found for UniProt ID: {uniprot_id}")
            return None
    else:
        print(f"Failed to retrieve data from Uniprot for UniProt ID: {uniprot_id}")
        return None



