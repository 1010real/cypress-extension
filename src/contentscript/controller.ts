import { finder } from '@medv/finder'
import { getStorage } from '../lib/storage'

const clickTargetType = ['button']
const clickTargetTagName = ['SPAN', 'DIV', 'P', 'A', 'TD']
const inputTargetType = ['radio', 'checkbox', 'select-one']
let storage

export default async (window: Window) => {
  storage = await getStorage()
  const getCssSelectorWrapper = (target: Element) => {
    const testid = target.getAttribute('data-testid')
    const testidSelector = testid ? `[data-testid='${testid}']` : testid
    return testidSelector || finder(target)
  }
  const handlers: Handlers = {
    mouseoverHandler: (e) => {
      // if (storage.startLog) return
      if (!isTargetEvent(e)) return
      setTimeout(() => {
        setSelectorTextWrapper(getCssSelectorWrapper(e.target as Element))
      }, 100)
    },
    clickHandler: async (e) => {
      console.log(`clicked: ${e.target}`, e)
      if (!storage.startLog) return
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
      const selector = getCssSelectorWrapper(e.target as Element)
      setSelectorTextWrapper(selector)
      const params = {
        selector,
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
      if (!storage.startLog) return
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
      const selector = getCssSelectorWrapper(e.target as Element)
      setSelectorTextWrapper(selector)
      const params = {
        selector,
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
      if (!storage.startLog) return
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
      const selector = getCssSelectorWrapper(e.target as Element)
      setSelectorTextWrapper(selector)
      const params = {
        selector,
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
    sendMessageHandler: async (msg: any) => {
      console.log(
        'received message from background/popup',
        msg.action,
        JSON.stringify(msg.data)
      )
      if (isTopFrame()) {
        console.log('on top frame')
        switch (msg.action) {
          case 'reloadStorage':
            storage = await getStorage()
            break
        }
      }
      // return true
    },
  }

  const { setSelectorText } = initScreen(window, handlers)
  // initScreen(window, handlers)

  // detect whether event is triggered by user
  function isTargetEvent(e) {
    return e.isTrusted
  }

  function isTopFrame() {
    return window.self === window.top
  }

  function setSelectorTextWrapper(text: string) {
    setSelectorText(text)
  }
}

export type Handlers = {
  mouseoverHandler: (e: MouseEvent) => void
  clickHandler: (e: MouseEvent) => void
  inputHandler: (e: InputEvent) => void
  focusoutHandler: (e: FocusEvent) => void
  sendMessageHandler: (msg: any) => Promise<boolean | void>
}

function initScreen(window: Window, handlers: Handlers) {
  const boundMouseoverHandler = handlers.mouseoverHandler.bind(this)
  window.addEventListener('mouseover', boundMouseoverHandler, true)
  const boundClickHandler = handlers.clickHandler.bind(this)
  window.addEventListener('click', boundClickHandler, true)
  const boundInputHandler = handlers.inputHandler.bind(this)
  window.addEventListener('input', boundInputHandler, true)
  const boundFocusoutHandler = handlers.focusoutHandler.bind(this)
  window.addEventListener('focusout', boundFocusoutHandler, true)
  const boundSendMessageHandler = handlers.sendMessageHandler.bind(this)
  chrome.runtime.onMessage.addListener(boundSendMessageHandler)

  const screenStyle =
    'width: 100%; height: 0; display: block; background-color: transparent;'
  const screen = window.document.createElement('div')
  screen.id = 'cypressFrame'
  screen.setAttribute('style', screenStyle)
  window.document.body.appendChild(screen)

  const selectorDisplayStyle =
    'width: 320px; display: block; position: fixed; right: 8px; bottom: 8px; z-index: 2147483647; background-color: transparent; color: purple; font-weight: bold; text-align: right;'
  const selectorDisplay = window.document.createElement('p')
  selectorDisplay.innerText = 'あいうえお'
  selectorDisplay.setAttribute('style', selectorDisplayStyle)
  screen.appendChild(selectorDisplay)

  const setSelectorText = (text: string) => {
    selectorDisplay.innerText = text
  }
  return { setSelectorText }
}
