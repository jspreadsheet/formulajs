import * as error from './utils/error.js'
import * as maths from './math-trig.js'
import * as stats from './statistical.js'
import * as utils from './utils/common.js'
import { compact, findResultIndex } from './utils/databaseUtils.js'

// Database functions
/**
 * Returns the average of selected database entries.
 *
 * Category: Database
 *
 * @param {*} database Range of values that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.
 * @param {*} field Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.
 * @param {*} criteria Range of values that contains the conditions you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one value below the column label in which you specify a condition for the column.
 * @returns
 */
export function DAVERAGE(database, field, criteria) {
  // Return error if field is not a number and not a string
  if (isNaN(field) && typeof field !== 'string') {
    return error.value
  }

  const resultIndexes = findResultIndex(database, criteria)
  let targetFields = []

  if (typeof field === 'string') {
    const index = utils.findField(database, field)
    targetFields = utils.rest(database[index])
  } else {
    targetFields = utils.rest(database[field])
  }

  let sum = 0

  utils.arrayEach(resultIndexes, (value) => {
    sum += targetFields[value]
  })

  return resultIndexes.length === 0 ? error.div0 : sum / resultIndexes.length
}

/**
 * Counts the values that contain numbers in a database.
 *
 * Category: Database
 *
 * @param {*} database The range of values that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.
 * @param {*} field Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.
 * @param {*} criteria The range of values that contains the conditions that you specify. You can use any range for the criteria argument, as long as the argument includes at least one column label and at least one value below the column label in which you specify a condition for the column.
 * @returns
 */
export function DCOUNT(database, field, criteria) {
  // Return error if field is not a number and not a string
  if (isNaN(field) && typeof field !== 'string') {
    return error.value
  }

  const resultIndexes = findResultIndex(database, criteria)
  let targetFields = []

  if (typeof field === 'string') {
    const index = utils.findField(database, field)
    targetFields = utils.rest(database[index])
  } else {
    targetFields = utils.rest(database[field])
  }

  const targetValues = []

  utils.arrayEach(resultIndexes, (value) => {
    targetValues.push(targetFields[value])
  })

  return stats.COUNT(targetValues)
}

/**
 * Counts nonblank values in a database.
 *
 * Category: Database
 *
 * @param {*} database The range of values that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.
 * @param {*} field Optional. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.
 * @param {*} criteria The range of values that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one value below the column label in which you specify a condition for the column.
 * @returns
 */
export function DCOUNTA(database, field, criteria) {
  // Return error if field is not a number and not a string
  if (isNaN(field) && typeof field !== 'string') {
    return error.value
  }

  const resultIndexes = findResultIndex(database, criteria)
  let targetFields = []

  if (typeof field === 'string') {
    const index = utils.findField(database, field)
    targetFields = utils.rest(database[index])
  } else {
    targetFields = utils.rest(database[field])
  }

  const targetValues = []

  utils.arrayEach(resultIndexes, (value) => {
    targetValues.push(targetFields[value])
  })

  return stats.COUNTA(targetValues)
}

/**
 * Extracts from a database a single record that matches the specified criteria.
 *
 * Category: Database
 *
 * @param {*} database The range of values that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.
 * @param {*} field Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.
 * @param {*} criteria The range of values that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one value below the column label in which you specify a condition for the column.
 * @returns
 */
export function DGET(database, field, criteria) {
  // Return error if field is not a number and not a string
  if (isNaN(field) && typeof field !== 'string') {
    return error.value
  }

  const resultIndexes = findResultIndex(database, criteria)
  let targetFields = []

  if (typeof field === 'string') {
    const index = utils.findField(database, field)
    targetFields = utils.rest(database[index])
  } else {
    targetFields = utils.rest(database[field])
  }

  // Return error if no record meets the criteria
  if (resultIndexes.length === 0) {
    return error.value
  }
  // Returns the #NUM! error value because more than one record meets the
  // criteria
  if (resultIndexes.length > 1) {
    return error.num
  }

  return targetFields[resultIndexes[0]]
}

