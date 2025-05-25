FROM node

WORKDIR /app/shopping
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3003
CMD ["npm", "start"]
# This Dockerfile sets up a Node.js application for the customer service.
# It installs dependencies and starts the application on port 3001.
# The application is expected to be a Node.js service that listens for requests.
