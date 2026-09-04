<template>
  <view class="page">
    <!-- 标题区 -->
    <view class="header">
      <view class="header-title">OpenRC 遥控小车</view>
      <view class="header-sub">摇杆控制</view>
    </view>

    <!-- 控制状态 -->
    <view class="status-bar">
      <view class="status-item">
        <view class="status-dot" :class="connected ? 'on' : ''"></view>
        <text class="status-text">{{ connected ? '已连接' : '未连接' }}</text>
      </view>
      <view class="btn" @click="connected = !connected">{{ connected ? '断开' : '连接' }}</view>
    </view>

    <!-- 摇杆区 -->
    <view class="joystick-wrap">
      <rc-joystick
        ref="joystick"
        :type="joyType"
        :size="220"
        :disabled="!connected"
        @move="onJoystickMove"
        @tap="onJoystickTap"
        @doubletap="onJoystickDoubleTap"
      />
      <view class="joystick-hint">按住拖动控制小车，松手回中</view>
    </view>

    <!-- 参数展示（参考车辆监控摇杆页参数卡风格） -->
    <view class="panel" style="display: none;">
      <view class="panel-title">摇杆输出</view>
      <view class="param-grid">
        <view class="param-item">
          <view class="param-label">角度</view>
          <view class="param-value">{{ angleText }}</view>
        </view>
        <view class="param-item">
          <view class="param-label">推力</view>
          <view class="param-value">{{ powerText }}</view>
        </view>
        <view class="param-item">
          <view class="param-label">方向</view>
          <view class="param-value">{{ directionText }}</view>
        </view>
        <view class="param-item">
          <view class="param-label">Y轴(前后)</view>
          <view class="param-value">{{ joyYText }}</view>
        </view>
        <view class="param-item">
          <view class="param-label">X轴(左右)</view>
          <view class="param-value">{{ joyXText }}</view>
        </view>
        <view class="param-item">
          <view class="param-label">类型</view>
          <view class="param-value">{{ joyTypeText }}</view>
        </view>
      </view>
    </view>

    <!-- 指令输出区 -->
    <view class="panel" style="display: none;">
      <view class="panel-title">控制指令（JSON）</view>
      <view class="cmd-box">{{ commandJson }}</view>
    </view>

    <!-- 底部工具条 -->
    <view class="toolbar" style="display: none;">
      <view class="tool-btn" :class="{ active: joyType === '8' }" @click="joyType = '8'">8轴</view>
      <view class="tool-btn" :class="{ active: joyType === '4' }" @click="joyType = '4'">4轴</view>
      <view class="tool-btn" :class="{ active: joyType === '2lr' }" @click="joyType = '2lr'">左右</view>
      <view class="tool-btn" :class="{ active: joyType === '2ud' }" @click="joyType = '2ud'">上下</view>
      <view class="tool-btn" @click="resetJoystick">回中</view>
    </view>
  </view>
</template>

<script>
import RcJoystick from '@/components/rc-joystick/rc-joystick.vue'

const DIRECTION_NAMES = {
  '-1': '中心',
  '0': '左',
  '1': '左上',
  '2': '上',
  '3': '右上',
  '4': '右',
  '5': '右下',
  '6': '下',
  '7': '左下'
}

export default {
  components: { RcJoystick },
  data() {
    return {
      connected: true,
      joyType: '8',
      angle: 0,
      angleDegrees: 0,
      power: 0,
      direction: -1,
      joyX: 0,
      joyY: 0
    }
  },
  computed: {
    angleText() {
      const d = Math.round(this.angleDegrees * 10) / 10
      return d + '°'
    },
    powerText() {
      return Math.round(this.power) + '%'
    },
    directionText() {
      return DIRECTION_NAMES[this.direction] || '中心'
    },
    joyXText() {
      return this.joyX.toFixed(2)
    },
    joyYText() {
      return this.joyY.toFixed(2)
    },
    joyTypeText() {
      const map = { '8': '八轴', '4': '四轴', '2lr': '左右二轴', '2ud': '上下二轴' }
      return map[this.joyType]
    },
    commandJson() {
      return JSON.stringify({
        type: this.joyType,
        angle: Math.round(this.angleDegrees * 10) / 10,
        power: Math.round(this.power),
        direction: this.direction,
        joyX: Math.round(this.joyX * 1000) / 1000,
        joyY: Math.round(this.joyY * 1000) / 1000
      })
    }
  },
  methods: {
    // 角度约定（与原生库一致）：0=左，90°=上，180°=右，-90°=下
    // 控制器约定：joyX 正数左转/负数右转；joyY 正数前进/负数后退
    onJoystickMove(data) {
      this.angle = data.angle
      this.angleDegrees = data.angleDegrees
      this.power = data.power
      this.direction = data.direction
      const ratio = data.power / 100.0
      this.joyX = ratio * Math.cos(data.angle)
      this.joyY = ratio * Math.sin(data.angle)
    },
    onJoystickTap() {
      console.log('joystick tap')
    },
    onJoystickDoubleTap() {
      console.log('joystick double tap')
    },
    resetJoystick() {
      this.$refs.joystick.reset()
      this.onJoystickMove({ angle: 0, angleDegrees: 0, power: 0, direction: -1 })
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx 32rpx 48rpx;
  box-sizing: border-box;
}

.header {
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #383838;
}

.header-sub {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #a6a6a6;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.status-item {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #d0d0d0;
  margin-right: 12rpx;
}

.status-dot.on {
  background: #5abf84;
}

.status-text {
  font-size: 26rpx;
  color: #383838;
}

.btn {
  padding: 10rpx 32rpx;
  background: #5abf84;
  color: #ffffff;
  border-radius: 40rpx;
  font-size: 26rpx;
}

.joystick-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  margin-bottom: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.joystick-hint {
  margin-top: 28rpx;
  font-size: 24rpx;
  color: #a6a6a6;
}

.panel {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.panel-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #383838;
  margin-bottom: 20rpx;
}

.param-grid {
  display: flex;
  flex-wrap: wrap;
}

.param-item {
  width: 33.33%;
  box-sizing: border-box;
  padding: 12rpx;
}

.param-label {
  font-size: 22rpx;
  color: #a6a6a6;
  margin-bottom: 6rpx;
}

.param-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #383838;
  background: #f5f6fa;
  border-radius: 10rpx;
  padding: 14rpx 0;
  text-align: center;
}

.cmd-box {
  background: #2c2c2c;
  color: #7bed9f;
  font-size: 24rpx;
  font-family: Consolas, Menlo, monospace;
  border-radius: 10rpx;
  padding: 20rpx;
  word-break: break-all;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tool-btn {
  padding: 14rpx 36rpx;
  background: #ffffff;
  color: #383838;
  border-radius: 40rpx;
  font-size: 26rpx;
  border: 2rpx solid #e0e0e0;
}

.tool-btn.active {
  background: #5abf84;
  color: #ffffff;
  border-color: #5abf84;
}
</style>
