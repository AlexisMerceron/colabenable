import { FunctionComponent, useMemo } from 'react'
import { createPortal } from 'react-dom'
import ReactECharts from 'echarts-for-react'
import { CursorAction } from '../CursorTrackingArea/CursorTrackingArea'
import { IconX } from '@tabler/icons-react'
import './GraphModal.scss'
import { Button, Theme } from '@radix-ui/themes'

interface GraphModalProps {
  open?: boolean
  onClose?: () => void
  data?: { x: number; y: number; action: CursorAction }[]
  onDonwloadButtonClick?: () => void
}

export const GraphModal: FunctionComponent<GraphModalProps> = ({
  open,
  onClose,
  data,
  onDonwloadButtonClick,
}) => {
  const { moveEvents, dragEvents, clickEvents, doubleClickEvents, rightClickEvents, allEvents } =
    useMemo(() => {
      const localAllEvents = []
      const localMoveEvents = []
      const localDragEvents = []
      const localClickEvents = []
      const localDoubleClickEvents = []
      const localRightClickEvents = []

      if (open) {
        for (const item of data ?? []) {
          localAllEvents.push([item.x, -item.y])
          if (item.action === 'move') {
            localMoveEvents.push([item.x, -item.y])
          } else if (item.action === 'drag') {
            localDragEvents.push([item.x, -item.y])
          } else if (item.action === 'left_click') {
            localClickEvents.push([item.x, -item.y])
          } else if (item.action === 'double_click') {
            localDoubleClickEvents.push([item.x, -item.y])
          } else if (item.action === 'right_click') {
            localRightClickEvents.push([item.x, -item.y])
          }
        }
      }

      return {
        moveEvents: localMoveEvents,
        dragEvents: localDragEvents,
        clickEvents: localClickEvents,
        doubleClickEvents: localDoubleClickEvents,
        rightClickEvents: localRightClickEvents,
        allEvents: localAllEvents,
      }
    }, [data, open])

  if (!open) {
    return null
  }

  return createPortal(
    <Theme>
      <div className="Overlay">
        <div className="GraphModal">
          <div className="GraphModal__header">
            <div className="GraphModal__header__left--area">
              <Button color="yellow" onClick={onDonwloadButtonClick}>
                Télécharger le CSV en local
              </Button>
              <Button color="gray" variant="solid" highContrast>
                Envoyer le CSV sur le cloud Google
              </Button>
            </div>
            <button type="button" className="GraphModal__close--button" onClick={onClose}>
              <IconX />
            </button>
          </div>
          <div className="GraphModal__body">
            <ReactECharts
              option={{
                ...option,
                series: [
                  {
                    type: 'scatter',
                    symbolSize: 10,
                    data: dragEvents,
                    itemStyle: {
                      color: '#79eb71',
                    },
                  },
                  {
                    type: 'line',
                    symbolSize: 4,
                    data: allEvents,
                    itemStyle: {
                      color: 'white',
                    },
                  },
                  {
                    type: 'effectScatter',
                    symbolSize: 12,
                    data: clickEvents,
                    itemStyle: {
                      color: '#eb7181',
                    },
                  },
                  {
                    type: 'effectScatter',
                    symbolSize: 12,
                    data: doubleClickEvents,
                    itemStyle: {
                      color: '#717feb',
                    },
                  },
                  {
                    type: 'effectScatter',
                    symbolSize: 12,
                    data: rightClickEvents,
                    itemStyle: {
                      color: '#ebde71',
                    },
                  },
                ],
              }}
              style={{ width: '1400px', height: '700px' }}
            />
          </div>
        </div>
      </div>
    </Theme>,
    document.getElementById('portal-root')!,
  )
}

const option = {
  xAxis: {
    scale: true,
    axisLine: {
      show: true,
      lineStyle: {
        color: '#64676d',
        type: 'dashed',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: '#64676d',
        type: 'dashed',
      },
    },
  },
  yAxis: {
    scale: true,
    max: 0,
    axisLine: {
      show: false,
      lineStyle: {
        color: '#64676d',
        type: 'dashed',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: '#64676d',
        type: 'dashed',
      },
    },
  },
}
