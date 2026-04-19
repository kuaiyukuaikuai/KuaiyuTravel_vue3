# KuaiyuTravel API 接口文档

## 统一返回结构

所有接口均返回 `Result` 包装类，结构如下：

```json
{
  "success": true,        // 请求是否成功
  "data": {},             // 业务数据
  "errorMsg": null        // 错误信息（失败时）
}
```


---

## 一、用户模块 `/user`

| 接口名称         | 请求路径           | 请求方式 | 请求参数                                                     | 返回数据                 |
| ---------------- | ------------------ | -------- | ------------------------------------------------------------ | ------------------------ |
| 发送手机验证码   | `/user/code`       | POST     | `phone`: String (RequestParam, 手机号)                       | `null`                   |
| 用户登录         | `/user/login`      | POST     | RequestBody: `{ phone: String, code?: String, password?: String }` | `String` (登录凭证Token) |
| 用户登出         | `/user/logout`     | POST     | 无                                                           | `null` (功能未完成)      |
| 获取当前用户信息 | `/user/me`         | GET      | 无 (从Token获取)                                             | `UserDTO` (用户信息)     |
| 查询用户详细信息 | `/user/info/{id}`  | GET      | `id`: Long (PathVariable, 用户ID)                            | `UserInfo` (用户详情)    |
| 根据ID查询用户   | `/user/{id}`       | GET      | `id`: Long (PathVariable, 用户ID)                            | `UserDTO` (用户基本信息) |
| 用户签到         | `/user/sign`       | POST     | 无 (从Token获取用户)                                         | `null`                   |
| 统计连续签到次数 | `/user/sign/count` | GET      | 无 (从Token获取用户)                                         | `Integer` (连续签到天数) |

---

## 二、地点模块 `/poi`

| 接口名称           | 请求路径       | 请求方式 | 请求参数                                                     | 返回数据               |
| ------------------ | -------------- | -------- | ------------------------------------------------------------ | ---------------------- |
| 查询地点详情       | `/poi/{id}`    | GET      | `id`: Long (PathVariable, 地点ID)                            | `Poi` (地点完整信息)   |
| 新增地点           | `/poi`         | POST     | RequestBody: `Poi` 对象                                      | `Long` (新增地点ID)    |
| 更新地点信息       | `/poi`         | PUT      | RequestBody: `Poi` 对象                                      | `null`                 |
| 按类型查询地点列表 | `/poi/of/type` | GET      | `typeId`: Integer (RequestParam, 类型ID)<br>`current`: Integer (RequestParam, 页码, 默认1)<br>`x`: Double (RequestParam, 可选, 经度)<br>`y`: Double (RequestParam, 可选, 纬度) | `List<Poi>` (地点列表) |
| 按名称搜索地点     | `/poi/of/name` | GET      | `name`: String (RequestParam, 可选, 搜索关键字)<br>`current`: Integer (RequestParam, 页码, 默认1) | `List<Poi>` (地点列表) |

---

## 三、地点类型模块 `/poi-type`

| 接口名称         | 请求路径         | 请求方式 | 请求参数 | 返回数据                   |
| ---------------- | ---------------- | -------- | -------- | -------------------------- |
| 查询地点类型列表 | `/poi-type/list` | GET      | 无       | `List<PoiType>` (类型列表) |

---

## 四、优惠券模块 `/voucher`

| 接口名称           | 请求路径                | 请求方式 | 请求参数                                   | 返回数据                     |
| ------------------ | ----------------------- | -------- | ------------------------------------------ | ---------------------------- |
| 新增普通优惠券     | `/voucher`              | POST     | RequestBody: `Voucher` 对象                | `Long` (优惠券ID)            |
| 新增秒杀优惠券     | `/voucher/seckill`      | POST     | RequestBody: `Voucher` 对象 (包含秒杀信息) | `Long` (优惠券ID)            |
| 查询地点优惠券列表 | `/voucher/list/{poiId}` | GET      | `poiId`: Long (PathVariable, 地点ID)       | `List<Voucher>` (优惠券列表) |

---

## 五、秒杀订单模块 `/voucher-order`

| 接口名称   | 请求路径                      | 请求方式 | 请求参数                            | 返回数据        |
| ---------- | ----------------------------- | -------- | ----------------------------------- | --------------- |
| 秒杀优惠券 | `/voucher-order/seckill/{id}` | POST     | `id`: Long (PathVariable, 优惠券ID) | `Long` (订单ID) |

