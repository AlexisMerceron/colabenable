import './GraphModal.scss'

import { CursorAction } from '@components/CursorTrackingArea/CursorTrackingArea'
import { Button, Theme } from '@radix-ui/themes'
import { IconDownload, IconSend, IconX } from '@tabler/icons-react'
import ReactECharts from 'echarts-for-react'
import { FunctionComponent, useMemo } from 'react'
import { createPortal } from 'react-dom'

interface GraphModalProps {
  open?: boolean
  onClose?: () => void
  data?: { time: number; x: number; y: number; action: CursorAction }[]
  onDonwloadButtonClick?: () => void
  onSendByEmailButtonClick?: (data: string[]) => void
  loading?: boolean
}

export const GraphModal: FunctionComponent<GraphModalProps> = ({
  open,
  onClose,
  data,
  onDonwloadButtonClick,
  onSendByEmailButtonClick,
  loading,
}) => {
  const { dragEvents, clickEvents, doubleClickEvents, rightClickEvents, allEvents } =
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
              <Button
                onClick={() =>
                  data &&
                  onSendByEmailButtonClick?.([
                    'time,x,y,action',
                    ...(data?.map((item) => `${item.time},${item.x},${item.y},${item.action}`) ??
                      []),
                  ])
                }
                color="yellow"
                loading={loading}
              >
                <IconSend size={18} />
                Envoyer le CSV par email
              </Button>
              <Button color="gray" onClick={onDonwloadButtonClick} variant="solid" highContrast>
                <IconDownload size={18} /> Télécharger le CSV en local
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
