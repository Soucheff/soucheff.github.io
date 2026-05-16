import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
        background: 'var(--color-surface)',
      }}
    >
      <button
        type="button"
        onClick={() => setCount((c) => c - 1)}
        aria-label="decrement"
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.375rem',
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
          cursor: 'pointer',
        }}
      >
        −
      </button>
      <output
        style={{
          minWidth: '3ch',
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 600,
          color: 'var(--color-text)',
        }}
      >
        {count}
      </output>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        aria-label="increment"
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.375rem',
          border: '1px solid var(--color-border)',
          background: 'var(--color-primary)',
          color: 'var(--color-primary-fg)',
          cursor: 'pointer',
        }}
      >
        +
      </button>
    </div>
  );
}
