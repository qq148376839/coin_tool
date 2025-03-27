<template>
  <div class="formula-container">
    <!-- 左侧变量面板 -->
    <div class="variable-panel">
      <div class="panel-section">
        <h3>系统变量</h3>
        <div class="variable-list">
          <div v-for="item in systemVariables" 
               :key="item.name"
               class="variable-item"
               @click="insertVariable(item)">
            <span class="name">{{ item.name }}</span>
            <span class="desc">{{ item.description }}</span>
          </div>
        </div>
      </div>
      
      <div class="panel-section">
        <h3>自定义变量</h3>
        <div class="add-variable">
          <el-input v-model="newVariable.name" placeholder="变量名称" />
          <el-select v-model="newVariable.type" placeholder="变量类型">
            <el-option label="数值" value="number" />
            <el-option label="公式" value="formula" />
          </el-select>
          <template v-if="newVariable.type === 'number'">
            <el-input 
              v-model="newVariable.value" 
              placeholder="变量值" 
            />
          </template>
          <template v-else>
            <el-select 
              v-model="newVariable.value" 
              placeholder="选择公式"
              class="formula-select"
            >
              <el-option 
                v-for="(formula, index) in savedFormulas" 
                :key="index"
                :label="formula"
                :value="formula"
              >
                <span>{{ formula }}</span>
                <span class="formula-preview">= {{ calculateFormula(formula) }}</span>
              </el-option>
            </el-select>
          </template>
          <el-button @click="addCustomVariable" :disabled="!canAddVariable">
            添加变量
          </el-button>
        </div>
        <div class="variable-list">
          <div v-for="item in customVariables" 
               :key="item.name"
               class="variable-item"
               @click="insertVariable(item)">
            <span class="name">{{ item.name }}</span>
            <span class="type-tag">{{ item.type === 'formula' ? '公式' : '数值' }}</span>
            <span class="value">{{ item.value }}</span>
            <span class="preview" v-if="item.type === 'formula'">
              = {{ calculateFormula(item.value) }}
            </span>
            <el-icon class="delete-icon" @click.stop="deleteVariable(item)">
              <Delete />
            </el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧公式编辑器 -->
    <div class="formula-editor">
      <div class="editor-header">
        <span>公式编辑器</span>
        <div class="operator-buttons">
          <el-button v-for="op in operators" 
                     :key="op"
                     @click="insertOperator(op)">
            {{ op }}
          </el-button>
        </div>
      </div>
      
      <el-input
        v-model="formula"
        type="textarea"
        :rows="8"
        placeholder="在此处编辑公式"
      />

      <div class="editor-footer">
        <el-button type="primary" @click="saveFormula">保存公式</el-button>
        <el-button @click="clearFormula">清空</el-button>
      </div>

      <div class="saved-formulas" v-if="savedFormulas.length">
        <h3>已保存的公式</h3>
        <div v-for="(item, index) in savedFormulas" 
             :key="index"
             class="formula-item">
          <span class="formula-text">{{ item }}</span>
          <el-icon class="delete-icon" @click="deleteFormula(index)">
            <Delete />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 底部交易变量模块 - 移到这里 -->
    <div class="trade-variables-footer">
      <div class="trade-variables-content">
        <div class="variables-section">
          <div class="trade-variable-item">
            <span class="label">开仓价格:</span>
            <el-select 
              v-model="tradeVariables.openPrice" 
              placeholder="选择开仓价格变量"
              class="price-select"
            >
              <el-option-group label="系统变量">
                <el-option
                  v-for="item in systemVariables"
                  :key="item.name"
                  :label="`${item.name} (${item.description})`"
                  :value="item.name"
                />
              </el-option-group>
              <el-option-group label="自定义变量">
                <el-option
                  v-for="item in customVariables"
                  :key="item.name"
                  :label="`${item.name} = ${calculateFormula(item.value)}`"
                  :value="item.name"
                />
              </el-option-group>
            </el-select>
            <span class="preview" v-if="tradeVariables.openPrice">
              = {{ calculateFormula(tradeVariables.openPrice) || '100' }}
            </span>
          </div>

          <div class="trade-variable-item">
            <span class="label">平仓价格:</span>
            <el-select 
              v-model="tradeVariables.closePrice" 
              placeholder="选择平仓价格变量"
              class="price-select"
            >
              <el-option-group label="系统变量">
                <el-option
                  v-for="item in systemVariables"
                  :key="item.name"
                  :label="`${item.name} (${item.description})`"
                  :value="item.name"
                />
              </el-option-group>
              <el-option-group label="自定义变量">
                <el-option
                  v-for="item in customVariables"
                  :key="item.name"
                  :label="`${item.name} = ${calculateFormula(item.value)}`"
                  :value="item.name"
                />
              </el-option-group>
            </el-select>
            <span class="preview" v-if="tradeVariables.closePrice">
              = {{ calculateFormula(tradeVariables.closePrice) || '100' }}
            </span>
          </div>
        </div>

        <div class="submit-section">
          <el-button 
            @click="goToVerify"
          >
            去验证
          </el-button>
          <el-button 
            type="primary" 
            @click="submitTradeVariables"
            :disabled="!tradeVariables.openPrice || !tradeVariables.closePrice"
          >
            提交
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加公式编辑弹窗 -->
    <el-dialog
      v-model="showFormulaDialog"
      title="编辑公式"
      width="600px"
    >
      <div class="formula-dialog-content">
        <div class="variables-section">
          <h4>可用变量</h4>
          <div class="available-variables">
            <div v-for="v in availableVariables" 
                 :key="v.name"
                 class="variable-chip"
                 @click="insertToTempFormula(v.name)">
              {{ v.name }}
            </div>
          </div>
        </div>
        
        <div class="operators-section">
          <div v-for="op in operators" 
               :key="op"
               class="operator-chip"
               @click="insertToTempFormula(op)">
            {{ op }}
          </div>
        </div>
        
        <el-input
          v-model="tempFormula"
          type="textarea"
          :rows="4"
          placeholder="在此处编辑公式"
        />
        
        <div class="preview-section" v-if="tempFormula">
          预览计算结果: {{ calculateFormula(tempFormula) }}
        </div>

        <div class="saved-formulas-section" v-if="savedFormulas.length">
          <h4>已保存的公式</h4>
          <div class="saved-formulas-list">
            <div v-for="(formula, index) in savedFormulas" 
                 :key="index"
                 class="formula-chip"
                 @click="selectSavedFormula(formula)">
              {{ formula }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showFormulaDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmFormula">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 系统预设变量
const systemVariables = ref([
  { name: 'latest_price', description: '最新价格' },
  { name: 'price', description: '当前价格' },
  { name: 'volume', description: '成交量' },
  { name: 'high', description: '最高价' },
  { name: 'low', description: '最低价' },
  { name: 'open', description: '开盘价' },
  { name: 'close', description: '收盘价' }
])

// 扩展自定义变量的类型
interface CustomVariable {
  name: string;
  value: string;
  type: 'number' | 'formula';
}

const customVariables = ref<CustomVariable[]>([])
const newVariable = ref({
  name: '',
  value: '',
  type: 'number'
})

// 公式编辑相关
const showFormulaDialog = ref(false)
const tempFormula = ref('')

// 计算可用于公式的变量
const availableVariables = computed(() => {
  return [
    ...systemVariables.value,
    ...customVariables.value.filter(v => 
      // 防止循环引用：正在编辑的变量不能引用自己
      v.name !== newVariable.value.name
    )
  ]
})

// 检查是否可以添加新变量
const canAddVariable = computed(() => {
  return newVariable.value.name && 
         newVariable.value.value && 
         !hasVariableName(newVariable.value.name) &&
         validateVariable()
})

// 验证变量值
function validateVariable(): boolean {
  if (newVariable.value.type === 'number') {
    return !isNaN(Number(newVariable.value.value));
  } else {
    // 验证公式的合法性
    return calculateFormula(newVariable.value.value) !== null;
  }
}

// 计算公式结果
function calculateFormula(formula: string, visitedVars: Set<string> = new Set()): number | null {
  try {
    let evaluatedFormula = formula;
    
    // 创建一个变量名数组，按长度降序排序，避免部分匹配问题
    const variableNames = [
      ...customVariables.value.map(v => v.name),
      ...systemVariables.value.map(v => v.name)
    ].sort((a, b) => b.length - a.length);

    // 检查变量名是否都是合法的
    const allVariables = formula.match(/[a-zA-Z_]\w*/g) || [];
    const isValidVariables = allVariables.every(v => 
      variableNames.includes(v) || !isNaN(Number(v))
    );
    
    if (!isValidVariables) {
      return null;
    }

    // 替换自定义变量
    for (const v of customVariables.value) {
      const regex = new RegExp(`\\b${v.name}\\b`, 'g');
      if (evaluatedFormula.match(regex)) {
        // 检测循环引用
        if (visitedVars.has(v.name)) {
          throw new Error('Circular reference detected');
        }
        visitedVars.add(v.name);

        if (v.type === 'number') {
          evaluatedFormula = evaluatedFormula.replace(regex, v.value);
        } else {
          // 如果是公式类型，递归计算其值
          const value = calculateFormula(v.value, visitedVars);
          if (value === null) throw new Error('Invalid formula');
          evaluatedFormula = evaluatedFormula.replace(regex, value.toString());
        }
      }
    }
    
    // 替换系统变量
    for (const v of systemVariables.value) {
      const regex = new RegExp(`\\b${v.name}\\b`, 'g');
      evaluatedFormula = evaluatedFormula.replace(regex, '100'); // 使用模拟值
    }
    
    // 检查是否还有未替换的变量
    if (/[a-zA-Z_]\w*/.test(evaluatedFormula)) {
      return null;
    }
    
    // 计算最终结果
    const result = eval(evaluatedFormula);
    return isNaN(result) ? null : Number(result);
  } catch (error) {
    console.error('Formula calculation error:', error);
    return null;
  }
}

// 在临时公式中插入变量或运算符
function insertToTempFormula(text: string) {
  tempFormula.value += text
}

// 确认公式
function confirmFormula() {
  if (calculateFormula(tempFormula.value) === null) {
    ElMessage.error('公式格式不正确')
    return
  }
  
  newVariable.value.value = tempFormula.value
  showFormulaDialog.value = false
  tempFormula.value = ''
}

// 运算符
const operators = ['+', '-', '*', '/', '(', ')']

// 公式内容
const formula = ref('')

// 已保存的公式
const savedFormulas = ref<string[]>([])

// 检查变量名是否已存在
function hasVariableName(name: string): boolean {
  return systemVariables.value.some(v => v.name === name) ||
         customVariables.value.some(v => v.name === name)
}

// 添加自定义变量
function addCustomVariable() {
  if (!canAddVariable.value) {
    ElMessage.warning('变量名已存在或输入不完整')
    return
  }
  
  customVariables.value.push({
    name: newVariable.value.name,
    value: newVariable.value.value,
    type: newVariable.value.type as "number" | "formula"
  })
  
  newVariable.value = { name: '', value: '', type: 'number' }
  ElMessage.success('变量添加成功')
}

// 删除自定义变量
function deleteVariable(variable: {name: string, value: string}) {
  const index = customVariables.value.findIndex(v => v.name === variable.name)
  if (index > -1) {
    customVariables.value.splice(index, 1)
    ElMessage.success('变量删除成功')
  }
}

// 插入变量到公式
function insertVariable(variable: {name: string}) {
  formula.value += variable.name
}

// 插入运算符
function insertOperator(op: string) {
  formula.value += op
}

// 保存公式
function saveFormula() {
  const trimmedFormula = formula.value.trim();
  if (!trimmedFormula) {
    ElMessage.warning('公式不能为空');
    return;
  }
  
  if (!validateBrackets(trimmedFormula)) {
    ElMessage.error('括号不匹配');
    return;
  }
  
  if (!validateOperators(trimmedFormula)) {
    ElMessage.error('运算符使用不正确');
    return;
  }
  
  const result = calculateFormula(trimmedFormula);
  if (result === null) {
    ElMessage.error('公式格式不正确或包含未定义的变量');
    return;
  }
  
  savedFormulas.value.push(trimmedFormula);
  ElMessage.success('公式保存成功');
  formula.value = '';
}

// 删除已保存的公式
function deleteFormula(index: number) {
  savedFormulas.value.splice(index, 1)
  ElMessage.success('公式删除成功')
}

// 清空当前公式
function clearFormula() {
  formula.value = ''
}

function selectSavedFormula(savedFormula: string) {
  tempFormula.value = savedFormula;
}

// 验证公式的括号匹配
function validateBrackets(formula: string): boolean {
  const stack: string[] = [];
  
  for (const char of formula) {
    if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      if (stack.length === 0) return false;
      stack.pop();
    }
  }
  
  return stack.length === 0;
}

