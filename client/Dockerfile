FROM ubuntu
WORKDIR /usr/src/app
RUN apt-get update && \
    apt-get install -y curl sudo && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

COPY ./client /usr/src/app
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]
