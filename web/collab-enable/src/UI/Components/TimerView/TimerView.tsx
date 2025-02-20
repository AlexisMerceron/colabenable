import { FunctionComponent } from 'react'
import './TimerView.scss'
import { TimeUtils } from '../../../Utils'



interface TimerViewProps {
  seconds: number
}

export const TimerView: FunctionComponent<TimerViewProps> = ({ seconds }) => {
  return (
    <div className="TimerView">
      {TimeUtils.formatSeconds(seconds)}
    </div>
  )
}
