// src/routes/management/components/FormDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type React from 'react'
import type { ReactNode } from 'react'

interface FormDialogProps {
  title: string
  description: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  trigger?: ReactNode
}

export function FormDialog({ title, description, open, onOpenChange, children, trigger }: FormDialogProps) {
  const DialogWrapper = ({ children: dialogChildren }: { children: React.ReactNode }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {dialogChildren}
      </DialogContent>
    </Dialog>
  )

  return <DialogWrapper>{children}</DialogWrapper>
}
