import './MouseMoveRecorder.scss';

import {
  CursorAction,
  CursorTrackingArea,
} from '@components/CursorTrackingArea/CursorTrackingArea';
import { DoubleClickItem } from '@components/DoubleClickItem/DoubleClickItem';
import { FakeMailApp } from '@components/FakeMailApp/FakeMailApp';
import { GraphModal } from '@components/GraphModal/GraphModal';
import { KeyboardButton } from '@components/KeyboardButton/KeyboardButton';
import { LeftClickItem } from '@components/LeftClickItem/LeftClickItem';
import { Navbar } from '@components/Navbar/Navbar';
import { RightClickItem } from '@components/RightClickItem/RightClickItem';
import { TimerView } from '@components/TimerView/TimerView';
import { IconClick, IconMail } from '@tabler/icons-react';
import { TimeUtils } from '@utils/TimeUtils';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useBoolean, useStateful } from 'react-hanger';
import { Case, Else, If, Switch, Then } from 'react-if';
import Select from 'react-select';

const API_URL = import.meta.env.VITE_API_URL;

const ITEM_WIDTH = 50;
const ITEM_HEIGHT = 50;

interface ViewMode {
  value: 'forms' | 'mail';
  label: string;
}

interface SelectTimer {
  value: number;
  label: string;
}

const options: ViewMode[] = [
  { value: 'forms', label: 'Formes interactives' },
  { value: 'mail', label: 'Faux client mail' },
];

const optionsTime: SelectTimer[] = [
  { value: -1, label: 'Aucune' },
  { value: 30, label: '30 secondes' },
  { value: 60, label: '60 secondes' },
  { value: 120, label: '120 secondes' },
];

enum InteractionType {
  LEFT_CLICK = 'LEFT_CLICK',
  DOUBLE_CLICK = 'DOUBLE_CLICK',
  RIGHT_CLICK = 'RIGHT_CLICK',
  DRAG = 'DRAG',
}

interface InteractionData {
  x: number;
  y: number;
  type: InteractionType;
  xEnd?: number;
  yEnd?: number;
}

const getRandomInteractionType = (): InteractionType => {
  const values = Object.values(InteractionType);
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
};

const getRandomPosition = (maxX: number, maxY: number) => {
  const x = Math.floor(Math.random() * (maxX - ITEM_WIDTH));
  const y = Math.floor(Math.random() * (maxY - ITEM_HEIGHT));
  return { x, y };
};

const composeName = (seconds: number, appMode: string) =>
  `${Date.now()}_${TimeUtils.formatSeconds(
    seconds
  )}_${appMode}_interactions.csv`;

