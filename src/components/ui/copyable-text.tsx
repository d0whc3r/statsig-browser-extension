import { Check, Copy } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import { cn } from '@/src/lib/utils'

import { Button } from './button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

const COPY_TIMEOUT = 2000

interface CopyableTextProps {
  value: string
  copyValue?: string
  copyLabel?: string
  copiedLabel?: string
  containerClassName?: string
  valueClassName?: string
  buttonClassName?: string
  hideButtonUntilHover?: boolean
}

export const CopyableText = memo(
  ({
    value,
    copyValue,
    copyLabel = 'Copy',
    copiedLabel = 'Copied!',
    containerClassName,
    valueClassName,
    buttonClassName,
    hideButtonUntilHover = false,
  }: CopyableTextProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        void navigator.clipboard.writeText(copyValue || value)
        setCopied(true)
        setTimeout(() => setCopied(false), COPY_TIMEOUT)
      },
      [copyValue, value],
    )

    return (
      <div className={cn('flex items-center gap-1 min-w-0 group', containerClassName)}>
        <button type="button" className={cn('text-left', valueClassName)} onClick={handleCopy}>
          {value}
        </button>
        <TooltipProvider>
          <Tooltip open={copied}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-4 w-4 p-0 shrink-0',
                  hideButtonUntilHover && 'opacity-0 group-hover:opacity-100 transition-opacity',
                  buttonClassName,
                )}
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? copiedLabel : copyLabel}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  },
)

CopyableText.displayName = 'CopyableText'
