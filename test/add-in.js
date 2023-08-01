import { expect } from 'chai'

import * as error from '../src/utils/error.js'
import * as addIn from '../src/add-in.js'

describe('Add-in', () => {
  it('EUROCONVERT', () => {
    expect(addIn.EUROCONVERT(1.20, "DEM", "EUR")).to.eq(0.61)
    expect(addIn.EUROCONVERT(1, "FRF", "EUR", true)).to.approximately(0.152449017, 1e-9)
    expect(addIn.EUROCONVERT(1, "FRF", "EUR", true, 3)).to.eq(0.152)
    expect(addIn.EUROCONVERT(1, "FRF", "EUR", false, 3)).to.eq(0.15)
    expect(addIn.EUROCONVERT(1, "FRF", "EUR", false)).to.eq(0.15)
    expect(addIn.EUROCONVERT(1, "FRF", "EUR")).to.eq(0.15)
    expect(addIn.EUROCONVERT(1, "FRF", "DEM", true)).to.approximately(0.29816436, 1e-6)
    expect(addIn.EUROCONVERT(1, "FRF", "DEM", true, 3)).to.approximately(0.29728616, 1e-6)
    expect(addIn.EUROCONVERT(1000, "DEM", "FRF")).to.eq(3353.85)
    expect(addIn.EUROCONVERT(5000, "ITL", "ESP", true)).to.approximately(429.6559881, 1e-6)
    expect(addIn.EUROCONVERT(1000, "ATS", "EUR")).to.approximately(72.67, 1e-2);
    expect(addIn.EUROCONVERT(1000, "BEF", "EUR")).to.approximately(24.79, 1e-2);
    expect(addIn.EUROCONVERT(1000, "DEM", "EUR")).to.approximately(511.29, 1e-2);
    expect(addIn.EUROCONVERT(1000, "EEK", "EUR")).to.approximately(63.91, 1e-2);
    expect(addIn.EUROCONVERT(1000, "FIM", "EUR")).to.approximately(168.19, 1e-2);
    expect(addIn.EUROCONVERT(1000, "FRF", "EUR")).to.approximately(152.45, 1e-2);
    expect(addIn.EUROCONVERT(1000, "GRD", "EUR")).to.approximately(2.93, 1e-2);
    expect(addIn.EUROCONVERT(1000, "IEP", "EUR")).to.approximately(1269.74, 1e-2);
    expect(addIn.EUROCONVERT(1000, "ITL", "EUR")).to.approximately(0.52, 1e-2);
    expect(addIn.EUROCONVERT(1000, "LUF", "EUR")).to.approximately(24.79, 1e-2);
    expect(addIn.EUROCONVERT(1000, "NLG", "EUR")).to.approximately(453.78, 1e-2);
    expect(addIn.EUROCONVERT(1000, "PTE", "EUR")).to.approximately(4.99, 1e-2);
    expect(addIn.EUROCONVERT(1000, "ESP", "EUR")).to.approximately(6.01, 1e-2);
    expect(addIn.EUROCONVERT(1000, "CYP", "EUR")).to.approximately(1708.6, 1e-2);
    expect(addIn.EUROCONVERT(1000, "LTL", "EUR")).to.approximately(289.62, 1e-2);
    expect(addIn.EUROCONVERT(1000, "MTL", "EUR")).to.approximately(2329.37, 1e-2);
    expect(addIn.EUROCONVERT(1000, "SIT", "EUR")).to.approximately(4.17, 1e-2);
    expect(addIn.EUROCONVERT(1000, "SKK", "EUR")).to.approximately(33.19, 1e-2);

    expect(addIn.EUROCONVERT("INVALID", "FRF", "EUR")).to.eq(error.value);
    expect(addIn.EUROCONVERT(1000, "INVALID", "EUR")).to.eq(error.value);
    expect(addIn.EUROCONVERT(1000, "BRL", "EUR")).to.eq(error.value);
    expect(addIn.EUROCONVERT(1000, "FRF", "INVALID")).to.eq(error.value);

    expect(addIn.EUROCONVERT(undefined, "FRF", "DEM", true, 3)).to.eq(0)
    expect(addIn.EUROCONVERT(1, undefined, "DEM", true, 3)).to.eq(error.value)
    expect(addIn.EUROCONVERT(1, "FRF", undefined, true, 3)).to.eq(error.value)
    expect(addIn.EUROCONVERT(null, "FRF", "DEM", true, 3)).to.eq(0)
    expect(addIn.EUROCONVERT(1, null, "DEM", true, 3)).to.eq(error.value)
    expect(addIn.EUROCONVERT(1, "FRF", null, true, 3)).to.eq(error.value)
    expect(addIn.EUROCONVERT(true, "FRF", "DEM", true, 3)).to.approximately(0, 1)
    expect(addIn.EUROCONVERT(1, true, "DEM", true, 3)).to.eq(error.value)
    expect(addIn.EUROCONVERT(1, "FRF", true, true, 3)).to.eq(error.value)
    expect(addIn.EUROCONVERT(false, "FRF", "DEM", true, 3)).to.approximately(0, 1)
    expect(addIn.EUROCONVERT(1, false, "DEM", true, 3)).to.eq(error.value)
    expect(addIn.EUROCONVERT(1, "FRF", false, true, 3)).to.eq(error.value)
    expect(addIn.EUROCONVERT([[1, 1]], "FRF", "DEM", true, 3)).to.eq(error.value)
    expect(addIn.EUROCONVERT(1, [["FRF", "FRF"]], "DEM", true, 3)).to.eq(error.value)
    expect(addIn.EUROCONVERT(1, "FRF", [["DEM", "DEM"]], true, 3)).to.eq(error.value)

    expect(addIn.EUROCONVERT(1, "FRF", "DEM", true, 3, 3)).to.eq(error.na)
    expect(addIn.EUROCONVERT(1.20, "DEM")).to.eq(error.na)
    expect(addIn.EUROCONVERT(1.20)).to.eq(error.na)
    expect(addIn.EUROCONVERT()).to.eq(error.na)
  })
})
