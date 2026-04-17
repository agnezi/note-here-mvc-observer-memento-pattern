import { TabBar } from './components/TabBar'
import { Editor } from './components/Editor'
import { StatusBar } from './components/StatusBar'

function App(): React.JSX.Element {
  return (
    <div className="flex flex-col h-screen">
      <TabBar />
      <Editor />
      <StatusBar />
    </div>
  )
}

export default App
