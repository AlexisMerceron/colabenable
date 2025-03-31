import '@radix-ui/themes/styles.css'
import './App.css'

import { MouseMoveRecorder } from '@pages/MouseMoveRecorder/MouseMoveRecorder'
import { Theme } from '@radix-ui/themes'

function App() {
  return (
    <Theme grayColor="slate">
      <MouseMoveRecorder />
    </Theme>
  )
}

export default App
