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

  const setTextArea = (log: any[]) => {
    textarea.value = log
      .map((item) => {
        const selector = `cy.get("${item.selector}")`
        let action: string

        switch (item.targetType) {
          case 'button':
          case 'SPAN':
          case 'DIV':
          case 'A':
          case 'P':
            action = 'click()'
            break
          case 'select-one':
            action = `select('${item.inputData}')`
            break
          case 'checkbox':
          case 'radio':
            action = `check('${item.inputData}')`
            break
          case 'text':
            action = `type('${item.inputData}')`
            break
        }
        return `${selector}.${action}`
      })
      .join('\n')
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
