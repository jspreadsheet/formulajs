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

  it('FILTERXML', () => {
    const xml1 = `<catalog><cd><title>Blood on the Tracks</title><artist>Bob Dylan</artist></cd>
      <cd><title>Hide your heart</title><artist>Bonnie Tyler</artist></cd>
      <cd><title>Legiao Urbana</title><artist>Legiao Urbana</artist></cd></catalog>`

    const xml2 = `<bookstore><book><title>Learning XML</title><author>Erik T. Ray</author><price>39.95</price></book>
      <book><title>Narnia</title><author>C. S. Lewis</author><price>30.00</price></book>
      <book><title>Harry Potter</title><author>J K. Rowling</author><price>29.99</price></book></bookstore>`

    const xml3 = `<world><country name="USA"><city>New York</city><city>Los Angeles</city></country>
      <country name="UK"><city>London</city><city>Manchester</city></country></world>`

    const xml4 = `<company><employee id="1"><name>John Doe</name><manager id="2" /></employee>
      <employee id="2"><name>Jane Smith</name><manager id="3" /></employee>
      <employee id="3"><name>James Brown</name></employee></company>`

    expect(web.FILTERXML(xml1, '//cd/title')).to.eql([['Blood on the Tracks'], ['Hide your heart'], ['Legiao Urbana']])
    expect(web.FILTERXML(xml1, '//cd/artist')).to.eql([['Bob Dylan'], ['Bonnie Tyler'], ['Legiao Urbana']])
    expect(web.FILTERXML(xml2, '//book[price<30]/title')).to.eql([['Harry Potter']])
    expect(web.FILTERXML(xml2, '//book[price>30]/title')).to.eql([['Learning XML']])
    expect(web.FILTERXML(xml2, '//book[price=30]/title')).to.eql([['Narnia']])
    expect(web.FILTERXML(xml3, "/world/country[@name='USA']/city")).to.eql([['New York'], ['Los Angeles']])
    expect(web.FILTERXML(xml3, "/world/country[@name='UK']/city")).to.eql([['London'], ['Manchester']])
    expect(web.FILTERXML(xml4, "/company/employee[name='John Doe']/manager/@id")).to.eql([['2']])
    expect(web.FILTERXML(xml4, "/company/employee[name='Michael Jackson']/manager/@id")).to.eql(error.value)
    expect(web.FILTERXML(`<book><title>Learning XML</author></book>`, '//book/title')).to.eql(error.value)
    expect(web.FILTERXML(`<book id=123><title>Learning XML</title></book>`, '//book/title')).to.eql(error.value)

    expect(web.FILTERXML(xml1, '')).to.eql(error.value)
    expect(web.FILTERXML(xml1, null)).to.eql(error.value)
    expect(web.FILTERXML(xml1, undefined)).to.eql(error.value)
    expect(web.FILTERXML(xml1, true)).to.eql(error.value)
    expect(web.FILTERXML(xml1, false)).to.eql(error.value)
    expect(web.FILTERXML(xml1, 4)).to.eql(error.value)
    expect(web.FILTERXML(xml1, '4')).to.eql(error.value)
    expect(web.FILTERXML(xml1, [['//cd/title', '//cd/title']])).to.eql(error.value)
    expect(web.FILTERXML(xml1)).to.eql(error.value)

    expect(web.FILTERXML('', '//cd/title')).to.eql(error.value)
    expect(web.FILTERXML(null, '//cd/title')).to.eql(error.value)
    expect(web.FILTERXML(undefined, '//cd/title')).to.eql(error.value)
    expect(web.FILTERXML(true, '//cd/title')).to.eql(error.value)
    expect(web.FILTERXML(false, '//cd/title')).to.eql(error.value)
    expect(web.FILTERXML([[xml1, xml1]], '//cd/title')).to.eql(error.value)
    expect(web.FILTERXML(4, '//cd/title')).to.eql(error.value)
    expect(web.FILTERXML('4', '//cd/title')).to.eql(error.value)

    expect(web.FILTERXML()).to.eql(error.na)
    expect(web.FILTERXML(xml1, '//cd/title', 2)).to.eql(error.na)

    Object.values(error).forEach((err) => {
      expect(web.FILTERXML(err, '//cd/title')).to.eql(err)
      expect(web.FILTERXML(xml1, err)).to.eql(err)
    })
  })
})
