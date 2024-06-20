import { isValidNumber } from './common.js'
import * as error from './error.js'

const defaultOperator = '='
const validSymbols = ['>', '>=', '<', '<=', '=', '<>']
const validSymbolsLength = validSymbols.length
const _TOKEN_TYPE_OPERATOR = 'operator'
const _TOKEN_TYPE_LITERAL = 'literal'
const SUPPORTED_TOKENS = [_TOKEN_TYPE_OPERATOR, _TOKEN_TYPE_LITERAL]

export const TOKEN_TYPE_OPERATOR = _TOKEN_TYPE_OPERATOR
export const TOKEN_TYPE_LITERAL = _TOKEN_TYPE_LITERAL

export const isValidExpression = function (expression) {
  for (let index = 0; index < validSymbolsLength; index++) {
    if (expression.startsWith(validSymbols[index])) {
      return true
    }
  }

  return false
}

/**
 * Create token which describe passed symbol/value.
 *
 * @param {String} value Value/Symbol to describe.
 * @param {String} type Type of the token 'operator' or 'literal'.
 * @return {Object}
 */
export function createToken(value, type) {
  if (SUPPORTED_TOKENS.indexOf(type) === -1) {
    throw new Error('Unsupported token type: ' + type)
  }

  return {
    value: value,
    type: type
  }
}

/**
 * Tries to cast numeric values to their type passed as a string.
 *
 * @param {*} value
 * @return {*}
 */
function castValueToCorrectType(value) {
  if (isValidNumber(value, true)) {
    return value.indexOf('.') === -1 ? parseInt(value, 10) : parseFloat(value)
  }

  if (value === 'false') {
    return false
  }

  if (value === 'true') {
    return true
  }

  return value
}

/**
 * Generate stream of tokens from passed expression.
 *
 * @param {String} expression
 * @return {String[]}
 */
function tokenizeExpression(expression) {
  if (expression === '') {
    return ['']
  }

  const expressionLength = expression.length
  const tokens = []
  let cursorIndex = 0
  let processedValue = ''
  let processedSymbol = ''

  while (cursorIndex < expressionLength) {
    const char = expression.charAt(cursorIndex)

    switch (char) {
      case '>':
      case '<':
      case '=':
        processedSymbol = processedSymbol + char

        if (processedValue.length > 0) {
          tokens.push(processedValue)
          processedValue = ''
        }

        break
      default:
        if (processedSymbol.length > 0) {
          tokens.push(processedSymbol)
          processedSymbol = ''
        }

        processedValue = processedValue + char
        break
    }

    cursorIndex++
  }

  if (processedValue.length > 0) {
    tokens.push(processedValue)
  }

  if (processedSymbol.length > 0) {
    tokens.push(processedSymbol)
  }

  return tokens
}

/**
 * Analyze and convert tokens to an object which describes their meaning.
 *
 * @param {String[]} tokens
 * @return {Object[]}
 */
function analyzeTokens(tokens) {
  let literalValue = ''
  const analyzedTokens = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (i === 0 && validSymbols.indexOf(token) >= 0) {
      analyzedTokens.push(createToken(token, TOKEN_TYPE_OPERATOR))
    } else {
      literalValue += token
    }
  }

  analyzedTokens.push(createToken(castValueToCorrectType(literalValue), TOKEN_TYPE_LITERAL))

  return analyzedTokens
}

/**
 * Compute/Evaluate an expression passed as an array of tokens.
 *
 * @param {Object[]} tokens
 * @return {Boolean}
 */
function computeExpression(tokens) {
  const values = []
  let operator

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    switch (token.type) {
      case TOKEN_TYPE_OPERATOR:
        operator = token.value
        break
      case TOKEN_TYPE_LITERAL:
        values.push(token.value)
        break
    }
  }

  return evaluate(values, operator)
}

/**
 * Evaluate values based on passed math operator.
 *
 * @param {*} values
 * @param {String} operator
 * @return {Boolean}
 */
function evaluate(values, operator) {
  let result = false

  switch (operator) {
    case '>':
      result = values[0] > values[1]
      break
    case '>=':
      result = values[0] >= values[1]
      break
    case '<':
      result = values[0] < values[1]
      break
    case '<=':
      result = values[0] <= values[1]
      break
    case '=':
      result = values[0] == values[1]
      break
    case '<>':
      result = values[0] != values[1]
      break
  }

  return result
}

export function parse(expression) {
  return analyzeTokens(tokenizeExpression(expression))
}

export const compute = computeExpression

export function countIfComputeExpression(tokens) {
  const values = []
  let operator

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    switch (token.type) {
      case TOKEN_TYPE_OPERATOR:
        operator = token.value
        break
      case TOKEN_TYPE_LITERAL:
        values.push(token.value)
        break
    }
  }

  return countIfEvaluate(values, operator)
}

export function runCriterias() {
  const numOfRows = arguments[0].length
  const numOfColumns = arguments[0][0].length

  const resultsLength = numOfRows * numOfColumns
  const results = new Array(resultsLength)

  for (let i = 0; i < resultsLength; i++) {
    results[i] = true
  }

  const numOfArguments = arguments.length

  for (let criteriaIndex = 0; criteriaIndex < numOfArguments; criteriaIndex += 2) {
    const criteriaRange = arguments[criteriaIndex]
    let criteria = arguments[criteriaIndex + 1]

    if (typeof criteria === 'undefined' || criteria === null) {
      criteria = '=0'
    } else if (typeof criteria !== 'string') {
      if (criteria instanceof Error) {
        criteria = criteria.message
      } else {
        criteria = '=' + criteria
      }
    }

    const tokenizedCriteria = parse(criteria.toLowerCase())

    for (let y = 0; y < numOfRows; y++) {
      const row = criteriaRange[y]

      for (let x = 0; x < numOfColumns; x++) {
        const resultPosition = y * numOfColumns + x

        if (results[resultPosition]) {
          let value = row[x]

          if (typeof value === 'string') {
            value = value.toLowerCase()
          }

          const tokens = [createToken(value, TOKEN_TYPE_LITERAL)].concat(tokenizedCriteria)

          if (!countIfComputeExpression(tokens)) {
            results[resultPosition] = false
          }
        }
      }
    }
  }

  return results
}

