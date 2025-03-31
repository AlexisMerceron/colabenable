import './KeyboardButton.scss'

import clsx from 'clsx'
import { FunctionComponent, PropsWithChildren } from 'react'

interface KeyboardButtonProps extends PropsWithChildren {
  pressed?: boolean
}

export const KeyboardButton: FunctionComponent<KeyboardButtonProps> = ({ pressed, children }) => {
  return <div className={clsx('KeyboardButton', { pressed })}>{children}</div>
}
