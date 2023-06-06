import jStat from 'jstat'

import * as error from './utils/error.js'
import * as utils from './utils/common.js'
import * as advance from './advance.js'
import * as evalExpression from './utils/criteria-eval.js'

const approximateBinarySearch = (lookupValue, lookupArray) => {
  const valueType = typeof lookupValue
  let highestValidValue = null

  let start = 0
  let end = lookupArray.length - 1

  while (end >= start) {
    let middle = start + Math.trunc((end - start) / 2)

    while (middle <= end && valueType !== typeof lookupArray[middle]) {
      middle++
    }

    if (middle > end) {
      middle--

      while (middle >= start && valueType !== typeof lookupArray[middle]) {
        middle--
      }
    }

    if (middle < start) {
      break
    }

    if (lookupValue > lookupArray[middle]) {
      highestValidValue = middle

      start = middle + 1
    } else if (lookupValue < lookupArray[middle]) {
      end = middle - 1
    } else {
      return middle
    }
  }

  return highestValidValue
}

/**
 * Chooses a value from a list of values.
 *
 * Category: Lookup and reference
 *
 * @param {*} index_num Specifies which value argument is selected. Index_num must be a number between 1 and 254, or a formula or reference to a value containing a number between 1 and 254. If index_num is 1, CHOOSE returns value1; if it is 2, CHOOSE returns value2; and so on. If index_num is less than 1 or greater than the number of the last value in the list, CHOOSE returns the #VALUE! error value. If index_num is a fraction, it is truncated to the lowest integer before being used.
 - If index_num is 1, CHOOSE returns value1; if it is 2, CHOOSE returns value2; and so on.
 - If index_num is less than 1 or greater than the number of the last value in the list, CHOOSE returns the #VALUE! error value.
 - If index_num is a fraction, it is truncated to the lowest integer before being used.
 * @param {*} args value1, value2, ... Value 1 is required, subsequent values are optional. 1 to 254 value arguments from which CHOOSE selects a value or an action to perform based on index_num. The arguments can be numbers, value references, defined names, formulas, functions, or text.
 * @returns
 */
export function CHOOSE() {
  if (arguments.length < 2) {
    return error.na
  }

  let index = arguments[0]

  if (Array.isArray(index)) {
    const options = Array.from(arguments).slice(1)

    return index.map((item) => CHOOSE(item, ...options))
  }

  if (Object.values(error).includes(index)) {
    return index
  }

  if (typeof index === 'string') {
    index = index.trim()

    if (!utils.isValidNumber(index)) {
      return error.value
    }

    index = parseFloat(index)
  }

  if (!Number.isInteger(index)) {
    index = Math.trunc(index)
  }

  if (index < 1 || index > 254) {
    return error.value
  }

  if (arguments.length < index + 1) {
    return error.value
  }

  return arguments[index]
}

/**
 * Returns the number of columns in a reference.
 *
 * Category: Lookup and reference
 *
 * @param {*} array An array or array formula, or a reference to a range of values for which you want the number of columns.
 * @returns
 */
export function COLUMNS(array) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (!(array instanceof Array)) {
    return 1
  }

  return array[0].length
}

/**
 * Looks in the top row of an array and returns the value of the indicated value.
 *
 * Category: Lookup and reference
 *
 * @param {*} lookup_value The value to be found in the first row of the table. Lookup_value can be a value, a reference, or a text string.
 * @param {*} table_array A table of information in which data is looked up. Use a reference to a range or a range name.
 * @param {*} row_index_num The row number in table_array from which the matching value will be returned. A row_index_num of 1 returns the first row value in table_array, a row_index_num of 2 returns the second row value in table_array, and so on. If row_index_num is less than 1, HLOOKUP returns the #VALUE! error value; if row_index_num is greater than the number of rows on table_array, HLOOKUP returns the #REF! error value.
 * @param {*} range_lookup Optional. A logical value that specifies whether you want HLOOKUP to find an exact match or an approximate match. If TRUE or omitted, an approximate match is returned. In other words, if an exact match is not found, the next largest value that is less than lookup_value is returned. If FALSE, HLOOKUP will find an exact match. If one is not found, the error value #N/A is returned.
 * @returns
 */
export function HLOOKUP(lookup_value, table_array, row_index_num, range_lookup) {
  if (arguments.length < 3 || arguments.length > 4) {
    return error.na
  }

  if (Array.isArray(table_array)) {
    table_array = utils.transpose(table_array)
  }

  return VLOOKUP(lookup_value, table_array, row_index_num, range_lookup)
}

/**
 * Uses an index to choose a value from a reference or array.
 *
 * Category: Lookup and reference
 *
 * @param {*} array A range of values or an array constant.
 - If array contains only one row or column, the corresponding row_num or column_num argument is optional.
 - If array has more than one row and more than one column, and only row_num or column_num is used, INDEX returns an array of the entire row or column in array.
 * @param {*} row_num Required, unless column_num is present. Selects the row in array from which to return a value. If row_num is omitted, column_num is required.
 * @param {*} column_num Optional. Selects the column in array from which to return a value. If column_num is omitted, row_num is required.
 * @returns
 */
