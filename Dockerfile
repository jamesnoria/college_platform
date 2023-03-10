FROM node:18

COPY ["package.json", "package-lock.json", "/usr/src/"]
COPY ["./backend/package.json", "/usr/src/backend/"]

WORKDIR /usr/src

RUN npm install

COPY [".", "/usr/src/"]

EXPOSE 8080

CMD ["npm", "run", "dev:backend"]