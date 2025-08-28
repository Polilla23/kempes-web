import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InputFile ({ onFileChange, accept = ".csv" }: { onFileChange: (file: File | null) => void, accept?: string }) {
    return (
        <div className="grid w-full items-center gap-3">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
                id="csv-file"
                type="file"
                accept={accept}
                onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    onFileChange(file)
                }}
                className="cursor-pointer"
            />
        </div>
    )
}