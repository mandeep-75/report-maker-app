import { create } from 'zustand'

export type Appearance = 'dark' | 'light'

export interface SettingsState {
  appearance: Appearance
  collegeName: string
  department: string
  logo: string | null
  setAppearance: (a: Appearance) => void
  setInstitution: (v: { collegeName?: string; department?: string; logo?: string | null }) => void
  applyInstitution: (report: {
    eventInfo: { collegeName: string; department: string }
  }) => void
}

const KEY = 'rm-settings'

function load(): Omit<SettingsState, 'setAppearance' | 'setInstitution' | 'applyInstitution'> {
  const defaults = {
    appearance: 'light' as Appearance,
    collegeName: '',
    department: '',
    logo: null as string | null,
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
        collegeName: state.collegeName,
        department: state.department,
        logo: state.logo,
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
  setInstitution: (v) => {
    set((s) => ({ ...s, ...v }))
    persist(get())
  },
  applyInstitution: (report) => {
    const { collegeName, department } = get()
    if (collegeName) report.eventInfo.collegeName = collegeName
    if (department) report.eventInfo.department = department
  },
}))
