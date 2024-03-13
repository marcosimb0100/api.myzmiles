FROM node:18
WORKDIR /app/zmileapi
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8004
CMD ["node", "app.js"]