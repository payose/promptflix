import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-white group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-amber-500 group-[.toast]:text-black",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300",
          error: "group-[.toast]:bg-red-500/10 group-[.toast]:border-red-500/50 group-[.toast]:text-red-200",
          success: "group-[.toast]:bg-green-500/10 group-[.toast]:border-green-500/50 group-[.toast]:text-green-200",
          warning: "group-[.toast]:bg-amber-500/10 group-[.toast]:border-amber-500/50 group-[.toast]:text-amber-200",
          info: "group-[.toast]:bg-blue-500/10 group-[.toast]:border-blue-500/50 group-[.toast]:text-blue-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
