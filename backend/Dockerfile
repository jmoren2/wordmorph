FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

ARG WORDNIK_API_KEY
ENV WORDNIK_API_KEY=${WORDNIK_API_KEY}

COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]