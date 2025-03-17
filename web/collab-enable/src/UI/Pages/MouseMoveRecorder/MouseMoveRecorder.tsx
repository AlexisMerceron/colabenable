import './MouseMoveRecorder.scss'

import { CursorAction, CursorTrackingArea } from '@components/CursorTrackingArea/CursorTrackingArea'
import { DoubleClickItem } from '@components/DoubleClickItem/DoubleClickItem'
import { FakeMailApp } from '@components/FakeMailApp/FakeMailApp'
import { GraphModal } from '@components/GraphModal/GraphModal'
import { KeyboardButton } from '@components/KeyboardButton/KeyboardButton'
import { LeftClickItem } from '@components/LeftClickItem/LeftClickItem'
import { Navbar } from '@components/Navbar/Navbar'
import { RightClickItem } from '@components/RightClickItem/RightClickItem'
import { TimerView } from '@components/TimerView/TimerView'
import { IconClick, IconMail } from '@tabler/icons-react'
import { TimeUtils, RandomUtils } from '@utils/TimeUtils'
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react'
import { useBoolean, useStateful } from 'react-hanger'
import { Case, Else, If, Switch, Then } from 'react-if'
import { Select } from '@radix-ui/themes'
import './MouseMoveRecorder.scss'

const API_URL = import.meta.env.VITE_API_URL

const ITEM_WIDTH = 50
const ITEM_HEIGHT = 50

type ViewMode = 'forms' | 'mail'

enum InteractionType {
  LEFT_CLICK = 'LEFT_CLICK',
  DOUBLE_CLICK = 'DOUBLE_CLICK',
  RIGHT_CLICK = 'RIGHT_CLICK',
  DRAG = 'DRAG',
}

interface InteractionData {
  x: number
  y: number
  type: InteractionType
  xEnd?: number
  yEnd?: number
}

const random = RandomUtils.seededRandom(9000)

const getRandomInteractionType = (): InteractionType => {
  const values = Object.values(InteractionType)
  const randomIndex = Math.floor(random() * values.length)
  return values[randomIndex]
}

const getRandomPosition = (maxX: number, maxY: number) => {
  const rx = random()
  const ry = random()

  const x = Math.floor(rx * (maxX - ITEM_WIDTH))
  const y = Math.floor(ry * (maxY - ITEM_HEIGHT))
  return { x, y }
}

const composeName = (seconds: number, appMode: string) =>
  `${Date.now()}_${TimeUtils.formatSeconds(seconds)}_${appMode}_interactions.csv`

