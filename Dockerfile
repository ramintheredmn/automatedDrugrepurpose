FROM ubuntu

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y wget gnupg openbabel python3-pip firefox && \
    wget -q "https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-linux64.tar.gz" -O /tmp/geckodriver.tar.gz && \
    tar -xzf /tmp/geckodriver.tar.gz -C /usr/local/bin && \
    rm -rf /var/lib/apt/lists/* /tmp/geckodriver.tar.gz

COPY backend/req.txt ./

RUN pip install -r req.txt

COPY . .

CMD ["gunicorn", "-b", "0.0.0.0:8000", "apprun:app"]
