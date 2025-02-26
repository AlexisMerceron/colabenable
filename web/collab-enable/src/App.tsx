import { MouseMoveRecorder } from './UI/Pages'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import './App.css'

function App() {
  return (
    <Theme grayColor="slate">
      <MouseMoveRecorder />
    </Theme>
  )
}

export default App
