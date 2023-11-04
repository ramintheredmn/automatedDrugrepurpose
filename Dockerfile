FROM ubuntu

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y openbabel && \
    apt-get install -y python3-pip && \
    rm -rf /var/lib/apt/lists/*

COPY backend/req.txt ./

RUN pip install -r req.txt

COPY . .

# Set the Gunicorn command and configuration
CMD ["gunicorn", "-b", "0.0.0.0:8000", "apprun:app"]
