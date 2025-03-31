import './TimerView.scss'

import { TimeUtils } from '@utils/TimeUtils'
import { FunctionComponent } from 'react'

interface TimerViewProps {
  seconds: number
}

export const TimerView: FunctionComponent<TimerViewProps> = ({ seconds }) => {
  return <div className="TimerView">{TimeUtils.formatSeconds(seconds)}</div>
}