export function INDEX(array, row_num, column_num) {
  if (arguments.length < 2 || arguments.length > 3) {
    return error.na
  }

  const someError = utils.anyError(array, row_num, column_num)
  if (someError) {
    return someError
  }

  if (!Array.isArray(array)) {
    array = [array]
  }

  if (!Array.isArray(array[0])) {
    array[0] = [array[0]]
  }

  const isRow = array.length === 1

  if (column_num === undefined) {
    if (isRow) {
      column_num = row_num
      row_num = 1
    } else {
      column_num = 1
    }
  }

  column_num = utils.getNumber(column_num)
  if (typeof column_num !== 'number') {
    return error.value
  }

  column_num = Math.trunc(column_num)

  row_num = utils.getNumber(row_num)
  if (typeof row_num !== 'number') {
    return error.value
  }

  row_num = Math.trunc(row_num)

  if (column_num < 0 || row_num < 0) {
    return error.value
  }

  const numOfRows = array.length
  const numOfColumns = array[0].length

  if (row_num > numOfRows || column_num > numOfColumns) {
    return error.ref
  }

  let result
  if (column_num === 0 && row_num === 0) {
    result = array
  } else if (column_num === 0) {
    result = [array[row_num - 1]]
  } else if (row_num === 0) {
    result = array.map((row) => [row[column_num - 1]])
  } else {
    return array[row_num - 1][column_num - 1]
  }

  if (result.length === 1 && result[0].length === 1) {
    return result[0][0]
  }
  return result
}

/**
 * Looks up values in a vector or array.
 *
 * Category: Lookup and reference
 *
 * @param {*} lookup_value A value that LOOKUP searches for in an array. The lookup_value argument can be a number, text, a logical value, or a name or reference that refers to a value.
 - If LOOKUP can't find the value of lookup_value, it uses the largest value in the array that is less than or equal to lookup_value.
 - If the value of lookup_value is smaller than the smallest value in the first row or column (depending on the array dimensions), LOOKUP returns the #N/A error value.
 * @param {*} array A range of values that contains text, numbers, or logical values that you want to compare with lookup_value. The array form of LOOKUP is very similar to the HLOOKUP and VLOOKUP functions. The difference is that HLOOKUP searches for the value of lookup_value in the first row, VLOOKUP searches in the first column, and LOOKUP searches according to the dimensions of array.
* @param {*} result_array Optional. A range that contains only one row or column. The result_array argument must be the same size as lookup_value. It has to be the same size.
 * @returns
 */
export function LOOKUP(lookup_value, array, result_array) {
  if (arguments.length < 2 || arguments.length > 3) {
    return error.na
  }

  if (lookup_value instanceof Error) {
    return lookup_value
  }

  if (!Array.isArray(array)) {
    array = [array]
  }
  if (!Array.isArray(array[0])) {
    array[0] = [array[0]]
  }

  if (array[0].length > array.length) {
    if (result_array === undefined) {
      result_array = array[array.length - 1]
    }

    array = array[0]
  } else {
    if (result_array === undefined) {
      result_array = array.map((row) => row[row.length - 1])
    }

    array = array.map((row) => row[0])
  }

  if (!Array.isArray(result_array)) {
    result_array = [result_array]
  }
  if (!Array.isArray(result_array[0])) {
    result_array[0] = [result_array[0]]
  }

  if (result_array.length > 1 && result_array[0].length > 1) {
    return error.na
  }

  array = utils.flatten(array)
  result_array = utils.flatten(result_array)

  const index = approximateBinarySearch(lookup_value, array)

  if (index === null) {
    return error.na
  }

  if (index >= result_array.length) {
    return error.ref
  }

  return result_array[index]
}

/**
 * Looks up values in a reference or array.
 *
 * Category: Lookup and reference
 *
 * @param {*} lookup_value The value that you want to match in lookup_array. For example, when you look up someone's number in a telephone book, you are using the person's name as the lookup value, but the telephone number is the value you want.The lookup_value argument can be a value (number, text, or logical value) or a value reference to a number, text, or logical value.
 * @param {*} lookup_array The range of values being searched.
 * @param {*} match_type Optional. The number -1, 0, or 1. The match_type argument specifies how Excel matches lookup_value with values in lookup_array. The default value for this argument is 1.
 * @returns
 */
export function MATCH(lookup_value, lookup_array, match_type = 1) {
  if (arguments.length < 2 || arguments.length > 3) {
    return error.na
  }

  if (!(lookup_array instanceof Array)) {
    return error.na
  }

  if (lookup_value instanceof Error) {
    return lookup_value
  }
  if (match_type instanceof Error) {
    return error.ref
  }

  if (lookup_array.length > 1 && lookup_array[0].length > 1) {
    return error.na
  }

  lookup_array = utils.flatten(lookup_array)

  match_type = utils.getNumber(match_type)
  if (typeof match_type !== 'number') {
    return error.value
  }

  const valueType = typeof lookup_value

  if (match_type > 0) {
    const result = approximateBinarySearch(lookup_value, lookup_array)
    if (result !== null) {
      return result + 1
    }
    return error.na
  } else if (match_type === 0) {
    const tokenizedCriteria = evalExpression.parse(lookup_value + '')

    const result = lookup_array.findIndex((item) => {
      const tokens = [evalExpression.createToken(item, evalExpression.TOKEN_TYPE_LITERAL)].concat(tokenizedCriteria)

      return evalExpression.countIfComputeExpression(tokens)
    })

    return result >= 0 ? result + 1 : error.na
  }

  let lowestValidValue = null
  for (let i = 0; i < lookup_array.length; i++) {
    if (valueType !== typeof lookup_array[i]) {
      continue
    }
    if (lookup_value > lookup_array[i]) {
      break
    }

    if (lookup_value < lookup_array[i]) {
      lowestValidValue = i
    } else {
      return i + 1
    }
  }

  if (lowestValidValue !== null) {
    while (lowestValidValue >= 0 && lookup_array[lowestValidValue] instanceof Error) {
      lowestValidValue--
    }

    return lowestValidValue >= 0 ? lowestValidValue + 1 : error.na
  }

  return error.na
}

