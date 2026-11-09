import React from 'react';

export function handleMenuKeyDown(e: React.KeyboardEvent<HTMLElement>) {
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  if (!items.length) return;
  const idx = items.indexOf(document.activeElement as HTMLElement);

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    items[(idx + 1) % items.length]?.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    items[(idx - 1 + items.length) % items.length]?.focus();
  } else if (e.key === 'Home') {
    e.preventDefault();
    items[0]?.focus();
  } else if (e.key === 'End') {
    e.preventDefault();
    items[items.length - 1]?.focus();
  } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const char = e.key.toLowerCase();
    const ordered = idx >= 0 ? [...items.slice(idx + 1), ...items.slice(0, idx + 1)] : items;
    const match = ordered.find((el) => (el.textContent || '').trim().toLowerCase().startsWith(char));
    if (match) {
      e.preventDefault();
      match.focus();
    }
  }
}

