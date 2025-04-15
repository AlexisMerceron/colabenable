import './MouseMoveRecorder.scss';

import { ClickItem } from '@components/ClickItem/ClickItem';
import {
  CursorAction,
  CursorTrackingArea,
} from '@components/CursorTrackingArea/CursorTrackingArea';
import { FakeMailApp } from '@components/FakeMailApp/FakeMailApp';
import { GraphModal } from '@components/GraphModal/GraphModal';
import { KeyboardButton } from '@components/KeyboardButton/KeyboardButton';
import { Navbar } from '@components/Navbar/Navbar';
import { TimerView } from '@components/TimerView/TimerView';
import {
  Button,
  Dialog,
  Flex,
  Select,
  Switch as SwitchWiget,
  Text,
  TextField,
} from '@radix-ui/themes';
import { IconClick, IconMail } from '@tabler/icons-react';
import { RandomUtils } from '@utils/RandomUtils';
import { TimeUtils } from '@utils/TimeUtils';
import { useState } from 'react';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useBoolean, useInput, useStateful } from 'react-hanger';
import { Case, Else, If, Switch, Then } from 'react-if';

const API_URL = import.meta.env.VITE_API_URL;

const ITEM_WIDTH = 50;
const ITEM_HEIGHT = 50;

interface ViewMode {
  value: 'forms' | 'mail';
  label: string;
}

interface SelectTimer {
  value: string;
  label: string;
}

const options: ViewMode[] = [
  { value: 'forms', label: 'Formes interactives' },
  { value: 'mail', label: 'Faux client mail' },
];

