import { defineStore } from 'pinia'

interface CustomVariable {
  name: string;
  value: string;
}

interface TradeVariables {
  openPrice: string;
  closePrice: string;
}

export const useFormulaStore = defineStore('formula', {
  state: () => ({
    customVariables: [] as CustomVariable[],
    savedFormulas: [] as string[],
    tradeVariables: {
      openPrice: '',
      closePrice: ''
    } as TradeVariables
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