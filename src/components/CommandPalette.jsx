import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Command, CornerDownLeft, Search } from 'lucide-react'

export default function CommandPalette({ social, resume }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const commands = useMemo(() => [
    { label: 'Home', meta: 'Navigate', target: 'home' },
    { label: 'About', meta: 'Navigate', target: 'about' },
    { label: 'Skills', meta: 'Navigate', target: 'skills' },
    { label: 'Projects', meta: 'Navigate', target: 'projects' },
    { label: 'Experience', meta: 'Navigate', target: 'experience' },
    { label: 'Education', meta: 'Navigate', target: 'experience' },
    { label: 'LeetCode', meta: 'Open profile', href: social.leetcode },
    { label: 'GitHub', meta: 'Open profile', href: social.github },
    { label: 'Resume', meta: 'Open resume PDF', href: resume },
    { label: 'Contact', meta: 'Navigate', target: 'contact' },
    { label: 'Open LinkedIn', meta: 'Open profile', href: social.linkedin },
    { label: 'Contact Me', meta: 'Navigate', target: 'contact' },
  ], [resume, social])
  const filteredCommands = useMemo(() => commands.filter((command) => `${command.label} ${command.meta}`.toLowerCase().includes(query.toLowerCase())), [commands, query])
  const activeIndex = Math.min(selectedIndex, Math.max(filteredCommands.length - 1, 0))

  const close = () => { setIsOpen(false); setQuery(''); setSelectedIndex(0) }
  const run = (command) => {
    if (command.href) window.open(command.href, '_blank', 'noopener,noreferrer')
    if (command.target) document.getElementById(command.target)?.scrollIntoView({ behavior: 'smooth' })
    close()
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setIsOpen(true) }
      if (event.key === 'Escape' && isOpen) close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) window.requestAnimationFrame(() => inputRef.current?.focus())
  }, [isOpen])

  const handleInputKeyDown = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setSelectedIndex((index) => (index + 1) % Math.max(filteredCommands.length, 1)) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setSelectedIndex((index) => (index - 1 + filteredCommands.length) % Math.max(filteredCommands.length, 1)) }
    if (event.key === 'Enter' && filteredCommands[activeIndex]) { event.preventDefault(); run(filteredCommands[activeIndex]) }
  }

  return <AnimatePresence>{isOpen && <motion.div className="command-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
    <motion.section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title" initial={{ opacity: 0, y: -14, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .98 }}>
      <div className="command-header"><Command size={16} /><span id="command-title">Command palette</span><kbd>ESC</kbd></div>
      <label className="command-search"><Search size={17} /><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setSelectedIndex(0) }} onKeyDown={handleInputKeyDown} placeholder="Search pages and actions..." aria-label="Search commands" /></label>
      <div className="command-list" role="listbox" aria-label="Portfolio commands">{filteredCommands.length ? filteredCommands.map((command, index) => <button type="button" role="option" aria-selected={index === activeIndex} className={index === activeIndex ? 'is-selected' : ''} key={`${command.label}-${command.meta}`} onMouseEnter={() => setSelectedIndex(index)} onClick={() => run(command)}><span><strong>{command.label}</strong><small>{command.meta}</small></span>{command.href ? <ArrowUpRight size={15} /> : <CornerDownLeft size={15} />}</button>) : <p className="command-empty">No matching commands.</p>}</div>
      <div className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>ENTER</kbd> select</span><span><kbd>ESC</kbd> close</span></div>
    </motion.section>
  </motion.div>}</AnimatePresence>
}
