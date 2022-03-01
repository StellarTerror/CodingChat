#!/bin/sh
uvicorn src.main:app --host 0.0.0.0 --port 3000 & node server.js
