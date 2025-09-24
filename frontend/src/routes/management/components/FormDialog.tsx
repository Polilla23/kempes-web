// src/routes/management/components/FormDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { ReactNode } from 'react'
import { useFormDialog } from '../hooks/useFormDialog'

interface FormDialogProps {
  title: string
  description: string
  open: boolean
  // onOpenChange: () => void
  children: ReactNode
  trigger?: ReactNode
}

export function FormDialog({ title, description, children, trigger }: FormDialogProps) {
  const { isOpen } = useFormDialog()
  const DialogWrapper = ({ children: dialogChildren }: { children: ReactNode }) => (
    <Dialog open={isOpen}>
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
