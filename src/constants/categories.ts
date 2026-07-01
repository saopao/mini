export interface LedgerCategoryMeta {
  label: string
  icon: string
  hint: string
  quickAmounts?: number[]
}

export const incomeCategoryOptions: LedgerCategoryMeta[] = [
  { label: '堂食', icon: '堂', hint: '店内消费', quickAmounts: [50, 100, 200, 500] },
  { label: '外卖', icon: '外', hint: '平台订单', quickAmounts: [30, 80, 150, 300] },
  { label: '自提', icon: '提', hint: '到店自取', quickAmounts: [30, 60, 100, 200] },
  { label: '私域', icon: '私', hint: '社群转账', quickAmounts: [100, 200, 500, 1000] },
  { label: '其他', icon: '其', hint: '其他收入', quickAmounts: [50, 100, 200, 500] }
]

export const expenseCategoryOptions: LedgerCategoryMeta[] = [
  { label: '房租', icon: '租', hint: '租金物业', quickAmounts: [500, 1000, 3000, 5000] },
  { label: '人工', icon: '人', hint: '工资兼职', quickAmounts: [100, 300, 500, 1000] },
  { label: '原料', icon: '料', hint: '采购耗材', quickAmounts: [100, 200, 500, 1000] },
  { label: '水电', icon: '水', hint: '能耗费用', quickAmounts: [50, 100, 200, 500] },
  { label: '平台费', icon: '平', hint: '抽佣服务', quickAmounts: [50, 100, 200, 500] },
  { label: '营销', icon: '销', hint: '推广活动', quickAmounts: [100, 200, 500, 1000] },
  { label: '设备', icon: '设', hint: '维修添置', quickAmounts: [200, 500, 1000, 3000] },
  { label: '其他', icon: '其', hint: '其他支出', quickAmounts: [50, 100, 200, 500] }
]

export const incomeCategories = incomeCategoryOptions.map((category) => category.label)

export const expenseCategories = expenseCategoryOptions.map((category) => category.label)

export const quickAmounts = [50, 100, 200, 500]
