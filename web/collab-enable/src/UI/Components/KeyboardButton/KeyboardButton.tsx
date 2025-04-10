import './KeyboardButton.scss'

import clsx from 'clsx'
import { FunctionComponent, PropsWithChildren } from 'react'

// Interface des propriétés du composant KeyboardButton
interface KeyboardButtonProps extends PropsWithChildren {
  pressed?: boolean // Indicateur si le bouton est pressé
}

// Composant fonctionnel pour afficher un bouton de clavier
export const KeyboardButton: FunctionComponent<KeyboardButtonProps> = ({ pressed, children }) => {
  return <p className={clsx('KeyboardButton', { pressed })}>{children}</p>
}