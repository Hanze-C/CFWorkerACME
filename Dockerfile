FROM node:lts
WORKDIR /app

COPY wrangler.example.jsonc wrangler.jsonc
COPY entrypoint.sh ./entrypoint.sh
COPY public ./public
COPY package*.json ./
COPY src ./src

RUN npm install -g wrangler
RUN chmod +x ./entrypoint.sh
RUN npm install
EXPOSE 3000
ENTRYPOINT ["sh","/app/entrypoint.sh"]