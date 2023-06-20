import * as error from './utils/error.js'
import * as utils from './utils/common.js'

export function ENCODEURL(url) {
  if (arguments.length !== 1) {
    return error.na
  }

  url = utils.parseString(url)

  return encodeURIComponent(url)
}
