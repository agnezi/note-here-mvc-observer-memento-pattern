import { useEditorStore } from '@renderer/store/useEditorStore'
import { useEffect, useRef } from 'react'

export function Editor(): React.ReactElement {
  const debouncerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeTabId = useEditorStore((state) => state.activeTabId)
  const editorDocument = useEditorStore((state) =>
    state.tabs.find((tab) => tab.id === state.activeTabId)
  )
  const updateContent = useEditorStore((state) => state.updateContent)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const saveContentHistorySnapshot = useEditorStore((state) => state.saveContentHistorySnapshot)
  const saveActiveTab = useEditorStore((state) => state.saveActiveTab)
  const openFile = useEditorStore((state) => state.openFile)

  function handleKeyDown(e: KeyboardEvent): void {
    if (activeTabId && (e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault()
      if (e.shiftKey) {
        redo(activeTabId)
      } else {
        undo(activeTabId)
      }
    }

    if (activeTabId && (e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      saveActiveTab(activeTabId)
    }
    if (activeTabId && (e.metaKey || e.ctrlKey) && e.key === 'o') {
      e.preventDefault()
      openFile()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTabId, undo, redo, openFile, saveActiveTab])

  useEffect(() => {
    return () => clearTimeout(debouncerTimer.current ?? undefined)
  }, [])

  function onTextAreaChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    if (activeTabId) {
      updateContent(activeTabId, e.target.value)
      clearTimeout(debouncerTimer.current ?? undefined)

      debouncerTimer.current = setTimeout(() => {
        saveContentHistorySnapshot(activeTabId)
      }, 500)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <textarea
        value={editorDocument?.content ?? ''}
        onChange={onTextAreaChange}
        className="flex-1 resize-none focus:outline-none font-mono p-4 bg-gray-100 text-gray-900"
      />
    </div>
  )
}
