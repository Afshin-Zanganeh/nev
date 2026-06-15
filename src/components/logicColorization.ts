import { createContext } from 'react'

export type LogicColorizationMode = 'text' | 'background'

export const LogicColorizationContext = createContext<LogicColorizationMode>('text')
