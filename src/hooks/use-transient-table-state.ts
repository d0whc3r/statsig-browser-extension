import { useState } from 'react'

export const useTransientTableState = () => {
  const [page, setPage] = useState(1)

  return {
    page,
    setPage,
  }
}
