import './FakeMailApp.scss'

import { Badge, Box, Button, Flex, Heading, Text, TextArea } from '@radix-ui/themes'
import { IconClipboardList, IconForbid2, IconHelp, IconShare3 } from '@tabler/icons-react'
import { FunctionComponent, useCallback, useMemo } from 'react'
import { useArray, useBoolean, useInput,useStateful } from 'react-hanger'
import { Else,If, Then } from 'react-if'

import { Mail, MailItem, NewMail } from './slices'

interface FakeEmail {
  id: number
  fullName: string
  object: string
  content: string
  reponses: { message: string; id: string }[]
}

const FAKE_MAILS: FakeEmail[] = [
  {
    id: 1,
    fullName: 'Lara Durand',
    object: 'Mise à jour du rapport mensuel',
    content: 'Bonjour, pourriez-vous vérifier le dernier rapport envoyé et me confirmer ? Merci !',
    reponses: [
      {
        id: '1',
        message:
          "Bonjour, j'ai bien pris en compte votre demande. Je vais vérifier le rapport et vous fais un retour rapidement. Bonne journée !",
      },
    ],
  },
  {
    id: 2,
    fullName: 'Florent Morel',
    object: 'Invitation à la réunion de projet',
    content: 'La réunion est prévue demain à 14h. Merci de confirmer votre disponibilité.',
    reponses: [],
  },
  {
    id: 3,
    fullName: 'Sophie Lemoine',
    object: "Problème d'accès au portail",
    content:
      'Bonjour, je rencontre des problèmes pour accéder au portail client. Pouvez-vous m’aider ?',
    reponses: [],
  },
  {
    id: 4,
    fullName: 'Jean Dupuis',
    object: 'Proposition commerciale',
    content: 'Bonjour, voici notre proposition pour la collaboration. Qu’en pensez-vous ?',
    reponses: [],
  },
]

const recipientNames = [
  'Alice',
  'Benjamin',
  'Chloé',
  'David',
  'Émilie',
  'Florian',
  'Gabriel',
  'Hélène',
  'Isabelle',
  'Julien',
  'Paul',
  'Léa',
  'Mathis',
  'Noémie',
  'Olivier',
  'Pauline',
  'Quentin',
  'Raphaël',
  'Sophie',
  'Thomas',
]

type Task = 'email_send' | 'email_delete' | 'email_open' | 'help_click' | 'email_reply'

const tasks: Task[] = ['email_send', 'email_delete', 'email_open', 'help_click', 'email_reply']

const actionLabels: Record<string, string> = {
  email_delete: 'Supprimez le mail de ',
  email_send: 'Envoyez un mail à ',
  email_open: 'Ouvrez le mail de ',
  email_reply: 'Répondez au mail de ',
}

interface ResolutionStack {
  label: string
  startTime: number
  endTime: number
  type: Task
}

interface MissionData {
  type: Task
  label: string
  payload?: string
}

