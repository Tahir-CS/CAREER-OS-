FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Prisma 6 reads DATABASE_URL while generating the client. Generation does not
# connect to the database, so use a build-only placeholder instead of requiring
# deployment secrets during docker build.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/careeros?schema=public npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