export const MouseMoveRecorder: FunctionComponent = () => {
  const currentInteraction = useStateful<InteractionData | undefined>({
    x: 10,
    y: 300,
    type: InteractionType.LEFT_CLICK,
  })
  const cursorTrackingAreaSize = useStateful<{ w: number; h: number } | undefined>(undefined)

  const showGraphModal = useBoolean(false)
  const isSpaceButtonClick = useBoolean(false)
  const isRecording = useBoolean(false)

  const time = useStateful(0)
  const recordedTime = useStateful(0)

  const onCursorTrackingAreaSizeChange = (w: number, h: number) => {
    cursorTrackingAreaSize.setValue({ w, h })
  }

  const generateRandomInteraction = useCallback(() => {
    const { x, y } = getRandomPosition(
      cursorTrackingAreaSize.value?.w ?? 0,
      cursorTrackingAreaSize.value?.h ?? 0,
    )
    const interactionType = getRandomInteractionType()

    if (interactionType === InteractionType.DRAG) {
      const { x: xEnd, y: yEnd } = getRandomPosition(
        cursorTrackingAreaSize.value?.w ?? 0,
        cursorTrackingAreaSize.value?.h ?? 0,
      )
      currentInteraction.setValue({
        x,
        y,
        type: InteractionType.LEFT_CLICK,
        xEnd,
        yEnd,
      })
    } else {
      currentInteraction.setValue({
        x,
        y,
        type: interactionType,
      })
    }
  }, [currentInteraction, cursorTrackingAreaSize.value])

  const interactionItemView = useMemo(() => {
    switch (currentInteraction.value?.type) {
      case InteractionType.LEFT_CLICK:
        return (
          <LeftClickItem
            x={currentInteraction.value.x}
            y={currentInteraction.value.y}
            onResolve={generateRandomInteraction}
          />
        )

      case InteractionType.DOUBLE_CLICK:
        return (
          <DoubleClickItem
            x={currentInteraction.value.x}
            y={currentInteraction.value.y}
            onResolve={generateRandomInteraction}
          />
        )

      case InteractionType.RIGHT_CLICK:
        return (
          <RightClickItem
            x={currentInteraction.value.x}
            y={currentInteraction.value.y}
            onResolve={generateRandomInteraction}
          />
        )
    }
  }, [currentInteraction.value, generateRandomInteraction])

  const debug = useStateful('')

  const onEvent = (x: number, y: number, action: CursorAction) => {
    debug.setValue(`${Date.now()},${x},${y},${action}`)
    if (isRecording.value) {
      interactions.setValue([...interactions.value, { time: Date.now(), x, y, action }])
    }
  }

  const interactions = useStateful<{ time: number; x: number; y: number; action: CursorAction }[]>(
    [],
  )

  const downloadCSV = () => {
    const headers = 'time,x,y,action\n'
    const rows = interactions.value
      .map(({ time, x, y, action }) => `${time},${x},${y},${action}`)
      .join('\n')
    const csvContent = headers + rows

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = composeName(recordedTime.value, selectedOption.value ?? '')
    a.click()

    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (isRecording.value) {
      const interval = setInterval(() => {
        time.setValue(time.value + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
    time.setValue(0)
  }, [isRecording.value, time])

  const stopRecord = useCallback(() => {
    if (isRecording.value) {
      isRecording.setFalse()
      recordedTime.setValue(time.value)
      showGraphModal.setTrue()
    }
  }, [isRecording, recordedTime, time.value, showGraphModal])

  const onKeyboardPress = useCallback(
    (e: KeyboardEvent) => {
      if (showGraphModal.value) {
        return
      }

      if (e.code === 'Space') {
        isSpaceButtonClick.setTrue()
        isRecording.setTrue()
        generateRandomInteraction()
      } else if (e.code === 'Escape' && isRecording.value) {
        stopRecord()
      }
    },
    [isSpaceButtonClick, showGraphModal, isRecording, generateRandomInteraction, stopRecord],
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyboardPress)
    window.addEventListener('keyup', isSpaceButtonClick.setFalse)

    return () => {
      window.removeEventListener('keydown', onKeyboardPress)
      window.removeEventListener('keyup', isSpaceButtonClick.setFalse)
    }
  }, [isSpaceButtonClick.setFalse, onKeyboardPress])

  const selectedOption = useStateful<ViewMode | null>('mail')

  const isSendEmailLoading = useBoolean(false)

  const sendDataByMail = async (data: string[]) => {
    isSendEmailLoading.setTrue()
    await fetch(`${API_URL}/send-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        fileName: composeName(recordedTime.value, selectedOption.value ?? ''),
      }),
    })
    isSendEmailLoading.setFalse()
  }

  return (
    <>
      <div className="MouseMoveRecorder">
        <Navbar>
          <If condition={isRecording.value}>
            <Then>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TimerView seconds={time.value} />
                &nbsp;
                <p className="MouseActivityTracker__instructions">
                  Appuyez sur la touche{' '}
                  <KeyboardButton pressed={isSpaceButtonClick.value}>Échap</KeyboardButton> de votre
                  clavier pour arreter l'enregistrement
                </p>
              </div>
            </Then>
            <Else>
              <p className="MouseActivityTracker__instructions">
                Appuyez sur la touche{' '}
                <KeyboardButton pressed={isSpaceButtonClick.value}>Espace</KeyboardButton> de votre
                clavier pour lancer l'enregistrement
              </p>
            </Else>
          </If>
          <Select.Root
            onValueChange={(val) => selectedOption.setValue(val as ViewMode)}
            defaultValue="mail"
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Item value="mail">Faux client mail</Select.Item>
                <Select.Item value="forms">Formes interactives</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Navbar>
        <CursorTrackingArea
          onSizeChange={onCursorTrackingAreaSizeChange}
          onEvent={onEvent}
          recording={isRecording.value}
        >
          <Switch>
            <Case condition={selectedOption.value === 'mail'}>
              <If condition={isRecording.value}>
                <Then>
                  <FakeMailApp />
                </Then>
                <Else>
                  <div className="FakeAppPlaceHolder__area">
                    <IconMail className="icon" color="white" strokeWidth={1} size={150} />
                  </div>
                </Else>
              </If>
            </Case>
            <Case condition={selectedOption.value === 'forms'}>
              <If condition={isRecording.value}>
                <Then>{interactionItemView}</Then>
                <Else>
                  <div className="FakeAppPlaceHolder__area">
                    <IconClick className="icon" color="white" strokeWidth={1} size={150} />
                  </div>
                </Else>
              </If>
            </Case>
          </Switch>
        </CursorTrackingArea>
      </div>
      <GraphModal
        open={showGraphModal.value}
        onClose={() => {
          showGraphModal.setFalse()
          interactions.setValue([])
        }}
        data={interactions.value}
        onDonwloadButtonClick={downloadCSV}
        onSendByEmailButtonClick={sendDataByMail}
        loading={isSendEmailLoading.value}
      />
    </>
  )
}
