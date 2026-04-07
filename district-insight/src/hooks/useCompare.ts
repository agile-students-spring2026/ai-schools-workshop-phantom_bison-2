import { useState, useCallback } from 'react'

const MAX_COMPARE = 3

interface UseCompareResult {
  selectedIds: string[]
  addDistrict: (leaid: string) => void
  removeDistrict: (leaid: string) => void
  clearAll: () => void
  isSelected: (leaid: string) => boolean
  isFull: boolean
}

export function useCompare(): UseCompareResult {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const addDistrict = useCallback((leaid: string) => {
    setSelectedIds(prev => {
      if (prev.includes(leaid) || prev.length >= MAX_COMPARE) return prev
      return [...prev, leaid]
    })
  }, [])

  const removeDistrict = useCallback((leaid: string) => {
    setSelectedIds(prev => prev.filter(id => id !== leaid))
  }, [])

  const clearAll = useCallback(() => {
    setSelectedIds([])
  }, [])

  const isSelected = useCallback(
    (leaid: string) => selectedIds.includes(leaid),
    [selectedIds]
  )

  return {
    selectedIds,
    addDistrict,
    removeDistrict,
    clearAll,
    isSelected,
    isFull: selectedIds.length >= MAX_COMPARE,
  }
}
