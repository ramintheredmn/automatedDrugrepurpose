FROM ubuntu

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y wget gnupg openbabel python3-pip unzip && \
    wget "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb" &&\
    apt install -y ./google-chrome-stable_current_amd64.deb && \
    rm google-chrome-stable_current_amd64.deb&& \
    apt-get clean 

COPY backend/req.txt ./

RUN pip install -r req.txt

COPY . .

CMD ["gunicorn", "-b", "0.0.0.0:8000", "apprun:app"]
