import './CursorTrackingArea.scss'

import clsx from 'clsx'
import { FunctionComponent, MouseEvent, PropsWithChildren, useEffect, useRef } from 'react'
import { useBoolean } from 'react-hanger'

export type CursorAction = 'left_click' | 'double_click' | 'right_click' | 'drag' | 'move'

interface CursorTrackingAreaProps extends PropsWithChildren {
  onSizeChange: (w: number, h: number) => void
  onEvent?: (x: number, y: number, action: CursorAction) => void
  recording?: boolean
}

export const CursorTrackingArea: FunctionComponent<CursorTrackingAreaProps> = ({
  onSizeChange,
  children,
  onEvent,
  recording,
}) => {
  const divRef = useRef<HTMLDivElement>(null)
  const isClicked = useBoolean(false)

  useEffect(() => {
    if (divRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          onSizeChange(width, height)
        }
      })

      observer.observe(divRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [onSizeChange])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    onEvent?.(x, y, isClicked.value ? 'drag' : 'move')
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor(event.clientX - rect.left)
    const y = Math.floor(event.clientY - rect.top)

    onEvent?.(x, y, 'left_click')
  }

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor(event.clientX - rect.left)
    const y = Math.floor(event.clientY - rect.top)

    onEvent?.(x, y, 'double_click')
  }

  const onContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()

    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor(event.clientX - rect.left)
    const y = Math.floor(event.clientY - rect.top)

    onEvent?.(x, y, 'right_click')
  }

  return (
    <div
      ref={divRef}
      className={clsx('CursorTrackingArea', { recording })}
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
