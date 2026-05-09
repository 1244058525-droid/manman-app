FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server/ ./server/
COPY app/ ./app/
EXPOSE 8787
CMD ["node", "server/index.js"]
