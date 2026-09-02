import img1 from '@imgs/cover/img1.webp'
import img2 from '@imgs/cover/img2.webp'
import img3 from '@imgs/cover/img3.webp'
import img4 from '@imgs/cover/img4.webp'
import img5 from '@imgs/cover/img5.webp'
import img6 from '@imgs/cover/img6.webp'
import img7 from '@imgs/cover/img7.webp'
import img8 from '@imgs/cover/img8.webp'

/**
 * 遥控车管理 mock 数据
 *
 * 提供遥控车的统一假数据（前端演示用，无真实后端）。
 * 数据结构为遥控车业务字段，支持增删改查。
 *
 * @module mock/temp/rcCarData
 */

/** 遥控车列表项 */
export interface RcCarItem {
  id: number
  /** 名称 */
  name: string
  /** 型号 */
  model: string
  /** 品牌 */
  brand: string
  /** 颜色 */
  color: string
  /** 状态：online 在线 / offline 离线 / maintain 维护中 */
  status: 'online' | 'offline' | 'maintain'
  /** 电量百分比 0-100 */
  battery: number
  /** 最高时速 km/h */
  maxSpeed: number
  /** 续航里程 km */
  range: number
  /** 价格 元 */
  price: number
  /** 负责人 */
  owner: string
  /** 图片 */
  image: string
  /** 备注描述 */
  remark: string
  /** 创建时间 */
  createTime: string
}

/** 遥控车状态配置 */
export const RC_CAR_STATUS = {
  online: { label: '在线', type: 'success' },
  offline: { label: '离线', type: 'info' },
  maintain: { label: '维护中', type: 'warning' }
} as const

/** 遥控车列表初始数据 */
export const RC_CAR_LIST: RcCarItem[] = [
  {
    id: 1,
    name: '雷霆 R1 越野车',
    model: 'R1-4WD',
    brand: 'Thunder',
    color: '#FF6B35',
    status: 'online',
    battery: 85,
    maxSpeed: 60,
    range: 120,
    price: 1299,
    owner: '张伟',
    image: img1,
    remark: '四驱越野，全地形适应，适合户外竞速。',
    createTime: '2026-08-01 10:30:00'
  },
  {
    id: 2,
    name: '疾风 F1 漂移车',
    model: 'F1-Drift',
    brand: 'Gale',
    color: '#3B82F6',
    status: 'offline',
    battery: 32,
    maxSpeed: 80,
    range: 90,
    price: 1599,
    owner: '李娜',
    image: img2,
    remark: '高速漂移，前置后驱，专业赛道改装。',
    createTime: '2026-08-05 14:20:00'
  },
  {
    id: 3,
    name: '山猫 M5 攀爬车',
    model: 'M5-Climb',
    brand: 'Lynx',
    color: '#22C55E',
    status: 'maintain',
    battery: 56,
    maxSpeed: 35,
    range: 150,
    price: 1899,
    owner: '王强',
    image: img3,
    remark: '强扭矩攀爬，金属大梁，岩石路段利器。',
    createTime: '2026-08-10 09:15:00'
  },
  {
    id: 4,
    name: '猎豹 P2 短卡',
    model: 'P2-ShortCourse',
    brand: 'Cheetah',
    color: '#F59E0B',
    status: 'online',
    battery: 92,
    maxSpeed: 70,
    range: 110,
    price: 1099,
    owner: '陈静',
    image: img4,
    remark: '沙漠短卡，独立悬挂，飞坡抗冲击强。',
    createTime: '2026-08-12 16:45:00'
  },
  {
    id: 5,
    name: '幻影 X3 竞速房车',
    model: 'X3-Onroad',
    brand: 'Phantom',
    color: '#8B5CF6',
    status: 'offline',
    battery: 18,
    maxSpeed: 95,
    range: 70,
    price: 2199,
    owner: '刘洋',
    image: img5,
    remark: '平路竞速，碳纤底盘，极速 95km/h。',
    createTime: '2026-08-15 11:00:00'
  },
  {
    id: 6,
    name: '铁骑 T8 大脚车',
    model: 'T8-Monster',
    brand: 'Iron',
    color: '#EF4444',
    status: 'online',
    battery: 74,
    maxSpeed: 50,
    range: 100,
    price: 1399,
    owner: '赵敏',
    image: img6,
    remark: '大脚怪胎，8 轮驱动，泥地表现强悍。',
    createTime: '2026-08-20 13:30:00'
  },
  {
    id: 7,
    name: '极光 A4 平跑车',
    model: 'A4-Sprint',
    brand: 'Aurora',
    color: '#06B6D4',
    status: 'maintain',
    battery: 45,
    maxSpeed: 88,
    range: 85,
    price: 1799,
    owner: '孙磊',
    image: img7,
    remark: '高速平跑，空气动力学外壳，竞赛级配置。',
    createTime: '2026-08-25 10:10:00'
  },
  {
    id: 8,
    name: '风暴 S6 短途拉力车',
    model: 'S6-Rally',
    brand: 'Storm',
    color: '#10B981',
    status: 'online',
    battery: 68,
    maxSpeed: 65,
    range: 130,
    price: 1499,
    owner: '周婷',
    image: img8,
    remark: '拉力赛道专用，全密封防尘，碎石路面稳定。',
    createTime: '2026-08-28 15:55:00'
  }
]

/** 自增 id 计数器（新增时使用） */
let nextId = RC_CAR_LIST.length + 1

/** 生成下一个自增 id */
export function genRcCarId(): number {
  return nextId++
}

/** 格式化当前时间为字符串 */
export function nowTime(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
