import subprocess

def run_openbabel(input_file, output_file, input_format='pdb', output_format='sdf'):
    command = f'obabel -i{input_format} {input_file} -o{output_format} -O {output_file}'

    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, executable='/bin/bash')
    stdout, stderr = process.communicate()

    return stdout, stderr