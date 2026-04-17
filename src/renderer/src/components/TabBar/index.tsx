import { useEditorStore } from '@renderer/store/useEditorStore'
import React from 'react'

export function TabBar(): React.ReactElement {
  const tabs = useEditorStore((state) => state.tabs)
  const activeTabId = useEditorStore((state) => state.activeTabId)
  const setActiveTab = useEditorStore((state) => state.setActiveTab)
  const createTab = useEditorStore((state) => state.createTab)
  const closeTab = useEditorStore((state) => state.closeTab)

  return (
    <>
      <div className="flex bg-gray-800 h-9 items-end">
        {tabs.map((tab) => (
          <div key={tab.id} className="flex items-center">
            <button
              onClick={() => setActiveTab(tab.id)}
              className={
                tab.id === activeTabId
                  ? 'bg-gray-100 text-gray-900 px-4 py-1.5 text-sm'
                  : 'bg-gray-700 text-gray-400 px-4 py-1.5 text-sm hover:bg-gray-600'
              }
            >
              {tab.isDirty ? '* ' : ''}
              {tab.filePath ? tab.filePath?.split('/').at(-1) : 'Sem título'}
            </button>
            <button
              onClick={() => closeTab(tab.id)}
              className="text-red-600 hover:text-white hover:bg-gray-600 rounded px-1 text-xs ml-1"
            >
              X
            </button>
          </div>
        ))}
        <button
          onClick={createTab}
          className="text-gray-400 hover:text-white px-3 py-1.5 hover:bg-ray-700 text-lg"
        >
          +
        </button>
      </div>
    </>
  )
}
