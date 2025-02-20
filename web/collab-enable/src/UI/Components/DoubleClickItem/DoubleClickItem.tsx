import { FunctionComponent, MouseEvent } from 'react'
import './DoubleClickItem.scss'

interface DoubleClickItemProps {
  x: number,
  y: number,
  onResolve?: () => void
}

export const DoubleClickItem: FunctionComponent<DoubleClickItemProps> = ({ x, y, onResolve }) => {

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className="DoubleClickItem" onContextMenu={onContextMenu} onDoubleClick={onResolve} style={{ top: y, left: x }}>2</div>
  )
}
