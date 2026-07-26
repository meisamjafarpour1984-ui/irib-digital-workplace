'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onSelect?: (item: string) => void
  suggestions?: string[]
  recentSearches?: string[]
  className?: string
}

export function SearchBar({
  placeholder = 'جستجو...',
  onSearch,
  onSelect,
  suggestions = [],
  recentSearches = [],
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    onSearch?.(debouncedQuery)
  }, [debouncedQuery, onSearch])

  const filteredSuggestions = query ? suggestions.filter((s) => s.includes(query)) : recentSearches

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      onSelect?.(filteredSuggestions[selectedIndex])
      setIsOpen(false)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search
          className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-input bg-card py-2.5 pr-10 pl-9 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          aria-label={placeholder}
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="پاک کردن"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <ul
          className="absolute inset-x-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-border bg-card shadow-lg"
          role="listbox"
        >
          {!query && recentSearches.length > 0 && (
            <li className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
              جستجوهای اخیر
            </li>
          )}
          {filteredSuggestions.map((item, i) => (
            <li
              key={item}
              onMouseDown={() => onSelect?.(item)}
              className={cn(
                'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors',
                i === selectedIndex ? 'bg-brand/5 text-brand' : 'text-foreground hover:bg-muted'
              )}
              role="option"
              aria-selected={i === selectedIndex}
            >
              {query ? (
                <TrendingUp className="size-3.5 text-muted-foreground" aria-hidden />
              ) : (
                <Clock className="size-3.5 text-muted-foreground" aria-hidden />
              )}
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
