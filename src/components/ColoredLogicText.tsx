import { useContext, type ReactNode } from 'react'
import { LOGIC_COLORIZATION_MODES, LogicColorizationContext } from './logicColorization'

type ColoredLogicTextProps = {
  text: string
  standaloneTerm?: boolean
  colorIndex?: number
}

const TERM_PATTERN = /(\?[A-Za-z_][A-Za-z0-9_]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_][A-Za-z0-9_]*|-?\d+(?:\.\d+)?)/g

const TERM_COLORS = [
  '#8f86bf',
  '#d95f55',
  '#1f9e89',
  '#2f7fb8',
  '#d6811c',
  '#6fa632',
  '#d66aa7',
  '#7f7f7f',
  '#9b5aa3',
  '#6faa65',
  '#c7a600',
] as const

// const TERM_COLORS = [
// '#8dd3c7',
// '#ffffb3',
// '#bebada',
// '#fb8072',
// '#80b1d3',
// '#fdb462',
// '#b3de69',
// '#fccde5',
// '#d9d9d9',
// '#bc80bd',
// '#ccebc5',
// '#ffed6f',
// ] as const


const CODE_COLORS = {
  rule: '#0000ff',
  parameter: '#008000',
  constant: '#800000',
} as const

function colorForIndex(index: number) {
  return TERM_COLORS[index % TERM_COLORS.length]
}

function isPredicateName(text: string, end: number) {
  return text.slice(end).trimStart().startsWith('(')
}

function codeColorForTerm(term: string, isRule: boolean) {
  if (isRule) {
    return CODE_COLORS.rule
  }
  if (term.startsWith('?')) {
    return CODE_COLORS.parameter
  }
  return CODE_COLORS.constant
}

function ColoredTerm({ term, colorIndex }: Readonly<{ term: string; colorIndex: number }>) {
  const mode = useContext(LogicColorizationContext)
  if (mode === LOGIC_COLORIZATION_MODES.none) {
    return term
  }

  return (
    <span
      style={{
        color: mode === LOGIC_COLORIZATION_MODES.code ? codeColorForTerm(term, false) : colorForIndex(colorIndex),
      }}
    >
      {term}
    </span>
  )
}

function ColoredCodeToken({ term, isRule }: Readonly<{ term: string; isRule: boolean }>) {
  const mode = useContext(LogicColorizationContext)
  if (mode !== LOGIC_COLORIZATION_MODES.code) {
    return term
  }

  return <span style={{ color: codeColorForTerm(term, isRule) }}>{term}</span>
}

export default function ColoredLogicText({
  text,
  standaloneTerm = false,
  colorIndex = 0,
}: Readonly<ColoredLogicTextProps>) {
  const mode = useContext(LogicColorizationContext)
  if (mode === LOGIC_COLORIZATION_MODES.none) {
    return text
  }

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
    const isRule = isPredicateName(text, end)
    const shouldColorTextTerm = argumentIndexes.length > 0 && !isRule
    parts.push(
      mode === LOGIC_COLORIZATION_MODES.code
        ? <ColoredCodeToken key={`${start}-${term}`} term={term} isRule={isRule} />
        : shouldColorTextTerm
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
  return <span style={{ whiteSpace: 'pre' }}>{parts}</span>
}
