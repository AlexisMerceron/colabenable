import './TimerView.scss'

import { TimeUtils } from '@utils/TimeUtils'
import { FunctionComponent } from 'react'

// Interface des propriétés du composant TimerView
interface TimerViewProps {
  seconds: number // Nombre de secondes à afficher
}

// Composant fonctionnel pour afficher un timer
export const TimerView: FunctionComponent<TimerViewProps> = ({ seconds }) => {
  return <div className="TimerView">{TimeUtils.formatSeconds(seconds)}</div>
}