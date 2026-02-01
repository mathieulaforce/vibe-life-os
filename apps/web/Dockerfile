FROM node:20-alpine AS build

WORKDIR /app/apps/web

COPY apps/web/package.json ./
RUN npm install

COPY apps/web ./
COPY packages /app/packages
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
