"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-3.5 text-primary" />,
        info: <InfoIcon className="size-3.5 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-3.5 text-orange-500" />,
        error: <OctagonXIcon className="size-3.5 text-red-500" />,
        loading: <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border-2 group-[.toaster]:border-border/40 group-[.toaster]:bg-card/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:shadow-2xl group-[.toaster]:p-4 group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-4 group-[.toaster]:font-sans",
          title: "group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:text-[10px] group-[.toast]:tracking-[0.2em] group-[.toast]:text-foreground group-[.toast]:leading-none group-[.toast]:mb-1",
          description: "group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:text-[8px] group-[.toast]:tracking-widest group-[.toast]:text-muted-foreground group-[.toast]:leading-relaxed",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:text-[9px] group-[.toast]:tracking-widest",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:border-primary/40 group-[.toast]:bg-primary/5",
          error: "group-[.toast]:border-red-500/40 group-[.toast]:bg-red-500/5",
          info: "group-[.toast]:border-blue-500/40 group-[.toast]:bg-blue-500/5",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
