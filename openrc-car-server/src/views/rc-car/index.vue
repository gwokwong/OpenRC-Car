<template>
  <div class="p-5 max-sm:p-4">
    <!-- 页面标题 + 操作区（右上角切换按钮） -->
    <div class="flex-b mb-5 max-sm:flex-col max-sm:gap-3">
      <div>
        <div class="text-xl font-600 text-g-900">{{ t('menus.rcCar.title') }}</div>
        <div class="mt-1 text-sm text-g-500">遥控车信息统一管理，支持卡片 / 列表两种视图切换</div>
      </div>
      <div class="flex-c gap-3">
        <!-- 视图切换：卡片 / 列表 -->
        <div class="flex-c border border-g-300 rounded-lg overflow-hidden bg-g-100">
          <button
            class="w-9 h-9 flex-c c-p transition-all"
            :class="viewMode === 'card' ? 'bg-white shadow-sm text-primary' : 'text-g-500 hover:text-g-700'"
            title="卡片视图"
            @click="viewMode = 'card'"
          >
            <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>
          <button
            class="w-9 h-9 flex-c c-p transition-all border-l border-g-300"
            :class="viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-g-500 hover:text-g-700'"
            title="列表视图"
            @click="viewMode = 'list'"
          >
            <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
        <ElButton type="primary" :icon="Plus" @click="openAddDialog">新增遥控车</ElButton>
      </div>
    </div>

    <!-- 搜索区 -->
    <div class="art-card p-4 mb-4">
      <div class="flex flex-wrap gap-3">
        <ElInput
          v-model="searchParams.keyword"
          placeholder="搜索名称 / 型号 / 品牌"
          clearable
          class="w-60 max-sm:w-full"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <ElSelect
          v-model="searchParams.status"
          placeholder="状态"
          clearable
          class="w-36 max-sm:w-full"
          @change="handleSearch"
        >
          <ElOption v-for="(item, key) in RC_CAR_STATUS" :key="key" :value="key" :label="item.label" />
        </ElSelect>
        <ElButton type="primary" plain :icon="Search" @click="handleSearch">查询</ElButton>
        <ElButton :icon="Refresh" @click="handleReset">重置</ElButton>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card'" v-loading="loading" class="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div
        v-for="car in filteredList"
        :key="car.id"
        class="art-card overflow-hidden c-p group transition-all hover:-translate-y-1 hover:shadow-lg"
      >
        <div class="relative h-40 overflow-hidden">
          <img :src="car.image" :alt="car.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <span
            class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs text-white"
            :style="{ backgroundColor: statusColor(car.status) }"
          >
            {{ statusLabel(car.status) }}
          </span>
        </div>
        <div class="p-4">
          <div class="flex-b">
            <div class="font-600 text-g-900">{{ car.name }}</div>
            <div class="text-sm text-g-500">{{ car.model }}</div>
          </div>
          <div class="mt-2 text-sm text-g-500 flex-c gap-2">
            <span class="px-1.5 py-0.5 rounded bg-g-100 text-g-600">{{ car.brand }}</span>
            <span class="flex-c gap-1">
              <span class="w-2.5 h-2.5 rounded-full inline-block" :style="{ backgroundColor: car.color }"></span>
              {{ car.color }}
            </span>
          </div>
          <div class="mt-3 text-xs text-g-500">
            <div class="flex-b mb-1">
              <span>电量</span>
              <span :class="car.battery < 30 ? 'text-red-500' : ''">{{ car.battery }}%</span>
            </div>
            <ElProgress :percentage="car.battery" :stroke-width="6" :show-text="false" :color="batteryColor(car.battery)" />
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-g-600">
            <div class="bg-g-50 rounded py-1.5">
              <div class="text-g-400">最高时速</div>
              <div class="font-500">{{ car.maxSpeed }} km/h</div>
            </div>
            <div class="bg-g-50 rounded py-1.5">
              <div class="text-g-400">续航</div>
              <div class="font-500">{{ car.range }} km</div>
            </div>
            <div class="bg-g-50 rounded py-1.5">
              <div class="text-g-400">价格</div>
              <div class="font-500 text-orange-500">¥{{ car.price }}</div>
            </div>
          </div>
          <div class="mt-3 flex-b border-t border-g-100 pt-3">
            <span class="text-xs text-g-400">负责人：{{ car.owner }}</span>
            <div class="flex-c gap-1">
              <ElButton size="small" text type="primary" @click="openEditDialog(car)">编辑</ElButton>
              <ElButton size="small" text type="danger" @click="handleDelete(car)">删除</ElButton>
            </div>
          </div>
        </div>
      </div>
      <ElEmpty v-if="!loading && filteredList.length === 0" description="暂无遥控车数据" class="col-span-full" />
    </div>

    <!-- 列表视图 -->
    <div v-else class="art-card overflow-hidden">
      <ElTable v-loading="loading" :data="filteredList" stripe>
        <ElTableColumn label="遥控车" min-width="220">
          <template #default="{ row }">
            <div class="flex-c gap-3">
              <img :src="row.image" :alt="row.name" class="w-12 h-12 rounded object-cover" />
              <div>
                <div class="font-500 text-g-900">{{ row.name }}</div>
                <div class="text-xs text-g-400">{{ row.model }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="品牌" prop="brand" width="110" />
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <ElTag :type="statusColor(row.status) as any" size="small" effect="light">{{ statusLabel(row.status) }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="电量" width="140">
          <template #default="{ row }">
            <div class="flex-c gap-2">
              <ElProgress :percentage="row.battery" :stroke-width="6" :show-text="false" :color="batteryColor(row.battery)" class="flex-1" />
              <span class="text-xs text-g-500 w-8 text-right">{{ row.battery }}%</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="最高时速" width="100" align="center">
          <template #default="{ row }">{{ row.maxSpeed }} km/h</template>
        </ElTableColumn>
        <ElTableColumn label="续航" width="100" align="center">
          <template #default="{ row }">{{ row.range }} km</template>
        </ElTableColumn>
        <ElTableColumn label="价格" width="110" align="right">
          <template #default="{ row }">
            <span class="text-orange-500 font-500">¥{{ row.price }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="负责人" prop="owner" width="100" />
        <ElTableColumn label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="openEditDialog(row)">编辑</ElButton>
            <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElEmpty v-if="!loading && filteredList.length === 0" description="暂无遥控车数据" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <RcCarDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :car-data="currentCar"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { Plus, Refresh, Search } from '@element-plus/icons-vue'
  import { ElMessageBox } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import RcCarDialog from './modules/rc-car-dialog.vue'
  import { RC_CAR_LIST, RC_CAR_STATUS, genRcCarId, nowTime, type RcCarItem } from '@/mock/temp/rcCarData'

  defineOptions({ name: 'RcCarIndex' })

  const { t } = useI18n()

  /** 视图模式：card 卡片 / list 列表 */
  const viewMode = ref<'card' | 'list'>('card')

  /** 遥控车数据（本地内存，增删改查即时生效） */
  const carList = ref<RcCarItem[]>(RC_CAR_LIST.map((item) => ({ ...item })))

  /** 搜索参数 */
  const searchParams = reactive({
    keyword: '',
    status: '' as '' | RcCarItem['status']
  })

  /** 加载状态（演示用） */
  const loading = ref(false)

  /** 弹窗控制 */
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentCar = ref<Partial<RcCarItem> | null>(null)

  /** 筛选后的列表 */
  const filteredList = computed(() => {
    const keyword = searchParams.keyword.trim().toLowerCase()
    return carList.value.filter((car) => {
      const matchKeyword =
        !keyword ||
        car.name.toLowerCase().includes(keyword) ||
        car.model.toLowerCase().includes(keyword) ||
        car.brand.toLowerCase().includes(keyword)
      const matchStatus = !searchParams.status || car.status === searchParams.status
      return matchKeyword && matchStatus
    })
  })

  /** 状态相关辅助 */
  const statusLabel = (status: RcCarItem['status']) => RC_CAR_STATUS[status]?.label ?? status
  const statusColor = (status: RcCarItem['status']) => {
    const map = { online: '#67C23A', offline: '#909399', maintain: '#E6A23C' }
    return map[status] ?? '#909399'
  }
  const batteryColor = (battery: number) => (battery < 30 ? '#F56C6C' : battery < 60 ? '#E6A23C' : '#67C23A')

  /** 查询 / 重置 */
  const handleSearch = () => {
    loading.value = true
    setTimeout(() => (loading.value = false), 300)
  }
  const handleReset = () => {
    searchParams.keyword = ''
    searchParams.status = ''
    handleSearch()
  }

  /** 新增 / 编辑 */
  const openAddDialog = () => {
    dialogType.value = 'add'
    currentCar.value = null
    dialogVisible.value = true
  }
  const openEditDialog = (row: RcCarItem) => {
    dialogType.value = 'edit'
    currentCar.value = { ...row }
    dialogVisible.value = true
  }

  /** 提交（新增 / 编辑共用） */
  const handleSubmit = (data: RcCarItem) => {
    if (dialogType.value === 'add') {
      carList.value.unshift({
        ...data,
        id: genRcCarId(),
        image: RC_CAR_LIST[carList.value.length % RC_CAR_LIST.length]?.image || '',
        createTime: nowTime()
      })
      ElMessage.success('新增成功')
    } else {
      const index = carList.value.findIndex((item) => item.id === data.id)
      if (index !== -1) {
        carList.value[index] = { ...carList.value[index], ...data }
      }
      ElMessage.success('更新成功')
    }
  }

  /** 删除 */
  const handleDelete = async (row: RcCarItem) => {
    await ElMessageBox.confirm(`确定删除遥控车「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    carList.value = carList.value.filter((item) => item.id !== row.id)
    ElMessage.success('删除成功')
  }
</script>

<style lang="scss" scoped></style>
