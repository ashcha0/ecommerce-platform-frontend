<template>
  <div id="app">
    <a-layout class="layout">
      <a-layout-header class="header">
        <div class="logo">
          <h2>电商平台管理系统</h2>
        </div>
        <a-menu
          mode="horizontal"
          :default-selected-keys="[currentRoute]"
          class="menu"
        >
          <a-menu-item key="products" @click="$router.push('/products')">
            <template #icon><icon-gift /></template>
            商品管理
          </a-menu-item>
          <a-menu-item key="orders" @click="$router.push('/orders')">
            <template #icon><icon-file-text /></template>
            订单管理
          </a-menu-item>
          <a-menu-item key="customers" @click="$router.push('/customers')">
            <template #icon><icon-user /></template>
            客户管理
          </a-menu-item>
          <a-menu-item key="inventory" @click="$router.push('/inventory')">
            <template #icon><icon-storage /></template>
            库存管理
          </a-menu-item>
          <a-menu-item key="delivery" @click="$router.push('/delivery')">
            <template #icon><icon-truck /></template>
            配送管理
          </a-menu-item>
          <a-menu-item key="statistics" @click="$router.push('/statistics')">
            <template #icon><icon-bar-chart /></template>
            统计分析
          </a-menu-item>
        </a-menu>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRoute = computed(() => {
  const path = route.path
  if (path.includes('/products')) return 'products'
  if (path.includes('/orders')) return 'orders'
  if (path.includes('/customers')) return 'customers'
  if (path.includes('/inventory')) return 'inventory'
  if (path.includes('/delivery')) return 'delivery'
  if (path.includes('/statistics')) return 'statistics'
  return 'products'
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  padding: 0 20px;
}

.logo {
  margin-right: 40px;
}

.logo h2 {
  margin: 0;
  color: #1d2129;
  font-weight: 600;
}

.menu {
  flex: 1;
  border-bottom: none;
}

.content {
  padding: 20px;
  background: #f7f8fa;
}
</style>