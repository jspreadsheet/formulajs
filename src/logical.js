import * as error from './utils/error.js'
import * as information from './information.js'
import * as utils from './utils/common.js'

/**
 * Returns TRUE if all of its arguments are TRUE.
 *
 * Category: Logical
 *
 * @returns
 */
export function AND() {
  if (arguments.length === 0) {
    return error.na
  }

  const args = utils.flatten(arguments)
  let result = error.value

  for (let i = 0; i < args.length; i++) {
    if (args[i] instanceof Error) {
      return args[i]
    }

    if (args[i] === undefined || args[i] === null || typeof args[i] === 'string') {
      continue
    }

    if (result === error.value) {
      result = true
    }

    if (!args[i]) {
      result = false
    }
  }

  return result
}

/**
 * Returns the logical value FALSE.
 *
 * Category: Logical
 *
 * @returns
 */
export function FALSE() {
  if (arguments.length !== 0) {
    return error.na
  }

  return false
}

function getBooleanValueFromLogicalTest(logicalTest) {
  if (logicalTest instanceof Error) {
    return logicalTest
  }

  const type = typeof logicalTest

  if (type === 'string') {
    if (logicalTest.length === 4) {
      if (logicalTest.toLowerCase() === 'true') {
        return true
      }
    } else if (logicalTest.length === 5 && logicalTest.toLowerCase() === 'false') {
      return false
    }

    return error.value
  }

  return type === 'boolean' ? logicalTest : Boolean(logicalTest)
}

function getValueFromSource(source, rowIndex, columnIndex, sourceType) {
  if (sourceType === 'single') {
    return source
  }

  if (sourceType === 'line') {
    return columnIndex < source[0].length ? source[0][columnIndex] : error.na
  }

  if (sourceType === 'column') {
    return rowIndex < source.length ? source[rowIndex][0] : error.na
  }

  return rowIndex < source.length && columnIndex < source[rowIndex].length ? source[rowIndex][columnIndex] : error.na
}

function addColumnToResult(source, sourceType, columnIndex, result, numOfRows) {
  for (let rowIndex = 0; rowIndex < numOfRows; rowIndex++) {
    result[rowIndex].push(getValueFromSource(source, rowIndex, columnIndex, sourceType))
  }
}

function addRowToResult(source, sourceType, rowIndex, result, numOfColumns) {
  for (let columnIndex = 0; columnIndex < numOfColumns; columnIndex++) {
    result[rowIndex].push(getValueFromSource(source, rowIndex, columnIndex, sourceType))
  }
}

function addItemToResult(source, sourceType, rowIndex, columnIndex, result) {
  result[rowIndex].push(getValueFromSource(source, rowIndex, columnIndex, sourceType))
}

/**
 * Specifies a logical test to perform.
 *
 * Category: Logical
 *
 * @param {*} logical_test
 * @param {*} value_if_true
 * @param {*} value_if_false
 *
 * @returns
 */
