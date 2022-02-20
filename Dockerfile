FROM node:latest
WORKDIR /usr/src/app

RUN apt-get update && apt-get install python3 python3-pip -y
COPY api/requirements.txt /usr/src/app
RUN pip3 install -r requirements.txt

COPY api/src /usr/src/app/src
COPY node/build /usr/src/app/build


RUN npm install express --save
RUN npm install http-proxy-middleware --save

COPY ./server.js /usr/src/app
COPY launch.sh /usr/src/app

CMD ["./launch.sh"]