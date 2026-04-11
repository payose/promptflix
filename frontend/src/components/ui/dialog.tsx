import * as React from "react"
import { X } from "lucide-react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  )
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className = "" }) => {
  return (
    <div className={`fixed inset-0 overflow-y-auto ${className}`}>
      <div className="min-h-screen flex items-start justify-center p-0">
        <div className="relative bg-[#181818] w-full max-w-3xl my-0">
          {children}
        </div>
      </div>
    </div>
  )
}

const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ""
}) => {
  return <div className={`relative ${className}`}>{children}</div>
}

const DialogClose: React.FC<{ onClose: () => void; className?: string }> = ({
  onClose,
  className = ""
}) => {
  return (
    <button
      onClick={onClose}
      className={`absolute top-4 right-4 z-10 rounded-full bg-black/50 hover:bg-black/70 p-2 transition-colors ${className}`}
      aria-label="Close dialog"
    >
      <X className="h-6 w-6 text-white" />
    </button>
  )
}

export { Dialog, DialogContent, DialogHeader, DialogClose }
