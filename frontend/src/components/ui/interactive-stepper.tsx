import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepItem {
  id: number
  label: string
  description?: string
}

interface InteractiveStepperProps {
  steps: StepItem[]
  currentStep: number
  onStepClick?: (stepId: number) => void
  className?: string
}

export function InteractiveStepper({ steps, currentStep, onStepClick, className }: InteractiveStepperProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Steps Header */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          const isClickable = step.id < currentStep && onStepClick

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step Button */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-3 transition-all',
                  isClickable && 'cursor-pointer hover:opacity-80',
                  !isClickable && 'cursor-default'
                )}
              >
                {/* Circle with number or check */}
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    isActive && 'border-primary bg-primary text-primary-foreground',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    !isActive && !isCompleted && 'border-muted-foreground bg-background text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Labels */}
                <div className="flex flex-col items-start text-left">
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isActive && 'text-primary',
                      isCompleted && 'text-primary',
                      !isActive && !isCompleted && 'text-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span
                      className={cn(
                        'text-xs transition-colors',
                        isActive && 'text-primary/80',
                        !isActive && 'text-muted-foreground'
                      )}
                    >
                      {step.description}
                    </span>
                  )}
                </div>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-[2px] flex-1 mx-4 transition-all',
                    step.id < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