---

## 六、博客模块 `/blog`

| 接口名称             | 请求路径           | 请求方式 | 请求参数                                                     | 返回数据                       |
| -------------------- | ------------------ | -------- | ------------------------------------------------------------ | ------------------------------ |
| 发布博客             | `/blog`            | POST     | RequestBody: `Blog` 对象                                     | `null`                         |
| 点赞博客             | `/blog/like/{id}`  | PUT      | `id`: Long (PathVariable, 博客ID)                            | `null`                         |
| 查询我的博客列表     | `/blog/of/me`      | GET      | `current`: Integer (RequestParam, 页码, 默认1)               | `List<Blog>` (博客列表)        |
| 查询热门博客         | `/blog/hot`        | GET      | `current`: Integer (RequestParam, 页码, 默认1)               | `List<Blog>` (博客列表)        |
| 查询博客详情         | `/blog/{id}`       | GET      | `id`: Long (PathVariable, 博客ID)                            | `Blog` (博客完整信息)          |
| 查询博客点赞列表     | `/blog/likes/{id}` | GET      | `id`: Long (PathVariable, 博客ID)                            | `List<UserDTO>` (点赞用户列表) |
| 查询指定用户博客     | `/blog/of/user`    | GET      | `id`: Long (RequestParam, 用户ID)<br>`current`: Integer (RequestParam, 页码, 默认1) | `List<Blog>` (博客列表)        |
| 查询关注用户博客动态 | `/blog/of/follow`  | GET      | `lastId`: Long (RequestParam, 上次查询的最大ID)<br>`offset`: Integer (RequestParam, 偏移量, 默认0) | `List<Blog>` (博客列表)        |

---

## 七、关注模块 `/follow`

| 接口名称      | 请求路径                  | 请求方式 | 请求参数                                                     | 返回数据                           |
| ------------- | ------------------------- | -------- | ------------------------------------------------------------ | ---------------------------------- |
| 关注/取关用户 | `/follow/{id}/{isFollow}` | PUT      | `id`: Long (PathVariable, 被关注用户ID)<br>`isFollow`: Boolean (PathVariable, true=关注, false=取关) | `null`                             |
| 判断是否关注  | `/follow/or/not/{id}`     | GET      | `id`: Long (PathVariable, 用户ID)                            | `Boolean` (是否关注)               |
| 查询共同关注  | `/follow/common/{id}`     | GET      | `id`: Long (PathVariable, 用户ID)                            | `List<UserDTO>` (共同关注用户列表) |

---

## 八、文件上传模块 `/upload`

| 接口名称     | 请求路径              | 请求方式 | 请求参数                                       | 返回数据               |
| ------------ | --------------------- | -------- | ---------------------------------------------- | ---------------------- |
| 上传博客图片 | `/upload/blog`        | POST     | `file`: MultipartFile (RequestParam, 图片文件) | `String` (文件名/路径) |
| 删除博客图片 | `/upload/blog/delete` | GET      | `name`: String (RequestParam, 文件名)          | `null`                 |

---

## 数据模型说明

### UserDTO (用户信息)
```typescript
{
  id: Long,
  nickName: String,
  icon: String
}
```


### Poi (地点信息)
```typescript
{
  id: Long,
  name: String,
  typeId: Integer,
  images: String,
  area: String,
  address: String,
  x: Double,
  y: Double,
  avgPrice: Long,
  sold: Integer,
  comments: Integer,
  score: Integer,
  openHours: String
}
```


### Blog (博客信息)
```typescript
{
  id: Long,
  userId: Long,
  title: String,
  images: String,
  content: String,
  liked: Integer,
  comments: Integer,
  isLike: Boolean,  // 当前用户是否点赞
  name: String,     // 用户名
  icon: String      // 用户头像
}
```


---

## 注意事项

1. **认证机制**: 除标注"无"的接口外，大部分接口需要在请求头中携带登录凭证（Token）
2. **分页参数**: `current` 为页码，从 1 开始；默认每页大小由后端配置
3. **经纬度参数**: 查询地点时可选传 `x`（经度）、`y`（纬度），用于附近地点排序
4. **关注动态**: `lastId` 和 `offset` 用于游标分页，实现下拉加载更多