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
FROM node:18-alpine

WORKDIR /app

# 复制构建产物和依赖
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# 暴露端口
EXPOSE 14086

# 启动应用
CMD ["node", "dist/main"] 