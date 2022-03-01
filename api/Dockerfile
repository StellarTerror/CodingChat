FROM python:3.10

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

# CMD ["uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0", "--port", "3000"]
CMD uvicorn src.main:app --host 0.0.0.0 --port $PORT
