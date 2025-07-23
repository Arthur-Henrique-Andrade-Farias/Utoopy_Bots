FROM mcr.microsoft.com/playwright:v1.54.1-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN chown -R pwuser:pwuser ./meu-perfil-chrome

EXPOSE 3000

CMD ["node", "server.js"]