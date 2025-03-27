import { defineStore } from 'pinia'

interface CustomVariable {
  name: string;
  value: string;
  type: 'number' | 'formula';
}

export const useFormulaStore = defineStore('formula', {
  state: () => ({
    customVariables: [] as CustomVariable[],
    savedFormulas: [] as string[],
    tradeVariables: {
      openPrice: '',
      closePrice: ''
    }
  }),
  
  actions: {
    setCustomVariables(variables: CustomVariable[]) {
      this.customVariables = variables
    },
    setSavedFormulas(formulas: string[]) {
      this.savedFormulas = formulas
    },
    setTradeVariables(openPrice: string, closePrice: string) {
      this.tradeVariables = { openPrice, closePrice }
    }
  }
}) 