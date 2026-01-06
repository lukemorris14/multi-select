'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { List, AutoSizer } from 'react-virtualized';
import Fuse from 'fuse.js';
import './MultiSelect.css';

export interface MultiSelectItem {
  id: string;
  label: string;
  group?: string;
}

export interface MultiSelectProps {
  items: MultiSelectItem[];
  selectedIds: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
  placeholder?: string;
  maxHeight?: number;
  itemHeight?: number;
}

export function MultiSelect({
  items,
  selectedIds,
  onSelectionChange,
  placeholder = 'Search items...',
  maxHeight = 400,
  itemHeight = 40,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusedChipIndex, setFocusedChipIndex] = useState<number>(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  
  const selectedItems = useMemo(
    () => items.filter(item => selectedIds.has(item.id)),
    [items, selectedIds]
  );
  
  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: ['label', 'group'],
      threshold: 0.3,
      includeScore: true,
    });
  }, [items]);
  
  const orderedItems = useMemo(() => {
    const selected: MultiSelectItem[] = [];
    const unselected: MultiSelectItem[] = [];
    
    for (const item of items) {
      if (selectedIds.has(item.id)) {
        selected.push(item);
      } else {
        unselected.push(item);
      }
    }
    
    if (searchQuery.trim()) {
      const fuseResults = fuse.search(searchQuery);
      const searchedItems = fuseResults
        .map(result => result.item)
        .filter(item => !selectedIds.has(item.id));
      return [...selected, ...searchedItems];
    }
    
    return [...selected, ...unselected];
  }, [items, selectedIds, searchQuery, fuse]);

  const toggleItem = useCallback((id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {

      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  }, [selectedIds, onSelectionChange]);

  const removeItem = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newSelection = new Set(selectedIds);
    newSelection.delete(id);
    onSelectionChange(newSelection);
  }, [selectedIds, onSelectionChange]);

  const clearAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(new Set());
    setIsOpen(false);
  }, [onSelectionChange]);

  const scrollToIndex = useCallback((index: number) => {
    if (listRef.current) {
      listRef.current.scrollToRow(index);
    }
  }, []);

  const handleMouseEnter = useCallback((index: number) => {
    requestAnimationFrame(() => {
      setFocusedIndex(index);
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!searchQuery) {
      if (e.key === 'ArrowLeft' && selectedItems.length > 0) {
        e.preventDefault();
        setFocusedChipIndex(selectedItems.length - 1);
        return;
      }
      if (e.key === 'Backspace' && selectedItems.length > 0 && !isOpen) {
        e.preventDefault();
        removeItem(selectedItems[selectedItems.length - 1].id);
        return;
      }
    }
    
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
        inputRef.current?.focus();
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, orderedItems.length - 1));
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
        
      case 'Enter':
        e.preventDefault();
        if (orderedItems[focusedIndex]) {
          toggleItem(orderedItems[focusedIndex].id);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, orderedItems, focusedIndex, toggleItem, scrollToIndex, searchQuery, selectedItems, removeItem]);

  const handleChipKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedChipIndex(-1);
        inputRef.current?.focus();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          setFocusedChipIndex(index - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index < selectedItems.length - 1) {
          setFocusedChipIndex(index + 1);
        } else {
          setFocusedChipIndex(-1);
          inputRef.current?.focus();
        }
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        const item = selectedItems[index];
        removeItem(item.id);
        if (index > 0) {
          setFocusedChipIndex(index - 1);
        } else {
          setFocusedChipIndex(-1);
          inputRef.current?.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setFocusedChipIndex(-1);
        inputRef.current?.focus();
        break;
    }
  }, [selectedItems, removeItem, isOpen]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as Node;
    if (dropdownRef.current && !dropdownRef.current.contains(relatedTarget)) {
      setIsOpen(false);
      setFocusedChipIndex(-1);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    setFocusedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToRow(focusedIndex);
      });
    }
  }, [focusedIndex, isOpen]);

  useEffect(() => {
    if (focusedChipIndex >= 0 && containerRef.current) {
      const chips = containerRef.current.querySelectorAll('.multi-select__chip');
      const chip = chips[focusedChipIndex] as HTMLElement;
      if (chip) {
        chip.focus();
      }
    }
  }, [focusedChipIndex]);
  
  return (
    <div ref={dropdownRef} className="multi-select" onBlur={handleBlur}>
      <div
        ref={containerRef}
        className="multi-select__container"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? "multiselect-listbox" : undefined}
        aria-label="Multi-select dropdown"
      >
        <div className="multi-select__chips">
          {selectedItems.map((item, index) => (
            <div
              key={item.id}
              className={`multi-select__chip ${
                focusedChipIndex === index ? 'multi-select__chip--focused' : ''
              }`}
              tabIndex={focusedChipIndex === index ? 0 : -1}
              onKeyDown={(e) => handleChipKeyDown(e, index)}
              onFocus={() => setFocusedChipIndex(index)}
              onClick={() => setFocusedChipIndex(index)}
            >
              <span className="multi-select__chip-label">{item.label}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id, e);
                }}
                className="multi-select__chip-remove"
                aria-label={`Remove ${item.label}`}
                tabIndex={-1}
              >
                <svg className="multi-select__chip-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setFocusedChipIndex(-1);
              setIsOpen(true);
            }}
            className="multi-select__input"
            placeholder={selectedItems.length === 0 ? placeholder : ''}
            aria-label="Search items"
            aria-autocomplete="list"
            aria-controls={isOpen ? "multiselect-listbox" : undefined}
            aria-activedescendant={isOpen ? `option-${focusedIndex}` : undefined}
          />

          {selectedItems.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              onFocus={() => setIsOpen(false)}
              className="multi-select__clear"
              aria-label="Clear all selections"
            >
              <svg className="multi-select__clear-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownListRef}
          className="multi-select__dropdown"
          role="listbox"
          id="multiselect-listbox"
          aria-label="Available items"
          aria-multiselectable="true"
          aria-activedescendant={`option-${focusedIndex}`}
          onKeyDown={handleKeyDown}
        >
          <div style={{ height: `${maxHeight}px` }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  ref={listRef}
                  height={height}
                  width={width}
                  rowCount={orderedItems.length}
                  rowHeight={itemHeight}
                  tabIndex={-1}
                  className="multi-select__list"
                  rowRenderer={({ index, key, style }) => {
                    const item = orderedItems[index];
                    if (!item) return null;
                    
                    const isSelected = selectedIds.has(item.id);
                    const isFocused = index === focusedIndex;
                    
                    return (
                      <div
                        key={key}
                        id={`option-${index}`}
                        role="option"
                        aria-selected={isSelected}
                        style={style}
                        className={`multi-select__option ${
                          isFocused ? 'multi-select__option--focused' : ''
                        } ${isSelected ? 'multi-select__option--selected' : ''}`}
                        onClick={() => toggleItem(item.id)}
                        onMouseEnter={() => handleMouseEnter(index)}
                      >
                        <div className="multi-select__option-content">
                          <div className="multi-select__option-label">{item.label}</div>
                          {item.group && (
                            <div className="multi-select__option-group">{item.group}</div>
                          )}
                        </div>
                        {isSelected && (
                          <svg
                            className="multi-select__option-check"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    );
                  }}
                  overscanRowCount={3}
                />
              )}
            </AutoSizer>
          </div>

          <div className="multi-select__footer">
            {selectedItems.length > 0 && `${selectedItems.length} selected · `}
            {orderedItems.length.toLocaleString()} items
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      )}
    </div>
  );
}
