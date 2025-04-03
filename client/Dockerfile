# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

# 复制 package.json（不强制要求 yarn.lock）
COPY package*.json ./

# 安装依赖（使用 npm 而不是 yarn）
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 