export function IF(logical_test, value_if_true, value_if_false) {
  if (arguments.length < 2 || arguments.length > 3) {
    return error.na
  }

  if (value_if_true === undefined || value_if_true === null) {
    value_if_true = 0
  }

  if (arguments.length !== 3) {
    value_if_false = false
  } else if (value_if_false === undefined || value_if_false === null) {
    value_if_false = 0
  }

  let logicalTestVariableType = utils.getVariableType2(logical_test)

  let valueIfTrueVariableType = utils.getVariableType2(value_if_true)
  if (valueIfTrueVariableType === 'fake-matrix') {
    valueIfTrueVariableType = 'single'
    value_if_true = value_if_true[0][0]
  }

  let valueIfFalseVariableType = utils.getVariableType2(value_if_false)
  if (valueIfFalseVariableType === 'fake-matrix') {
    valueIfFalseVariableType = 'single'
    value_if_false = value_if_false[0][0]
  }

  const getCorrectArgument = (testValue) => {
    if (typeof testValue === 'undefined') {
      return {
        source: error.na,
        type: 'single'
      }
    }

    if (testValue instanceof Error) {
      return {
        source: testValue,
        type: 'single'
      }
    }

    if (testValue) {
      return {
        source: value_if_true,
        type: valueIfTrueVariableType
      }
    }

    return {
      source: value_if_false,
      type: valueIfFalseVariableType
    }
  }

  if (logicalTestVariableType === 'fake-matrix') {
    logical_test = logical_test[0][0]
    logicalTestVariableType = 'single'
  }

  if (logicalTestVariableType === 'single') {
    const handledTestValue = getBooleanValueFromLogicalTest(logical_test)

    const { source } = getCorrectArgument(handledTestValue)

    return source
  }

  const numOfRowsInTheResult = Math.max(
    logical_test.length,
    valueIfTrueVariableType !== 'single' ? value_if_true.length : 1,
    valueIfFalseVariableType !== 'single' ? value_if_false.length : 1
  )

  const numOfColumnsInTheResult = Math.max(
    logical_test[0].length,
    valueIfTrueVariableType !== 'single' ? value_if_true[0].length : 1,
    valueIfFalseVariableType !== 'single' ? value_if_false[0].length : 1
  )

  const result = []
  for (let rowIndex = 0; rowIndex < numOfRowsInTheResult; rowIndex++) {
    result.push([])
  }

  if (logicalTestVariableType === 'line') {
    const testRow = logical_test[0]

    for (let columnIndex = 0; columnIndex < numOfColumnsInTheResult; columnIndex++) {
      const handledTestValue =
        columnIndex >= testRow.length ? undefined : getBooleanValueFromLogicalTest(testRow[columnIndex])

      const { source, type } = getCorrectArgument(handledTestValue)

      addColumnToResult(source, type, columnIndex, result, numOfRowsInTheResult)
    }

    return result
  }

  if (logicalTestVariableType === 'column') {
    for (let rowIndex = 0; rowIndex < numOfRowsInTheResult; rowIndex++) {
      const handledTestValue =
        rowIndex >= logical_test.length ? undefined : getBooleanValueFromLogicalTest(logical_test[rowIndex][0])

      const { source, type } = getCorrectArgument(handledTestValue)

      addRowToResult(source, type, rowIndex, result, numOfColumnsInTheResult)
    }

    return result
  }

  for (let rowIndex = 0; rowIndex < numOfRowsInTheResult; rowIndex++) {
    for (let columnIndex = 0; columnIndex < numOfColumnsInTheResult; columnIndex++) {
      const handledTestValue =
        rowIndex >= logical_test.length || columnIndex >= logical_test[rowIndex].length
          ? undefined
          : getBooleanValueFromLogicalTest(logical_test[rowIndex][columnIndex])

      const { source, type } = getCorrectArgument(handledTestValue)

      addItemToResult(source, type, rowIndex, columnIndex, result)
    }
  }

  return result
}

/**
 * Checks whether one or more conditions are met and returns a value that corresponds to the first TRUE condition.
 *
 * Category: Logical
 *
 * @returns
 */
export function IFS() {
  if (arguments.length < 2 || arguments.length % 2 === 1) {
    return error.na
  }

  for (let i = 0; i < arguments.length / 2; i++) {
    let test = arguments[i * 2]

    if (Object.values(error).includes(test)) {
      return test
    }

    if (test === 'true') {
      test = true
    } else if (test === 'false') {
      test = false
    } else if (typeof test === 'string') {
      return error.value
    }

    if (test) {
      if (arguments[i * 2 + 1] == undefined || arguments[i * 2 + 1] == null) {
        return 0
      } else {
        return arguments[i * 2 + 1]
      }
    }
  }

  return error.na
}

