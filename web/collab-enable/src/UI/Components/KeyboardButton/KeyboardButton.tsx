import { FunctionComponent, PropsWithChildren } from 'react'
import clsx from 'clsx'
import './KeyboardButton.scss'

interface KeyboardButtonProps extends PropsWithChildren {
  pressed?: boolean
}

export const KeyboardButton: FunctionComponent<KeyboardButtonProps> = ({ pressed, children }) => {
  return (
    <div className={clsx('KeyboardButton', { pressed })}>
      {children}
    </div>
  )
}