export const FakeMailApp: FunctionComponent = () => {
  const selectedMail = useStateful<(typeof FAKE_MAILS)[0] | null>(null)
  const fakeMails = useArray(FAKE_MAILS)
  const resolutionsStack = useArray<ResolutionStack>([])

  const isEditMode = useBoolean(false)
  const isReplyMode = useBoolean(false)

  const onDeleteClick = (fakeEmail: FakeEmail) => {
    fakeMails.setValue((mails) => mails.filter((mail) => mail.id !== fakeEmail.id))

    if (selectedMail.value?.id === fakeEmail.id) {
      selectedMail.setValue(null)
    }
  }

  const generateRandomMission = useCallback(() => {
    const randomTaskIndex = Math.floor(Math.random() * tasks.length)
    let task: Task = 'email_send'
    if (fakeMails.value.length > 0) {
      task = tasks[randomTaskIndex]
    }

    if (['email_delete', 'email_send', 'email_open', 'email_reply'].includes(task)) {
      let randomFullname =
        fakeMails.value[Math.floor(Math.random() * fakeMails.value.length)]?.fullName ?? ''

      if (task === 'email_send') {
        randomFullname = recipientNames[Math.floor(Math.random() * recipientNames.length)]
      }

      return {
        type: task,
        payload: randomFullname,
        label: actionLabels[task] + randomFullname,
      }
    }

    return {
      type: task,
      label: "Cliquez sur l'aide",
    }
  }, [fakeMails.value])

  const missionData = useStateful<MissionData>(generateRandomMission())

  const missionStartTime = useMemo(() => Date.now(), [missionData])

  const computeTaskScore = () => {
    resolutionsStack.push({
      startTime: missionStartTime,
      endTime: Date.now(),
      label: missionData.value.label,
      type: missionData.value.type,
    })
  }

  const onSendClick = (mail: Mail) => {
    fakeMails.unshift({
      id: Math.max(0, ...fakeMails.value.map((m) => m.id)) + 1,
      fullName: mail.to,
      object: mail.objet,
      content: mail.message,
      reponses: [],
    })
    isEditMode.setFalse()
    onTask('email_send', {
      id: 4,
      fullName: mail.to,
      object: mail.objet,
      content: mail.message,
      reponses: [],
    })
  }

  const onTask = (task: Task, payload?: FakeEmail) => {
    if (missionData.value.type === task && task === 'email_delete') {
      if (payload?.fullName === missionData.value.payload) {
        missionData.setValue(generateRandomMission())
        computeTaskScore()
      }
    } else if (missionData.value.type === task && task === 'email_reply') {
      if (payload?.fullName === missionData.value.payload) {
        missionData.setValue(generateRandomMission())
        computeTaskScore()
      }
    } else if (missionData.value.type === task && task === 'email_send') {
      if (
        payload?.fullName?.toLocaleLowerCase() === missionData.value.payload?.toLocaleLowerCase()
      ) {
        missionData.setValue(generateRandomMission())
        computeTaskScore()
      }
    } else if (missionData.value.type === task && task === 'email_open') {
      if (payload?.fullName === missionData.value.payload) {
        missionData.setValue(generateRandomMission())
        computeTaskScore()
      }
    } else if (missionData.value.type === task && task === 'help_click') {
      missionData.setValue(generateRandomMission())
      computeTaskScore()
    }
  }

  const replyMessage = useInput()

  const onSendReplyClick = () => {
    if (!selectedMail.value || !replyMessage.value.trim()) return

    const updatedMails = fakeMails.value.map((mail) =>
      mail.id === selectedMail.value?.id
        ? {
            ...mail,
            reponses: [...mail.reponses, { message: replyMessage.value, id: String(Date.now()) }],
          }
        : mail,
    )

    fakeMails.setValue(updatedMails)

    const newSelectedMessage = updatedMails.find((mail) => mail.id === selectedMail.value?.id)
    if (newSelectedMessage) {
      selectedMail.setValue(newSelectedMessage)
    }

    replyMessage.setValue('')
    isReplyMode.setFalse()
    onTask('email_reply', selectedMail.value)
  }

  const score = useMemo(() => {
    if (resolutionsStack.value.length === 0) return 0

    let rawScore = 0
    const totalTasks = resolutionsStack.value.length
    const maxTheoreticalScore = totalTasks

    for (const resolution of resolutionsStack.value) {
      const durationInSeconds = (resolution.endTime - resolution.startTime) / 1000

      let taskScore = 1

      switch (resolution.type) {
        case 'email_send':
          if (durationInSeconds > 20) {
            const excess = durationInSeconds - 20
            taskScore = Math.max(0, 1 - excess * 0.05)
          }
          break
        case 'email_delete':
          if (durationInSeconds > 10) {
            const excess = durationInSeconds - 10
            taskScore = Math.max(0, 1 - excess * 0.2)
          }
          break
        case 'email_open':
          if (durationInSeconds > 5) {
            const excess = durationInSeconds - 5
            taskScore = Math.max(0, 1 - excess * 0.2)
          }
          break
        case 'help_click':
          if (durationInSeconds > 5) {
            const excess = durationInSeconds - 5
            taskScore = Math.max(0, 1 - excess * 0.25)
          }
          break
        case 'email_reply':
          if (durationInSeconds > 15) {
            const excess = durationInSeconds - 15
            taskScore = Math.max(0, 1 - excess * 0.067)
          }
          break
      }

      rawScore += taskScore
    }

    const normalizedScore = (rawScore / maxTheoreticalScore) * 20

    return Math.round(Math.min(Math.max(normalizedScore, 0), 20))
  }, [resolutionsStack.value])

  return (
    <div className="FakeMailApp">
      <div className="FakeMailApp__header">
        <Flex align="center" gap="3">
          <Badge size="2" radius="full">
            <IconClipboardList size={16} />
            {missionData.value.label}
          </Badge>
          <Badge color="gray">{score}/20</Badge>
        </Flex>

        <div
          onClick={() => {
            alert(
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
            )
            onTask('help_click')
          }}
          className="FakeMailApp__header__help--icon"
        >
          <IconHelp />
        </div>
      </div>
      <div className="FakeMailApp__sidebar">
        <Button color="yellow" style={{ width: '100%' }} onClick={isEditMode.setTrue}>
          Nouveau mail
        </Button>
        {fakeMails.value.map((fakeMail) => (
          <MailItem
            key={fakeMail.id}
            fullName={fakeMail.fullName}
            object={fakeMail.object}
            content={fakeMail.content}
            onClick={() => {
              selectedMail.setValue(fakeMail)
              isReplyMode.setFalse()
              onTask('email_open', fakeMail)
            }}
            onDeleteClick={() => {
              onDeleteClick(fakeMail)
              onTask('email_delete', fakeMail)
            }}
            selected={fakeMail.id === selectedMail.value?.id}
          />
        ))}
      </div>
      <div className="FakeMailApp__body">
        <If condition={isEditMode.value}>
          <Then>
            <NewMail onSendClick={onSendClick} />
          </Then>
          <Else>
            <If condition={!!selectedMail.value}>
              <Then>
                <Flex direction="column" gap="3">
                  <Flex justify="between" align="center">
                    <Heading>{selectedMail.value?.object}</Heading>
                    <If condition={isReplyMode.value}>
                      <Then>
                        <Button onClick={onSendReplyClick} color="yellow">
                          Envoyer la reponse
                        </Button>
                      </Then>
                      <Else>
                        <Button onClick={isReplyMode.setTrue} color="yellow" variant="outline">
                          <IconShare3 size={16} />
                          Repondre
                        </Button>
                      </Else>
                    </If>
                  </Flex>
                  <If condition={isReplyMode.value}>
                    <Then>
                      <TextArea defaultValue="" onChange={replyMessage.onChange} />
                    </Then>
                  </If>
                  <Text size="2">{selectedMail.value?.content}</Text>
                  <Text size="2">De : {selectedMail.value?.fullName}</Text>
                  {selectedMail.value?.reponses.map((response) => (
                    <Box key={response.id}>
                      <hr />
                      <Text>{response.message}</Text>
                    </Box>
                  ))}
                </Flex>
              </Then>
              <Else>
                <div className="FakeMailApp__empty-state">
                  <IconForbid2 size={180} strokeWidth={0.4} />
                  <Text>Aucun mail sélectionné</Text>
                </div>
              </Else>
            </If>
          </Else>
        </If>
      </div>
    </div>
  )
}
