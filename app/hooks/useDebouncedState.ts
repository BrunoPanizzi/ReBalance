import { Dispatch, SetStateAction, useState } from 'react'
import debounce from '~/lib/debounce'

export function useDebouncedState<S>(
  initialState: S,
  ms: number,
): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState(initialState)

  const debouncedSetState = debounce(
    (value: SetStateAction<S>) => setState(value),
    ms,
  )

  return [state, debouncedSetState]
}
