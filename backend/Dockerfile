FROM ubuntu
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y \
    python3.10 python3-pip \
    openbabel \
    firefox

COPY ./backend /usr/src/app
RUN pip3 install --no-cache-dir -r req.txt
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]