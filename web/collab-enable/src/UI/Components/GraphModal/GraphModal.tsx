import './GraphModal.scss'

import { CursorAction } from '@components'
import { Button, Theme } from '@radix-ui/themes'
import { IconDownload, IconSend, IconX } from '@tabler/icons-react'
import ReactECharts from 'echarts-for-react'
import { FunctionComponent, useMemo } from 'react'
import { createPortal } from 'react-dom'

// Interface des propriétés du composant GraphModal
interface GraphModalProps {
  open?: boolean // Indicateur si le modal est ouvert
  onClose?: () => void // Callback pour fermer le modal
  data?: { time: number; x: number; y: number; action: CursorAction }[] // Données pour le graphique
  onDownloadButtonClick?: () => void // Callback pour le bouton de téléchargement
  onSendByEmailButtonClick?: (data: string[]) => void // Callback pour envoyer les données par email
  loading?: boolean // Indicateur de chargement
}

// Composant fonctionnel pour afficher le modal graphique
export const GraphModal: FunctionComponent<GraphModalProps> = ({
  open,
  onClose,
  data,
  onDownloadButtonClick,
  onSendByEmailButtonClick,
  loading,
}) => {
  // Utilisation de useMemo pour calculer les différents types d'événements
  const { dragEvents, clickEvents, doubleClickEvents, rightClickEvents, allEvents } =
    useMemo(() => {
      const localAllEvents: [number, number][] = []
      const localMoveEvents: [number, number][] = []
      const localDragEvents: [number, number][] = []
      const localClickEvents: [number, number][] = []
      const localDoubleClickEvents: [number, number][] = []
      const localRightClickEvents: [number, number][] = []

      if (open) {
        for (const item of data ?? []) {
          const eventPoint = [item.x, -item.y] as [number, number]
          localAllEvents.push(eventPoint)
          switch (item.action) {
            case 'move':
              localMoveEvents.push(eventPoint)
              break
            case 'drag':
              localDragEvents.push(eventPoint)
              break
            case 'left_click':
              localClickEvents.push(eventPoint)
              break
            case 'double_click':
              localDoubleClickEvents.push(eventPoint)
              break
            case 'right_click':
              localRightClickEvents.push(eventPoint)
              break
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
                    ...(data.map((item) => `${item.time},${item.x},${item.y},${item.action}`) ??
                      []),
                  ])
                }
                color="yellow"
                loading={loading}
              >
                <IconSend size={18} />
                Envoyer le CSV par email
              </Button>
              <Button color="gray" onClick={onDownloadButtonClick} variant="solid" highContrast>
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
                    name: 'Drag',
                    type: 'scatter',
                    symbolSize: 10,
                    data: dragEvents,
                    itemStyle: {
                      color: '#79eb71',
                    },
                  },
                  {
                    type: 'line',
                    symbolSize: 0,
                    data: allEvents,
                    itemStyle: {
                      color: '#FFFFFF80',
                    },
                  },
                  {
                    name: 'Clic gauche',
                    type: 'effectScatter',
                    symbolSize: 12,
                    data: clickEvents,
                    itemStyle: {
                      color: '#eb7181',
                    },
                  },
                  {
                    name: 'Double clic',
                    type: 'effectScatter',
                    symbolSize: 12,
                    data: doubleClickEvents,
                    itemStyle: {
                      color: '#717feb',
                    },
                  },
                  {
                    name: 'Clic droit',
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

// Options de configuration pour le graphique ECharts
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
  legend: {
    data: ['Drag', 'Mouvement', 'Clic gauche', 'Double clic', 'Clic droit'],
    textStyle: {
      color: '#FFFFFF',
    },
    top: '10px',
  },
}
