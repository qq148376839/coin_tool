# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

# 安装 python3 和构建工具（longport 可能需要）
RUN apk add --no-cache python3 make g++ gcc

# 复制 package.json
COPY package*.json ./

# 单独安装 longport
RUN npm install longport@1.2.0

# 安装其他依赖
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