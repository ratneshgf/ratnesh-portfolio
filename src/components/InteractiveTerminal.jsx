import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Terminal as TerminalIcon } from 'lucide-react'

const commandList = ['help', 'about', 'skills', 'projects', 'contact', 'github', 'leetcode', 'resume', 'clear']

export default function InteractiveTerminal({ social, resume }) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')
  const [history, setHistory] = useState([{ type: 'system', text: 'navigation terminal ready · type help' }])
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const runCommand = (rawCommand) => {
    const command = rawCommand.trim().toLowerCase()
    if (!command) return
    if (command === 'clear') { setHistory([]); setValue(''); return }

    const nextHistory = [...history, { type: 'command', text: `> ${command}` }]
    if (command === 'help') nextHistory.push({ type: 'output', text: `available commands:\n${commandList.join('  ·  ')}` })
    else if (['about', 'skills', 'projects', 'contact'].includes(command)) { document.getElementById(command)?.scrollIntoView({ behavior: 'smooth' }); nextHistory.push({ type: 'output', text: `routing to ${command}...` }) }
    else if (command === 'github' || command === 'leetcode') { window.open(social[command], '_blank', 'noopener,noreferrer'); nextHistory.push({ type: 'output', text: `opening ${command}...` }) }
    else if (command === 'resume') { window.open(resume, '_blank', 'noopener,noreferrer'); nextHistory.push({ type: 'output', text: 'opening resume...' }) }
    else nextHistory.push({ type: 'output', text: `command not found · type help for available commands` })
    setHistory(nextHistory)
    setValue('')
  }

  return <aside className={`interactive-terminal ${isOpen ? 'is-open' : ''}`} aria-label="Interactive navigation terminal">
    <button className="terminal-toggle" type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}><span><TerminalIcon size={14} /> nav://terminal</span>{isOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</button>
    {isOpen && <div className="terminal-panel"><div className="terminal-output" aria-live="polite">{history.map((entry, index) => <p className={`terminal-line ${entry.type}`} key={`${entry.text}-${index}`}>{entry.text}</p>)}</div><form className="terminal-form" onSubmit={(event) => { event.preventDefault(); runCommand(value) }}><span>&gt;</span><input ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} aria-label="Terminal command" placeholder="type a command..." autoComplete="off" spellCheck="false" /></form></div>}
  </aside>
}
