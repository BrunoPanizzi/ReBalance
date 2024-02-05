const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const brl = brlFormatter.format

export const currencyToNumber = (currency: string): number => {
  return Number(currency.replace(/\D/g, '')) / 100
}

export const percentage = (value: number, decimalPlaces: number = 1) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
  }).format(value)

const decimalFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'decimal',
  minimumFractionDigits: 2,
})

export const decimal = decimalFormatter.format
