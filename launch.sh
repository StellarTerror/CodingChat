#/bin/sh
uvicorn src.main:app --host 127.0.0.1 --port 3000 & node server.js