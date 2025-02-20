import { FunctionComponent } from 'react'
import { useInput } from 'react-hanger'
import { Button, Flex, Text, TextArea, TextField } from '@radix-ui/themes'
import { IconSend } from '@tabler/icons-react'
import './NewMail.scss'

export interface Mail {
  to: string
  objet: string
  message: string
}

interface NewMailProps {
  onSendClick?: (mail: Mail) => void
  onInputFocus?: () => void
}

export const NewMail: FunctionComponent<NewMailProps> = ({ onSendClick, onInputFocus }) => {
  const to = useInput()
  const objet = useInput()
  const message = useInput()

  return (
    <>
    <Button 
      color="yellow"
      onClick={() => onSendClick?.({
        to: to.value,
        objet: objet.value,
        message: message.value,
      })}
      disabled={!to.value || !objet.value || !message.value}
    >
      <IconSend size={16} />
      Envoyer</Button>
    <div className="NewMail">
      <Flex gap="1" align="center">
        <Text size="2">À :</Text> <TextField.Root onFocus={onInputFocus} size="1" style={{ width: '20ch'}} onChange={to.onChange} />
      </Flex>
      <Flex gap="1" align="center">
        <Text size="2">Objet :</Text> <TextField.Root onFocus={onInputFocus} size="1" style={{ width: '60ch'}} onChange={objet.onChange} />
      </Flex>
      <TextArea onFocus={onInputFocus} className="objet" onChange={message.onChange} />
    </div>
    </>
  )
}
