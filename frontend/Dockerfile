# Базовый образ Node.js
FROM node:18-alpine

# Рабочая директория
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем весь код
COPY . .

# Собираем проект
RUN npm run build

# Устанавливаем сервер для раздачи статики
RUN npm install -g serve

# Запускаем приложение
CMD ["serve", "-s", "dist", "-l", "80"]

EXPOSE 80