/**
 * Returns the number of rows in a reference.
 *
 * Category: Lookup and reference
 *
 * @param {*} array An array, an array formula, or a reference to a range of values for which you want the number of rows.
 * @returns
 */
export function ROWS(array) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (!(array instanceof Array)) {
    return 1
  }

  return array.length
}

/**
 * Returns a sorted array of the elements in an array. The returned array is the same shape as the provided array argument.
 *
 * Category: Lookup and reference
 *
 * @param {*} array Array to sort
 * @param {*} sort_index Optional. A number indicating the row or column to sort by
 * @param {*} sort_order Optional. A number indicating the desired sort order; 1 for ascending order (default), -1 for descending order
 * @param {*} by_col Optional. A logical value indicating the desired sort direction; FALSE to sort by row (default), TRUE to sort by column
 * @returns
 */
export function SORT(array, sort_index = 1, sort_order = 1, by_col = false) {
  if (!array || !Array.isArray(array)) {
    return error.na
  }

  if (array.length === 0) {
    return 0
  }

  sort_index = utils.parseNumber(sort_index)
  if (!sort_index || sort_index < 1) {
    return error.value
  }

  sort_order = utils.parseNumber(sort_order)
  if (sort_order !== 1 && sort_order !== -1) {
    return error.value
  }

  by_col = utils.parseBool(by_col)
  if (typeof by_col !== 'boolean') {
    return error.name
  }

  const sortArray = (arr) =>
    arr.sort((a, b) => {
      a = utils.parseString(a[sort_index - 1])
      b = utils.parseString(b[sort_index - 1])

      return sort_order === 1 ? (a < b ? sort_order * -1 : sort_order) : a > b ? sort_order : sort_order * -1
    })

  const matrix = utils.fillMatrix(array)
  const result = by_col ? utils.transpose(matrix) : matrix

  return sort_index >= 1 && sort_index <= result[0].length
    ? by_col
      ? utils.transpose(sortArray(result))
      : sortArray(result)
    : error.value
}

/**
 * Returns the transpose of an array.
 *
 * Category: Lookup and reference
 *
 * @param {*} array An array or range of values on a worksheet that you want to transpose. The transpose of an array is created by using the first row of the array as the first column of the new array, the second row of the array as the second column of the new array, and so on. If you're not sure of how to enter an array formula, see Create an array formula.
 * @returns
 */
export function TRANSPOSE(array) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (!Array.isArray(array)) {
    return array
  }

  return jStat.transpose(array)
}

/**
 * Returns a list of unique values in a list or range.
 *
 * Category: Lookup and reference
 *
 * @returns
 */
export function UNIQUE() {
  const result = []

  for (let i = 0; i < arguments.length; ++i) {
    let hasElement = false
    const element = arguments[i]

    // Check if we've already seen this element.

    for (let j = 0; j < result.length; ++j) {
      hasElement = result[j] === element

      if (hasElement) {
        break
      }
    }

    // If we did not find it, add it to the result.
    if (!hasElement) {
      result.push(element)
    }
  }

  return result
}

/**
 * Looks in the first column of an array and moves across the row to return the value of a value.
 *
 * Category: Lookup and reference
 *
 * @param {*} lookup_value The value to be found in the first row of the table. Lookup_value can be a value, a reference, or a text string.
 * @param {*} table_array A table of information in which data is looked up. Use a reference to a range or a range name.
 * @param {*} col_index_num The row number in table_array from which the matching value will be returned. A row_index_num of 1 returns the first row value in table_array, a row_index_num of 2 returns the second row value in table_array, and so on. If row_index_num is less than 1, HLOOKUP returns the #VALUE! error value; if row_index_num is greater than the number of rows on table_array, HLOOKUP returns the #REF! error value.
 * @param {*} range_lookup Optional. A logical value that specifies whether you want HLOOKUP to find an exact match or an approximate match. If TRUE or omitted, an approximate match is returned. In other words, if an exact match is not found, the next largest value that is less than lookup_value is returned. If FALSE, HLOOKUP will find an exact match. If one is not found, the error value #N/A is returned.
 * @returns
 */
export function VLOOKUP(lookup_value, table_array, col_index_num, range_lookup = true) {
  if (arguments.length < 3 || arguments.length > 4) {
    return error.na
  }

  if (!table_array) {
    return error.na
  }

  col_index_num = utils.getNumber(col_index_num)
  if (typeof col_index_num !== 'number' || col_index_num < 1) {
    return error.value
  }

  if (col_index_num > table_array[0].length) {
    return error.ref
  }

  if (range_lookup instanceof Error) {
    return range_lookup
  }

  range_lookup = utils.parseBool(range_lookup)
  if (typeof range_lookup !== 'boolean') {
    return error.value
  }

  if (range_lookup) {
    const rowIndex = approximateBinarySearch(lookup_value, utils.flatten(table_array.map((row) => row[0])))

    if (rowIndex === null) {
      return error.na
    }

    return table_array[rowIndex][col_index_num - 1]
  }

  for (let i = 0; i < table_array.length; i++) {
    if (table_array[i][0] === lookup_value) {
      return table_array[i][col_index_num - 1]
    }
  }

  return error.na
}

