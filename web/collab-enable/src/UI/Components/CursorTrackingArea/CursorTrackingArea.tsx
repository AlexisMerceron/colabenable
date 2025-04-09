import './CursorTrackingArea.scss'

import clsx from 'clsx'
import { FunctionComponent, MouseEvent, PropsWithChildren, useEffect, useRef } from 'react'
import { useBoolean } from 'react-hanger'

// Définition des types d'actions du curseur
export type CursorAction = 'left_click' | 'double_click' | 'right_click' | 'drag' | 'move'

// Interface des propriétés de la zone de suivi du curseur
interface CursorTrackingAreaProps extends PropsWithChildren {
  onSizeChange: (w: number, h: number) => void // Callback pour les changements de taille
  onEvent?: (x: number, y: number, action: CursorAction) => void // Callback pour les événements de curseur
  recording?: boolean // Indicateur de l'état d'enregistrement
}

// Composant fonctionnel pour la zone de suivi du curseur
export const CursorTrackingArea: FunctionComponent<CursorTrackingAreaProps> = ({
  onSizeChange,
  children,
  onEvent,
  recording,
}) => {
  const divRef = useRef<HTMLDivElement>(null) // Référence pour le div
  const isClicked = useBoolean(false) // État pour suivre si le curseur est cliqué

  // Utilisation d'un effet pour observer les changements de taille
  useEffect(() => {
    if (divRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          onSizeChange(width, height) // Appel du callback lors du changement de taille
        }
      })

      observer.observe(divRef.current)

      // Nettoyage de l'observateur lors du démontage du composant
      return () => {
        observer.disconnect()
      }
    }
  }, [onSizeChange])

  // Gestionnaire de mouvement de la souris
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    onEvent?.(x, y, isClicked.value ? 'drag' : 'move') // Appel du callback avec l'action appropriée
  }

  // Gestionnaire de clic de la souris
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor(event.clientX - rect.left)
    const y = Math.floor(event.clientY - rect.top)

    onEvent?.(x, y, 'left_click') // Appel du callback avec l'action de clic gauche
  }

  // Gestionnaire de double clic de la souris
  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor(event.clientX - rect.left)
    const y = Math.floor(event.clientY - rect.top)

    onEvent?.(x, y, 'double_click') // Appel du callback avec l'action de double clic
  }

  // Gestionnaire du clic droit (menu contextuel)
  const onContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()

    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor(event.clientX - rect.left)
    const y = Math.floor(event.clientY - rect.top)

    onEvent?.(x, y, 'right_click') // Appel du callback avec l'action de clic droit
  }

  return (
    <div
      ref={divRef}
      className={clsx('CursorTrackingArea', { recording })} // Ajout de la classe 'recording' si enregistrement en cours
      onMouseDown={isClicked.setTrue}
      onMouseUp={isClicked.setFalse}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onContextMenu={onContextMenu}
      onDoubleClick={handleDoubleClick}
    >
      {children}
    </div>
  )
}