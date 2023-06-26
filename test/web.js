import { expect } from 'chai'

import * as error from '../src/utils/error.js'
import * as web from '../src/web.js'

describe('Text', () => {
  it('ENCODEURL', () => {
    expect(web.ENCODEURL()).to.equal(error.na)
    expect(web.ENCODEURL('string')).to.equal('string')
    expect(web.ENCODEURL('string', 'string')).to.equal(error.na)
    expect(web.ENCODEURL('http://contoso.sharepoint.com/Finance/Profit and Loss Statement.xlsx')).to.equal(
      'http%3A%2F%2Fcontoso.sharepoint.com%2FFinance%2FProfit%20and%20Loss%20Statement.xlsx'
    )
    expect(web.ENCODEURL(true)).to.equal('true')
    expect(web.ENCODEURL(false)).to.equal('false')
    expect(web.ENCODEURL(undefined)).to.equal(error.na)
    expect(web.ENCODEURL(error.value)).to.equal(error.value)
    expect(web.ENCODEURL(error.na)).to.equal(error.na)
    expect(web.ENCODEURL(null)).to.equal('')
    expect(web.ENCODEURL(25)).to.equal('25')
    expect(web.ENCODEURL(0.343)).to.equal('0.343')
  })
})
