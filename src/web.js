import * as error from './utils/error.js'
import * as utils from './utils/common.js'
import xmldom from 'xmldom'
import xpath from 'xpath'

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

  const DOMParser = xmldom.DOMParser
  const result = []

  try {
    const doc = new DOMParser({
      locator: {},
      errorHandler: {
        warning: function () {
          throw error.value
        },
        error: function () {
          throw error.value
        },
        fatalError: function () {
          throw error.value
        }
      }
    }).parseFromString(xml, 'text/xml')
    const nodes = xpath.select(xp, doc)

    for (let i = 0; i < nodes.length; i++) {
      result.push([nodes[i].value || nodes[i].firstChild.data])
    }

    if (result.length === 0) {
      return error.value
    }

    return result
  } catch (err) {
    return error.value
  }
}
