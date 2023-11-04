# Start from a base Python 3.8 image
FROM ubuntu

# Set the working directory
WORKDIR /usr/src/app

# Install OpenBabel
RUN apt-get update && \
    apt-get install -y openbabel && \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY backend/req.txt ./

# Install the Python dependencies
RUN pip install -r req.txt

# Copy the rest of the application code into the container
COPY . .

# Set the Gunicorn command and configuration
CMD ["gunicorn", "-b", "0.0.0.0:8000", "apprun:app"]
