import './ClickItem.scss'

import { DragEvent, FunctionComponent, MouseEvent } from 'react'

// Définition des propriétés du composant ClickItem
interface ClickItemProps {
  x: number
  y: number
  onResolve?: () => void
  type: 'left' | 'right' | 'double' | 'dragStart' | 'dragEnd'
}

export const ClickItem: FunctionComponent<ClickItemProps> = ({ x, y, onResolve, type }) => {
  // Empêche le menu contextuel par défaut et appelle onResolve si le type est "right"
  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (type === 'right') onResolve?.()
  }

  // Retourne le nom de la classe CSS en fonction du type de clic
  const getClassName = () => {
    const typeClassMap: Record<string, string> = {
      left: 'LeftClickItem',
      right: 'RightClickItem',
      double: 'DoubleClickItem',
      dragStart: 'DragStartClickItem',
      dragEnd: 'DragEndClickItem',
    }
    return typeClassMap[type]
  }

  // Retourne le contenu à afficher en fonction du type de clic
  const getContent = () => {
    const typeContentMap: Record<string, string> = {
      left: '1',
      right: 'Droit',
      double: '2',
      dragStart: 'To move',
      dragEnd: 'Drop Zone',
    }
    return typeContentMap[type]
  }

  // Gère le début du glisser
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    ;(e.target as HTMLElement).classList.add('hide')
  }

  // Réinitialise la position à la position initiale à la fin du glisser
  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    ;(e.target as HTMLElement).classList.remove('hide')
  }

  // Empêche le comportement par défaut lors du glisser
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    ;(e.target as HTMLElement).classList.add('drag-over')
  }

  // Empêche le comportement par défaut lors du glisser
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    ;(e.target as HTMLElement).classList.remove('drag-over')
  }

  // Gère le dépôt de l'élément et appelle onResolve
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    onResolve?.()
  }

  // Retourne les gestionnaires d'événements appropriés en fonction du type de clic
  const getClickHandler = () => {
    const handlers: Record<string, unknown> = {
      left: { onClick: onResolve },
      right: {},
      double: { onDoubleClick: onResolve },
      dragStart: {
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        draggable: true,
      },
      dragEnd: {
        onDragOver: handleDragOver,
        onDrop: handleDrop,
        onDragLeave: handleDragLeave,
      },
    }
    return handlers[type] || {}
  }

  return (
    <div
      className={getClassName()}
      onContextMenu={onContextMenu}
      {...getClickHandler()}
      style={{ top: y, left: x }}
    >
      {getContent()}
    </div>
  )
}
