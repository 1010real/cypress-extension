import { getStorage, setStorage } from '../lib/storage'

let storage

export default (window: Window) => {
  const document = window.document
  const togglebtn: HTMLButtonElement = document.querySelector('#togglebtn')
  const clearbtn: HTMLButtonElement = document.querySelector('#clearbtn')
  const textarea: HTMLTextAreaElement = document.querySelector('#log')
  const status: HTMLElement = document.querySelector('#status')

  const setStatus = (startLog: boolean) => {
    status.innerText = startLog ? 'logging...' : 'idle'
    togglebtn.innerText = startLog ? '停止' : '開始'
  }

  const setTextArea = (log: string[]) => {
    textarea.value = log.map((item) => `cy.get("${item}")`).join('\n')
  }

  togglebtn.onclick = async () => {
    storage = { ...storage, startLog: !storage.startLog }
    await setStorage(storage)
    setStatus(storage.startLog)
  }

  clearbtn.onclick = async () => {
    storage = { ...storage, log: [] }
    await setStorage(storage)
    setTextArea(storage.log)
  }

  window.onload = async (e) => {
    storage = await getStorage()
    setStatus(storage.startLog)
    setTextArea(storage.log)
  }
}
