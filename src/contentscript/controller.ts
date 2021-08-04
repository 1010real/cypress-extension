import getCssSelector from 'css-selector-generator'

export default async (window: Window) => {
  const handlers: Handlers = {
    clickHandler: async (e) => {
      console.log(`clicked: ${e.target}`)
      if (!isTargetEvent(e)) return

      let clickedPoint = { x: e.clientX, y: e.clientY }
      let params = {
        selector: getCssSelector(e.target as Element),
        clickedPoint,
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
  sendMessageHandler: (msg: any) => boolean | void
}

function initScreen(window: Window, handlers: Handlers) {
  const boundClickHandler = handlers.clickHandler.bind(this)
  window.addEventListener('click', boundClickHandler, true)
  const boundSendMessageHandler = handlers.sendMessageHandler.bind(this)
  chrome.runtime.onMessage.addListener(boundSendMessageHandler)
}
