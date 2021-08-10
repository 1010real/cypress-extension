import { getStorage, setStorage, initStorage } from '../lib/storage'

export default () => {
  chrome.runtime.onInstalled.addListener(async ({}) => {
    await initStorage()
    chrome.tabs.create({ url: 'https://console.smartmat.io/' })
  })

  const handleActionClick = async () => {
    const storage = await getStorage()
  }
  chrome.action.onClicked.addListener(handleActionClick)

  const handleMessage = async (request: any) => {
    const storage = await getStorage()
    switch (request.action) {
      case 'startLog':
        await setStorage({ ...storage, startLog: true })
        return { data: 'success to start logging' }

      case 'endLog':
        await setStorage({ ...storage, startLog: true })
        return { data: 'success to end logging' }

      case 'log':
        if (!storage.startLog) return
        console.log(
          request.data.params.type,
          request.data.params.targetType,
          request.data.params.inputData
        )
        await setStorage({
          ...storage,
          log: [...storage.log, request.data.params],
        })
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('onMessage', request.action)
    handleMessage(request).then((value) => sendResponse(value))
    return request.needResponse
  })

  chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {})
}
