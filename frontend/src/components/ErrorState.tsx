import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <div className="flex items-center gap-2 font-medium text-destructive">
        <TriangleAlert className="size-5" aria-hidden />
        Something went wrong
      </div>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      {onRetry && (
        <Button variant="outline" className="rounded-full" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