/**
 * Extract a subset of data from a range based on specified criteria
 *
 * Category: Lookup and reference
 *
 * @param {*} sample The data set that the criteria will be applied to.
 * @param {*} conditions The criteria that the sample will be filtered on. Array of array of booleans.
 * @returns
 */
export function FILTER(array, include, if_empty) {
  if (arguments.length < 2 || arguments.length > 3) {
    return error.na
  }

  if (typeof array === 'undefined' || typeof include === 'undefined') {
    return error.value
  }

  const validationArrayType = utils.getVariableType(include)

  if (validationArrayType === 'matrix') {
    return error.value
  }

  const sourceArrayType = utils.getVariableType(array)

  if (validationArrayType === 'single') {
    if (sourceArrayType === 'matrix') {
      return error.value
    }

    const parsedValidation = utils.parseBool(include)

    if (typeof parsedValidation !== 'boolean') {
      return parsedValidation
    }

    if (parsedValidation) {
      if (array === null) {
        return 0
      }

      return array
    }

    if (typeof if_empty === 'undefined') {
      return error.calc
    }

    if (if_empty === null) {
      return 0
    }

    return if_empty
  }

  if (sourceArrayType === 'single') {
    return error.value
  }

  if (validationArrayType === 'line') {
    const validations = include[0]

    const numberOfCols = validations.length

    if (array[0].length !== numberOfCols) {
      return error.value
    }

    const numberOfRows = array.length

    const result = []
    for (let y = 0; y < numberOfRows; y++) {
      result.push([])
    }

    for (let x = 0; x < numberOfCols; x++) {
      const parsedValidation = utils.parseBool(validations[x])

      if (typeof parsedValidation !== 'boolean') {
        return parsedValidation
      } else if (parsedValidation) {
        for (let y = 0; y < numberOfRows; y++) {
          const item = array[y][x]

          result[y].push(item !== null ? item : 0)
        }
      }
    }

    if (result[0].length !== 0) {
      return result
    }

    if (typeof if_empty === 'undefined') {
      return error.calc
    }

    if (if_empty === null) {
      return 0
    }

    return if_empty
  }

  // validationArrayType === 'column'

  const numberOfRows = include.length

  if (array.length !== numberOfRows) {
    return error.value
  }

  const numberOfCols = array[0].length

  const result = []

  for (let y = 0; y < numberOfRows; y++) {
    const parsedValidation = utils.parseBool(include[y][0])

    if (typeof parsedValidation !== 'boolean') {
      return parsedValidation
    } else if (parsedValidation) {
      const row = array[y]

      const parsedRow = []
      for (let x = 0; x < numberOfCols; x++) {
        const item = row[x]

        parsedRow.push(item !== null ? item : 0)
      }

      result.push(parsedRow)
    }
  }

  if (result.length !== 0) {
    return result
  }

  if (typeof if_empty === 'undefined') {
    return error.calc
  }

  if (if_empty === null) {
    return 0
  }

  return if_empty
}

const startsWithNumber = /^-*\d/
const startWithLetterOrNumber = /^\w/

const a1Absolute = {
  1: function (row, column) {
    return '$' + column + '$' + row
  },
  2: function (row, column) {
    return column + '$' + row
  },
  3: function (row, column) {
    return '$' + column + row
  },
  4: function (row, column) {
    return column + row
  }
}

const r1c1Absolute = {
  1: function (row, column) {
    return 'R' + row + 'C' + column
  },
  2: function (row, column) {
    return 'R' + row + 'C[' + column + ']'
  },
  3: function (row, column) {
    return 'R[' + row + ']C' + column
  },
  4: function (row, column) {
    return 'R[' + row + ']C[' + column + ']'
  }
}

export function ADDRESS(row, column, absoluteNum = 1, a1Style = true, sheetName) {
  if (arguments.length < 2 || arguments.length > 5) {
    return error.na
  }

  const someError = utils.anyError(row, column, absoluteNum, a1Style, sheetName)
  if (someError) {
    return someError
  }

  row = utils.getNumber(row)
  column = utils.getNumber(column)

  if (typeof row === 'string') {
    row = row.toUpperCase()

    if (row === 'TRUE') {
      row = 1
    } else if (row === 'FALSE') {
      row = 0
    } else {
      return error.value
    }
  }

  if (typeof column === 'string') {
    column = column.toUpperCase()

    if (column === 'TRUE') {
      column = 1
    } else if (column === 'FALSE') {
      column = 0
    } else {
      return error.value
    }
  }

  row = Math.trunc(row)
  column = Math.trunc(column)

  if (row < 1 || column < 1) {
    return error.value
  }

  absoluteNum = utils.getNumber(absoluteNum)
  if (typeof absoluteNum !== 'number') {
    return error.value
  }

  absoluteNum = Math.trunc(absoluteNum)

  if (absoluteNum < 1 || absoluteNum > 4) {
    return error.value
  }

  a1Style = utils.parseBool(a1Style)
  if (typeof a1Style !== 'boolean') {
    return error.value
  }

  let result = ''

  if (sheetName !== undefined) {
    const sheetNameType = typeof sheetName

    if (sheetName === null) {
      sheetName = ''
    } else {
      if (sheetNameType !== 'string') {
        sheetName = sheetName.toString()
      }

      const upperCase = sheetName.toUpperCase()

      if (upperCase === 'TRUE' || upperCase === 'FALSE') {
        sheetName = "'" + upperCase + "'"
      } else if (
        sheetName.length > 0 &&
        (startsWithNumber.test(sheetName) || !startWithLetterOrNumber.test(sheetName))
      ) {
        sheetName = "'" + sheetName + "'"
      }
    }

    result = sheetName + '!'
  }

  if (a1Style) {
    const columnsLetter = advance.getColumnName(column - 1)

    return result + a1Absolute[absoluteNum](row, columnsLetter)
  }
  return result + r1c1Absolute[absoluteNum](row, column)
}

