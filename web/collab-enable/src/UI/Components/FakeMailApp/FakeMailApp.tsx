import './FakeMailApp.scss'

import { Badge, Box, Button, Flex, Heading, Text, TextArea } from '@radix-ui/themes'
import { IconClipboardList, IconForbid2, IconHelp, IconShare3 } from '@tabler/icons-react'
import { RandomUtils } from '@utils'
import { FunctionComponent, useCallback, useMemo } from 'react'
import { useArray, useBoolean, useInput, useStateful } from 'react-hanger'
import { Else, If, Then } from 'react-if'

import { Mail, MailItem, NewMail } from './slices'

// Définir l'interface FakeEmail
interface FakeEmail {
  id: number
  fullName: string
  object: string
  content: string
  reponses: { message: string; id: string }[]
}

// Exemple de faux e-mails
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

// Exemple de noms de destinataires
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

// Définir les types de tâches
type Task = 'email_send' | 'email_delete' | 'email_open' | 'help_click' | 'email_reply'

// Définir la liste des tâches
const tasks: Task[] = ['email_send', 'email_delete', 'email_open', 'help_click', 'email_reply']

// Définir les libellés d'action
const actionLabels: Record<string, string> = {
  email_delete: 'Supprimez le mail de ',
  email_send: 'Envoyez un mail à ',
  email_open: 'Ouvrez le mail de ',
  email_reply: 'Répondez au mail de ',
}

// Définir l'interface ResolutionStack
interface ResolutionStack {
  label: string
  startTime: number
  endTime: number
  type: Task
}

// Définir l'interface MissionData
interface MissionData {
  type: Task
  label: string
  payload?: string
}

export const FakeMailApp: FunctionComponent = () => {
  const selectedMail = useStateful<FakeEmail | null>(null)
  const fakeMails = useArray(FAKE_MAILS)
  const resolutionsStack = useArray<ResolutionStack>([])

  const isEditMode = useBoolean(false)
  const isReplyMode = useBoolean(false)

  // Gérer la suppression d'un e-mail
  const onDeleteClick = (fakeEmail: FakeEmail) => {
    fakeMails.setValue((mails) => mails.filter((mail) => mail.id !== fakeEmail.id))

    if (selectedMail.value?.id === fakeEmail.id) {
      selectedMail.setValue(null)
    }
  }

  // Générer une mission aléatoire
  const generateRandomMission = useCallback(() => {
    const randomTaskIndex = Math.floor(RandomUtils.getNumber() * tasks.length)
    let task: Task = 'email_send'
    if (fakeMails.value.length > 0) {
      task = tasks[randomTaskIndex]
    }

    if (['email_delete', 'email_send', 'email_open', 'email_reply'].includes(task)) {
      let randomFullname =
        fakeMails.value[Math.floor(RandomUtils.getNumber() * fakeMails.value.length)]?.fullName ??
        ''

      if (task === 'email_send') {
        randomFullname = recipientNames[Math.floor(RandomUtils.getNumber() * recipientNames.length)]
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

  const missionStartTime = useMemo(() => Date.now(), [])

  // Calculer le score de la tâche
  const computeTaskScore = () => {
    resolutionsStack.push({
      startTime: missionStartTime,
      endTime: Date.now(),
      label: missionData.value.label,
      type: missionData.value.type,
    })
  }

  // Gérer l'envoi d'un nouvel e-mail
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

  // Gérer l'accomplissement de la tâche
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

  // Gérer l'envoi d'une réponse
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

  // Calculer le score basé sur la pile de résolutions
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
              "Lorem Ipsum est simplement du faux texte de l'industrie de l'imprimerie et de la composition. Lorem Ipsum est le faux texte standard de l'industrie depuis les années 1500.",
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
