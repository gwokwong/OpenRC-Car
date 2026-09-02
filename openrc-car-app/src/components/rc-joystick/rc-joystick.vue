<template>
  <view
    class="rc-joystick"
    :class="{ 'rc-joystick--disabled': disabled }"
    :style="rootStyle"
    @touchstart="onTouchStart"
    @touchmove.stop.prevent="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
    @tap="onTap"
  >
    <!-- 1. 外圆背景 -->
    <view class="js-pad" :style="padStyle"></view>

    <!-- 2. 外圆双层边框 -->
    <view class="js-border js-border-outer" :style="borderOuterStyle"></view>
    <view class="js-border js-border-inner" :style="borderInnerStyle"></view>

    <!-- 3. 四向方向箭头（尖端朝外） -->
    <view class="js-arrow js-arrow-up" :style="arrowUpStyle"></view>
    <view class="js-arrow js-arrow-down" :style="arrowDownStyle"></view>
    <view class="js-arrow js-arrow-left" :style="arrowLeftStyle"></view>
    <view class="js-arrow js-arrow-right" :style="arrowRightStyle"></view>

    <!-- 4. 按钮浅色外圈（跟随手指） -->
    <view v-if="active" class="js-halo" :style="haloStyle"></view>

    <!-- 5. 实心按钮（激活绿色 / 空闲灰色） -->
    <view class="js-button" :style="buttonStyle"></view>
  </view>
</template>

<script>
/**
 * rc-joystick 摇杆组件
 * 1:1 复刻 D:\workspace\sf-farm-app\joysticklibrary\src\main\java\com\erz\joysticklibrary\JoyStick.kt
 * 包括：触摸拖动、角度/推力计算、8/4/2 轴类型、方向回调、外环内球视觉、松手回中
 *
 * 角度约定（与原生库一致）：
 *   angle = atan2(centerY - posY, centerX - posX)，弧度
 *   0°=左，90°=上，180°=右，-90°=下
 * 推力 power：0 ~ 100（100 为外圈最大移动半径处）
 * 方向 direction：CENTER=-1, LEFT=0, LEFT_UP=1, UP=2, UP_RIGHT=3,
 *               RIGHT=4, RIGHT_DOWN=5, DOWN=6, DOWN_LEFT=7
 */
const DIRECTION = {
  CENTER: -1,
  LEFT: 0,
  LEFT_UP: 1,
  UP: 2,
  UP_RIGHT: 3,
  RIGHT: 4,
  RIGHT_DOWN: 5,
  DOWN: 6,
  DOWN_LEFT: 7
}

function calculateDirection(degrees) {
  if ((degrees >= 0 && degrees < 22.5) || (degrees < 0 && degrees > -22.5)) return DIRECTION.LEFT
  if (degrees >= 22.5 && degrees < 67.5) return DIRECTION.LEFT_UP
  if (degrees >= 67.5 && degrees < 112.5) return DIRECTION.UP
  if (degrees >= 112.5 && degrees < 157.5) return DIRECTION.UP_RIGHT
  if ((degrees >= 157.5 && degrees <= 180) || (degrees >= -180 && degrees < -157.5)) return DIRECTION.RIGHT
  if (degrees >= -157.5 && degrees < -112.5) return DIRECTION.RIGHT_DOWN
  if (degrees >= -112.5 && degrees < -67.5) return DIRECTION.DOWN
  if (degrees >= -67.5 && degrees < -22.5) return DIRECTION.DOWN_LEFT
  return DIRECTION.CENTER
}

