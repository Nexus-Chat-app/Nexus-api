FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3001

CMD ["npm", "run", "dev"]