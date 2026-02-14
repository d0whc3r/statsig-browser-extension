import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { memo, useCallback } from 'react'

import { Button } from '@/src/components/ui/button'

interface BottomContentProps {
  page: number
  setPage: (page: number) => void
  total: number
}

interface PageNumbersProps {
  page: number
  totalPages: number
  onPageClick: (page: number) => void
}

const PageButton = memo(
  ({
    pageNumber,
    currentPage,
    onClick,
  }: {
    pageNumber: number
    currentPage: number
    onClick: (page: number) => void
  }) => {
    const handleClick = useCallback(() => onClick(pageNumber), [onClick, pageNumber])

    return (
      <Button
        variant={pageNumber === currentPage ? 'default' : 'ghost'}
        size="icon-sm"
        onClick={handleClick}
        className={pageNumber === currentPage ? 'bg-foreground text-background' : ''}
      >
        {pageNumber}
      </Button>
    )
  },
)

PageButton.displayName = 'PageButton'

const PageNumbers = ({ page, totalPages, onPageClick }: PageNumbersProps) => {
  const pages = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(<PageButton key={i} pageNumber={i} currentPage={page} onClick={onPageClick} />)
  }

  return <div className="flex gap-1">{pages}</div>
}

const BottomContent = ({ page, setPage, total }: BottomContentProps) => {
  const totalPages = total || 1

  const handlePrevious = useCallback(() => {
    if (page > 1) {
      setPage(page - 1)
    }
  }, [page, setPage])

  const handleNext = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }, [page, totalPages, setPage])

  const handlePageClick = useCallback(
    (pageNumber: number) => {
      setPage(pageNumber)
    },
    [setPage],
  )

  return (
    <div className="flex w-full justify-center items-center gap-2">
      <Button variant="ghost" size="icon-sm" onClick={handlePrevious} disabled={page === 1}>
        <ChevronLeft />
      </Button>
      <PageNumbers page={page} totalPages={totalPages} onPageClick={handlePageClick} />
      <Button variant="ghost" size="icon-sm" onClick={handleNext} disabled={page === totalPages}>
        <ChevronRight />
      </Button>
    </div>
  )
}

export default BottomContent
