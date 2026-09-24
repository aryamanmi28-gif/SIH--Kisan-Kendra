import { useEffect, useRef } from 'react'

/**
 * The queue as the farmer pictures it: a line of tokens moving towards theirs.
 * Served tokens fade back, the counter token carries the only pulsing dot in
 * the product, and the farmer's own token sits solid and larger at the end.
 */
export default function QueueRail({ nowServing, tokenNumber, lastIssuedToken }) {
  const railRef = useRef(null)
  const youRef = useRef(null)

  const start = Math.max(1, Math.min(nowServing - 2, tokenNumber - 8))
  const end = Math.max(tokenNumber, Math.min(lastIssuedToken, tokenNumber + 2))
  const tokens = []
  for (let value = start; value <= end; value += 1) tokens.push(value)

  useEffect(() => {
    const rail = railRef.current
    const you = youRef.current
    if (!rail || !you) return
    // Keep the farmer's own token on screen as the line moves.
    rail.scrollTo({ left: you.offsetLeft - rail.clientWidth + you.clientWidth + 24, behavior: 'smooth' })
  }, [nowServing, tokenNumber])

  const spanned = tokenNumber - start
  const progressed = Math.max(0, Math.min(spanned, nowServing - start))
  const percent = spanned > 0 ? Math.round((progressed / spanned) * 100) : 100

  return (
    <div>
      <div
        ref={railRef}
        className="no-scrollbar flex items-end gap-2 overflow-x-auto pb-1"
        role="list"
        aria-label="Tokens in the queue"
      >
        {tokens.map((value) => {
          const isYou = value === tokenNumber
          const isServing = value === nowServing
          const isDone = value < nowServing

          let styles = 'border-line bg-white text-muted'
          if (isDone) styles = 'border-line bg-paper text-muted/60'
          if (isServing) styles = 'border-steel-500 bg-steel-50 text-steel-600'
          if (isYou) styles = 'border-brand-600 bg-brand-600 text-white'
          if (isYou && isServing) styles = 'border-grain-500 bg-grain-500 text-white'

          return (
            <div key={value} role="listitem" className="flex shrink-0 flex-col items-center gap-1">
              <span className={`text-xs font-medium ${isYou ? 'text-brand-700' : 'text-transparent'}`}>You</span>
              <span
                ref={isYou ? youRef : null}
                className={`flex items-center justify-center border-2 font-bold tnum ${styles} ${
                  isYou ? 'h-16 w-16 text-2xl' : 'h-12 w-12 text-lg'
                }`}
                aria-label={
                  isYou
                    ? `Your token ${value}`
                    : isServing
                      ? `Token ${value}, at the counter now`
                      : isDone
                        ? `Token ${value}, done`
                        : `Token ${value}, waiting`
                }
              >
                {value}
              </span>
              {isServing ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-steel-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-steel-500 animate-pulseDot" />
                  At counter
                </span>
              ) : (
                <span className="text-xs text-transparent">.</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3">
        <div
          className="h-2 w-full bg-line"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress towards your turn"
        >
          <div className="h-full bg-brand-600" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-sm text-muted">
          <span>Counter is here</span>
          <span className="font-semibold text-brand-700">Your turn</span>
        </div>
      </div>
    </div>
  )
}
