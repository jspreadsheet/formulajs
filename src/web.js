import * as error from './utils/error.js'
import * as utils from './utils/common.js'

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