const optionsTime: SelectTimer[] = [
  { value: '-1', label: 'Aucune' },
  { value: '60', label: '1 minute' },
  { value: '180', label: '3 minutes' },
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

// Générer un type d'interaction aléatoire
const getRandomInteractionType = (): InteractionType => {
  const values = Object.values(InteractionType);
  const randomIndex = Math.floor(RandomUtils.getNumber() * values.length);
  return values[randomIndex];
};

// Générer une position aléatoire dans les limites données
const getRandomPosition = (maxX: number, maxY: number) => {
  const x = Math.floor(RandomUtils.getNumber() * (maxX - ITEM_WIDTH));
  const y = Math.floor(RandomUtils.getNumber() * (maxY - ITEM_HEIGHT));
  return { x, y };
};

// Composer un nom de fichier basé sur l'heure actuelle, les secondes formatées et le mode de l'application
const composeName = (seconds: number, appMode: string) => {
  const timestamp = Date.now();
  const formattedTime = TimeUtils.formatSeconds(seconds);
  const seedPart = RandomUtils.isRandomSeed()
    ? ''
    : `seed-${RandomUtils.getInitSeed()}_`;

  return `${timestamp}_${seedPart}${formattedTime}_${appMode}_interactions.csv`;
};

export const MouseMoveRecorder: FunctionComponent = () => {
  // État pour l'interaction actuelle
  const currentInteraction = useStateful<InteractionData | undefined>({
    x: 10,
    y: 300,
    type: InteractionType.LEFT_CLICK,
  });

  // État pour la taille de la zone de suivi du curseur
  const cursorTrackingAreaSize = useStateful<
    { w: number; h: number } | undefined
  >(undefined);

  // États booléens pour divers éléments de l'interface utilisateur
  const showGraphModal = useBoolean(false);
  const isSpaceButtonClick = useBoolean(false);
  const isRecording = useBoolean(false);

  // États pour le suivi du temps
  const time = useStateful(0);
  const recordedTime = useStateful(0);

  // Gérer le changement de taille de la zone de suivi du curseur
  const onCursorTrackingAreaSizeChange = (w: number, h: number) => {
    cursorTrackingAreaSize.setValue({ w, h });
  };

  // Générer une interaction aléatoire
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
        type: InteractionType.DRAG,
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

  // Déterminer la vue de l'élément d'interaction en fonction du type d'interaction actuel
  const interactionItemView = useMemo(() => {
    switch (currentInteraction.value?.type) {
      case InteractionType.LEFT_CLICK:
        return (
          <ClickItem
            key={`${currentInteraction.value.x}-${currentInteraction.value.y}-left`}
            x={currentInteraction.value.x}
            y={currentInteraction.value.y}
            onResolve={generateRandomInteraction}
            type="left"
          />
        );
      case InteractionType.DOUBLE_CLICK:
        return (
          <ClickItem
            key={`${currentInteraction.value.x}-${currentInteraction.value.y}-double`}
            x={currentInteraction.value.x}
            y={currentInteraction.value.y}
            onResolve={generateRandomInteraction}
            type="double"
          />
        );
      case InteractionType.RIGHT_CLICK:
        return (
          <ClickItem
            key={`${currentInteraction.value.x}-${currentInteraction.value.y}-right`}
            x={currentInteraction.value.x}
            y={currentInteraction.value.y}
            onResolve={generateRandomInteraction}
            type="right"
          />
        );
      case InteractionType.DRAG:
        if (
          currentInteraction.value?.xEnd !== undefined &&
          currentInteraction.value?.yEnd !== undefined
        ) {
          return (
            <>
              <ClickItem
                key={`${currentInteraction.value.x}-${currentInteraction.value.yEnd}-dragEnd`}
                x={currentInteraction.value.xEnd}
                y={currentInteraction.value.yEnd}
                onResolve={generateRandomInteraction}
                type="dragEnd"
              />
              <ClickItem
                key={`${currentInteraction.value.x}-${currentInteraction.value.y}-dragStart`}
                x={currentInteraction.value.x}
                y={currentInteraction.value.y}
                type="dragStart"
              />
            </>
          );
        }
        return null;
      default:
        return null;
    }
  }, [currentInteraction.value, generateRandomInteraction]);

  const debug = useStateful('');
  const [email, setEmail] = useState('');
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

  const onKeyboardPress = useCallback(
    (e: KeyboardEvent) => {
      if (showGraphModal.value) {
        return;
      }

      if (e.code === 'Space') {
        isSpaceButtonClick.setTrue();
        isRecording.setTrue();
        RandomUtils.resetSeed();
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

  const selectedOption = useStateful<ViewMode | null>(options[1]);
  const selectedTimeOption = useStateful<SelectTimer | null>(optionsTime[0]);

  const isSendEmailLoading = useBoolean(false);

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
        recipient: email,
      }),
    });
    isSendEmailLoading.setFalse();
  };

  const seedData = useInput(RandomUtils.getInitSeed());

  const saveSeedValue = () => {
    RandomUtils.setInitSeed(+seedData.value);
  };

  useEffect(() => {
    if (isRecording.value && selectedTimeOption.value?.value !== time.value.toString()) {
      const interval = setInterval(() => {
        time.setValue(time.value + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    stopRecord();
    time.setValue(0);
  }, [isRecording.value, time, selectedTimeOption, stopRecord]);

  return (
    <>
      <div className="MouseMoveRecorder">
        <Navbar>
          <Flex align="center" gap="2">
            <If condition={isRecording.value}>
              <Then>
                <Text color="blue">
                  (seed :{' '}
                  {RandomUtils.isRandomSeed()
                    ? 'aléatoire'
                    : RandomUtils.getInitSeed()}
                  )
                </Text>
                <Flex align="center" gap="1">
                  <TimerView seconds={time.value} />
                  &nbsp;
                  <Text className="MouseActivityTracker__instructions">
                    Appuyez sur la touche
                  </Text>
                  <KeyboardButton pressed={isSpaceButtonClick.value}>
                    Échap
                  </KeyboardButton>
                  <Text className="MouseActivityTracker__instructions">
                    de votre clavier pour arrêter l'enregistrement
                  </Text>
                </Flex>
              </Then>
              <Else>
                <Dialog.Root>
                  <Dialog.Trigger>
                    <Button>Mettre à jour le seed</Button>
                  </Dialog.Trigger>
                  <Dialog.Content maxWidth="450px">
                    <Dialog.Title>Modification de la seed</Dialog.Title>
                    <Flex direction="column" gap="3">
                      <Text as="label" size="2">
                        <Flex gap="2">
                          <SwitchWiget
                            size="2"
                            onCheckedChange={(val) => {
                              if (val) {
                                RandomUtils.activeRandom();
                              } else {
                                RandomUtils.disabledRandom();
                              }
                            }}
                            defaultChecked={RandomUtils.isRandomSeed()}
                          />{' '}
                          Mettre un seed aléatoire
                        </Flex>
                      </Text>
                      <div>
                        <Text as="div" size="2" mb="1" weight="bold">
                          Seed
                        </Text>
                        <TextField.Root
                          value={
                            RandomUtils.isRandomSeed() ? '' : seedData.value
                          }
                          onChange={seedData.onChange}
                          disabled={RandomUtils.isRandomSeed()}
                          placeholder="Un entier"
                        />
                      </div>
                      <Dialog.Close>
                        <Button onClick={saveSeedValue}>
                          Enregistrer la modification
                        </Button>
                      </Dialog.Close>
                    </Flex>
                  </Dialog.Content>
                </Dialog.Root>
                <Flex gap="1" align="center">
                  <Text className="MouseActivityTracker__instructions">
                    Appuyez sur la touche{' '}
                  </Text>
                  <KeyboardButton pressed={isSpaceButtonClick.value}>
                    Espace
                  </KeyboardButton>
                  <Text className="MouseActivityTracker__instructions">
                    de votre clavier pour lancer l'enregistrement
                  </Text>
                </Flex>
              </Else>
            </If>
            <If condition={!isRecording.value}>
              <Then>
                <Select.Root
                  onValueChange={(val) =>
                    selectedOption.setValue(
                      options.find((option) => option.value === val) || null
                    )
                  }
                  defaultValue={selectedOption.value?.value}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Group>
                      <Select.Item value="mail">Faux client mail</Select.Item>
                      <Select.Item value="forms">
                        Formes interactives
                      </Select.Item>
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
                <p className="MouseActivityTracker__instructions">Durée: </p>
                <Select.Root
                  onValueChange={(val) =>
                    selectedTimeOption.setValue(
                      optionsTime.find((option) => option.value === val) || null
                    )
                  }
                  defaultValue={selectedTimeOption.value?.value}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Group >
                      {optionsTime.map((option) => (
                        <Select.Item
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </Then>
            </If>
          </Flex>
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
        onDownloadButtonClick={downloadCSV}
        onSendByEmailButtonClick={sendDataByMail}
        loading={isSendEmailLoading.value}
        onChangeEmail={setEmail}
        email={email}
      />
    </>
  );
};
