FROM python:3.9-slim

WORKDIR /flask-app

COPY requirements.txt .

RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y ffmpeg libsm6 libxext6 tesseract-ocr 

COPY ./app ./app

CMD [ "python", "./app/app.py" ]
