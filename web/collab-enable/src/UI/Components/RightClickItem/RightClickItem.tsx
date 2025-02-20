import { FunctionComponent, MouseEvent } from 'react'
import './RightClickItem.scss'

interface RightClickItemProps {
  x: number,
  y: number,
  onResolve?: () => void
}

export const RightClickItem: FunctionComponent<RightClickItemProps> = ({ x, y, onResolve }) => {
  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    onResolve?.()
  }

  return (
    <div className="RightClickItem" onContextMenu={onContextMenu} style={{ top: y, left: x }}>Droit</div>
  )
}
