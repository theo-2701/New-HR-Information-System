/// <reference types="vite/client" />

interface Window {
  lucide: {
    createIcons: (options?: { attrs?: Record<string, unknown> }) => void
  }
}
