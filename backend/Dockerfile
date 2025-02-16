# Базовый образ
FROM python:3.12.4

# Устанавливаем зависимости
WORKDIR /app

RUN pip install poetry

# Отключаем venv
RUN poetry config virtualenvs.create false

COPY pyproject.toml poetry.lock ./

RUN poetry install

# Копируем код проекта
COPY . .

# Открываем порт
EXPOSE 8000

# Команда запуска Django
CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