export const MouseMoveRecorder: FunctionComponent = () => {
  
  const selectedOption = useStateful<ViewMode | null>(options[1]);
  const selectedTimeOption = useStateful<SelectTimer | null>(optionsTime[0]);

  const isSendEmailLoading = useBoolean(false);
  const currentInteraction = useStateful<InteractionData | undefined>({
    x: 10,
    y: 300,
    type: InteractionType.LEFT_CLICK,
  });
  const cursorTrackingAreaSize = useStateful<
    { w: number; h: number } | undefined
  >(undefined);

  const showGraphModal = useBoolean(false);
  const isSpaceButtonClick = useBoolean(false);
  const isRecording = useBoolean(false);

  const time = useStateful(0);
  const recordedTime = useStateful(0);

  const onCursorTrackingAreaSizeChange = (w: number, h: number) => {
    cursorTrackingAreaSize.setValue({ w, h });
  };

  const generateRandomInteraction = useCallback(() => {
    const { x, y } = getRandomPosition(
      cursorTrackingAreaSize.value?.w ?? 0,
      cursorTrackingAreaSize.value?.h ?? 0
    );
    const interactionType = getRandomInteractionType();

    if (interactionType === InteractionType.DRAG) {
      const { x: xEnd, y: yEnd } = getRandomPosition(
        cursorTrackingAreaSize.value?.w ?? 0,
        cursorTrackingAreaSize.value?.h ?? 0
      );
      currentInteraction.setValue({
        x,
        y,
        type: InteractionType.LEFT_CLICK,
        xEnd,
        yEnd,
      });
    } else {
      currentInteraction.setValue({
        x,
        y,
        type: interactionType,
      });
    }
  }, [currentInteraction, cursorTrackingAreaSize.value]);

  const interactionItemView = useMemo(() => {
    switch (currentInteraction.value?.type) {
      case InteractionType.LEFT_CLICK:
        return (
          <LeftClickItem
            x={currentInteraction.value.x}
            y={currentInteraction.value.y}
            onResolve={generateRandomInteraction}
          />
        );

      case InteractionType.DOUBLE_CLICK:
        return (
          <DoubleClickItem
            x={currentInteraction.value.x}
            y={currentInteraction.value.y}
            onResolve={generateRandomInteraction}
          />
        );

      case InteractionType.RIGHT_CLICK:
        return (
          <RightClickItem
            x={currentInteraction.value.x}
            y={currentInteraction.value.y}
            onResolve={generateRandomInteraction}
          />
        );
    }
  }, [currentInteraction.value, generateRandomInteraction]);

  const debug = useStateful('');

  const onEvent = (x: number, y: number, action: CursorAction) => {
    debug.setValue(`${Date.now()},${x},${y},${action}`);
    if (isRecording.value) {
      interactions.setValue([
        ...interactions.value,
        { time: Date.now(), x, y, action },
      ]);
    }
  };

  const interactions = useStateful<
    { time: number; x: number; y: number; action: CursorAction }[]
  >([]);

  const downloadCSV = () => {
    const headers = 'time,x,y,action\n';
    const rows = interactions.value
      .map(({ time, x, y, action }) => `${time},${x},${y},${action}`)
      .join('\n');
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = composeName(
      recordedTime.value,
      selectedOption.value?.value ?? ''
    );
    a.click();

    URL.revokeObjectURL(url);
  };

  const stopRecord = useCallback(() => {
    if (isRecording.value) {
      isRecording.setFalse();
      recordedTime.setValue(time.value);
      showGraphModal.setTrue();
    }
  }, [isRecording, recordedTime, time.value, showGraphModal]);

  useEffect(() => {
    if (isRecording.value && selectedTimeOption.value?.value !== time.value) {
      const interval = setInterval(() => {
        time.setValue(time.value + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    stopRecord();
    time.setValue(0);
  }, [isRecording.value, time, selectedTimeOption, stopRecord]);

  const onKeyboardPress = useCallback(
    (e: KeyboardEvent) => {
      if (showGraphModal.value) {
        return;
      }

      if (e.code === 'Space') {
        isSpaceButtonClick.setTrue();
        isRecording.setTrue();
        generateRandomInteraction();
      } else if (e.code === 'Escape' && isRecording.value) {
        stopRecord();
      }
    },
    [
      isSpaceButtonClick,
      showGraphModal,
      isRecording,
      generateRandomInteraction,
      stopRecord,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyboardPress);
    window.addEventListener('keyup', isSpaceButtonClick.setFalse);

    return () => {
      window.removeEventListener('keydown', onKeyboardPress);
      window.removeEventListener('keyup', isSpaceButtonClick.setFalse);
    };
  }, [isSpaceButtonClick.setFalse, onKeyboardPress]);

  const sendDataByMail = async (data: string[]) => {
    isSendEmailLoading.setTrue();
    await fetch(`${API_URL}/send-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        fileName: composeName(
          recordedTime.value,
          selectedOption.value?.value ?? ''
        ),
      }),
    });
    isSendEmailLoading.setFalse();
  };

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
                  <KeyboardButton pressed={isSpaceButtonClick.value}>
                    Échap
                  </KeyboardButton>{' '}
                  de votre clavier pour arreter l'enregistrement
                </p>
              </div>
            </Then>
            <Else>
              <p className="MouseActivityTracker__instructions">
                Appuyez sur la touche{' '}
                <KeyboardButton pressed={isSpaceButtonClick.value}>
                  Espace
                </KeyboardButton>{' '}
                de votre clavier pour lancer l'enregistrement
              </p>
            </Else>
          </If>
          <Select
            className="Select"
            classNamePrefix="Select"
            defaultValue={selectedOption.value}
            onChange={selectedOption.setValue}
            options={options}
          />
          <p className="MouseActivityTracker__instructions">Durée: </p>
          <Select
            className="SelectTime"
            classNamePrefix="SelectTime"
            defaultValue={selectedTimeOption.value}
            onChange={selectedTimeOption.setValue}
            options={optionsTime}
          />
        </Navbar>
        <CursorTrackingArea
          onSizeChange={onCursorTrackingAreaSizeChange}
          onEvent={onEvent}
          recording={isRecording.value}
        >
          <Switch>
            <Case condition={selectedOption.value?.value === 'mail'}>
              <If condition={isRecording.value}>
                <Then>
                  <FakeMailApp />
                </Then>
                <Else>
                  <div className="FakeAppPlaceHolder__area">
                    <IconMail
                      className="icon"
                      color="white"
                      strokeWidth={1}
                      size={150}
                    />
                  </div>
                </Else>
              </If>
            </Case>
            <Case condition={selectedOption.value?.value === 'forms'}>
              <If condition={isRecording.value}>
                <Then>{interactionItemView}</Then>
                <Else>
                  <div className="FakeAppPlaceHolder__area">
                    <IconClick
                      className="icon"
                      color="white"
                      strokeWidth={1}
                      size={150}
                    />
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
          showGraphModal.setFalse();
          interactions.setValue([]);
        }}
        data={interactions.value}
        onDonwloadButtonClick={downloadCSV}
        onSendByEmailButtonClick={sendDataByMail}
        loading={isSendEmailLoading.value}
      />
    </>
  );
};
