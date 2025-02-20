import { DragEvent, FunctionComponent } from 'react'
import { useBoolean } from 'react-hanger'
import clsx from 'clsx'
import './DradItem.scss'

interface DradItemProps {
  onResolve?: string
}

export const DradItem: FunctionComponent<DradItemProps> = ({ onResolve }) => {
  const isDraging = useBoolean(false)

  const onDragStartHandler = (e: DragEvent<HTMLDivElement>) => {
    isDraging.setTrue()
    console.log(e)
    const element = e.target
  }

  return (
    <div className={clsx("DradItem")} onDragStart={onDragStartHandler} draggable>
      Drag
    </div>
  )
}
