import clsx from 'clsx'
import { FunctionComponent, PropsWithChildren } from 'react'
import { Text } from '@radix-ui/themes'

import './KeyboardButton.scss'

// Interface des propriétés du composant KeyboardButton
interface KeyboardButtonProps extends PropsWithChildren {
  pressed?: boolean // Indicateur si le bouton est pressé
}

// Composant fonctionnel pour afficher un bouton de clavier
export const KeyboardButton: FunctionComponent<KeyboardButtonProps> = ({ pressed, children }) => {
  return (
    <Text size="1" className={clsx('KeyboardButton', { pressed })}>
      {children}
    </Text>
  )
}
