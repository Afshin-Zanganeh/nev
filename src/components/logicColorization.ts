import { createContext } from 'react'

export const LOGIC_COLORIZATION_MODES = {
  none: 'none',
  text: 'text',
  code: 'code',
} as const

export type LogicColorizationMode = typeof LOGIC_COLORIZATION_MODES[keyof typeof LOGIC_COLORIZATION_MODES]

export const LogicColorizationContext = createContext<LogicColorizationMode>(LOGIC_COLORIZATION_MODES.text)