export function countIfCompare(value, criteria) {
  const criteriaType = typeof criteria
  if (criteriaType === 'number') {
    const cellValue = value
    const cellValueType = typeof cellValue

    if (cellValueType === 'number') {
      return cellValue === criteria
    }

    if (cellValueType === 'string' && isValidNumber(cellValue, true)) {
      return parseFloat(cellValue) === criteria
    }

    return false
  }

  if (criteria === '') {
    return value === '' || value === null
  }

  if (criteriaType === 'string' && typeof value === 'string') {
    return stringCompare(value, criteria)
  }

  return value === criteria
}

const customFindIndex = function (value, valueIndex, criteria, criteriaIndex) {
  const currentCriteriaChar = criteria[criteriaIndex]

  if (currentCriteriaChar === '~') {
    return value.indexOf(criteria[criteriaIndex + 1], valueIndex)
  }

  if (currentCriteriaChar === '?') {
    return valueIndex >= value.length ? -1 : valueIndex
  }

  return value.indexOf(currentCriteriaChar, valueIndex)
}

export const stringCompare = function (value, criteria) {
  let valueIndex = 0

  const criteriaLength = criteria.length
  for (let criteriaIndex = 0; criteriaIndex < criteriaLength; criteriaIndex++) {
    const currentCriteriaChar = criteria[criteriaIndex]

    if (currentCriteriaChar === '~') {
      const nextCriteriaChar = criteria[criteriaIndex + 1]

      if (nextCriteriaChar === '?') {
        if (value[valueIndex] !== '?') {
          return false
        }

        valueIndex++
        criteriaIndex++
      } else if (nextCriteriaChar === '*') {
        if (value[valueIndex] !== '*') {
          return false
        }

        valueIndex++
        criteriaIndex++
      } else if (nextCriteriaChar === '~') {
        if (value[valueIndex] !== '~') {
          return false
        }

        valueIndex++
        criteriaIndex++
      }
    } else if (currentCriteriaChar === '?') {
      if (valueIndex >= value.length) {
        return false
      }

      valueIndex++
    } else if (currentCriteriaChar === '*') {
      do {
        criteriaIndex++

        if (criteriaIndex === criteriaLength) {
          return true
        }
      } while (criteria[criteriaIndex] === '*')

      if (criteria[criteriaIndex] === '~') {
        const nextCriteriaChar = criteria[criteriaIndex + 1]

        if (nextCriteriaChar !== '?' && nextCriteriaChar !== '*' && nextCriteriaChar !== '~') {
          criteriaIndex++
        }
      }

      if (criteriaIndex === criteriaLength) {
        return true
      }

      let nextIndex = customFindIndex(value, valueIndex, criteria, criteriaIndex)

      while (nextIndex >= 0) {
        const result = stringCompare(value.slice(nextIndex), criteria.slice(criteriaIndex))

        if (result) {
          return true
        }

        nextIndex = customFindIndex(value, nextIndex + 1, criteria, criteriaIndex)
      }

      return false
    } else {
      if (value[valueIndex] !== currentCriteriaChar) {
        return false
      }

      valueIndex++
    }
  }

  return valueIndex === value.length
}

const errorMessages = Object.values(error).map((err) => err.message.toLowerCase())

const compare = {
  '>': function (values) {
    return typeof values[0] === typeof values[1] && values[0] > values[1]
  },
  '>=': function (values) {
    return typeof values[0] === typeof values[1] && values[0] >= values[1]
  },
  '<': function (values) {
    return typeof values[0] === typeof values[1] && values[0] < values[1]
  },
  '<=': function (values) {
    return typeof values[0] === typeof values[1] && values[0] <= values[1]
  },
  '=': function (values) {
    if (typeof values[1] === 'number') {
      if (typeof values[0] === 'number') {
        return values[0] === values[1]
      }

      if (typeof values[0] === 'string') {
        return parseFloat(values[0]) === values[1]
      }

      return false
    }

    if (typeof values[1] === 'string') {
      if (errorMessages.includes(values[1])) {
        return values[0] instanceof Error && values[0].message.toLowerCase() === values[1]
      }

      if (values[1] === '') {
        return values[0] === null
      }

      if (typeof values[0] === 'string') {
        return stringCompare(values[0], values[1])
      }

      return false
    }

    return values[0] === values[1]
  },
  '<>': function (values) {
    if (values[1] === '') {
      return values[0] !== null
    }

    if (typeof values[1] === 'string') {
      if (errorMessages.includes(values[1])) {
        return !(values[0] instanceof Error) || values[0].message.toLowerCase() !== values[1]
      }

      if (typeof values[0] === 'string') {
        return !stringCompare(values[0], values[1])
      }

      return true
    }

    return values[0] !== values[1]
  }
}

function countIfEvaluate(values, operator) {
  if (!operator) {
    if (values[1] === '') {
      return values[0] === '' || values[0] === null
    }

    operator = defaultOperator
  }

  return compare[operator](values)
}
