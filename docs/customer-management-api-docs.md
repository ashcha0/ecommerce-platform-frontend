# 客户管理功能模块接口文档

## 概述

本文档描述了电商系统中客户管理功能模块的所有API接口，包括客户注册、登录、信息管理、查询等功能。

**基础URL**: `http://localhost:8080/ecommerce-api`

## 接口列表

### 1. 客户注册

**接口地址**: `POST /customers/register`

**接口描述**: 新客户注册账号

**请求参数**:
```json
{
  "username": "string",      // 用户名，3-50字符，只能包含字母、数字、下划线
  "password": "string",      // 密码，6-20字符
  "confirmPassword": "string", // 确认密码
  "phone": "string",         // 手机号，格式：1[3-9]xxxxxxxxx
  "email": "string",         // 邮箱（可选），最大100字符
  "realName": "string",      // 真实姓名（可选），最大50字符
  "address": "string"        // 地址（可选），最大200字符
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {}
}
```

**错误响应**:
- `400`: 参数验证失败或用户名/手机号已存在

---

### 2. 客户登录

**接口地址**: `POST /customers/login`

**接口描述**: 客户账号登录

**请求参数**:
```json
{
  "username": "string",  // 用户名
  "password": "string"   // 密码
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {}
}
```

**错误响应**:
- `401`: 用户名或密码错误

---

### 3. 获取客户信息

**接口地址**: `GET /customers/{id}`

**接口描述**: 根据客户ID获取客户详细信息

