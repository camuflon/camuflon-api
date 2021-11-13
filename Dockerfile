FROM node:lts-alpine
WORKDIR /server
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
RUN npm run transpile && \
    rm -r source node_modules
RUN npm ci --only=prod --ignore-scripts
CMD ["npm", "start"]