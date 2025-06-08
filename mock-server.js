import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080;

// 启用CORS
app.use(cors());
app.use(express.json());

// 模拟商品数据
const mockProducts = [
  {
    id: 1,
    name: '苹果手机',
    description: '最新款苹果手机，性能强劲',
    price: 6999.00,
    stock: 50,
    category: '电子产品',
    status: 'active',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '华为笔记本',
    description: '轻薄便携，办公首选',
    price: 5999.00,
    stock: 30,
    category: '电子产品',
    status: 'active',
    createTime: '2024-01-02 10:00:00',
    updateTime: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    name: '小米耳机',
    description: '无线蓝牙耳机，音质清晰',
    price: 299.00,
    stock: 100,
    category: '电子产品',
    status: 'active',
    createTime: '2024-01-03 10:00:00',
    updateTime: '2024-01-03 10:00:00'
  },
  {
    id: 4,
    name: '运动鞋',
    description: '舒适透气，运动必备',
    price: 399.00,
    stock: 80,
    category: '服装鞋帽',
    status: 'active',
    createTime: '2024-01-04 10:00:00',
    updateTime: '2024-01-04 10:00:00'
  },
  {
    id: 5,
    name: '咖啡杯',
    description: '陶瓷材质，保温效果好',
    price: 59.00,
    stock: 200,
    category: '生活用品',
    status: 'active',
    createTime: '2024-01-05 10:00:00',
    updateTime: '2024-01-05 10:00:00'
  }
];

// 商品列表API
app.get('/ecommerce-api/products', (req, res) => {
  const { pageNum = 1, pageSize = 10, name, category, status } = req.query;
  
  let filteredProducts = [...mockProducts];
  
  // 根据条件过滤
  if (name) {
    filteredProducts = filteredProducts.filter(p => p.name.includes(name));
  }
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  if (status) {
    filteredProducts = filteredProducts.filter(p => p.status === status);
  }
  
  // 分页
  const start = (pageNum - 1) * pageSize;
  const end = start + parseInt(pageSize);
  const paginatedProducts = filteredProducts.slice(start, end);
  
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list: paginatedProducts,
      total: filteredProducts.length,
      pageNum: parseInt(pageNum),
      pageSize: parseInt(pageSize)
    }
  });
});

// 获取单个商品详情
app.get('/ecommerce-api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = mockProducts.find(p => p.id === parseInt(id));
  
  if (product) {
    res.json({
      code: 200,
      message: '获取成功',
      data: product
    });
  } else {
    res.status(404).json({
      code: 404,
      message: '商品不存在',
      data: null
    });
  }
});

// 创建商品
app.post('/ecommerce-api/products', (req, res) => {
  const newProduct = {
    id: mockProducts.length + 1,
    ...req.body,
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN')
  };
  
  mockProducts.push(newProduct);
  
  res.json({
    code: 200,
    message: '创建成功',
    data: newProduct
  });
});

// 更新商品
app.put('/ecommerce-api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = mockProducts.findIndex(p => p.id === parseInt(id));
  
  if (index !== -1) {
    mockProducts[index] = {
      ...mockProducts[index],
      ...req.body,
      updateTime: new Date().toLocaleString('zh-CN')
    };
    
    res.json({
      code: 200,
      message: '更新成功',
      data: mockProducts[index]
    });
  } else {
    res.status(404).json({
      code: 404,
      message: '商品不存在',
      data: null
    });
  }
});

// 删除商品
app.delete('/ecommerce-api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = mockProducts.findIndex(p => p.id === parseInt(id));
  
  if (index !== -1) {
    mockProducts.splice(index, 1);
    
    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } else {
    res.status(404).json({
      code: 404,
      message: '商品不存在',
      data: null
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Mock server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /ecommerce-api/products - 获取商品列表');
  console.log('  GET /ecommerce-api/products/:id - 获取商品详情');
  console.log('  POST /ecommerce-api/products - 创建商品');
  console.log('  PUT /ecommerce-api/products/:id - 更新商品');
  console.log('  DELETE /ecommerce-api/products/:id - 删除商品');
});