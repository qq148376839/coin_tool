import { createWebHistory, createRouter } from 'vue-router'

import HomeView from './view/home.vue'
import AppView from './components/HelloWorld.vue'
import FormulaView from './view/formula.vue'
import Verify from './view/verify.vue'
import Account from './view/account.vue'
import ContractAccount from './view/contract-account.vue'
import Order from './view/order.vue'
import Strategy from './view/strategy.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: HomeView },
  { path: '/market', component: AppView },
  { path: '/formula', component: FormulaView },
  { path: '/verify', component: Verify },
  { path: '/account', component: Account },
  { path: '/contract-account', component: ContractAccount },
  { path: '/order', component: Order },
  { path: '/strategy', component: Strategy }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router;