import * as error from './utils/error.js'
import * as utils from './utils/common.js'

export function EUROCONVERT(number, source, target, full_precision = false, triangulation_precision) {
  if (arguments.length > 5 || arguments.length < 3) {
    return error.na
  }

  const rates = {
    ATS: 13.7603,
    BEF: 40.3399,
    DEM: 1.95583,
    EEK: 15.6466,
    FIM: 5.94573,
    FRF: 6.55957,
    GRD: 340.75,
    IEP: 0.787564,
    ITL: 1936.27,
    LUF: 40.3399,
    NLG: 2.20371,
    PTE: 200.482,
    ESP: 166.386,
    CYP: 0.585274,
    LTL: 3.4528,
    MTL: 0.4293,
    SIT: 239.64,
    SKK: 30.126,
    EUR: 1
  }

  number = utils.parseNumber(number)
  triangulation_precision = utils.parseNumber(triangulation_precision)
  full_precision = utils.parseBool(full_precision)

  if (!rates[source] || !rates[target] || utils.anyIsError(number, triangulation_precision, full_precision)) {
    return error.value
  }

  let before_triang = number / rates[source]

  if (typeof triangulation_precision === 'number' && triangulation_precision >= 3) {
    before_triang = Number(before_triang.toFixed(triangulation_precision))
  }

  let result = before_triang * rates[target]

  return full_precision ? result : Number(result.toFixed(2))
}
