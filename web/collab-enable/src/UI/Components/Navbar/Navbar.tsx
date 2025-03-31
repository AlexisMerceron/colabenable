import './Navbar.scss'

import { FunctionComponent, PropsWithChildren } from 'react'

export const Navbar: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <div className="Navbar">
      <div className="Navbar__actions--area">{children}</div>
    </div>
  )
}
