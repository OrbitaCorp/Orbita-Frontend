import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WizardData } from '@/lib/api'

// Estado acumulado durante todo el onboarding, ANTES de que exista una
// cuenta — el flujo es: elegir rubro → completar el wizard paso a paso →
// recién al final se crea la cuenta y se guarda todo junto (ver
// PENDIENTES.md). `persist` en localStorage para poder retomar si se
// recarga la página a mitad de camino.

const initialWizard: WizardData = {
  rubro: '',
  subrubros: [],
  nombre: '',
  descripcion: '',
  email: '',
  telefono: '',
  subdominio: '',
  modoVenta: '',
  direccion: '',
  latLng: [-34.6037, -58.3816],
  operatesPhysical: false,
  operatesOnline: false,
  pagos: [],
  transferAlias: '',
  teamSize: '',
}

interface OnboardingState {
  wizard: WizardData
  setWizard: (patch: Partial<WizardData>) => void
  resetWizard: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      wizard: initialWizard,
      setWizard: (patch) => set((state) => ({ wizard: { ...state.wizard, ...patch } })),
      resetWizard: () => set({ wizard: initialWizard }),
    }),
    { name: 'orbita_onboarding_wizard' },
  ),
)
