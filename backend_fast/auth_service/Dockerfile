FROM python:3.13

WORKDIR /app

RUN pip install poetry

RUN poetry config virtualenvs.create false

COPY pyproject.toml poetry.lock ./

RUN poetry install --no-root

COPY . .

EXPOSE 8001
