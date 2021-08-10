import { getStorage, setStorage } from '../lib/storage'

let storage

export default (window: Window) => {
  const document = window.document
  const togglebtn: HTMLButtonElement = document.querySelector('#togglebtn')
  const clearbtn: HTMLButtonElement = document.querySelector('#clearbtn')
  const copybtn: HTMLButtonElement = document.querySelector('#copybtn')
  const textarea: HTMLTextAreaElement = document.querySelector('#log')
  const status: HTMLElement = document.querySelector('#status')

  const setStatus = (startLog: boolean) => {
    status.innerText = startLog ? 'logging...' : 'idle'
    togglebtn.innerText = startLog ? '停止' : '開始'
  }

  const setTextArea = (log: any[]) => {
    textarea.value = log
      .map((item) => {
        if (item.type === 'visit') {
          return `cy.visit('${item.inputData}')`
        }
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

  copybtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(textarea.value)
      console.log('code copied to clipboard')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  window.onload = async (e) => {
    storage = await getStorage()
    setStatus(storage.startLog)
    setTextArea(storage.log)
  }
}
