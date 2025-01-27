import { type MutableRefObject, useEffect, useRef, useState } from 'react'
import {
  createSnapSlider,
  TSnapSliderJumpToFn,
  type TSnapSliderStateFull,
} from './snap-slider'

export interface TUseSnapSlider extends TSnapSliderStateFull {
  jumpTo: TSnapSliderJumpToFn
  goNext: () => void
  goPrev: () => void
}

export function useSnapSlider(
  ref: MutableRefObject<HTMLDivElement | null>,
  count: number = 1,
  index: number = 0,
  circular = false,
  countHash?: string | number,
  debug?: boolean
): TUseSnapSlider {
  const [, forceUpdate] = useState<number>(0)
  const mountedRef = useRef<boolean>(false)
  const initRef = useRef<boolean>(false)
  const [observer] = useState(() =>
    createSnapSlider({
      element: ref.current,
      count,
      index,
      circular,
      initalSubscriptionPublish: false,
      debug,
    })
  )
  const result = observer.getState()
  useEffect(() => {
    if (mountedRef.current) {
      observer.jumpTo(0)
      observer.calculate()
    }
  }, [count, countHash, observer])
  useEffect(() => {
    mountedRef.current = true
    ref.current && observer.setElement(ref.current)
    const unsubscribe = observer.subscribe(() => {
      if (mountedRef.current) {
        forceUpdate((x) => x + 1)
      }
    })

    return () => {
      mountedRef.current = false
      unsubscribe()
    }
  }, [observer, forceUpdate])
  return {
    ...result,
    jumpTo: observer.jumpTo,
    goNext: observer.goNext,
    goPrev: observer.goPrev,
  }
}