export function AREAS() {
  throw new Error('AREAS is not implemented')
}

export function FORMULATEXT() {
  throw new Error('FORMULATEXT is not implemented')
}

export function GETPIVOTDATA() {
  throw new Error('GETPIVOTDATA is not implemented')
}

export function RTD() {
  throw new Error('RTD is not implemented')
}

/**
 * Excludes a specified number of rows or columns from the start or end of an array.
 *
 * Category: Lookup and reference
 *
 * @param {*} array The array from which to drop rows or columns.
 * @param {*} rows The number of rows to drop. A negative value drops from the end of the array.
 * @param {*} columns The number of columns to exclude. A negative value drops from the end of the array.
 * @returns
 */
export function DROP(array, rows = 0, columns = 0) {
  if (arguments.length < 2 || arguments.length > 3) {
    return error.na
  }

  if (array === undefined) {
    return error.value
  }

  const anyError = utils.anyError(rows, columns)

  if (anyError) {
    return anyError
  }

  rows = utils.parseNumber(rows)
  columns = utils.parseNumber(columns)

  if (utils.anyIsError(rows, columns)) {
    return error.value
  }

  const arrayVarType = utils.getVariableType(array)

  if (arrayVarType === 'single' && rows === 0 && columns === 0) {
    return utils.isDefined(array) ? array : 0
  } else if (arrayVarType === 'single') {
    return error.calc
  }

  let arrayRows = array.length
  let arrayColumns = array[0].length

  if (arrayRows > 64 || arrayColumns > 64) {
    return error.num
  }

  if (rows < 0) {
    arrayRows = arrayRows + rows
    rows = 0
  }

  if (columns < 0) {
    arrayColumns = arrayColumns + columns
    columns = 0
  }

  if (arrayRows <= rows || arrayColumns <= columns) {
    return error.calc
  }

  let result = []
  for (let i = rows; i < arrayRows; i++) {
    result.push(array[i].slice(columns))
  }

  if (result.length === 1 && result[0].length === 1) {
    return result[0][0]
  }

  return result
}

/**
 * Expands or pads an array to specified row and column dimensions.
 *
 * Category: Lookup and reference
 *
 * @param {*} array The array to expand.
 * @param {*} rows The number of rows in the expanded array. If missing, rows will not be expanded.
 * @param {*} columns The number of columns in the expanded array. If missing, columns will not be expanded.
 * @param {*} padWith The value with which to pad. The default is #N/A.
 * @returns
 */
export function EXPAND(array, rows, columns, padWith = error.na) {
  if (arguments.length < 2 || arguments.length > 4) {
    return error.na
  }

  if (
    !utils.isDefined(array) ||
    utils.anyIsNull(rows, columns) ||
    utils.isArrayLike(rows) ||
    utils.isArrayLike(columns) ||
    utils.isArrayLike(padWith)
  ) {
    return error.value
  }

  const anyError = utils.anyError(rows, columns)

  if (anyError) {
    return anyError
  }

  const arrayVarType = utils.getVariableType(array)

  let arrayRows = utils.isArrayLike(array) ? array.length : 1
  let arrayColumns = array[0] ? array[0].length || 1 : 1
  rows = utils.isDefined(rows) ? rows : arrayRows
  columns = utils.isDefined(columns) ? columns : arrayColumns

  if (arrayRows > rows || arrayColumns > columns) {
    return error.value
  }

  if (arrayRows > 64 || arrayColumns > 64) {
    return error.num
  }

  let result = []

  if (arrayVarType === 'single') {
    for (let i = 0; i < rows; i++) {
      result[i] = Array(columns).fill(padWith)
      if (i === 0) {
        result[i][0] = array
      }
    }
  } else {
    for (let i = 0; i < rows; i++) {
      result[i] = []
      for (let j = 0; j < columns; j++) {
        result[i][j] = array[i] ? array[i][j] || padWith : padWith
      }
    }
  }

  if (result.length === 1 && result[0].length === 1) {
    return result[0][0]
  }

  return result
}

/**
 * Appends arrays horizontally and in sequence to return a larger array.
 *
 * Category: Lookup and reference
 *
 * @param {*} arrays The arrays to append.
 * @returns
 */
export function HSTACK(...arrays) {
  if (!arrays.length) {
    return error.na
  }

  if (utils.anyIsUndefined(...arrays)) {
    return error.value
  }

  let result = [],
    maxRows = 0,
    arraysLength = arrays.length

  for (let a = 0; a < arraysLength; a++) {
    let current = arrays[a]

    if (!utils.isArrayLike(current)) {
      current = [[current]]
    }

    if (maxRows < current.length) {
      maxRows = current.length
    }
  }

  for (let a = 0; a < arraysLength; a++) {
    let current = arrays[a]

    if (!utils.isArrayLike(current)) {
      current = [[current]]
    }

    let currentRows = current.length

    for (let i = 0; i < maxRows; i++) {
      if (!result[i]) {
        result[i] = []
      }
      if (i >= currentRows) {
        result[i] = result[i].concat(new Array(current[0].length).fill(error.na))
      } else {
        result[i] = result[i].concat(current[i])
      }
    }
  }

  if (~utils.flatten(result).indexOf(null)) {
    let rows = result.length
    let columns = result[0].length

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if (result[i][j] === null) {
          result[i][j] = 0
        }
      }
    }
  }

  return result.length === 1 && result[0].length === 1 ? result[0][0] : result
}

