export interface EditorDocument {
  id: string
  content: string
  filePath: string | null
  isDirty: boolean
  history: {
    past: string[]
    future: string[]
  }
}

export function factoryCreateDocument(): EditorDocument {
  return {
    id: window.crypto.randomUUID(),
    content: '',
    filePath: null,
    isDirty: false,
    history: {
      past: [],
      future: []
    }
  }
}

export function createADocument(
  documentData: Omit<EditorDocument, 'id' | 'history' | 'isDirty'>
): EditorDocument {
  return {
    ...documentData,
    id: window.crypto.randomUUID(),
    history: {
      past: [],
      future: []
    },
    isDirty: false
  }
}
