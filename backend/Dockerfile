FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-18

WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 5000

CMD ["npm", "start"]