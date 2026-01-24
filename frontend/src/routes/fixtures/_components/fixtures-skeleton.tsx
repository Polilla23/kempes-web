import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FixturesSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <Card key={i} className="bg-card border-border overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="px-4 py-3 flex items-center gap-4">
                  <Skeleton className="w-6 h-6" />
                  <Skeleton className="w-20 h-4" />
                  <div className="flex-1 flex justify-end">
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="w-24 h-8 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="w-4 h-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
