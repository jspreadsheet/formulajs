import * as utils from './utils/common.js'
import * as error from './utils/error.js'

// TODO
/**
 *
 * Returns information about the formatting, location, or contents of a value.
 *
 * Category: Information
 *
 * @returns
 */
export function CELL(infoType, referenceValue) {
  if (arguments.length !== 2 || (infoType === undefined && referenceValue === undefined)) {
    return error.na
  }

  if (typeof infoType !== 'string') {
    return error.value
  }

  if (!this.k || this.k.length < 1) {
    return error.value
  }

  const reference = this.k[1].split(':')[0]
  const row = utils.parseNumber(reference.match(/\d+/g)[0])
  const col = reference.replace(/[^A-Za-z]/g, '')

  switch (infoType.toLowerCase()) {
    case 'row':
      return row
    case 'col':
      return utils.lettersToNumber(col)
    case 'address':
      return `$${col}$${row}`
    case 'contents':
      return referenceValue
    case 'type':
      if (typeof referenceValue === 'number' || typeof referenceValue === 'boolean') {
        return 'v'
      } else if (referenceValue instanceof Error) {
        return 'e'
      } else if (typeof referenceValue === 'string') {
        return 'l'
      }
      return 'b'
    case 'width':
      return this.instance.getWidth(utils.lettersToNumber(col))
    default:
      return error.na
  }
}

export const ERROR = {}

ERROR.TYPE = (error_val) => {
  switch (error_val) {
    case error.nil:
      return 1
    case error.div0:
      return 2
    case error.value:
      return 3
    case error.ref:
      return 4
    case error.name:
      return 5
    case error.num:
      return 6
    case error.na:
      return 7
    case error.data:
      return 8
  }

  return error.na
}

// TODO
/**
 * -- Not implemented --
 *
 * Returns information about the current operating environment.
 *
 * Category: Information
 *
 * @returns
 */
export function INFO() {
  throw new Error('INFO is not implemented')
}

/**
 * Returns TRUE if the value is blank.
 *
 * Category: Information
 *
 * @param {*} value The value that you want tested. The value argument can be a blank (empty value), error, logical value, text, number, or reference value, or a name referring to any of these.
 * @returns
 */
export function ISBLANK(value) {
  if (arguments.length !== 1) {
    return error.na
  }

  return value === null
}

/**
 * Returns TRUE if the value is any error value except #N/A.
 *
 * Category: Information
 *
 * @param {*} value The value that you want tested. The value argument can be a blank (empty value), error, logical value, text, number, or reference value, or a name referring to any of these.
 * @returns
 */
export function ISERR(value) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (Array.isArray(value)) {
    return value.map((item) => ISERR(item))
  }

  if (value === error.na) {
    return false
  }

  return Object.values(error).includes(value) || (typeof value === 'number' && (isNaN(value) || !isFinite(value)))
}

/**
 * Returns TRUE if the value is any error value.
 *
 * Category: Information
 *
 * @param {*} value The value that you want tested. The value argument can be a blank (empty value), error, logical value, text, number, or reference value, or a name referring to any of these.
 * @returns
 */
export function ISERROR(value) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (Array.isArray(value)) {
    return value.map((item) => ISERROR(item))
  }

  return ISERR(value) || value === error.na
}

/**
 * Returns TRUE if the number is even.
 *
 * Category: Information
 *
 * @param {*} number The value to test. If number is not an integer, it is truncated.
 * @returns
 */
export function ISEVEN(number) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (Array.isArray(number)) {
    return error.value
  }

  if (number instanceof Error) {
    return number
  }

  if (typeof number === 'boolean') {
    return error.value
  }

  number = utils.getNumber(number)

  if (typeof number !== 'number') {
    return error.value
  }

  return !(Math.floor(Math.abs(number)) & 1)
}

/**
 * Returns TRUE if the value is a logical value.
 *
 * Category: Information
 *
 * @param {*} value The value that you want tested. The value argument can be a blank (empty value), error, logical value, text, number, or reference value, or a name referring to any of these.
 * @returns
 */
export function ISLOGICAL(value) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (Array.isArray(value)) {
    return value.map((item) => ISLOGICAL(item))
  }

  return typeof value === 'boolean'
}

/**
 * Returns TRUE if the value is the #N/A error value.
 *
 * Category: Information
 *
 * @param {*} value The value that you want tested. The value argument can be a blank (empty value), error, logical value, text, number, or reference value, or a name referring to any of these.
 * @returns
 */
export function ISNA(value) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (Array.isArray(value)) {
    return value.map((item) => ISNA(item))
  }

  return value === error.na
}