// 验证运算符使用是否正确
function validateOperators(formula: string): boolean {
  // 去除所有空格
  const trimmed = formula.replace(/\s/g, '');
  
  // 检查是否以运算符开头或结尾
  if (/^[+\-*\/]|[+\-*\/]$/.test(trimmed)) return false;
  
  // 检查是否有连续的运算符
  if (/[+\-*\/]{2,}/.test(trimmed)) return false;
  
  // 检查括号后面是否直接跟运算符
  if (/\([+\-*\/]/.test(trimmed)) return false;
  
  // 检查运算符后面是否直接跟右括号
  if (/[+\-*\/]\)/.test(trimmed)) return false;
  
  // 检查变量名是否合法
  const variables = trimmed.match(/[a-zA-Z_]\w*/g) || [];
  const allVariables = [
    ...customVariables.value.map(v => v.name),
    ...systemVariables.value.map(v => v.name)
  ];
  
  return variables.every(v => allVariables.includes(v));
}

const tradeVariables = ref({
  openPrice: '',
  closePrice: ''
})

// 在 script setup 中添加提交函数
async function submitTradeVariables() {
  try {
    const payload = {
      customVariables: customVariables.value,
      openPrice: tradeVariables.value.openPrice,
      closePrice: tradeVariables.value.closePrice
    }
    
    await fetch('/test/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    ElMessage.success('提交成功');
  } catch (error) {
    console.error('Submit error:', error);
    ElMessage.error('提交失败');
  }
}

function goToVerify() {
  router.push({
    path: '/verify',
    query: {
      state: encodeURIComponent(JSON.stringify({
        customVariables: customVariables.value,
        openPrice: tradeVariables.value.openPrice,
        closePrice: tradeVariables.value.closePrice
      }))
    }
  })
}
</script>

<style scoped lang="scss">
.formula-container {
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  min-height: 100%;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 80px;
  width: 100%;
  
  .variable-panel {
    width: 400px;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    
    .panel-section {
      margin-bottom: 20px;
      
      h3 {
        margin-bottom: 16px;
        color: #333;
      }
    }
    
    .variable-list {
      .variable-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #f5f7fa;
        margin-bottom: 8px;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background: #ecf5ff;
        }
        
        .name {
          font-weight: bold;
          margin-right: 8px;
        }
        
        .desc, .value {
          color: #666;
          font-size: 12px;
        }
        
        .delete-icon {
          margin-left: auto;
          color: #f56c6c;
        }
      }
    }
    
    .add-variable {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
  }
  
  .formula-editor {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    
    .editor-header {
      margin-bottom: 16px;
      
      .operator-buttons {
        margin-top: 12px;
        display: flex;
        gap: 8px;
      }
    }
    
    .editor-footer {
      margin-top: 16px;
      display: flex;
      gap: 12px;
    }
    
    .saved-formulas {
      margin-top: 24px;
      
      h3 {
        margin-bottom: 16px;
        color: #333;
      }
      
      .formula-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background: #f5f7fa;
        margin-bottom: 8px;
        border-radius: 4px;
        
        .formula-text {
          flex: 1;
        }
        
        .delete-icon {
          color: #f56c6c;
          cursor: pointer;
        }
      }
    }
  }
}

