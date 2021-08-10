const storageKey = '__cy'

const initStorageValue: StorageType = {
  startLog: false,
  log: [],
}

export type StorageType = {
  startLog: boolean
  log: any[]
}

export const initStorage = async () => {
  await setStorage(initStorageValue)
}

export const setStorage = (value: StorageType): Promise<void> => {
  return new Promise((resolve) => {
    // console.log('setStorage', value)
    chrome.storage.sync.set({ [storageKey]: value }, () => {
      resolve()
    })
  })
}

export const getStorage = (): Promise<StorageType> => {
  return new Promise((resolve) =>
    // chrome.storage.sync.get(null, (items) => { // get all storage data for debug
    chrome.storage.sync.get([storageKey], (items) => {
      // console.log('getStorage', items[storageKey])
      resolve(items[storageKey] as StorageType)
    })
  )
}
