"use client"

import { useStore } from "@/lib/store"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useStore((state) => state.theme);

  return (
    <Sonner
      theme={theme === 'dark' ? 'dark' : 'light'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/30 dark:group-[.toaster]:bg-gray-800/20 group-[.toaster]:text-gray-900 dark:group-[.toaster]:text-white group-[.toaster]:border-black/5 dark:group-[.toaster]:border-white/5 group-[.toaster]:shadow-soft backdrop-blur-xl",
          description: "group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-accent-blue group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-200/50 group-[.toast]:text-gray-700 dark:group-[.toast]:bg-gray-700/50 dark:group-[.toast]:text-gray-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