.formula-dialog-content {
  .variables-section {
    margin-bottom: 16px;
    
    h4 {
      margin-bottom: 8px;
    }
    
    .available-variables {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
  
  .variable-chip, .operator-chip {
    padding: 4px 8px;
    background: #f0f0f0;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: #e0e0e0;
    }
  }
  
  .operators-section {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .preview-section {
    margin-top: 12px;
    padding: 8px;
    background: #f5f7fa;
    border-radius: 4px;
  }
}

.variable-item {
  .type-tag {
    padding: 2px 6px;
    background: #e6f4ff;
    border-radius: 4px;
    font-size: 12px;
    margin: 0 8px;
  }
  
  .preview {
    color: #666;
    font-size: 12px;
    margin-left: 8px;
  }
}

.formula-input {
  flex: 1;
  
  .preview {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }
}

.saved-formulas-section {
  margin-bottom: 16px;
  
  .saved-formulas-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .formula-chip {
    padding: 4px 8px;
    background: #f0f0f0;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: #e0e0e0;
    }
  }
}

.formula-select {
  flex: 1;
  
  :deep(.formula-preview) {
    margin-left: 8px;
    color: #666;
    font-size: 12px;
  }
}

.trade-variables-footer {
  position: absolute;
  bottom: 100px;
  left: -20px;
  width: 100%;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  z-index: 100;

  .trade-variables-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    .variables-section {
      flex: 1;
      display: flex;
      gap: 32px;

      .trade-variable-item {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;

        .label {
          font-weight: 500;
          color: #333;
          white-space: nowrap;
        }

        .price-select {
          width: 240px;
        }

        .preview {
          min-width: 60px;
          color: #67C23A;
          font-weight: 500;
        }
      }
    }

    .submit-section {
      padding-left: 20px;
      border-left: 1px solid #dcdfe6;
      display: flex;
      gap: 12px;
    }
  }
}
</style>


