import * as evalExpression from './criteria-eval.js'
import * as utils from './common.js'

export function compact(array) {
  const result = []

  utils.arrayEach(array, (value) => {
    if (value) {
      result.push(value)
    }
  })

  return result
}

export function findResultIndex(database, criterias) {
  const matches = {}

  for (let i = 1; i < database[0].length; ++i) {
    matches[i] = true
  }

  let maxCriteriaLength = criterias[0].length

  for (let i = 1; i < criterias.length; ++i) {
    if (criterias[i].length > maxCriteriaLength) {
      maxCriteriaLength = criterias[i].length
    }
  }

  for (let k = 1; k < database.length; ++k) {
    for (let l = 1; l < database[k].length; ++l) {
      let currentCriteriaResult = false
      let hasMatchingCriteria = false

      for (let j = 0; j < criterias.length; ++j) {
        const criteria = criterias[j]

        if (criteria.length < maxCriteriaLength) {
          continue
        }

        const criteriaField = criteria[0]

        if (database[k][0] !== criteriaField) {
          continue
        }

        hasMatchingCriteria = true

        for (let p = 1; p < criteria.length; ++p) {
          if (!currentCriteriaResult) {
            const isWildcard = criteria[p] === void 0 || criteria[p] === '*'

            if (isWildcard) {
              currentCriteriaResult = true
            } else {
              const tokenizedCriteria = evalExpression.parse(criteria[p] + '')
              const tokens = [evalExpression.createToken(database[k][l], evalExpression.TOKEN_TYPE_LITERAL)].concat(
                tokenizedCriteria
              )

              currentCriteriaResult = evalExpression.compute(tokens)
            }
          }
        }
      }

      if (hasMatchingCriteria) {
        matches[l] = matches[l] && currentCriteriaResult
      }
    }
  }

  const result = []

  for (let n = 0; n < database[0].length; ++n) {
    if (matches[n]) {
      result.push(n - 1)
    }
  }

  return result
}
