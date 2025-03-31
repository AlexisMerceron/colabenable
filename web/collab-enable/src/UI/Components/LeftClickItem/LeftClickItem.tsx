import './LeftClickItem.scss'

import { FunctionComponent, MouseEvent } from 'react'

interface OnClickItemProps {
  x: number
  y: number
  onResolve?: () => void
}

export const LeftClickItem: FunctionComponent<OnClickItemProps> = ({ x, y, onResolve }) => {
  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div
      className="LeftClickItem"
      onContextMenu={onContextMenu}
      onClick={onResolve}
      style={{ top: y, left: x }}
    >
      1
    </div>
  )
}
