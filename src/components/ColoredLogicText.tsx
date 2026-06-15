import { useContext, type ReactNode } from 'react'
import { LogicColorizationContext } from './logicColorization'

type ColoredLogicTextProps = {
  text: string
  standaloneTerm?: boolean
  colorIndex?: number
}

const TERM_PATTERN = /(\?[A-Za-z_][A-Za-z0-9_]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_][A-Za-z0-9_]*|-?\d+(?:\.\d+)?)/g

const TERM_COLORS = [
  { text: '#a0006d', background: '#ffc4ea' },
  { text: '#0756a3', background: '#b9dcff' },
  { text: '#a13c00', background: '#ffd2ad' },
  { text: '#b42318', background: '#ffc7c2' },
  { text: '#5b21b6', background: '#dec9ff' },
  { text: '#6f3f17', background: '#e7c8aa' },
  { text: '#334155', background: '#d5dbe3' },
] as const

function colorForIndex(index: number) {
  return TERM_COLORS[index % TERM_COLORS.length]
}

function isPredicateName(text: string, end: number) {
  return text.slice(end).trimStart().startsWith('(')
}

function ColoredTerm({ term, colorIndex }: Readonly<{ term: string; colorIndex: number }>) {
  const mode = useContext(LogicColorizationContext)
  const color = colorForIndex(colorIndex)
  return (
    <span
      style={{
        color: color.text,
        backgroundColor: mode === 'background' ? color.background : undefined,
        borderRadius: mode === 'background' ? 3 : undefined,
        boxShadow: mode === 'background' ? `0 0 0 2px ${color.background}` : undefined,
      }}
    >
      {term}
    </span>
  )
}

export default function ColoredLogicText({
  text,
  standaloneTerm = false,
  colorIndex = 0,
}: Readonly<ColoredLogicTextProps>) {
  if (standaloneTerm) {
    return <ColoredTerm term={text} colorIndex={colorIndex} />
  }

  const parts: ReactNode[] = []
  const argumentIndexes: number[] = []
  let cursor = 0

  for (const match of text.matchAll(TERM_PATTERN)) {
    const start = match.index
    const end = start + match[0].length
    const precedingText = text.slice(cursor, start)

    parts.push(precedingText)
    for (const character of precedingText) {
      if (character === '(') {
        argumentIndexes.push(0)
      } else if (character === ',' && argumentIndexes.length > 0) {
        argumentIndexes[argumentIndexes.length - 1] += 1
      } else if (character === ')') {
        argumentIndexes.pop()
      }
    }

    const term = match[0]
    parts.push(
      argumentIndexes.length > 0 && !isPredicateName(text, end)
        ? <ColoredTerm
            key={`${start}-${term}`}
            term={term}
            colorIndex={argumentIndexes[argumentIndexes.length - 1]}
          />
        : term
    )
    cursor = end
  }

  parts.push(text.slice(cursor))
  return <>{parts}</>
}