/**
 * Returns a value you specify if a formula evaluates to an error; otherwise, returns the result of the formula.
 *
 * Category: Logical
 *
 * @param {*} value The argument that is checked for an error.
 * @param {*} value_if_error The value to return if the formula evaluates to an error. The following error types are evaluated: #N/A, #VALUE!, #REF!, #DIV/0!, #NUM!, #NAME?, or #NULL!.
 * @returns
 */
export function IFERROR(value, value_if_error) {
  if (arguments.length !== 2) {
    return error.na
  }

  if (value === null) {
    return 0
  }

  return information.ISERROR(value) ? value_if_error : value
}

/**
 * Returns the value you specify if the expression resolves to #N/A, otherwise returns the result of the expression.
 *
 * Category: Logical
 *
 * @returns
 */
export function IFNA(value, value_if_na) {
  if (arguments.length !== 2) {
    return error.na
  }

  if (value === null) {
    return 0
  }

  return value === error.na ? value_if_na : value
}

/**
 * Reverses the logic of its argument.
 *
 * Category: Logical
 *
 * @returns
 */
export function NOT(logical) {
  if (arguments.length !== 1) {
    return error.na
  }

  if (logical instanceof Error) {
    return logical
  }

  if (typeof logical === 'string') {
    const upperCase = logical.toUpperCase()

    if (upperCase === 'TRUE') {
      return false
    }
    if (upperCase === 'FALSE') {
      return true
    }

    return error.value
  }

  return !logical
}

/**
 * Returns TRUE if any argument is TRUE.
 *
 * Category: Logical
 *
 * @returns
 */
export function OR() {
  if (arguments.length < 1) {
    return error.na
  }

  const args = utils.flatten(arguments)
  let result = error.value

  for (let i = 0; i < args.length; i++) {
    if (args[i] instanceof Error) {
      return args[i]
    }

    if (args[i] === undefined || args[i] === null || typeof args[i] === 'string') {
      continue
    }

    if (result === error.value) {
      result = false
    }

    if (args[i]) {
      result = true
    }
  }

  return result
}

/**
 * Returns the logical value TRUE.
 *
 * Category: Logical
 *
 * @returns
 */
export function TRUE() {
  return true
}

/**
 * Returns a logical exclusive OR of all arguments.
 *
 * Category: Logical
 *
 * @param {*} args logical1, logical2,… Logical 1 is required, subsequent logical values are optional. 1 to 254 conditions you want to test that can be either TRUE or FALSE, and can be logical values, arrays, or references.
 * @returns
 */
export function XOR() {
  const args = utils.flatten(arguments)
  let result = error.value

  for (let i = 0; i < args.length; i++) {
    if (args[i] instanceof Error) {
      return args[i]
    }

    if (args[i] === undefined || args[i] === null || typeof args[i] === 'string') {
      continue
    }

    if (result === error.value) {
      result = 0
    }

    if (args[i]) {
      result++
    }
  }

  if (result === error.value) {
    return result
  }

  return !!(Math.floor(Math.abs(result)) & 1)
}

/**
 * Evaluates an expression against a list of values and returns the result corresponding to the first matching value. If there is no match, an optional default value may be returned.
 *
 * Category: Logical
 *
 * @returns
 */
export function SWITCH() {
  let result

  if (arguments.length > 0) {
    const targetValue = arguments[0]
    const argc = arguments.length - 1
    const switchCount = Math.floor(argc / 2)
    let switchSatisfied = false
    const hasDefaultClause = argc % 2 !== 0
    const defaultClause = argc % 2 === 0 ? null : arguments[arguments.length - 1]

    if (switchCount) {
      for (let index = 0; index < switchCount; index++) {
        if (targetValue === arguments[index * 2 + 1]) {
          result = arguments[index * 2 + 2]
          switchSatisfied = true
          break
        }
      }
    }

    if (!switchSatisfied) {
      result = hasDefaultClause ? defaultClause : error.na
    }
  } else {
    result = error.value
  }

  return result
}
