import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import type { StateCreator } from 'zustand'

type Middleware = [
  ['zustand/devtools', never],
  ['zustand/subscribeWithSelector', never]
]

type PersistedMiddleware = [
  ['zustand/devtools', never],
  ['zustand/subscribeWithSelector', never],
  ['zustand/persist', unknown]
]

export function createStore<T>(
  name: string,
  initializer: StateCreator<T, Middleware>
) {
  return create<T>()(
    devtools(subscribeWithSelector(initializer), { name })
  )
}

export function createPersistedStore<T>(
  name: string,
  initializer: StateCreator<T, PersistedMiddleware>
) {
  return create<T>()(
    devtools(
      subscribeWithSelector(
        persist(initializer, { name })
      ),
      { name }
    )
  )
}
