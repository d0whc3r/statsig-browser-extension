import { Copy } from 'lucide-react'
import { memo, useCallback } from 'react'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip'
import { cn } from '@/src/lib/utils'

interface UserPropertyProps {
  label: string
  value: unknown
  isLast?: boolean
}

export const UserProperty = memo(({ label, value, isLast = false }: UserPropertyProps) => {
  const renderValue = useCallback((val: unknown) => {
    if (typeof val === 'boolean') {
      return <Badge variant={val ? 'default' : 'destructive'}>{String(val)}</Badge>
    }
    if (val === null || val === undefined) {
      return <span className="text-muted-foreground italic">null</span>
    }
    if (typeof val === 'object') {
      return (
        <div className="w-full mt-2 relative group/obj">
          <div className="bg-muted rounded-lg p-2 border overflow-hidden">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(val, undefined, 2)}
            </pre>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover/obj:opacity-100 transition-opacity">
            <CopyButton text={JSON.stringify(val, undefined, 2)} />
          </div>
        </div>
      )
    }

    const stringValue = String(val)
    return (
      <div className="flex items-center gap-2 max-w-full">
        <span className="text-sm text-foreground break-all">{stringValue}</span>
        {stringValue && <CopyButton text={stringValue} />}
      </div>
    )
  }, [])

  return (
    <div className={cn('py-3', !isLast && 'border-b')}>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 min-w-0">{renderValue(value)}</div>
      </div>
    </div>
  )
})

UserProperty.displayName = 'UserProperty'

const CopyButton = memo(({ text }: { text: string }) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text)
  }, [text])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 text-muted-foreground hover:text-primary"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

CopyButton.displayName = 'CopyButton'