/**
 * Returns TRUE if the value is not text.
 *
 * Category: Information
 *
 * @param {*} value The value that you want tested. The value argument can be a blank (empty value), error, logical value, text, number, or reference value, or a name referring to any of these.
 * @returns
 */
export function ISNONTEXT(value) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (Array.isArray(value)) {
    return value.map((item) => ISNONTEXT(item))
  }

  return typeof value !== 'string'
}

/**
 * Returns TRUE if the value is a number.
 *
 * Category: Information
 *
 * @param {*} value The value that you want tested. The value argument can be a blank (empty value), error, logical value, text, number, or reference value, or a name referring to any of these.
 * @returns
 */
export function ISNUMBER(value) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (Array.isArray(value)) {
    return value.map((item) => ISNUMBER(item))
  }

  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Returns TRUE if the number is odd.
 *
 * Category: Information
 *
 * @param {*} value The value that you want tested. The value argument can be a blank (empty value), error, logical value, text, number, or reference value, or a name referring to any of these.
 * @returns
 */
export function ISODD(value) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (Array.isArray(value)) {
    return error.value
  }

  if (value instanceof Error) {
    return value
  }

  value = utils.getNumber(value)

  if (typeof value === 'string') {
    return error.value
  }

  return !!(Math.floor(Math.abs(value)) & 1)
}

// TODO
/**
 * -- Not implemented --
 *
 * Returns TRUE if the value is a reference.
 *
 * Category: Information
 *
 * @param {*} value The value that you want tested. The value argument can be a blank (empty value), error, logical value, text, number, or reference value, or a name referring to any of these.
 * @returns
 */
export function ISREF() {
  if (arguments.length < 1) {
    return error.na
  } else if (arguments.length > 1) {
    return error.error
  }

  if (this.k && this.k.length > 0) {
    return true
  }

  return false
}

/**
 * Returns TRUE if the value is text.
 *
 * Category: Information
 *
 * @param {*} value The value that you want tested. The value argument can be a blank (empty value), error, logical value, text, number, or reference value, or a name referring to any of these.
 * @returns
 */
export function ISTEXT(value) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (Array.isArray(value)) {
    return value.map((item) => ISTEXT(item))
  }

  return typeof value === 'string'
}

/**
 * Returns a value converted to a number.
 *
 * Category: Information
 *
 * @param {*} value The value you want converted. N converts values listed in the following table.
 * @returns
 */
export function N(value) {
  if (Array.isArray(value)) {
    return N(value[0])
  }

  if (ISNUMBER(value)) {
    return value
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (value === true) {
    return 1
  }

  if (value === false) {
    return 0
  }

  if (ISERROR(value)) {
    return value
  }

  return 0
}

/**
 * Returns the error value #N/A.
 *
 * Category: Information
 *
 * @returns
 */
export function NA() {
  return error.na
}

/**
 *
 * Returns the sheet number of the referenced sheet.
 *
 * Category: Information
 *
 * @param {*} value Optional. Value is the name of a sheet or a reference for which you want the sheet number. If value is omitted, SHEET returns the number of the sheet that contains the function.
 * @returns
 */
export function SHEET() {
  if (!this.k || this.k.length < 1) {
    return error.value
  }

  if (this.k[0].split('!').length > 1) {
    const referencedWorksheetName = this.k[0].split('!')[0]
    const spreadsheet = this.instance.parent

    for (let i = 0; i < spreadsheet.worksheets.length; i++) {
      if (spreadsheet.worksheets[i].options.worksheetName.toUpperCase() === referencedWorksheetName) {
        return i
      }
    }
    return error.ref
  }

  return this.instance.getWorksheetActive()
}

/**
 *
 * Returns the number of sheets in a reference.
 *
 * Category: Information
 *
 * @param {*} reference Optional. Reference is a reference for which you want to know the number of sheets it contains. If Reference is omitted, SHEETS returns the number of sheets in the workbook that contains the function.
 * @returns
 */
export function SHEETS(value) {
  if (this.k && this.k.length > 0) {
    return this.k.length
  }

  if (value) {
    return error.value
  }

  return this.instance.parent.worksheets.length
}

/**
 * Returns a number indicating the data type of a value.
 *
 * Category: Information
 *
 * @param {*} value Can be any Microsoft Excel value, such as a number, text, logical value, and so on.
 * @returns
 */
export function TYPE(value) {
  if (Array.isArray(value)) {
    return 64
  }

  if (ISNUMBER(value)) {
    return 1
  }

  if (ISTEXT(value)) {
    return 2
  }

  if (ISLOGICAL(value)) {
    return 4
  }

  if (ISERROR(value)) {
    return 16
  }
}