export default {
  name: 'RcJoystick',
  props: {
    // 控件边长（px，逻辑像素，参照原库 210dp）
    size: { type: Number, default: 210 },
    // 外圆背景色
    padColor: { type: String, default: '#FFFFFF' },
    // 外圆边框颜色
    borderColor: { type: String, default: '#E0E0E0' },
    // 外圆边框宽度（px）
    borderWidth: { type: Number, default: 2 },
    // 方向箭头颜色
    arrowColor: { type: String, default: '#D0D0D0' },
    // 按钮实心颜色（激活时）
    buttonColor: { type: String, default: '#5ABF84' },
    // 按钮浅色外圈颜色
    haloColor: { type: String, default: '#B8E0C8' },
    // 未操作时中心圆点颜色
    idleButtonColor: { type: String, default: '#D0D0D0' },
    // 按钮直径（px，参照原库 48dp）
    buttonSize: { type: Number, default: 48 },
    // 浅色外圈直径（px，参照原库 75dp）
    haloSize: { type: Number, default: 75 },
    // 箭头整体尺寸（px，参照原库 47dp）
    arrowSize: { type: Number, default: 30 },
    // 轴向类型：'8' 八轴 / '4' 四轴 / '2lr' 左右二轴 / '2ud' 上下二轴
    type: { type: String, default: '8' },
    // 松手后是否停留在最后位置
    stayPut: { type: Boolean, default: false },
    // 禁用（置灰不可操作）
    disabled: { type: Boolean, default: false }
  },
  emits: ['move', 'tap', 'doubletap', 'update:modelValue'],
  data() {
    return {
      centerX: 0,
      centerY: 0,
      outerRadius: 0,
      buttonRadius: 0,
      haloRadius: 0,
      moveRadius: 0,
      arrowOffset: 0,
      posX: 0,
      posY: 0,
      active: false,
      angle: 0,
      power: 0,
      direction: DIRECTION.CENTER,
      rect: null,
      lastTapTime: 0
    }
  },
  computed: {
    rootStyle() {
      return {
        width: this.size + 'px',
        height: this.size + 'px'
      }
    },
    padStyle() {
      const d = this.outerRadius * 2
      return {
        width: d + 'px',
        height: d + 'px',
        left: (this.size - d) / 2 + 'px',
        top: (this.size - d) / 2 + 'px',
        borderRadius: '50%',
        backgroundColor: this.padColor
      }
    },
    borderOuterStyle() {
      const r = this.outerRadius
      const d = r * 2
      return {
        width: d + 'px',
        height: d + 'px',
        left: (this.size - d) / 2 + 'px',
        top: (this.size - d) / 2 + 'px',
        borderRadius: '50%',
        border: this.borderWidth + 'px solid ' + this.borderColor,
        boxSizing: 'border-box'
      }
    },
    borderInnerStyle() {
      // 内层边框半径比外层小 1.5 倍 borderWidth
      const r = this.outerRadius - this.borderWidth * 1.5
      const d = r * 2
      return {
        width: d + 'px',
        height: d + 'px',
        left: (this.size - d) / 2 + 'px',
        top: (this.size - d) / 2 + 'px',
        borderRadius: '50%',
        border: this.borderWidth + 'px solid ' + this.borderColor,
        boxSizing: 'border-box'
      }
    },
    arrowHalfW() {
      return (this.arrowSize * 0.5) / 2
    },
    arrowHalfH() {
      return (this.arrowSize * 0.72) / 2
    },
    arrowUpStyle() {
      return this.arrowStyle(this.centerX, this.centerY - this.arrowOffset, 0)
    },
    arrowDownStyle() {
      return this.arrowStyle(this.centerX, this.centerY + this.arrowOffset, 180)
    },
    arrowLeftStyle() {
      return this.arrowStyle(this.centerX - this.arrowOffset, this.centerY, 270)
    },
    arrowRightStyle() {
      return this.arrowStyle(this.centerX + this.arrowOffset, this.centerY, 90)
    },
    haloStyle() {
      const d = this.haloRadius * 2
      return {
        width: d + 'px',
        height: d + 'px',
        left: this.posX - this.haloRadius + 'px',
        top: this.posY - this.haloRadius + 'px',
        borderRadius: '50%',
        backgroundColor: this.haloColor
      }
    },
    buttonStyle() {
      // 按钮在外圈内向拖动方向偏移，到达边缘时可触达外圈边缘（复刻原生 draw 逻辑）
      let bx = this.centerX
      let by = this.centerY
      const dx = this.posX - this.centerX
      const dy = this.posY - this.centerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const buttonOffset = this.haloRadius - this.buttonRadius
      if (dist > 0.01) {
        const ratio = buttonOffset / dist
        bx = this.posX + dx * ratio
        by = this.posY + dy * ratio
      }
      const d = this.buttonRadius * 2
      return {
        width: d + 'px',
        height: d + 'px',
        left: bx - this.buttonRadius + 'px',
        top: by - this.buttonRadius + 'px',
        borderRadius: '50%',
        backgroundColor: this.active ? this.buttonColor : this.idleButtonColor,
        transition: this.active ? 'none' : 'left 0.18s ease, top 0.18s ease'
      }
    }
  },
  watch: {
    disabled(val) {
      if (val && this.active) {
        this.reset()
      }
    },
    size() {
      this.calcGeometry()
    }
  },
  mounted() {
    this.calcGeometry()
    this.refreshRect()
  },
  methods: {
    calcGeometry() {
      const size = this.size
      this.centerX = size / 2
      this.centerY = size / 2
      // 外圆留出 8px 边距
      this.outerRadius = size / 2 - 8
      this.buttonRadius = this.buttonSize / 2
      this.haloRadius = this.haloSize / 2
      // 最大移动半径，使浅色外圈边缘刚好贴到外圆内边框
      this.moveRadius = this.outerRadius - this.borderWidth / 2 - this.haloRadius
      if (this.moveRadius < 0) this.moveRadius = 0
      this.arrowOffset = this.outerRadius * 0.68
      this.posX = this.centerX
      this.posY = this.centerY
    },
    refreshRect() {
      // #ifdef H5 || APP-PLUS || MP-WEIXIN
      const query = uni.createSelectorQuery().in(this)
      query
        .select('.rc-joystick')
        .boundingClientRect((res) => {
          if (res) {
            this.rect = { left: res.left, top: res.top }
          }
        })
        .exec()
      // #endif
    },
    onTouchStart(e) {
      if (this.disabled) return
      this.active = true
      // 每次触摸刷新位置，避免页面滚动后偏差
      this.refreshRect()
      const t = e.touches && e.touches[0]
      if (t && this.rect) {
        this.posX = t.clientX - this.rect.left
        this.posY = t.clientY - this.rect.top
      }
      this.applyMove()
    },
    onTouchMove(e) {
      if (this.disabled) return
      const t = e.touches && e.touches[0]
      if (t && this.rect) {
        this.posX = t.clientX - this.rect.left
        this.posY = t.clientY - this.rect.top
      }
      this.applyMove()
    },
    onTouchEnd(e) {
      if (this.disabled) return
      this.active = false
      if (!this.stayPut) {
        this.posX = this.centerX
        this.posY = this.centerY
        this.direction = DIRECTION.CENTER
        this.angle = 0
        this.power = 0
      }
      this.emitMove()
    },
    applyMove() {
      const cx = this.centerX
      const cy = this.centerY
      // 轴向约束（复刻原生库 switch type）
      if (this.type === '2lr') {
        this.posY = cy
      } else if (this.type === '2ud') {
        this.posX = cx
      } else if (this.type === '4') {
        if (Math.abs(this.posX - cx) > Math.abs(this.posY - cy)) {
          this.posY = cy
        } else {
          this.posX = cx
        }
      }
      // 半径限制
      const dx0 = this.posX - cx
      const dy0 = this.posY - cy
      const absVal = Math.sqrt(dx0 * dx0 + dy0 * dy0)
      if (absVal > this.moveRadius) {
        this.posX = (dx0 * this.moveRadius) / absVal + cx
        this.posY = (dy0 * this.moveRadius) / absVal + cy
      }
      // 角度 / 推力 / 方向
      const dx = this.posX - cx
      const dy = this.posY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      this.angle = Math.atan2(cy - this.posY, cx - this.posX)
      this.power = this.moveRadius > 0 ? (100 * dist) / this.moveRadius : 0
      this.direction = calculateDirection((this.angle * 180) / Math.PI)
      this.emitMove()
    },
    emitMove() {
      const data = {
        angle: this.angle,
        angleDegrees: (this.angle * 180) / Math.PI,
        power: this.power,
        direction: this.direction
      }
      this.$emit('move', data)
      this.$emit('update:modelValue', data)
    },
    onTap() {
      const now = Date.now()
      if (now - this.lastTapTime < 300) {
        this.lastTapTime = 0
        this.$emit('doubletap')
      } else {
        this.lastTapTime = now
        this.$emit('tap')
      }
    },
    arrowStyle(x, y, deg) {
      const clip =
        'polygon(50% 0%, 100% 42%, 62% 34%, 62% 100%, 38% 100%, 38% 34%, 0% 42%)'
      return {
        width: this.arrowSize * 0.5 + 'px',
        height: this.arrowSize * 0.72 + 'px',
        left: x - this.arrowHalfW + 'px',
        top: y - this.arrowHalfH + 'px',
        backgroundColor: this.arrowColor,
        clipPath: clip,
        transform: 'rotate(' + deg + 'deg)'
      }
    },
    /** 对外暴露：主动回中并复位输出 */
    reset() {
      this.active = false
      this.posX = this.centerX
      this.posY = this.centerY
      this.direction = DIRECTION.CENTER
      this.angle = 0
      this.power = 0
      this.emitMove()
    }
  }
}
</script>

<style scoped lang="scss">
.rc-joystick {
  position: relative;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.rc-joystick--disabled {
  opacity: 0.45;
  pointer-events: none;
}

.js-pad,
.js-border,
.js-arrow,
.js-halo,
.js-button {
  position: absolute;
}

.js-border-outer,
.js-border-inner {
  border-radius: 50%;
}

.js-arrow {
  z-index: 3;
}

.js-halo {
  z-index: 4;
}

.js-button {
  z-index: 5;
}
</style>
