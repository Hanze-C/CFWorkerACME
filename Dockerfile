FROM node:lts
WORKDIR /app

COPY wrangler.dockers.jsonc wrangler.jsonc
COPY entrypoint.sh ./entrypoint.sh
COPY public ./public
COPY package*.json ./
COPY schema.set.sql ./
COPY src ./src

RUN npm install -g wrangler
RUN chmod +x ./entrypoint.sh
RUN npm install
COPY src/http.js ./node_modules/acme-client/src/
RUN wrangler d1 execute test-db --local --file schema.set.sql
EXPOSE 3000
ENTRYPOINT ["sh","/app/entrypoint.sh"]