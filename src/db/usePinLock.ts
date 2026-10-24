import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

const PIN_KEY = 'security_pin'

async function hashPin(pin: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function usePinLock() {
  const result = useLiveQuery(async () => {
    const row = await db.settings.get(PIN_KEY)
    return row?.value as { enabled: boolean; hash: string } | undefined
  })

  return {
    loading: result === undefined,
    isPinSet: Boolean(result?.enabled && result.hash),
    isPinEnabled: Boolean(result?.enabled),
    setPin: async (pin: string) => {
      const hash = await hashPin(pin)
      await db.settings.put({ key: PIN_KEY, value: { enabled: true, hash } })
    },
    removePin: async () => {
      await db.settings.put({ key: PIN_KEY, value: { enabled: false, hash: '' } })
    },
    verifyPin: async (pin: string): Promise<boolean> => {
      if (!result?.hash) return true
      const inputHash = await hashPin(pin)
      return inputHash === result.hash
    },
  }
}
