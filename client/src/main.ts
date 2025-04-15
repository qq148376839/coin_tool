import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(router)
app.use(ElementPlus)

const config = new DocumentBuilder()
  .setTitle('长桥API接口文档')
  .setDescription('加密货币交易工具API文档')
  .setVersion('1.0')
  .addTag('account', '账户相关接口')
  .addTag('quote', '行情相关接口')
  .addTag('order', '订单相关接口')
  .build()

const document = SwaggerModule.createDocument(app, config)
SwaggerModule.setup('api', app, document)

app.mount('#app')
