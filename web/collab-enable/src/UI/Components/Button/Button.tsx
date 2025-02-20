import { FunctionComponent, ReactNode } from 'react'
import './Button.scss'
import clsx from 'clsx'

interface ButtonProps {
  children: ReactNode,
  onClick?: () => void,
  variant?: 'white',
  className?: string
}

export const Button: FunctionComponent<ButtonProps> = ({ children, onClick, variant, className }) => {
  return (
    <button className={clsx("Button", variant, className)} onClick={onClick}>
      {children}
    </button>
  )
}
