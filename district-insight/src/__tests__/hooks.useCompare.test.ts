import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCompare } from '../hooks/useCompare'

describe('useCompare', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useCompare())
    expect(result.current.selectedIds).toHaveLength(0)
    expect(result.current.isFull).toBe(false)
  })

  it('adds a district', () => {
    const { result } = renderHook(() => useCompare())
    act(() => result.current.addDistrict('A'))
    expect(result.current.selectedIds).toContain('A')
    expect(result.current.isSelected('A')).toBe(true)
  })

  it('does not add duplicate', () => {
    const { result } = renderHook(() => useCompare())
    act(() => { result.current.addDistrict('A'); result.current.addDistrict('A') })
    expect(result.current.selectedIds).toHaveLength(1)
  })

  it('caps at 3 districts', () => {
    const { result } = renderHook(() => useCompare())
    act(() => {
      result.current.addDistrict('A')
      result.current.addDistrict('B')
      result.current.addDistrict('C')
    })
    expect(result.current.isFull).toBe(true)
    act(() => result.current.addDistrict('D'))
    expect(result.current.selectedIds).toHaveLength(3)
  })

  it('removes a district', () => {
    const { result } = renderHook(() => useCompare())
    act(() => { result.current.addDistrict('A'); result.current.addDistrict('B') })
    act(() => result.current.removeDistrict('A'))
    expect(result.current.selectedIds).not.toContain('A')
    expect(result.current.selectedIds).toContain('B')
  })

  it('clears all districts', () => {
    const { result } = renderHook(() => useCompare())
    act(() => { result.current.addDistrict('A'); result.current.addDistrict('B') })
    act(() => result.current.clearAll())
    expect(result.current.selectedIds).toHaveLength(0)
  })

  it('isSelected returns false for non-selected', () => {
    const { result } = renderHook(() => useCompare())
    expect(result.current.isSelected('X')).toBe(false)
  })
})
