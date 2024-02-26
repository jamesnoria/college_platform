FROM node:18

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]
COPY ["./backend/package.json", "./backend/"]

RUN npm ci

COPY [".", "./"]

EXPOSE 8080

CMD ["npm", "run", "dev:backend"]