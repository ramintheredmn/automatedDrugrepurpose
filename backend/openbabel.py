import subprocess

def run_openbabel(input_file, output_file, input_format='pdb', output_format='sdf'):
    # Define the command
    command = f'openbabel.obabel -i{input_format} {input_file} -o{output_format} -O {output_file}'

    # Execute the command
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, executable='/bin/bash')
    # Get the output and error messages
    stdout, stderr = process.communicate()

    return stdout, stderr