/**
 * Returns the specified columns from an array.  
 * 
 * Category: Lookup and reference
 * 
 * @param {*} array The array containing the columns to be returned in the new array. Required.
 * @param  {*} col_num1 The first column to be returned. Required.
 * @param {...any} col_numN Additional columns to be returned. Optional.
 * @returns 
 */
export function CHOOSECOLS(array, col_num1, ...col_numN) {
  if (!Array.isArray(array) || !array.length) {
    return error.value;
  }

  if (array.some(item => !Array.isArray(item))) {
    return error.value;
  }

  const result = [];
  const indices = [col_num1, ...col_numN];

  for (let i = 0; i < array.length; i++) {
    const row = array[i];
    const newRow = [];

    for (let j = 0; j < indices.length; j++) {
      const index = indices[j];

      if (typeof index !== 'number' || index < 1 || index > row.length) {
        return error.value;
      }

      let v = row[index - 1];

      if (((typeof v !== 'number' && !v) || typeof v === 'boolean')) {
        v = utils.parseNumber(v);
      }
      
      newRow.push(v);
    }

    result.push(newRow);
  }

  return result;
}


/**
 * Returns the specified columns from an array.  
 * 
 * Category: Lookup and reference
 * 
 * @param {*} array The array containing the columns to be returned in the new array. Required.
 * @param  {*} row_num1 The first row to be returned. Required.
 * @param {...any} row_numN Additional row numbers to be returned. Optional.
 * @returns 
 */
export function CHOOSEROWS(array, row_num1, ...row_numN) {
  if (!Array.isArray(array) || !array.length) {
    return error.value;
  }

  if (array.some(item => !Array.isArray(item))) {
    return error.value;
  }

  const result = [];
  const indices = [row_num1, ...row_numN];

  // processamento de erro anterior ao cálculo da matriz
  if (indices.some(index => typeof index !== 'number' || index < 1 || !array[index - 1])) {
    return error.value;
  }

  for (let i = 0; i < indices.length; i ++) {
    const index = indices[i];

    const row = [...array[index - 1]].map(v => {
      return ((typeof v !== 'number' && !v) || typeof v === 'boolean') ? utils.parseNumber(v) : v 
    });

    result.push(row);
  }

  return result;
}

/**
 * converts a generic value based on its type to handle comparisons between types that follow excel's comparison logic. 
 * In excel a boolean is considered greater than any primitive type e.g.
 * @param {*} valueA any javascript type
 * @returns 
 */
const excelTypesComparator = function (valueA) {
  const isBoolean = (v) => typeof v === "boolean";
  const isString = (v) => typeof v === "string";

  const TBoolean = (bool) => {
    const isGreaterThan = (v) => {
      if (!isBoolean(v)) return true;
      return bool > v;
    };

    const isGreaterOrEqualThan = (v) => {
      if (!isBoolean(v)) return true;
      return bool >= v;
    };

    const isLessThan = (v) => {
      if (!isBoolean(v)) return false;
      return bool < v;
    };

    const isLessOrEqualThan = (v) => {
      if (!isBoolean(v)) return false;
      return bool <= v;
    };

    const isEqualsTo = (v) => {
      return bool === v;
    };

    return {
      isGreaterThan,
      isGreaterOrEqualThan,
      isLessThan,
      isLessOrEqualThan,
      isEqualsTo,
    };
  };

  const TString = (string) => {
    const isGreaterThan = (v) => {
      if (isBoolean(v)) return false;
      if (!isString(v)) return true;
      if (isString(v)) return string > v;
    };

    const isGreaterOrEqualThan = (v) => {
      if (isBoolean(v)) return false;
      if (!isString(v)) return true;
      if (isString(v)) return string >= v;
    };

    const isLessThan = (v) => {
      if (isBoolean(v)) return true;
      if (!isString(v)) return false;
      if (isString(v)) return string < v;
    };

    const isLessOrEqualThan = (v) => {
      if (isBoolean(v)) return true;
      if (!isString(v)) return false;
      if (isString(v)) return string <= v;
    };

    const isEqualsTo = (v) => {
      return v === string;
    };

    return {
      isGreaterThan,
      isGreaterOrEqualThan,
      isLessThan,
      isLessOrEqualThan,
      isEqualsTo,
    };
  };

  const TNumber = (number) => {
    const isGreaterThan = (v) => {
      if (isBoolean(v) || isString(v)) return false;
      return number > v;
    };

    const isGreaterOrEqualThan = (v) => {
      if (isBoolean(v) || isString(v)) return false;
      return number >= v;
    };

    const isLessThan = (v) => {
      if (isBoolean(v) || isString(v)) return true;
      return number < v;
    };

    const isLessOrEqualThan = (v) => {
      if (isBoolean(v) || isString(v)) return true;
      return number <= v;
    };

    const isEqualsTo = (v) => {
      return number === v;
    };

    return {
      isGreaterThan,
      isGreaterOrEqualThan,
      isLessThan,
      isLessOrEqualThan,
      isEqualsTo,
    };
  };

  const TGeneric = (genericValue) => {
    const isGreaterThan = (v) => {
      if (isBoolean(v) || isString(v)) return false;
      return genericValue > v;
    };

    const isGreaterOrEqualThan = (v) => {
      if (isBoolean(v) || isString(v)) return false;
      return genericValue >= v;
    };

    const isLessThan = (v) => {
      if (isBoolean(v) || isString(v)) return true;
      return genericValue < v;
    };

    const isLessOrEqualThan = (v) => {
      if (isBoolean(v) || isString(v)) return true;
      return genericValue <= v;
    };

    const isEqualsTo = (v) => {
      return genericValue === v;
    };

    return {
      isGreaterThan,
      isGreaterOrEqualThan,
      isLessThan,
      isLessOrEqualThan,
      isEqualsTo,
    };
  };

  const convertToType = (genericValue) => {
    switch (typeof genericValue) {
      case "boolean":
        return TBoolean(genericValue);
      case "number":
        return TNumber(genericValue);
      case "string":
        return TString(genericValue);
      default:
        return TGeneric(genericValue);
    }
  };

  const T = convertToType(valueA);
  return T;
};

