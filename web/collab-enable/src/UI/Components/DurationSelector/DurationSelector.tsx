import { FunctionComponent } from 'react'
import './DurationSelector.scss'

interface DurationSelectorProps {
  onValueChange?: (val: number) => void
}

export const DurationSelector: FunctionComponent<DurationSelectorProps> = ({ onValueChange }) => {
  return (
    <div className="DurationSelector">
      <label className='DurationSelector__label'>Durée de l'enregistrement en minutes</label>
      <input type="number" defaultValue={3} min={1} max={60} className='DurationSelector__input' />
    </div>
  )
}
