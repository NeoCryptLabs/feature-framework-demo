"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface DateRangePickerProps {
  from: string
  to: string
}

export function DateRangePicker({ from, to }: DateRangePickerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, value)
      router.push(`/analytics?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-muted-foreground">From</label>
      <input
        type="date"
        value={from}
        onChange={(e) => updateParams("from", e.target.value)}
        className="rounded-md border bg-background px-3 py-2 text-sm"
      />
      <label className="text-sm font-medium text-muted-foreground">To</label>
      <input
        type="date"
        value={to}
        onChange={(e) => updateParams("to", e.target.value)}
        className="rounded-md border bg-background px-3 py-2 text-sm"
      />
    </div>
  )
}