/**
 * Returns the maximum value from selected database entries.
 *
 * Category: Database
 *
 * @param {*} database The range of values that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.
 * @param {*} field Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.
 * @param {*} criteria The range of values that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one value below the column label in which you specify a condition for the column.
 * @returns
 */
export function DMAX(database, field, criteria) {
  // Return error if field is not a number and not a string

  if (isNaN(field) && typeof field !== 'string') {
    return error.value
  }

  const resultIndexes = findResultIndex(database, criteria)
  let targetFields = []

  if (typeof field === 'string') {
    const index = utils.findField(database, field)
    targetFields = utils.rest(database[index])
  } else {
    targetFields = utils.rest(database[field])
  }

  let maxValue = targetFields[resultIndexes[0]]

  utils.arrayEach(resultIndexes, (value) => {
    if (maxValue < targetFields[value]) {
      maxValue = targetFields[value]
    }
  })

  return maxValue
}

/**
 * Returns the minimum value from selected database entries.
 *
 * Category: Database
 *
 * @param {*} database The range of values that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.
 * @param {*} field Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.
 * @param {*} criteria The range of values that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one value below the column label in which you specify a condition for the column.
 * @returns
 */
export function DMIN(database, field, criteria) {
  // Return error if field is not a number and not a string
  if (isNaN(field) && typeof field !== 'string') {
    return error.value
  }

  const resultIndexes = findResultIndex(database, criteria)
  let targetFields = []

  if (typeof field === 'string') {
    const index = utils.findField(database, field)
    targetFields = utils.rest(database[index])
  } else {
    targetFields = utils.rest(database[field])
  }

  let minValue = targetFields[resultIndexes[0]]

  utils.arrayEach(resultIndexes, (value) => {
    if (minValue > targetFields[value]) {
      minValue = targetFields[value]
    }
  })

  return minValue
}

/**
 * Multiplies the values in a particular field of records that match the criteria in a database.
 *
 * Category: Database
 *
 * @param {*} database The range of values that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.
 * @param {*} field Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.
 * @param {*} criteria The range of values that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one value below the column label in which you specify a condition for the column.
 * @returns
 */
export function DPRODUCT(database, field, criteria) {
  // Return error if field is not a number and not a string
  if (isNaN(field) && typeof field !== 'string') {
    return error.value
  }

  const resultIndexes = findResultIndex(database, criteria)
  let targetFields = []

  if (typeof field === 'string') {
    const index = utils.findField(database, field)
    targetFields = utils.rest(database[index])
  } else {
    targetFields = utils.rest(database[field])
  }

  let targetValues = []

  utils.arrayEach(resultIndexes, (value) => {
    targetValues.push(targetFields[value])
  })
  targetValues = compact(targetValues)

  let result = 1

  utils.arrayEach(targetValues, (value) => {
    result *= value
  })

  return result
}

/**
 * Adds the numbers in the field column of records in the database that match the criteria.
 *
 * Category: Database
 *
 * @param {*} database The range of values that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.
 * @param {*} field Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.
 * @param {*} criteria Is the range of values that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one value below the column label in which you specify a condition for the column.
 * @returns
 */
export function DSUM(database, field, criteria) {
  // Return error if field is not a number and not a string
  if (isNaN(field) && typeof field !== 'string') {
    return error.value
  }

  const resultIndexes = findResultIndex(database, criteria)
  let targetFields = []

  if (typeof field === 'string') {
    const index = utils.findField(database, field)
    targetFields = utils.rest(database[index])
  } else {
    targetFields = utils.rest(database[field])
  }

  const targetValues = []

  utils.arrayEach(resultIndexes, (value) => {
    targetValues.push(targetFields[value])
  })

  return maths.SUM(targetValues)
}
