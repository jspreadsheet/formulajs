import { expect } from 'chai'

import * as error from '../src/utils/error.js'
import * as logical from '../src/logical.js'

describe('Logical', () => {
  it('AND', () => {
    expect(logical.AND(undefined, undefined)).to.equal(error.value)
    expect(logical.AND('', undefined)).to.equal(error.value)
    expect(logical.AND('text', undefined)).to.equal(error.value)
    expect(logical.AND(undefined, true)).to.equal(true)
    expect(logical.AND(true, undefined)).to.equal(true)
    expect(logical.AND(undefined, false)).to.equal(false)
    expect(logical.AND(false, undefined)).to.equal(false)
    expect(logical.AND(error.na, true)).to.equal(error.na)

    expect(logical.AND(0)).to.equal(false)
    expect(logical.AND(4)).to.equal(true)
    expect(logical.AND(-5)).to.equal(true)

    expect(logical.AND(1.5)).to.equal(true)
    expect(logical.AND(0.1)).to.equal(true)

    expect(logical.AND(true)).to.equal(true)
    expect(logical.AND(false)).to.equal(false)

    expect(logical.AND('text')).to.equal(error.value)
    expect(logical.AND('')).to.equal(error.value)

    expect(logical.AND('true')).to.equal(error.value)
    expect(logical.AND('false')).to.equal(error.value)

    expect(logical.AND('0')).to.equal(error.value)
    expect(logical.AND('4')).to.equal(error.value)
    expect(logical.AND('-5')).to.equal(error.value)

    Object.values(error).forEach((err) => {
      expect(logical.AND(err)).to.equal(err)
    })

    expect(logical.AND(null)).to.equal(error.value)

    expect(logical.AND(null, null)).to.equal(error.value)
    expect(logical.AND('', null)).to.equal(error.value)
    expect(logical.AND('text', null)).to.equal(error.value)
    expect(logical.AND(null, true)).to.equal(true)
    expect(logical.AND(true, null)).to.equal(true)
    expect(logical.AND(null, false)).to.equal(false)
    expect(logical.AND(false, null)).to.equal(false)

    expect(logical.AND(true, true)).to.equal(true)
    expect(logical.AND(false, false)).to.equal(false)
    expect(logical.AND(true, false)).to.equal(false)
    expect(logical.AND(false, true)).to.equal(false)

    expect(logical.AND(0, 0)).to.equal(false)
    expect(logical.AND(4, 4)).to.equal(true)
    expect(logical.AND(4, 0)).to.equal(false)
    expect(logical.AND(0, 4)).to.equal(false)

    expect(logical.AND(42, true)).to.equal(true)
    expect(logical.AND(0, true)).to.equal(false)

    expect(logical.AND('text', true)).to.equal(true)
    expect(logical.AND(true, 'text')).to.equal(true)
    expect(logical.AND('text', false)).to.equal(false)
    expect(logical.AND(false, 'text')).to.equal(false)

    expect(logical.AND(error.nil, error.value)).to.equal(error.nil)
    expect(logical.AND(error.value, error.nil)).to.equal(error.value)

    expect(logical.AND(error.div0, true)).to.equal(error.div0)
    expect(logical.AND(true, error.data)).to.equal(error.data)
    expect(logical.AND(error.name, false)).to.equal(error.name)
    expect(logical.AND(false, error.nil)).to.equal(error.nil)

    expect(logical.AND('text', error.num)).to.equal(error.num)
    expect(logical.AND(error.calc, 'text')).to.equal(error.calc)

    expect(logical.AND('', '', '')).to.equal(error.value)
    expect(logical.AND(true, 1, true)).to.equal(true)
    expect(logical.AND(4, true, 0)).to.equal(false)

    expect(logical.AND()).to.equal(error.na)

    expect(logical.AND([1, true, 'text'])).to.equal(true)
    expect(logical.AND(['text', true, 0])).to.equal(false)
    expect(logical.AND([true, 'text', error.div0])).to.equal(error.div0)
    expect(logical.AND([true, error.nil, error.div0])).to.equal(error.nil)

    expect(logical.AND([[1], [true], ['text']])).to.equal(true)
    expect(logical.AND([['text'], [true], [0]])).to.equal(false)
    expect(logical.AND([[true], ['text'], [error.div0]])).to.equal(error.div0)
    expect(logical.AND([[error.data], ['text'], [error.div0]])).to.equal(error.data)

    expect(
      logical.AND([
        [1, 'something'],
        [true, 4],
        [6, 'text']
      ])
    ).to.equal(true)
    expect(
      logical.AND([
        ['text', 1],
        [true, false],
        [0, true]
      ])
    ).to.equal(false)
    expect(
      logical.AND([
        [true, false],
        [1, 'text'],
        [error.div0, 4]
      ])
    ).to.equal(error.div0)
    expect(
      logical.AND([
        [true, error.value],
        [error.div0, error.data],
        [0, 4]
      ])
    ).to.equal(error.value)
    expect(
      logical.AND([
        [true, false],
        [error.div0, error.data],
        [0, 4]
      ])
    ).to.equal(error.div0)
  })

  it('FALSE', () => {
    expect(logical.FALSE()).to.equal(false)

    expect(logical.FALSE(1)).to.equal(error.na)
  })

  describe('IF', () => {
    it('First argument is not a range', () => {
      expect(logical.IF(undefined, undefined, undefined)).to.equal(0)
      expect(logical.IF(undefined, 1, 2)).to.equal(2)
      expect(logical.IF(error.na, undefined)).to.equal(error.na)

      expect(logical.IF(true, error.na)).to.equal(error.na)

      expect(logical.IF(null, 1, 2)).to.equal(2)
      expect(logical.IF(true, null, 2)).to.equal(0)
      expect(logical.IF(false, 1, null)).to.equal(0)

      expect(logical.IF(1, 1, 2)).to.equal(1)
      expect(logical.IF(0, 1, 2)).to.equal(2)
      expect(logical.IF(-4, 1, 2)).to.equal(1)
      expect(logical.IF(0.4, 1, 2)).to.equal(1)

      expect(logical.IF(true, 1, 2)).to.equal(1)
      expect(logical.IF(false, 1, 2)).to.equal(2)
      expect(logical.IF(true, 1)).to.equal(1)
      expect(logical.IF(false, 1)).to.equal(false)

      expect(logical.IF('true', 1, 2)).to.equal(1)
      expect(logical.IF('TRUE', 1, 2)).to.equal(1)
      expect(logical.IF('false', 1, 2)).to.equal(2)
      expect(logical.IF('FALSE', 1, 2)).to.equal(2)

      expect(logical.IF('  true', 1, 2)).to.equal(error.value)
      expect(logical.IF('text', 1, 2)).to.equal(error.value)
      expect(logical.IF('', 1, 2)).to.equal(error.value)
      expect(logical.IF('   ', 1, 2)).to.equal(error.value)
      expect(logical.IF('1', 1, 2)).to.equal(error.value)
      expect(logical.IF('1900-02-01', 1, 2)).to.equal(error.value)
      expect(logical.IF('08:45 AM', 1, 2)).to.equal(error.value)

      expect(
        logical.IF(
          true,
          [
            [1, 2],
            [3, 4]
          ],
          [[5, 6]]
        )
      ).to.eql([
        [1, 2],
        [3, 4]
      ])
      expect(
        logical.IF(
          false,
          [
            [1, 2],
            [3, 4]
          ],
          [[5, 6]]
        )
      ).to.eql([[5, 6]])

      Object.values(error).forEach((err) => {
        expect(logical.IF(err, 1, 2)).to.equal(err)
      })
    })

    it('First argument is a false range', () => {
      expect(logical.IF([[true]], 1, 2)).to.equal(1)
      expect(logical.IF([[false]], 1, 2)).to.equal(2)

      expect(
        logical.IF(
          [[true]],
          [
            [1, 2],
            [3, 4]
          ],
          [[5, 6]]
        )
      ).to.eql([
        [1, 2],
        [3, 4]
      ])
      expect(
        logical.IF(
          [[false]],
          [
            [1, 2],
            [3, 4]
          ],
          [[5, 6]]
        )
      ).to.eql([[5, 6]])

      Object.values(error).forEach((err) => {
        expect(logical.IF([[err]], 1, 2)).to.equal(err)
      })
    })

    it('First argument is a column', () => {
      expect(
        logical.IF(
          [[false], [true], [false]],
          [
            [1, 4],
            [2, 5],
            [3, 6]
          ],
          'test'
        )
      ).to.eql([
        ['test', 'test'],
        [2, 5],
        ['test', 'test']
      ])

      expect(
        logical.IF([[false], [true], [false]], 'test', [
          [1, 4],
          [2, 5],
          [3, 6]
        ])
      ).to.eql([
        [1, 4],
        ['test', 'test'],
        [3, 6]
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [
            [1, 4],
            [2, 5],
            [3, 6]
          ],
          'test'
        )
      ).to.eql([
        ['test', 'test'],
        [2, 5],
        ['test', 'test']
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [['test']],
          [
            [1, 4],
            [2, 5],
            [3, 6]
          ]
        )
      ).to.eql([
        [1, 4],
        ['test', 'test'],
        [3, 6]
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [
            [1, 4],
            [2, 5],
            [3, 6]
          ],
          [['test']]
        )
      ).to.eql([
        ['test', 'test'],
        [2, 5],
        ['test', 'test']
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [
            [10, 20],
            [11, 21],
            [12, 22]
          ],
          [
            [110, 120, 130, 140],
            [111, 121, 131, 141],
            [112, 122, 132, 142]
          ]
        )
      ).to.eql([
        [110, 120, 130, 140],
        [11, 21, error.na, error.na],
        [112, 122, 132, 142]
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [
            [10, 20, 30, 40],
            [11, 21, 31, 41],
            [12, 22, 32, 42]
          ],
          [
            [110, 120],
            [111, 121],
            [112, 122]
          ]
        )
      ).to.eql([
        [110, 120, error.na, error.na],
        [11, 21, 31, 41],
        [112, 122, error.na, error.na]
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [[10], [11], [12]],
          [
            [110, 120, 130],
            [111, 121, 131],
            [112, 122, 132]
          ]
        )
      ).to.eql([
        [110, 120, 130],
        [11, 11, 11],
        [112, 122, 132]
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [
            [10, 20, 30, 40],
            [11, 21, 31, 41],
            [12, 22, 32, 42]
          ],
          [[110], [111], [112]]
        )
      ).to.eql([
        [110, 110, 110, 110],
        [11, 21, 31, 41],
        [112, 112, 112, 112]
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [[10], [11], [12], [13]],
          [
            [110, 120, 130],
            [111, 121, 131],
            [112, 122, 132]
          ]
        )
      ).to.eql([
        [110, 120, 130],
        [11, 11, 11],
        [112, 122, 132],
        [error.na, error.na, error.na]
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [
            [10, 20, 30, 40],
            [11, 21, 31, 41],
            [12, 22, 32, 42]
          ],
          [[110], [111], [112], [113]]
        )
      ).to.eql([
        [110, 110, 110, 110],
        [11, 21, 31, 41],
        [112, 112, 112, 112],
        [error.na, error.na, error.na, error.na]
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [[10], [11], [12]],
          [
            [110, 120, 130],
            [111, 121, 131]
          ]
        )
      ).to.eql([
        [110, 120, 130],
        [11, 11, 11],
        [error.na, error.na, error.na]
      ])

      expect(
        logical.IF(
          [[false], [true], [false]],
          [[10], [11]],
          [
            [110, 120, 130],
            [111, 121, 131],
            [112, 122, 132]
          ]
        )
      ).to.eql([
        [110, 120, 130],
        [11, 11, 11],
        [112, 122, 132]
      ])

      expect(logical.IF([[false], [true], [false]], [[10], [11], [12]], [[110, 120, 130]])).to.eql([
        [110, 120, 130],
        [11, 11, 11],
        [110, 120, 130]
      ])

      expect(
        logical.IF(
          [[false], [true], [true]],
          [[10], [11], [12]],
          [
            [110, 120, 130],
            [111, 121, 131]
          ]
        )
      ).to.eql([
        [110, 120, 130],
        [11, 11, 11],
        [12, 12, 12]
      ])

      expect(
        logical.IF(
          [[false], [true], [true]],
          [[10], [11]],
          [
            [110, 120, 130],
            [111, 121, 131],
            [112, 122, 132]
          ]
        )
      ).to.eql([
        [110, 120, 130],
        [11, 11, 11],
        [error.na, error.na, error.na]
      ])

      expect(
        logical.IF(
          [[false], [error.data], [true]],
          [[10], [11], [12]],
          [
            [110, 120, 130],
            [111, 121, 131],
            [112, 122, 132]
          ]
        )
      ).to.eql([
        [110, 120, 130],
        [error.data, error.data, error.data],
        [12, 12, 12]
      ])
    })

    it('First argument is a row', () => {
      expect(
        logical.IF(
          [[false, true, false]],
          [
            [1, 2, 3],
            [4, 5, 6]
          ],
          'test'
        )
      ).to.eql([
        ['test', 2, 'test'],
        ['test', 5, 'test']
      ])

      expect(
        logical.IF([[false, true, false]], 'test', [
          [1, 2, 3],
          [4, 5, 6]
        ])
      ).to.eql([
        [1, 'test', 3],
        [4, 'test', 6]
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [
            [1, 2, 3],
            [4, 5, 6]
          ],
          'test'
        )
      ).to.eql([
        ['test', 2, 'test'],
        ['test', 5, 'test']
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [['test']],
          [
            [1, 2, 3],
            [4, 5, 6]
          ]
        )
      ).to.eql([
        [1, 'test', 3],
        [4, 'test', 6]
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [
            [1, 2, 3],
            [4, 5, 6]
          ],
          [['test']]
        )
      ).to.eql([
        ['test', 2, 'test'],
        ['test', 5, 'test']
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [
            [10, 11, 12],
            [20, 21, 22]
          ],
          [
            [110, 111, 112],
            [120, 121, 122],
            [130, 131, 132],
            [140, 141, 142]
          ]
        )
      ).to.eql([
        [110, 11, 112],
        [120, 21, 122],
        [130, error.na, 132],
        [140, error.na, 142]
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [
            [10, 11, 12],
            [20, 21, 22],
            [30, 31, 32],
            [40, 41, 42]
          ],
          [
            [110, 111, 112],
            [120, 121, 122]
          ]
        )
      ).to.eql([
        [110, 11, 112],
        [120, 21, 122],
        [error.na, 31, error.na],
        [error.na, 41, error.na]
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [[10, 11, 12]],
          [
            [110, 111, 112],
            [120, 121, 122],
            [130, 131, 132]
          ]
        )
      ).to.eql([
        [110, 11, 112],
        [120, 11, 122],
        [130, 11, 132]
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [
            [10, 11, 12],
            [20, 21, 22],
            [30, 31, 32],
            [40, 41, 42]
          ],
          [[110, 111, 112]]
        )
      ).to.eql([
        [110, 11, 112],
        [110, 21, 112],
        [110, 31, 112],
        [110, 41, 112]
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [[10, 11, 12, 13]],
          [
            [110, 111, 112],
            [120, 121, 122],
            [130, 131, 132]
          ]
        )
      ).to.eql([
        [110, 11, 112, error.na],
        [120, 11, 122, error.na],
        [130, 11, 132, error.na]
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [
            [10, 11, 12],
            [20, 21, 22],
            [30, 31, 32],
            [40, 41, 42]
          ],
          [[110, 111, 112, 113]]
        )
      ).to.eql([
        [110, 11, 112, error.na],
        [110, 21, 112, error.na],
        [110, 31, 112, error.na],
        [110, 41, 112, error.na]
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [[10, 11, 12]],
          [
            [110, 111],
            [120, 121],
            [130, 131]
          ]
        )
      ).to.eql([
        [110, 11, error.na],
        [120, 11, error.na],
        [130, 11, error.na]
      ])

      expect(
        logical.IF(
          [[false, true, false]],
          [[10, 11]],
          [
            [110, 111, 112],
            [120, 121, 122],
            [130, 131, 132]
          ]
        )
      ).to.eql([
        [110, 11, 112],
        [120, 11, 122],
        [130, 11, 132]
      ])

      expect(logical.IF([[false, true, false]], [[10, 11, 12]], [[110], [120], [130]])).to.eql([
        [110, 11, 110],
        [120, 11, 120],
        [130, 11, 130]
      ])

      expect(
        logical.IF(
          [[false, true, true]],
          [[10, 11, 12]],
          [
            [110, 111],
            [120, 121],
            [130, 131]
          ]
        )
      ).to.eql([
        [110, 11, 12],
        [120, 11, 12],
        [130, 11, 12]
      ])

      expect(
        logical.IF(
          [[false, true, true]],
          [[10, 11]],
          [
            [110, 111, 112],
            [120, 121, 122],
            [130, 131, 132]
          ]
        )
      ).to.eql([
        [110, 11, error.na],
        [120, 11, error.na],
        [130, 11, error.na]
      ])

      expect(
        logical.IF(
          [[false, error.data, true]],
          [[10, 11, 12]],
          [
            [110, 111, 112],
            [120, 121, 122],
            [130, 131, 132]
          ]
        )
      ).to.eql([
        [110, error.data, 12],
        [120, error.data, 12],
        [130, error.data, 12]
      ])
    })

    it('First argument is a range that is not a row or column', () => {
      expect(
        logical.IF(
          [
            [true, false, false],
            [false, false, true]
          ],
          10,
          [
            [110, 111, 112],
            [120, 121, 122]
          ]
        )
      ).to.eql([
        [10, 111, 112],
        [120, 121, 10]
      ])
      expect(
        logical.IF(
          [
            [true, false, false],
            [false, false, true]
          ],
          [
            [10, 11, 12],
            [20, 21, 22]
          ],
          110
        )
      ).to.eql([
        [10, 110, 110],
        [110, 110, 22]
      ])

      expect(
        logical.IF(
          [
            [true, false, false],
            [false, false, true]
          ],
          [[10]],
          [
            [110, 111, 112],
            [120, 121, 122]
          ]
        )
      ).to.eql([
        [10, 111, 112],
        [120, 121, 10]
      ])
      expect(
        logical.IF(
          [
            [true, false, false],
            [false, false, true]
          ],
          [
            [10, 11, 12],
            [20, 21, 22]
          ],
          [[110]]
        )
      ).to.eql([
        [10, 110, 110],
        [110, 110, 22]
      ])

      expect(
        logical.IF(
          [
            [true, false, false],
            [false, false, true]
          ],
          [
            [10, 11, 12],
            [20, 21, 22]
          ],
          [
            [110, 111, 112],
            [120, 121, 122]
          ]
        )
      ).to.eql([
        [10, 111, 112],
        [120, 121, 22]
      ])

      expect(
        logical.IF(
          [
            [true, false, false],
            [false, false, true]
          ],
          [[10, 11, 12]],
          [[110], [120]]
        )
      ).to.eql([
        [10, 110, 110],
        [120, 120, 12]
      ])
      expect(
        logical.IF(
          [
            [true, false, false],
            [false, false, true]
          ],
          [[10], [20]],
          [[110, 111, 112]]
        )
      ).to.eql([
        [10, 111, 112],
        [110, 111, 20]
      ])

      expect(
        logical.IF(
          [
            [true, false, false],
            [false, false, true]
          ],
          [[10], [20], [30]],
          [[110, 111, 112, 113]]
        )
      ).to.eql([
        [10, 111, 112, error.na],
        [110, 111, 20, error.na],
        [error.na, error.na, error.na, error.na]
      ])

      expect(
        logical.IF(
          [
            [false, false, true],
            [true, false, false],
            [false, true, false]
          ],
          [
            [10, 11, 12],
            [20, 21, 22]
          ],
          [
            [100, 101],
            [110, 111],
            [120, 121]
          ]
        )
      ).to.eql([
        [100, 101, 12],
        [20, 111, error.na],
        [120, error.na, error.na]
      ])

      expect(
        logical.IF(
          [
            [true, false, error.num],
            [false, false, true]
          ],
          [
            [10, 11, 12],
            [20, 21, 22]
          ],
          [
            [110, 111, 112],
            [120, 121, 122]
          ]
        )
      ).to.eql([
        [10, 111, error.num],
        [120, 121, 22]
      ])
    })

    it('Incorrect number of arguments', () => {
      expect(logical.IF()).to.equal(error.na)
      expect(logical.IF(true)).to.equal(error.na)
      expect(logical.IF(true, 1, 2, 3)).to.equal(error.na)
    })
  })

  it('IFS', () => {
    expect(logical.IFS(true, 1, true, 2)).to.equal(1)
    expect(logical.IFS(false, 1, true, 2)).to.equal(2)
    expect(logical.IFS(false, 1, false, 2)).to.equal(error.na)

    expect(logical.IFS(0, 1, true, 2)).to.equal(2)
    expect(logical.IFS(5, 1, true, 2)).to.equal(1)
    expect(logical.IFS(-6, 1, true, 2)).to.equal(1)

    expect(logical.IFS(true, null)).to.equal(0)
    expect(logical.IFS(null, 2)).to.equal(error.na)

    expect(logical.IFS('true', 1, true, 2)).to.equal(1)
    expect(logical.IFS('false', 1, true, 2)).to.equal(2)

    expect(logical.IFS('   true', 1, true, 2)).to.equal(error.value)
    expect(logical.IFS('1', 1, true, 2)).to.equal(error.value)
    expect(logical.IFS('text', 1, true, 2)).to.equal(error.value)
    expect(logical.IFS('08:45 AM', 1, true, 2)).to.equal(error.value)
    expect(logical.IFS('1900-01-01', 1, true, 2)).to.equal(error.value)

    expect(logical.IFS()).to.equal(error.na)
    expect(logical.IFS(true)).to.equal(error.na)
    expect(logical.IFS(true, 1, true)).to.equal(error.na)

    Object.values(error).forEach((err) => {
      expect(logical.IFS(err, 1, true, 2)).to.equal(err)
    })
  })

  it('IFERROR', () => {
    expect(logical.IFERROR(1, 2)).to.equal(1)
    expect(logical.IFERROR(-46, 2)).to.equal(-46)
    expect(logical.IFERROR(0, 2)).to.equal(0)

    expect(logical.IFERROR('0', 2)).to.equal('0')
    expect(logical.IFERROR('1', 2)).to.equal('1')
    expect(logical.IFERROR('-34', 2)).to.equal('-34')

    expect(logical.IFERROR(true, 2)).to.equal(true)
    expect(logical.IFERROR(false, 2)).to.equal(false)

    expect(logical.IFERROR(null, 2)).to.equal(0)

    expect(logical.IFERROR('true', 2)).to.equal('true')
    expect(logical.IFERROR('false', 2)).to.equal('false')

    expect(logical.IFERROR('', 2)).to.equal('')
    expect(logical.IFERROR('text', 2)).to.equal('text')

    expect(logical.IFERROR('08:45 AM', 2)).to.equal('08:45 AM')
    expect(logical.IFERROR('1900-01-01', 2)).to.equal('1900-01-01')

    Object.values(error).forEach((err) => {
      expect(logical.IFERROR(err, 'text')).to.equal('text')
    })

    expect(logical.IFERROR()).to.equal(error.na)
    expect(logical.IFERROR(1, 2, 3)).to.equal(error.na)
  })

  it('IFNA', () => {
    expect(logical.IFNA(1, 2)).to.equal(1)
    expect(logical.IFNA(0, 2)).to.equal(0)
    expect(logical.IFNA(-4, 2)).to.equal(-4)

    expect(logical.IFNA('0', 2)).to.equal('0')
    expect(logical.IFNA('-31', 2)).to.equal('-31')
    expect(logical.IFNA('164', 2)).to.equal('164')

    expect(logical.IFNA(true, 2)).to.equal(true)
    expect(logical.IFNA(false, 2)).to.equal(false)

    expect(logical.IFNA(null, 2)).to.equal(0)

    expect(logical.IFNA('true', 2)).to.equal('true')
    expect(logical.IFNA('false', 2)).to.equal('false')

    expect(logical.IFNA('', 2)).to.equal('')
    expect(logical.IFNA('text', 2)).to.equal('text')

    expect(logical.IFNA('1900-02-01', 2)).to.equal('1900-02-01')
    expect(logical.IFNA('08:45 AM', 2)).to.equal('08:45 AM')

    const errorsExceptNa = Object.values(error)
    const naIndex = errorsExceptNa.indexOf(error.na)

    errorsExceptNa.splice(naIndex, 1)

    errorsExceptNa.forEach((err) => {
      expect(logical.IFNA(err, 'text')).to.equal(err)
    })

    expect(logical.IFNA(error.na, 'text')).to.equal('text')

    expect(logical.IFNA()).to.equal(error.na)
    expect(logical.IFNA('text')).to.equal(error.na)
    expect(logical.IFNA(1, 2, 3)).to.equal(error.na)
  })

  it('NOT', () => {
    expect(logical.NOT(true)).to.equal(false)
    expect(logical.NOT(false)).to.equal(true)

    expect(logical.NOT('trUe')).to.equal(false)
    expect(logical.NOT('fAlse')).to.equal(true)

    expect(logical.NOT(null)).to.equal(true)

    expect(logical.NOT(0)).to.equal(true)
    expect(logical.NOT(-2)).to.equal(false)
    expect(logical.NOT(0.1)).to.equal(false)

    expect(logical.NOT('')).to.equal(error.value)
    expect(logical.NOT('text')).to.equal(error.value)

    expect(logical.NOT('08:45 AM')).to.equal(error.value)
    expect(logical.NOT('1900-02-01')).to.equal(error.value)

    Object.values(error).forEach((err) => {
      expect(logical.NOT(err)).to.equal(err)
    })

    expect(logical.NOT()).to.equal(error.na)
    expect(logical.NOT(2, 0)).to.equal(error.na)
  })

  it('OR', () => {
    expect(logical.OR(undefined, undefined)).to.equal(error.value)
    expect(logical.OR('', undefined)).to.equal(error.value)
    expect(logical.OR('text', undefined)).to.equal(error.value)
    expect(logical.OR(undefined, false)).to.equal(false)
    expect(logical.OR(false, undefined)).to.equal(false)
    expect(logical.OR(undefined, true)).to.equal(true)
    expect(logical.OR(true, undefined)).to.equal(true)

    expect(logical.OR(0)).to.equal(false)
    expect(logical.OR(1)).to.equal(true)
    expect(logical.OR(-4)).to.equal(true)
    expect(logical.OR(true)).to.equal(true)
    expect(logical.OR(false)).to.equal(false)

    expect(logical.OR(null)).to.equal(error.value)
    expect(logical.OR('')).to.equal(error.value)
    expect(logical.OR('4')).to.equal(error.value)
    expect(logical.OR('text')).to.equal(error.value)
    expect(logical.OR('true')).to.equal(error.value)

    Object.values(error).forEach((err) => {
      expect(logical.OR(err)).to.equal(err)
    })

    expect(logical.OR(null, null)).to.equal(error.value)
    expect(logical.OR('', null)).to.equal(error.value)
    expect(logical.OR('text', null)).to.equal(error.value)
    expect(logical.OR(null, false)).to.equal(false)
    expect(logical.OR(false, null)).to.equal(false)
    expect(logical.OR(null, true)).to.equal(true)
    expect(logical.OR(true, null)).to.equal(true)

    expect(logical.OR(error.data, false)).to.equal(error.data)
    expect(logical.OR(false, error.div0)).to.equal(error.div0)

    expect(logical.OR(true, false)).to.equal(true)
    expect(logical.OR(0, false)).to.equal(false)

    expect(logical.OR(0, 0)).to.equal(false)
    expect(logical.OR(4, 4)).to.equal(true)
    expect(logical.OR(4, 0)).to.equal(true)
    expect(logical.OR(0, 4)).to.equal(true)

    expect(logical.OR('')).to.equal(error.value)
    expect(logical.OR('', '', '')).to.equal(error.value)

    expect(logical.OR()).to.equal(error.na)
  })

  it('TRUE', () => {
    expect(logical.TRUE()).to.equal(true)
  })

  it('XOR', () => {
    expect(logical.XOR(undefined, undefined)).to.equal(error.value)
    expect(logical.XOR('', undefined)).to.equal(error.value)
    expect(logical.XOR('text', undefined)).to.equal(error.value)
    expect(logical.XOR(undefined, false)).to.equal(false)
    expect(logical.XOR(false, undefined)).to.equal(false)
    expect(logical.XOR(undefined, true)).to.equal(true)
    expect(logical.XOR(true, undefined)).to.equal(true)
    expect(logical.XOR(error.na, false)).to.equal(error.na)
    expect(logical.XOR(true)).to.equal(true)
    expect(logical.XOR(false)).to.equal(false)
    expect(logical.XOR(false, false)).to.equal(false)
    expect(logical.XOR(false, true)).to.equal(true)
    expect(logical.XOR(true, false)).to.equal(true)
    expect(logical.XOR(true, true)).to.equal(false)
    expect(logical.XOR(1)).to.equal(true)
    expect(logical.XOR(0, false)).to.equal(false)
    expect(logical.XOR(2, false)).to.equal(true)
  })

  it('SWITCH', () => {
    expect(logical.SWITCH()).to.equal(error.value)
    expect(logical.SWITCH(7)).to.equal(error.na)
    expect(logical.SWITCH(7, 'Default Expression')).to.equal('Default Expression')
    expect(logical.SWITCH(7, 9, 'Nine', 7, 'Seven')).to.equal('Seven')
    expect(logical.SWITCH(8, 9, 'Nine', 7, 'Seven', 'Eight')).to.equal('Eight')
    expect(logical.SWITCH(10, 9, 'Nine', 7, 'Seven', 8, 'Eight')).to.equal(error.na)
    expect(logical.SWITCH(7, 9, 'Nine')).to.equal(error.na)
  })
})
