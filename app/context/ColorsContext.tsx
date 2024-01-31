import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { Colors } from '~/constants/availableColors'

export type ColorsContext = {
  color: Colors
  setColor: (color: Colors) => void
}

const colorsContext = createContext<ColorsContext | null>(null)

export function ColorsProvider({ children }: { children: ReactNode }) {
  const [color, setColor] = useState<Colors>('emerald')

  const changeColor = () => {
    const html = document.querySelector('html')

    if (html) {
      html.setAttribute('data-color', color)
    }
  }

  useEffect(() => {
    changeColor()
  }, [color])

  return (
    <colorsContext.Provider value={{ color, setColor }}>
      {children}
    </colorsContext.Provider>
  )
}

export function useColors() {
  const context = useContext(colorsContext)
  if (!context) {
    throw new Error('useColors must be used within a ColorsProvider')
  }
  return context
}
