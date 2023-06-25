FROM        node:20

RUN         npm install -g pnpm
RUN         npm install -g pm2

WORKDIR     /var/www
COPY        . .
COPY        production ./.env
RUN         pnpm install
RUN         pnpm build

EXPOSE      3000

ENTRYPOINT  ["pnpm", "start"]