/**
 * Performs a binary search to find a value that follows specified match mode and search mode rules.
 * @param {*} lookupValue The value to search for.
 * @param {*} lookupArray The range to consider for the search. This range must be a singular row or column.
 * @param {*} match_mode [OPTIONAL: 0 by default] The manner in which to find a match for the search_key.
 *  - 0 is for an exact match.
 *  - 1 is for an exact match or the next value that's greater than the search_key.
 *  - -1 is for an exact match or the next value that's lesser than the search_key.
 * @param {*} search_mode [OPTIONAL: 1 by default] The manner in which to search through the lookup range.
 * - 1 is to search from the first entry to the last.
 * - -1 is to search from the last entry to the first.
 * - 2 is to search through the range with binary search. The range needs to be sorted in ascending order first.
 * - -2 is to search through the range with binary search. The range needs to be sorted in descending order first.
 * @returns 
 */
const xmatchCustomBinarySearch = (lookupValue, lookupArray, match_mode = 1, search_mode = 2) => {
  let low = 0;
  let up = lookupArray.length - 1;
  let mid = undefined;
  let lastMatch = undefined;
  let exactMatch = undefined;

  // enquanto o indice inicial do array for menor que o maior indice
  while (low <= up) {
    // calcula o indice do meio do array
    mid = (low + up) >> 1;

    if (match_mode === 0 && search_mode === 2) {
      // Caso "mid" seja exatamente igual ao valor procurado
      if (lookupArray[mid] === lookupValue) {
        // Atribuimos a referência do índice de match à variável lastMatch
        exactMatch = mid;
        // Como é exatamente igual e supomos que a lista está ordenada em ordem crescente, então iremos olhar para os valores
        // anteriores de lookup_range, para verificar se existem outros possiveis matches menores ou iguais a lookupValue
        up = mid - 1;
      }
      // Verificamos se a referência de mid em lookupArray é um valor menor que lookupValue
      else if (excelTypesComparator(lookupArray[mid]).isLessThan(lookupValue)) {
        // como supomos que a lista ser ordenada em ordem crescente, isso significa que o ponteiro
        // "low" deve apontar para o próximo valor de "mid", já que se a referencia de mid é menor que lookupValue, então,
        // teoricamente, os valores maiores estão à direita da lista.
        low = mid + 1;
      }
      // Caso a referência de mid em lookupArray seja um valor maior que lookupValue
      else {
        up = mid - 1;
      }
      continue;
    } 
    
    if (match_mode === 0 && search_mode === -2) {
      if (lookupArray[mid] === lookupValue) {
        exactMatch = mid;
        // Encaminha a referência de low para a direita (valores menores)
        low = mid + 1;
      } else if (excelTypesComparator(lookupArray[mid]).isLessThan(lookupValue)) {
        // Encaminha a referência de up para a esquerda (valores maiores)
        up = mid - 1;
      } else {
        // Encaminha a referência de low para a direita (valores menores)
        low = mid + 1;
      }
      continue;
    }

    // supomos que a lista está ordenada em ordem crescente
    if (match_mode === 1 && search_mode === 2) {
      // Caso "mid" seja exatamente igual ao valor procurado
      if (lookupArray[mid] === lookupValue) {
        // Atribuimos a referência do índice de match à variável lastMatch
        exactMatch = mid;
        // Como é exatamente igual e supomos que a lista está ordenada em ordem crescente, então iremos olhar para os valores
        // anteriores de lookup_range, para verificar se existem outros possiveis matches menores ou iguais a lookupValue
        up = mid - 1;
      }
      // Verificamos se a referência de mid em lookupArray é um valor menor que lookupValue
      else if (excelTypesComparator(lookupArray[mid]).isLessThan(lookupValue)) {
        // como supomos que a lista ser ordenada em ordem crescente, isso significa que o ponteiro
        // "low" deve apontar para o próximo valor de "mid", já que se a referencia de mid é menor que lookupValue, então,
        // teoricamente, os valores maiores estão à direita da lista.
        low = mid + 1;
      }
      // Caso a referência de mid em lookupArray seja um valor maior que lookupValue
      else {
        // Esse é um caso de match, portanto devemos guardar a referencia do match
        lastMatch = mid;

        up = mid - 1;
      }
      continue;
    }

    // supomos que a lista está ordenada em ordem crescente e queremos achar um valor menor ou igual
    // ao valor de busca (match_mode = -1)
    if (match_mode === -1 && search_mode === 2) {
      if (lookupArray[mid] === lookupValue) {
        // Caso o valor seja igual, guardamos a referência deste match
        exactMatch = mid;
        // Como supomos que a lista está ordenada em ordem crescente, significa que podem existir outros valores iguais a
        // searchKey anteriormente, como o caso [1, 1, 7, 7, 8, 9, 10], caso simplesmente retornassemos o match aqui, seria
        // retornado a posição 4, porém o primeiro match está na posição 3.
        up = mid - 1;
      }
      else if (excelTypesComparator(lookupArray[mid]).isLessThan(lookupValue)) {
        // Caso o valor seja menor que searchKey, guardamos a referência deste match
        lastMatch = mid;
        // Atualizamos low para ter a referência da proxima posição referente a mid, pois, se o valor de referência de mid
        // é menor que o valor procurado, isso significa que podem existir elementos posteriores que se aproximam mais
        // da chave de busca.
        low = mid + 1;
      } else {
        // Caso o valor atual referente a mid seja maior que lookupValue, então podemos diminuir a referência do tamanho
        // do array (up) para mid - 1;
        up = mid - 1;
      }
      continue;
    }
    // supomos que a lista está ordenada em ordem decrescente
    if (match_mode === 1 && search_mode === -2) {      
      if (lookupArray[mid] === lookupValue) {
        exactMatch = mid;
        // Encaminha a referência de low para a direita (valores menores)
        low = mid + 1;
      } else if (excelTypesComparator(lookupArray[mid]).isLessThan(lookupValue)) {
        // Encaminha a referência de up para a esquerda (valores maiores)
        up = mid - 1;
      } else {
        lastMatch = mid;
        // Encaminha a referência de low para a direita (valores menores)
        low = mid + 1;
      }
      continue;
    }

    if (match_mode === -1 && search_mode === -2) {
      if (lookupArray[mid] === lookupValue) {
        exactMatch = mid;
        // Encaminha a referência de up para a esquerda (valores maiores)
        low = mid + 1;
      } else if (excelTypesComparator(lookupArray[mid]).isLessThan(lookupValue)) {
        lastMatch = mid;

        // Encaminha a referência de up para a esquerda (valores maiores)
        up = mid - 1;
      } else {
        low = mid + 1;
      }
    }
  }

  const referenceIndex = exactMatch !== undefined ? exactMatch : lastMatch !== undefined ? lastMatch : -1;
  return referenceIndex;
}

