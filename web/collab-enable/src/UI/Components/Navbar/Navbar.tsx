import { FunctionComponent, PropsWithChildren } from 'react'
import './Navbar.scss'

export const Navbar: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <div className="Navbar">
      <div className="Navbar__actions--area">
        {children}
      </div>
    </div>
  )
}
