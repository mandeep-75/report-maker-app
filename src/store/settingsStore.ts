import { create } from 'zustand'

export type Appearance = 'dark' | 'light'

export interface SettingsState {
  appearance: Appearance
  setAppearance: (a: Appearance) => void
}

const KEY = 'rm-settings'

function load(): Omit<SettingsState, 'setAppearance'> {
  const defaults = {
    appearance: 'light' as Appearance,
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaults
    return { ...defaults, ...(JSON.parse(raw) as Partial<typeof defaults>) }
  } catch {
    return defaults
  }
}

function persist(state: SettingsState) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        appearance: state.appearance,
      })
    )
  } catch {
    /* ignore */
  }
}

export const useSettings = create<SettingsState>()((set, get) => ({
  ...load(),
  setAppearance: (appearance) => {
    set({ appearance })
    persist(get())
    document.documentElement.classList.toggle('theme-dark', appearance === 'dark')
  },
}))