**路径参数**:
- `id`: 客户ID（必填）

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "realName": "张三",
    "phone": "13812345678",
    "email": "test@example.com",
    "address": "北京市朝阳区",
    "createTime": "2023-01-01T10:00:00",
    "updateTime": "2023-01-01T10:00:00"
  }
}
```

**错误响应**:
- `404`: 客户不存在

---

### 4. 更新客户信息

**接口地址**: `PUT /customers/{id}`

**接口描述**: 更新客户的个人信息

**路径参数**:
- `id`: 客户ID（必填）

**请求参数**:
```json
{
  "id": 1,                    // 客户ID（必填）
  "realName": "string",       // 真实姓名（可选），最大50字符
  "phone": "string",          // 手机号（可选），格式：1[3-9]xxxxxxxxx
  "email": "string",          // 邮箱（可选），最大100字符
  "address": "string"         // 地址（可选），最大200字符
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

**错误响应**:
- `400`: 参数验证失败
- `404`: 客户不存在

---

### 5. 删除客户

**接口地址**: `DELETE /customers/{id}`

**接口描述**: 根据客户ID删除客户账号

**路径参数**:
- `id`: 客户ID（必填）

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**错误响应**:
- `404`: 客户不存在

---

### 6. 获取客户列表

**接口地址**: `GET /customers`

**接口描述**: 获取所有客户列表，支持分页

**查询参数**:
- `page`: 页码，默认为1
- `size`: 每页大小，默认为10

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "username": "testuser",
        "realName": "张三",
        "phone": "13812345678",
        "email": "test@example.com",
        "address": "北京市朝阳区",
        "createTime": "2023-01-01T10:00:00",
        "updateTime": "2023-01-01T10:00:00"
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "pages": 10,
    "isFirstPage": true,
    "isLastPage": false,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

---

### 7. 搜索客户

**接口地址**: `GET /customers/search`

**接口描述**: 根据条件搜索客户，支持按用户名、手机号等条件进行筛选，支持分页查询

**查询参数**:
- `username`: 用户名（可选）
- `phone`: 手机号（可选）
- `email`: 邮箱（可选）
- `page`: 页码，最小值为1（可选）
- `size`: 每页大小，1-100之间（可选）

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [],
    "total": 0,
    "pageNum": 1,
    "pageSize": 10
  }
}
```

**错误响应**:
- `400`: 参数验证失败

---

### 8. 检查用户名是否存在

**接口地址**: `GET /customers/check-username`

**接口描述**: 检查指定用户名是否已被注册

**查询参数**:
- `username`: 用户名（必填）

**请求示例**:
```bash
curl -X 'GET' \
  'http://localhost:8080/ecommerce-api/customers/check-username?username=testuser' \
  -H 'accept: */*'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": true  // true表示用户名已存在，false表示用户名可用
}
```

---

### 9. 检查手机号是否存在

**接口地址**: `GET /customers/check-phone`

**接口描述**: 检查指定手机号是否已被注册

**查询参数**:
- `phone`: 手机号（必填）

**请求示例**:
```bash
curl -X 'GET' \
  'http://localhost:8080/ecommerce-api/customers/check-phone?phone=13812345678' \
  -H 'accept: */*'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": false  // true表示手机号已存在，false表示手机号可用
}
```

---

### 10. 检查邮箱是否存在

**接口地址**: `GET /customers/check-email`

**接口描述**: 检查指定邮箱是否已被注册

**查询参数**:
- `email`: 邮箱（必填）

**请求示例**:
```bash
curl -X 'GET' \
  'http://localhost:8080/ecommerce-api/customers/check-email?email=test@example.com' \
  -H 'accept: */*'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": false  // true表示邮箱已存在，false表示邮箱可用
}
```

---

## 数据模型

### CustomerVO（客户视图对象）
```json
{
  "id": "integer",           // 客户ID
  "username": "string",      // 用户名
  "realName": "string",      // 真实姓名
  "phone": "string",         // 手机号
  "email": "string",         // 邮箱
  "address": "string",       // 地址
  "createTime": "datetime",  // 创建时间
  "updateTime": "datetime"   // 更新时间
}
```

### CustomerRegisterDTO（客户注册数据传输对象）
```json
{
  "username": "string",      // 用户名，3-50字符，只能包含字母、数字、下划线
  "password": "string",      // 密码，6-20字符
  "confirmPassword": "string", // 确认密码
  "phone": "string",         // 手机号，格式：1[3-9]xxxxxxxxx
  "email": "string",         // 邮箱（可选），最大100字符
  "realName": "string",      // 真实姓名（可选），最大50字符
  "address": "string"        // 地址（可选），最大200字符
}
```

### CustomerUpdateDTO（客户更新数据传输对象）
```json
{
  "id": "integer",           // 客户ID（必填）
  "realName": "string",      // 真实姓名（可选），最大50字符
  "phone": "string",         // 手机号（可选），格式：1[3-9]xxxxxxxxx
  "email": "string",         // 邮箱（可选），最大100字符
  "address": "string"        // 地址（可选），最大200字符
}
```

### CustomerLoginDTO（客户登录数据传输对象）
```json
{
  "username": "string",  // 用户名
  "password": "string"   // 密码
}
```

### CustomerQueryDTO（客户查询数据传输对象）
```json
{
  "username": "string",  // 用户名（可选）
  "phone": "string",     // 手机号（可选）
  "email": "string",     // 邮箱（可选）
  "page": "integer",     // 页码，最小值为1（可选）
  "size": "integer"      // 每页大小，1-100之间（可选）
}
```

---

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}  // 具体数据内容
}
```

### 错误响应
```json
{
  "code": 400,  // 错误码
  "message": "错误信息",
  "data": null
}
```

### 常见错误码
- `200`: 操作成功
- `400`: 参数验证失败
- `401`: 用户名或密码错误
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 注意事项

1. 所有接口都需要正确设置 `Content-Type: application/json` 请求头（POST/PUT请求）
2. 手机号格式必须符合中国大陆手机号规范：1[3-9]xxxxxxxxx
3. 用户名只能包含字母、数字和下划线，长度3-50字符
4. 密码长度必须在6-20字符之间
5. 分页查询的页码从1开始
6. 检查接口（check-username、check-phone、check-email）返回的data字段为布尔值，true表示已存在，false表示可用

---

**文档版本**: 1.0  
**最后更新**: 2024年12月  
**联系方式**: 如有问题请联系开发团队