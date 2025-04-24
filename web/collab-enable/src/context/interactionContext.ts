// src/context/InteractionContext.tsx
import { createContext, useContext } from 'react'

interface InteractionContextType {
  incrValidInteractions: () => void
}

export const InteractionContext = createContext<InteractionContextType>({
  incrValidInteractions: () => {},
})

export const useInteraction = () => useContext(InteractionContext)
