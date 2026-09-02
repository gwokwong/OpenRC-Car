import { AppRouteRecord } from '@/types/router'

/**
 * 遥控车管理路由模块
 *
 * 提供遥控车列表页面（卡片/列表两种布局，右上角按钮切换），
 * 对应页面 src/views/rc-car/index.vue。
 *
 * @module router/modules/rc-car
 */
export const rcCarRoutes: AppRouteRecord = {
  path: '/rc-car',
  name: 'RcCar',
  component: '/index/index',
  meta: {
    title: 'menus.rcCar.title',
    icon: 'ri:car-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'list',
      name: 'RcCarList',
      component: '/rc-car/index',
      meta: {
        title: 'menus.rcCar.list',
        icon: 'ri:car-line',
        keepAlive: true
      }
    }
  ]
}
