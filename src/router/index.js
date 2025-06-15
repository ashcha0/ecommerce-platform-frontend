import { createRouter, createWebHistory } from 'vue-router'
import ProductManagement from '@/views/ProductManagement.vue'
import OrderManagement from '@/views/OrderManagement.vue'
import CustomerManagement from '@/views/CustomerManagement.vue'
import DeliveryManagement from '@/views/DeliveryManagement.vue'
import StatisticsAnalysis from '@/views/StatisticsAnalysis.vue'
import InventoryManagement from '@/views/InventoryManagement.vue'

const routes = [
  {
    path: '/',
    redirect: '/products'
  },
  {
    path: '/products',
    name: 'ProductManagement',
    component: ProductManagement,
    meta: {
      title: '商品管理'
    }
  },
  {
    path: '/orders',
    name: 'OrderManagement',
    component: OrderManagement,
    meta: {
      title: '订单管理'
    }
  },
  {
    path: '/customers',
    name: 'CustomerManagement',
    component: CustomerManagement,
    meta: {
      title: '客户管理'
    }
  },
  {
    path: '/delivery',
    name: 'DeliveryManagement',
    component: DeliveryManagement,
    meta: {
      title: '配送管理'
    }
  },
  {
    path: '/statistics',
    name: 'StatisticsAnalysis',
    component: StatisticsAnalysis,
    meta: {
      title: '统计分析'
    }
  },
  {
    path: '/inventory',
    name: 'InventoryManagement',
    component: InventoryManagement,
    meta: {
      title: '库存管理'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 电商平台管理系统`
  }
  next()
})

export default router