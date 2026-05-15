FROM python:3.13-slim

WORKDIR /app


RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY . .


EXPOSE 5000

CMD gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 4 --timeout 120 run:app