/**
 * 
 * @param {*} searchKey The value to search for.
 * @param {*} lookup_range The range to consider for the search. This range must be a singular row or column.
 * @param {*} match_mode [OPTIONAL: 0 by default] The manner in which to find a match for the search_key.
 *  - 0 is for an exact match.
 *  - 1 is for an exact match or the next value that's greater than the search_key.
 *  - -1 is for an exact match or the next value that's lesser than the search_key.
 * @param {*} search_mode [OPTIONAL: 1 by default] The manner in which to search through the lookup range.
 * - 1 is to search from the first entry to the last.
 * - -1 is to search from the last entry to the first.
 * - 2 is to search through the range with binary search. The range needs to be sorted in ascending order first.
 * - -2 is to search through the range with binary search. The range needs to be sorted in descending order first.
 * @returns 
 */
export function XMATCH(
  searchKey,
  lookup_range,
  match_mode = 0,
  search_mode = 1
) {
  if (typeof searchKey === 'undefined') {
    searchKey = null;
  }

  match_mode = utils.parseNumber(match_mode);
  search_mode = utils.parseNumber(search_mode);

  if (utils.anyIsError(match_mode, search_mode) || !Array.isArray(lookup_range)) {
    return error.value;
  };

  lookup_range = lookup_range.flat();

  if (lookup_range.findIndex(item => Array.isArray(item) !== -1)) {
    return error.na;
  }

  searchKey =
    typeof searchKey === "string" ? searchKey.toLowerCase() : searchKey;
  
  lookup_range = lookup_range.map((v) => (typeof v === "string" ? v.toLowerCase() : v));

  let orderedList;
  let findedIndex;

  const checkMatchModeRules = (value, searchKey) => {
    if (match_mode === 0) return excelTypesComparator(value).isEqualsTo(searchKey);
    else if (match_mode === 1) return excelTypesComparator(value).isGreaterOrEqualThan(searchKey);
    else if (match_mode === -1) return excelTypesComparator(value).isLessOrEqualThan(searchKey);
  };

  // is not a binary search
  if (![2, -2].includes(search_mode)) {
    orderedList = lookup_range
      .slice()
      .sort((a, b) => excelTypesComparator(a).isLessThan(b) ? -1 : excelTypesComparator(a).isGreaterThan(b) ? 1 : 0)

    if ((match_mode === -1 && search_mode !== -1) || (match_mode === 1 && search_mode === -1)) {
      orderedList = orderedList.reverse();
    }

    if (search_mode === 1) {
      for (let i = 0; i < orderedList.length; i++) {
        if (checkMatchModeRules(orderedList[i], searchKey)) {
          findedIndex = lookup_range.indexOf(orderedList[i]);
          break;
        }
      }
    } else if (search_mode === -1) {
      for (let i = orderedList.length - 1; i >= 0; i--) {
        if (checkMatchModeRules(orderedList[i], searchKey)) {
          findedIndex = lookup_range.indexOf(orderedList[i]);
          break;
        }
      }
    }
  } else {
    orderedList = lookup_range;
    findedIndex = xmatchCustomBinarySearch(searchKey, orderedList, match_mode, search_mode);
  }

  if (typeof findedIndex === 'number' && findedIndex >= 0) {
    return (1 + findedIndex);
  }

  return error.na;
};
