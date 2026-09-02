---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 4f152940444a68ea1ec4ce3748abc308_21c6c774a66611f199d2525400287e28
    ReservedCode1: SKbbiR0ocZhm11BeHWNKMqZbOem1a0B/SiPTU9OuMgDn5/y6yr1rmb4uDTgcxu1j0NInpBJ1SztWTdvefYGyZcPBjHeheYIcTBTbmw2POIwLjl9o6uwRn5AGgViRSDMTGY/ysUdTHEqleyvj7+1EnHEkIEMcoh7ievDK12rqV6vkcjkpRNHCkN+sHwI=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 4f152940444a68ea1ec4ce3748abc308_21c6c774a66611f199d2525400287e28
    ReservedCode2: SKbbiR0ocZhm11BeHWNKMqZbOem1a0B/SiPTU9OuMgDn5/y6yr1rmb4uDTgcxu1j0NInpBJ1SztWTdvefYGyZcPBjHeheYIcTBTbmw2POIwLjl9o6uwRn5AGgViRSDMTGY/ysUdTHEqleyvj7+1EnHEkIEMcoh7ievDK12rqV6vkcjkpRNHCkN+sHwI=
---

# OpenRC Car — 遥控小车项目

基于 **uniapp（Vue3）+ Vue3 管理后台** 的遥控小车完整项目。仓库包含两个子项目：

| 目录 | 说明 |
|---|---|
| `openrc-car-app` | 遥控小车客户端 App（uniapp + Vue3），核心为摇杆遥控页面 |
| `openrc-car-server` | 遥控车管理后台（Vue3 + TypeScript + Element Plus），负责遥控车信息的增删改查 |

---

## 目录结构

```
D:\workspace\openrc-car
├── openrc-car-app/                  # 客户端 App（uniapp + Vue3）
│   ├── src/
│   │   ├── components/
│   │   │   └── rc-joystick/
│   │   │       └── rc-joystick.vue # 摇杆组件（1:1 复刻 sf-farm-app joysticklibrary）
│   │   ├── pages/
│   │   │   └── index/
│   │   │       └── index.vue       # 遥控主页：摇杆控制 + 角度/推力/方向 + 指令 JSON 输出
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── manifest.json           # uni-app 应用配置（AppID、权限等）
│   │   ├── pages.json              # 页面路由配置
│   │   └── uni.scss                # 全局样式变量
│   ├── index.html                  # H5 构建入口
│   ├── vite.config.js              # Vite 配置（uni-app CLI 工程）
│   ├── package.json
│   └── package-lock.json
│
└── openrc-car-server/               # 管理后台（Vue3 + TS + Element Plus + Tailwind）
    ├── src/
    │   ├── api/                    # 接口封装
    │   ├── assets/                 # 静态资源
    │   ├── components/             # 通用组件
    │   ├── locales/                # i18n（zh / en）
    │   ├── mock/                   # 前端 mock 数据
    │   ├── router/                 # 路由配置
    │   │   └── modules/rc-car.ts   # 遥控车管理路由模块
    │   ├── store/                  # Pinia 状态
    │   ├── types/                  # 全局类型定义
    │   ├── utils/                  # 工具函数
    │   └── views/
    │       └── rc-car/             # 遥控车管理页面
    │           ├── index.vue               # 列表页：卡片/列表双视图 + 增删改查
    │           └── modules/rc-car-dialog.vue # 新增/编辑弹窗
    ├── index.html
    ├── vite.config.ts
    ├── package.json
    └── tsconfig.json
```

---

## 技术栈与核心功能

### openrc-car-app（客户端 App）

**技术栈**：uniapp（Vue3 语法）、Vite、Vue 3.4、vue-i18n、sass

**核心功能**

- 摇杆遥控：`rc-joystick` 摇杆组件，1:1 复刻 `sf-farm-app` 的 `joysticklibrary`
  - 8 方向 / 4 方向 / 左右 / 上下多模式切换
  - 角度与推力计算（`atan2` 角度约定、`power = 100 * dist / moveRadius`）
  - 触摸拖动、回中、锁定等交互
- 遥控主页：实时展示摇杆**角度 / 推力 / 方向 / joyX / joyY**，并输出**控制指令 JSON**，为后续接入 TCP / 蓝牙实际控制预留接口

### openrc-car-server（管理后台）

**技术栈**：Vue 3 + TypeScript + Vite + Element Plus + Tailwind CSS + Pinia + vue-router + vue-i18n

**核心功能**

- **遥控车管理**（`/rc-car/list`）：
  - 增：新增遥控车（名称、型号、品牌、颜色、状态、电量、最高时速、续航、价格、负责人、备注）
  - 删：删除确认（`ElMessageBox`）
  - 改：编辑遥控车信息
  - 查：关键词搜索（名称/型号/品牌）+ 状态下拉筛选
  - **卡片 / 列表双布局**：页面右上角按钮一键切换
  - 数据层：前端 mock 数据（`src/mock/temp/rcCarData.ts`），增删改查即时生效
- 继承原 art-design-pro 后台能力：登录认证、主题配置、国际化、多级菜单等

---

## 安装与运行

> 环境要求：Node.js ≥ 20.19（server 要求 ≥ 20.19，app 实测 Node 22 可运行）

### 客户端 App（openrc-car-app）

```bash
cd openrc-car-app

# 安装依赖
npm install

# 开发运行（H5，浏览器打开）
npm run dev:h5

# 构建 H5 产物（输出到 dist/build/h5）
npm run build:h5

# 微信小程序
npm run dev:mp-weixin

# App 端
npm run dev:app
```

### 管理后台（openrc-car-server）

```bash
cd openrc-car-server

# 安装依赖（推荐 pnpm）
pnpm install

# 开发运行（自动打开浏览器）
pnpm dev

# 生产构建（vue-tsc 类型检查 + vite build）
pnpm build

# 构建产物预览
pnpm serve
```

---

## 后续规划 / 可扩展方向

- **客户端真实控制链路**：当前摇杆输出本地指令 JSON，后续可接入 **TCP / WebSocket / 蓝牙** 将指令下发到小车，实现真实遥控
- **控制指令协议化**：定义统一指令协议（方向、推力、心跳、超时归零），与服务端联动
- **后台与客户端对接**：后台遥控车数据通过 API 与 App 打通，实现设备绑定、在线状态、电量回传
- **后台增强**：
  - 接入真实后端（当前为前端 mock 数据）
  - 遥控车实时监控（位置、轨迹、视频回传）
  - 指令日志与历史回放
- **多端发布**：App 端打包 Android/iOS，小程序端上架微信
*（内容由AI生成，仅供参考）*
