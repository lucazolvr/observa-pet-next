'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

type ToastContextValue = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, visible: true })
    timerRef.current = setTimeout(() => {
      setToast(null)
    }, 2400)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{ background: '#16233f' }}
          className="
            fixed bottom-24 left-1/2 z-50
            animate-toast-in
            -translate-x-1/2
            px-5 py-3 rounded-btn
            text-white text-sm font-medium
            shadow-card
            whitespace-nowrap
            pointer-events-none
          "
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}
