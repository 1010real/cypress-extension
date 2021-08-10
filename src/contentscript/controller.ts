import getCssSelector from 'css-selector-generator'

const clickTargetType = ['button']
const clickTargetTagName = ['SPAN', 'DIV', 'P', 'A', 'TD']
const inputTargetType = ['radio', 'checkbox', 'select-one']

export default async (window: Window) => {
  const handlers: Handlers = {
    clickHandler: async (e) => {
      console.log(
        `clicked: ${e.target}`,
        e,
        getCssSelector(e.target as Element)
      )
      if (!isTargetEvent(e)) return
      // @ts-ignore
      const targetType = e.target.type as string
      // @ts-ignore
      const tagName = e.target.tagName as string
      console.log(e.target, targetType, tagName)
      if (
        !clickTargetType.includes(targetType) &&
        !clickTargetTagName.includes(tagName)
      )
        return

      // checkboxクリックもspanクリックとして認識されるのでスキップ
      if (
        tagName === 'SPAN' &&
        (e.target as HTMLSpanElement).getAttribute('class') === 'check'
      )
        return

      // const clickedPoint = { x: e.clientX, y: e.clientY }
      const params = {
        selector: getCssSelector(e.target as Element),
        type: e.type,
        // @ts-ignore
        targetType: targetType || tagName,
        // // @ts-ignore
        // tagName: e.target.TagName,
        // clickedPoint,
      }
      chrome.runtime.sendMessage({
        action: 'log',
        data: { params },
        needResponse: false,
      })
    },
    inputHandler: async (e) => {
      console.log(`inputed: ${e.target}`, e)
      if (!isTargetEvent(e)) return
      // @ts-ignore
      const targetType = e.target.type as string
      if (!inputTargetType.includes(targetType)) return
      let inputData
      // @ts-ignore
      switch (e.target.type) {
        case 'select-one':
        case 'checkbox':
        case 'radio':
          // @ts-ignore
          inputData = e.target.value
          break
        default:
          return
      }
      const params = {
        selector: getCssSelector(e.target as Element),
        type: e.type,
        targetType: (e.target as HTMLSelectElement).type,
        inputData,
      }
      chrome.runtime.sendMessage({
        action: 'log',
        data: { params },
        needResponse: false,
      })
    },
    focusoutHandler: async (e) => {
      console.log(`focusout: ${e.target}`, e)
      if (!isTargetEvent(e)) return

      let inputData
      // @ts-ignore
      switch (e.target.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'textarea':
          inputData = (e.target as HTMLInputElement).value
          break
        default:
          return
      }
      const params = {
        selector: getCssSelector(e.target as Element),
        type: e.type,
        // @ts-ignore
        targetType: e.target.type,
        inputData,
      }
      chrome.runtime.sendMessage({
        action: 'log',
        data: { params },
        needResponse: false,
      })
    },
    sendMessageHandler: (msg: any) => {
      console.log(
        'received message from background/popup',
        msg.action,
        JSON.stringify(msg.data)
      )
      if (isTopFrame()) {
        console.log('on top frame')
        switch (msg.action) {
          case 'aiueo2':
            console.log('received sendMessage in contentScript.')
            break
        }
      }
      return true
    },
  }

  initScreen(window, handlers)

  // detect whether event is triggered by user
  function isTargetEvent(e) {
    return e.isTrusted
  }

  function isTopFrame() {
    return window.self === window.top
  }
}

export type Handlers = {
  clickHandler: (e: MouseEvent) => void
  inputHandler: (e: InputEvent) => void
  focusoutHandler: (e: FocusEvent) => void
  sendMessageHandler: (msg: any) => boolean | void
}

function initScreen(window: Window, handlers: Handlers) {
  const boundClickHandler = handlers.clickHandler.bind(this)
  window.addEventListener('click', boundClickHandler, true)
  const boundInputHandler = handlers.inputHandler.bind(this)
  window.addEventListener('input', boundInputHandler, true)
  const boundFocusoutHandler = handlers.focusoutHandler.bind(this)
  window.addEventListener('focusout', boundFocusoutHandler, true)
  const boundSendMessageHandler = handlers.sendMessageHandler.bind(this)
  chrome.runtime.onMessage.addListener(boundSendMessageHandler)
}
