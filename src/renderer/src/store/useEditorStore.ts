import { createADocument, EditorDocument, factoryCreateDocument } from '@renderer/models/Document'

import { create } from 'zustand'

type StoreType = {
  tabs: EditorDocument[]
  activeTabId: string | null
  createTab: () => void
  setActiveTab: (id: string) => void
  updateContent: (id: string, content: string) => void
  undo: (id: string) => void
  redo: (id: string) => void
  saveContentHistorySnapshot: (id: string) => void
  saveActiveTab: (id: string) => void
  openFile: () => void
  closeTab: (id: string) => void
}

const initialDoc = factoryCreateDocument()

export const useEditorStore = create<StoreType>((set, get) => ({
  tabs: [initialDoc],
  activeTabId: initialDoc.id,
  createTab: () => {
    set((state) => ({
      ...state,
      tabs: [...state.tabs, factoryCreateDocument()]
    }))
  },
  setActiveTab: (id) => {
    const activeTab = get().tabs.find((tab) => tab.id === id)

    if (activeTab) {
      set((state) => ({
        ...state,
        activeTabId: activeTab.id
      }))
    }
  },
  updateContent: (id, content) => {
    const activeTab = get().tabs.find((tab) => tab.id === id)

    const newTabs = get().tabs.map((tab) =>
      tab.id === id
        ? {
            ...tab,
            content,
            isDirty: true
          }
        : tab
    )
    if (activeTab) {
      set((state) => ({
        ...state,
        tabs: newTabs
      }))
    }
  },
  undo: (id) => {
    const activeTab = get().tabs.find((tab) => tab.id === id)

    if (activeTab?.history?.past && activeTab.history.past.length > 0) {
      const newTabs = get().tabs.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              history: {
                ...tab.history,
                past: tab.history.past.slice(0, -1),
                future: [...tab.history.future, tab.content]
              },
              content: tab.history.past.at(-1) ?? '',
              isDirty: true
            }
          : tab
      )

      set((state) => ({
        ...state,
        tabs: newTabs
      }))
    }
  },
  redo: (id) => {
    const activeTab = get().tabs.find((tab) => tab.id === id)

    if (activeTab?.history?.future && activeTab.history.future.length > 0) {
      const newTabs = get().tabs.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              history: {
                ...tab.history,
                past: [...tab.history.past, tab.content],
                future: tab.history.future.slice(0, -1)
              },
              content: tab.history.future.at(-1) ?? '',
              isDirty: true
            }
          : tab
      )
      set((state) => ({
        ...state,
        tabs: newTabs
      }))
    }
  },
  saveContentHistorySnapshot: (id) => {
    const activeTab = get().tabs.find((tab) => tab.id === id)

    const newTabs = get().tabs.map((tab) =>
      tab.id === id
        ? {
            ...tab,
            history: { ...tab.history, past: [...tab.history.past, tab.content], future: [] }
          }
        : tab
    )
    if (activeTab) {
      set((state) => ({
        ...state,
        tabs: newTabs
      }))
    }
  },
  saveActiveTab: async (id) => {
    const activeTab = get().tabs.find((tab) => tab.id === id)
    const filePath = activeTab?.filePath
    const content = activeTab?.content ?? ''

    if (!filePath && activeTab) {
      const result = await window.api.saveFileAs(content)

      if (!result) return

      const newTabs = get().tabs.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              isDirty: false,
              filePath: result.filePath
            }
          : tab
      )
      if (activeTab) {
        set((state) => ({
          ...state,
          tabs: newTabs
        }))
      }
    }

    if (filePath && activeTab) {
      await window.api.saveFile(filePath, content)

      const newTabs = get().tabs.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              isDirty: false
            }
          : tab
      )
      if (activeTab) {
        set((state) => ({
          ...state,
          tabs: newTabs
        }))
      }
    }
  },
  openFile: async () => {
    const opened = await window.api.openFile()

    if (!opened) {
      return null
    }

    const newDocument = createADocument({
      content: opened.content,
      filePath: opened?.filePath
    })

    set((state) => ({
      ...state,
      tabs: [...state.tabs, newDocument],
      activeTabId: newDocument.id
    }))
  },
  closeTab: async (id) => {
    console.log('closeTab chamado, id:', id)
    const activeTab = get().tabs.find((tab) => tab.id === id)
    const activeTabIndex = get().tabs.findIndex((tab) => tab.id === id)
    const candidateToOpen = get().tabs[activeTabIndex - 1] ?? get().tabs[activeTabIndex + 1]

    if (activeTab?.isDirty) {
      const result = await window.api.confirmCloseTab()

      if (result === 'cancel') {
        return null
      }

      if (result === 'save') {
        await get().saveActiveTab(activeTab.id)
      }
    }

    const newTabs = get().tabs.filter((tab) => tab.id !== id)
    const newTab = factoryCreateDocument()

    if (newTabs.length === 0) {
      set((state) => ({
        ...state,
        tabs: [newTab],
        activeTabId: newTab.id
      }))
    } else {
      set((state) => ({
        ...state,
        tabs: newTabs,
        activeTabId: candidateToOpen.id
      }))
    }
  }
}))
