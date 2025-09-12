import { Skeleton } from "./skeleton";

// Individual form field skeleton
export function FormFieldSkeleton({ labelWidth = "w-24" }: { labelWidth?: string}) {
    return (
        <div className="space-y-2">
            <Skeleton className={`h-5 ${labelWidth}`}/>
            <Skeleton className="h-11 w-full"/>
        </div>
    )
}

// 2-column form field row skeleton
export function FormFieldRowSkeleton({
    leftLabelWidth = "w-24",
    rightLabelWidth = "w-24",
} : {
    leftLabelWidth?: string
    rightLabelWidth?: string
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldSkeleton labelWidth={leftLabelWidth}/>
            <FormFieldSkeleton labelWidth={rightLabelWidth}/>
        </div>
    )
}

// Checkbox field skeleton
export function CheckboxFieldSkeleton({
    labelWidth = "w-24",
    descriptionWidth = "w-80"
} : {
    labelWidth?: string
    descriptionWidth?: string
}) {
    return (
        <div className="flex items-start space-x-3">
            <Skeleton className="h-4 w-4 mt-1"/>
            <div className="space-y-2 flex-1">
                <Skeleton className={`h-5 ${labelWidth}`}/>
                <Skeleton className={`h-4 ${descriptionWidth}`}/>
            </div>
        </div>
    )
}

// Multiple checkbox field skeleton
export function CheckboxFieldsSkeleton({
    count = 2,
    labelWidths = ["w-24", "w-16"],
    descriptionWidths = ["w-48", "w-80"]
} : {
    count?: number
    labelWidths?: string[]
    descriptionWidths?: string[]
}) {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: count}).map((_, index) => (
                <CheckboxFieldSkeleton
                    key={index}
                    labelWidth={labelWidths[index] || "w-24"}
                    descriptionWidth={descriptionWidths[index] || "w-80"}
                />
            ))}
        </div>
    )
}

// Submit button skeleton
export function SubmitButtonSkeleton() {
    return <Skeleton className="h-11 w-11"/>
}

// Complete form skeleton with customizable fields
export function FormSkeleton({
    fields = [],
    checkboxFields = [],
    showSubmitButton = true
} : {
    fields?: Array<{
        type: 'single' | 'row'
        leftLabelWidth?: string
        rightLabelWidth?: string
    }>
    checkboxFields?: Array<{
        labelWidth?: string
        descriptionWidth?: string
    }>
    showSubmitButton?: boolean
}) {
    return (
        <div className="space-y-6">
            {fields.map((field, index) => (
                <div key={index}>
                    {field.type === 'single' ? (
                        <FormFieldSkeleton labelWidth={field.leftLabelWidth}/>
                    ) : (
                        <FormFieldRowSkeleton 
                            leftLabelWidth={field.leftLabelWidth}
                            rightLabelWidth={field.rightLabelWidth}
                        />
                    )}
                </div>
            ))}

            {checkboxFields.length > 0 && (
                <div className="flex flex-col gap-3">
                    {checkboxFields.map((checkbox, index) => (
                        <CheckboxFieldSkeleton
                            key={index}
                            labelWidth={checkbox.labelWidth}
                            descriptionWidth={checkbox.descriptionWidth}
                        />
                    ))}
                </div>
            )}
            
            {showSubmitButton && <SubmitButtonSkeleton />}
        </div>
    )
}

// Player form field skeleton
export function PlayerFormSkeleton() {
    return (
        <FormSkeleton
            fields={[
                { type: 'row', leftLabelWidth: 'w-16', rightLabelWidth: 'w-24' }, // Name and Last Name
                { type: 'row', leftLabelWidth: 'w-36', rightLabelWidth: 'w-28' }, // Birthdate and Overall
                { type: 'row', leftLabelWidth: 'w-20', rightLabelWidth: 'w-28' }, // Salary and Owner Club
                { type: 'row', leftLabelWidth: 'w-28', rightLabelWidth: 'w-0' },  // Actual Club
                { type: 'row', leftLabelWidth: 'w-32', rightLabelWidth: 'w-36' }, // Sofifa ID and Transfermarkt ID
            ]}
            checkboxFields={[
            { labelWidth: 'w-24', descriptionWidth: 'w-48' }, // isKempesita
            { labelWidth: 'w-16', descriptionWidth: 'w-80' }, // isActive
            ]}
        />
    )
}

// Club form field skeleton
export function ClubFormSkeleton() {
    return (
        <FormSkeleton
            fields={[
                { type: 'single', leftLabelWidth: 'w-24' }, // Club Name
                { type: 'single', leftLabelWidth: 'w-32' }, // Club Logo URL
                { type: 'single', leftLabelWidth: 'w-28' }, // Club Owner
            ]}
            checkboxFields={[
                { labelWidth: 'w-32', descriptionWidth: 'w-80' }, // isActive
            ]}
        />
    )
}

// Table skeleton for player list
export function PlayerTableSkeleton({ rows = 11 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-3 border-b">
                    <div className="grid grid-cols-9 gap-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-18" />
                        <Skeleton className="h-4 w-18" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                </div>

                {/* Table Rows */}
                {Array.from({ length: rows }).map((_, index) => (
                    <div key={index} className="px-6 py-4 border-b last:border-b-0">
                        <div className="grid grid-cols-9 gap-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-18" />
                            <Skeleton className="h-4 w-18" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Table skeleton for club list and user list
export function ClubAndUserTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            
            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-3 border-b">
                <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                </div>
            </div>
            
            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="px-6 py-4 border-b last:border-b-0">
                <div className="grid grid-cols-4 gap-4 items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-6 rounded" />
                </div>
                </div>
            ))}
            </div>
        </div>
    )
  }