import { useEditorStore } from '@renderer/store/useEditorStore'

export function StatusBar(): React.ReactElement {
  const content = useEditorStore(
    (state) => state.tabs.find((tab) => tab.id === state.activeTabId)?.content ?? ''
  )

  return (
    <div className="flex justify-end p-1">
      <span>
        Linhas: {content.split('\n').length} | Palavras:{' '}
        {content.trim().split(/\s+/).filter(Boolean).length}
      </span>
    </div>
  )
}
