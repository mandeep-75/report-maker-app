import { create } from 'zustand'

export type Appearance = 'dark' | 'light'

export const FREE_MODELS = [
  { id: 'nemotron-3-ultra-free', label: 'Nemotron 3 Ultra (Free)' },
  { id: 'nemotron-3.5-lightning-free', label: 'Nemotron 3.5 Lightning (Free)' },
  { id: 'mimo-v2.5-free', label: 'MiMo V2.5 (Free)' },
  { id: 'big-pickle', label: 'Big Pickle (Free)' },
] as const

export type FreeModelId = (typeof FREE_MODELS)[number]['id']

export interface SettingsState {
  appearance: Appearance
  apiKey: string
  selectedModel: FreeModelId
  setAppearance: (a: Appearance) => void
  setApiKey: (key: string) => void
  setSelectedModel: (m: FreeModelId) => void
}

const KEY = 'rm-settings'

function load(): Omit<SettingsState, 'setAppearance' | 'setApiKey' | 'setSelectedModel'> {
  const defaults = {
    appearance: 'light' as Appearance,
    apiKey: '',
    selectedModel: 'nemotron-3-ultra-free' as FreeModelId,
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
        apiKey: state.apiKey,
        selectedModel: state.selectedModel,
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
  setApiKey: (apiKey) => {
    set({ apiKey })
    persist(get())
  },
  setSelectedModel: (selectedModel) => {
    set({ selectedModel })
    persist(get())
  },
}))
