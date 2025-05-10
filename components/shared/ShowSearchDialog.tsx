/* components/shared/ShowSearchDialog.tsx */
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import SearchInput from '@/components/shared/SearchInput'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'

import oaps from '@/data/oaps.json'                         // ← OAP data

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type Show = {
  id: string             // unique
  slug?: string
  showTitle: string
  description: string
  thumbnailUrl: string
  startTime: string
  endTime: string
  weekday: number        // 0–6  (Sunday … Saturday)
  /* enriched ↓ */
  dayLabel?: string
  oapNames?: string[]
}

/* Weekday labels for display */
const weekdayLabels = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function ShowSearchDialog({ shows }: { shows: Show[] }) {
  const [term, setTerm]   = useState('')
  const [open, setOpen]   = useState(false)
  const router            = useRouter()

  /* ---- build show → OAPs lookup so we can enrich results ---------- */
  const showToOaps: Record<string, string[]> = {}
  oaps.forEach((oap: any) => {
    ;(oap.shows ?? []).forEach((title: string) => {
      showToOaps[title] = showToOaps[title]
        ? [...showToOaps[title], oap.name]
        : [oap.name]
    })
  })

  /* ---- enrich each show with day label + OAP names ---------------- */
  const enriched: Show[] = shows.map((s) => ({
    ...s,
    dayLabel: weekdayLabels[s.weekday],
    oapNames: showToOaps[s.showTitle] ?? [],
  }))

  /* ---- fuzzy‑search index ---------------------------------------- */
  const fuse = new Fuse(enriched, {
    keys: ['showTitle', 'description', 'dayLabel', 'oapNames'],
    threshold: 0.3,
  })
  const results = term ? fuse.search(term).map((r) => r.item) : []

  /* ---- helpers ---------------------------------------------------- */
  const handleSelect = (show: Show) => {
    router.push(`/?highlight=${show.slug ?? show.id}`)
    setOpen(false)
    setTerm('')
  }

  /* ---------------------------------------------------------------- */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* trigger lives OUTSIDE dialog so search box is still in navbar */}
      <DialogTrigger asChild>
        <button className="p-2 hover:bg-muted rounded-md md:inline-flex">
          <span className="sr-only">Search shows</span>
          <i className="ri-search-line text-xl" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Search shows</DialogTitle>
        </DialogHeader>

        {/* search box inside the dialog */}
        <SearchInput
          value={term}
          onSearch={setTerm}
          placeholder="Type a show name, day or OAP…"
          autoFocus
        />

        {/* result list */}
        <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
          {results.length === 0 && !!term && (
            <p className="text-sm text-muted-foreground ml-2">No matches&nbsp;😔</p>
          )}

          {results.map((show) => (
            <button
              key={show.id}                      /* always unique */
              onClick={() => handleSelect(show)}
              className="flex gap-4 items-center w-full text-left p-2 rounded-md hover:bg-muted transition"
            >
              <img
                src={show.thumbnailUrl}
                alt={show.showTitle}
                className="w-12 h-12 rounded-md object-cover"
              />

              <div className="flex-1">
                <p className="font-semibold">{show.showTitle}</p>

                {/* Day + time */}
                <p className="text-xs text-muted-foreground">
                  {show.dayLabel} &middot; {show.startTime} – {show.endTime}
                </p>

                {/* OAP names (if any) */}
                {show.oapNames!.length > 0 && (
                  <p className="text-xs mt-0.5 text-muted-foreground">
                    {show.oapNames!.join(', ')}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
