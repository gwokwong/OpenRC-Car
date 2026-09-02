<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增遥控车' : '编辑遥控车'"
    width="560px"
    align-center
    destroy-on-close
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="90px">
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入遥控车名称" />
      </ElFormItem>
      <ElFormItem label="型号" prop="model">
        <ElInput v-model="formData.model" placeholder="请输入型号" />
      </ElFormItem>
      <ElFormItem label="品牌" prop="brand">
        <ElInput v-model="formData.brand" placeholder="请输入品牌" />
      </ElFormItem>
      <ElFormItem label="颜色" prop="color">
        <div class="flex-c gap-2">
          <ElColorPicker v-model="formData.color" />
          <span class="text-sm text-g-600">{{ formData.color }}</span>
        </div>
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElSelect v-model="formData.status" placeholder="请选择状态">
          <ElOption v-for="(item, key) in RC_CAR_STATUS" :key="key" :value="key" :label="item.label" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="电量(%)" prop="battery">
        <ElInputNumber v-model="formData.battery" :min="0" :max="100" />
      </ElFormItem>
      <ElFormItem label="最高时速" prop="maxSpeed">
        <ElInputNumber v-model="formData.maxSpeed" :min="0" :max="200" />
        <span class="ml-2 text-sm text-g-600">km/h</span>
      </ElFormItem>
      <ElFormItem label="续航里程" prop="range">
        <ElInputNumber v-model="formData.range" :min="0" :max="1000" />
        <span class="ml-2 text-sm text-g-600">km</span>
      </ElFormItem>
      <ElFormItem label="价格" prop="price">
        <ElInputNumber v-model="formData.price" :min="0" :precision="2" />
        <span class="ml-2 text-sm text-g-600">元</span>
      </ElFormItem>
      <ElFormItem label="负责人" prop="owner">
        <ElInput v-model="formData.owner" placeholder="请输入负责人" />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { RC_CAR_STATUS, type RcCarItem } from '@/mock/temp/rcCarData'
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    carData?: Partial<RcCarItem> | null
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: RcCarItem): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  const formRef = ref<FormInstance>()

  const formData = reactive({
    id: 0,
    name: '',
    model: '',
    brand: '',
    color: '#409EFF',
    status: 'online' as RcCarItem['status'],
    battery: 80,
    maxSpeed: 60,
    range: 100,
    price: 999,
    owner: '',
    image: '',
    remark: '',
    createTime: ''
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入遥控车名称', trigger: 'blur' }],
    model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
    brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
  }

  /** 初始化表单数据（新增/编辑共用） */
  const initFormData = () => {
    const row = props.carData
    const isEdit = props.type === 'edit' && row
    Object.assign(formData, {
      id: isEdit ? row.id : 0,
      name: isEdit ? row.name : '',
      model: isEdit ? row.model : '',
      brand: isEdit ? row.brand : '',
      color: isEdit ? row.color : '#409EFF',
      status: isEdit ? row.status : 'online',
      battery: isEdit ? row.battery : 80,
      maxSpeed: isEdit ? row.maxSpeed : 60,
      range: isEdit ? row.range : 100,
      price: isEdit ? row.price : 999,
      owner: isEdit ? row.owner : '',
      image: isEdit ? row.image : '',
      remark: isEdit ? row.remark : '',
      createTime: isEdit ? row.createTime : ''
    })
  }

  watch(
    () => [props.visible, props.type, props.carData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => formRef.value?.clearValidate())
      }
    },
    { immediate: true }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (valid) {
        emit('submit', { ...formData } as RcCarItem)
        dialogVisible.value = false
      }
    })
  }
</script>
