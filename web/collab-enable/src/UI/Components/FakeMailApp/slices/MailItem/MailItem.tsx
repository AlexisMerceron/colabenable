import { FunctionComponent } from 'react'
import { Menu, TriggerEvent, useContextMenu } from 'react-contexify'
import clsx from 'clsx'
import 'react-contexify/ReactContexify.css'
import './MailItem.scss'
import { Flex, Text } from '@radix-ui/themes'

interface MailItemProps {
  fullName?: string
  object?: string
  content?: string,
  onClick?: () => void,
  selected?: boolean,
  onDeleteClick?: () => void
}

export const MailItem: FunctionComponent<MailItemProps> = ({ fullName, object, content, onClick, selected, onDeleteClick }) => {
  const { show } = useContextMenu({
    id: fullName ?? '',
  })

  function handleContextMenu(event: TriggerEvent){
    show({
      event,
      props: {
        key: 'value'
      }
    })
  }

  return (
    <>
    <Flex direction="column" gap="0" className={clsx('MailItem', { selected })} onContextMenu={handleContextMenu} onClick={onClick}>
      <Text weight="bold" size="2">{fullName}</Text>
      <Text size="2">{object}</Text>
      <Text color="gray" size="2">{content}</Text>
    </Flex>
    <Menu className="ContextMenu" id={fullName ?? ''}>
      <p className="ContextMenu__item">Copier</p>
      <p className="ContextMenu__item text-red" onClick={onDeleteClick}>Supprimer</p>
    </Menu>
    </>
  )
}
