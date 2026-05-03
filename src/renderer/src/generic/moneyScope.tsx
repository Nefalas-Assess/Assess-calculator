import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore
} from 'react'

type MoneyEntry = {
  group: string
  value: number
}

type MoneyStore = {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
  register: (id: string, entry: MoneyEntry) => void
  unregister: (id: string) => void
  getTotal: (group: string, excludeId?: string) => number
}

const MoneyScopeContext = createContext<MoneyStore | undefined>(undefined)

let scopeCounter = 0

const createMoneyStore = (): MoneyStore => {
  const entries = new Map<string, MoneyEntry>()
  const listeners = new Set<() => void>()
  let version = 0

  const notify = () => {
    version += 1
    listeners.forEach((listener) => listener())
  }

  return {
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => version,
    register: (id, entry) => {
      const previous = entries.get(id)

      if (previous?.group === entry.group && previous?.value === entry.value) {
        return
      }

      entries.set(id, entry)
      notify()
    },
    unregister: (id) => {
      if (!entries.delete(id)) return
      notify()
    },
    getTotal: (group, excludeId) => {
      let total = 0

      entries.forEach((entry, id) => {
        if (id === excludeId || entry.group !== group) return
        total += entry.value
      })

      return total
    }
  }
}

export const MoneyScope = ({ children }) => {
  const parentStore = useContext(MoneyScopeContext)
  const localStore = useMemo(() => createMoneyStore(), [])
  const scopeId = useRef(`money-scope-${scopeCounter++}`)

  const store = useMemo<MoneyStore>(
    () => ({
      subscribe: localStore.subscribe,
      getSnapshot: localStore.getSnapshot,
      register: (id, entry) => {
        localStore.register(id, entry)
        parentStore?.register(`${scopeId.current}:${id}`, entry)
      },
      unregister: (id) => {
        localStore.unregister(id)
        parentStore?.unregister(`${scopeId.current}:${id}`)
      },
      getTotal: localStore.getTotal
    }),
    [localStore, parentStore]
  )

  return <MoneyScopeContext.Provider value={store}>{children}</MoneyScopeContext.Provider>
}

export const useMoneyScope = () => useContext(MoneyScopeContext)

export const useMoneyScopeTotal = (group: string, excludeId?: string) => {
  const store = useMoneyScope()
  const snapshot = useSyncExternalStore(
    store?.subscribe || (() => () => {}),
    store?.getSnapshot || (() => 0),
    store?.getSnapshot || (() => 0)
  )

  return useMemo(() => {
    if (!store) return 0
    return store.getTotal(group, excludeId)
  }, [excludeId, group, snapshot, store])
}

export const useMoneyRegistration = ({
  id,
  group,
  value
}: {
  id: string
  group?: string
  value: number
}) => {
  const store = useMoneyScope()

  const unregister = useCallback(() => {
    if (!store || !group) return
    store.unregister(id)
  }, [group, id, store])

  useLayoutEffect(() => unregister, [unregister])

  useLayoutEffect(() => {
    if (!store || !group) return
    store.register(id, { group, value })
  }, [group, id, store, value])
}
