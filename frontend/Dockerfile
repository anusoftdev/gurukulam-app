FROM node:20-alpine AS build
WORKDIR /app

# Copy manifests first so dependency layer is cached separately from source
COPY package.json package-lock.json* ./

# Install all deps (including devDeps needed for Vite build)
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Build
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
