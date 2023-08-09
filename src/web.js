import * as error from './utils/error.js'
import * as utils from './utils/common.js'
import libxmljs from 'libxmljs'

export function ENCODEURL(url) {
  if (arguments.length !== 1 || arguments[0] === undefined) {
    return error.na
  }

  if (utils.anyIsError(url)) {
    return url
  }

  url = utils.parseString(url)

  return encodeURIComponent(url)
}

export function FILTERXML(xml, xp) {
  if (arguments.length === 0 || arguments.length > 2) {
    return error.na
  }

  const anyError = utils.anyError(xml, xp)

  if (anyError) {
    return anyError
  }

  const result = []

  try {
    const doc = libxmljs.parseXml(xml)

    const nodes = doc.find(xp)

    for (let i = 0; i < nodes.length; i++) {
      if (typeof nodes[i].text === 'function') {
        result.push([nodes[i].text()])
      } else {
        result.push([nodes[i].value()])
      }
    }

    if (result.length === 0) {
      return error.value
    }

    return result
  } catch (err) {
    return error.value
  }
}
