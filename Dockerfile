FROM node:20-slim

# Install Linux dependencies for VS Code/Codium
RUN apt-get update && apt-get install -y \
    libnss3 libnspr4 libasound2 libgbm1 libxkbcommon0 libx11-6 \
    curl python3 make gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Environment
ENV PORT=3000
EXPOSE 3000

CMD [ "node", "server.js" ]