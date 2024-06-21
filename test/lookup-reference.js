import { expect } from 'chai'

import * as error from '../src/utils/error.js'
import * as lookup from '../src/lookup-reference.js'

describe('Lookup Reference', () => {
  it('CHOOSE', () => {
    expect(lookup.CHOOSE(1, 'jima')).to.equal('jima')
    expect(lookup.CHOOSE(3, 'jima', 'jimb', 'jimc')).to.equal('jimc')

    expect(lookup.CHOOSE(1.5, 'jima')).to.equal('jima')
    expect(lookup.CHOOSE(3.7, 'jima', 'jimb', 'jimc')).to.equal('jimc')

    expect(lookup.CHOOSE(true, 'jima')).to.equal('jima')
    expect(lookup.CHOOSE(false, 'jima')).to.equal(error.value)

    expect(lookup.CHOOSE('true', 'jima')).to.equal(error.value)
    expect(lookup.CHOOSE('false', 'jima')).to.equal(error.value)

    expect(lookup.CHOOSE('jima', 'jimb', 'jimc')).to.equal(error.value)
    expect(lookup.CHOOSE('', 'jima', 'jimb', 'jimc')).to.equal(error.value)

    expect(lookup.CHOOSE('   1   ', 'jima')).to.equal('jima')
    expect(lookup.CHOOSE('   3    ', 'jima', 'jimb', 'jimc')).to.equal('jimc')
    expect(lookup.CHOOSE('   1.48   ', 'jima')).to.equal('jima')
    expect(lookup.CHOOSE('   3.9    ', 'jima', 'jimb', 'jimc')).to.equal('jimc')

    expect(lookup.CHOOSE(-2, 'jima')).to.equal(error.value)
    expect(lookup.CHOOSE(0, 'jima')).to.equal(error.value)
    expect(lookup.CHOOSE(2, 'jima')).to.equal(error.value)
    expect(lookup.CHOOSE(255, 'jima')).to.equal(error.value)

    expect(lookup.CHOOSE()).to.equal(error.na)
    expect(lookup.CHOOSE(1)).to.equal(error.na)

    Object.values(error).forEach((err) => {
      expect(lookup.CHOOSE(err, 'first')).to.equal(err)
    })

    expect(lookup.CHOOSE([1, true, false], 'jima')).to.eql(['jima', 'jima', error.value])
    expect(lookup.CHOOSE([[0], [error.div0], [2]], 'jima', 'jimb')).to.eql([[error.value], [error.div0], ['jimb']])
    expect(
      lookup.CHOOSE(
        [
          [1, true],
          [false, 2],
          ['text', error.name]
        ],
        'jima',
        'jimb'
      )
    ).to.eql([
      ['jima', 'jima'],
      [error.value, 'jimb'],
      [error.value, error.name]
    ])
  })

  it('COLUMNS', () => {
    expect(lookup.COLUMNS('')).to.equal(1)
    expect(lookup.COLUMNS(1)).to.equal(1)
    expect(lookup.COLUMNS('3')).to.equal(1)

    expect(
      lookup.COLUMNS([
        [1, 2],
        [2, 3],
        [2, 4]
      ])
    ).to.equal(2)
    expect(lookup.COLUMNS([[1], [2]])).to.equal(1)
    expect(lookup.COLUMNS([[1, 2]])).to.equal(2)

    expect(lookup.COLUMNS()).to.equal(error.na)
    expect(lookup.COLUMNS('3', 2)).to.equal(error.na)
  })

  describe('MATCH', () => {
    it('using match_type 0', () => {
      expect(lookup.MATCH(4, [[0, 'text', 2, 3, 4, 100, 7]], null)).to.equal(5)
      expect(lookup.MATCH(4, [[0], [1], ['bernie'], [3], [4], [100], [7]], 0)).to.equal(5)

      expect(lookup.MATCH(-5, [[1, 3, 6, error.div0, -5]], 0)).to.equal(5)
      expect(lookup.MATCH('j*z', [['jimd', 'jimq', -5, error.div0, 'jimz']], 0)).to.equal(5)

      expect(lookup.MATCH(null, [['text', 0, 1, null, true, false]], 0)).to.equal(2)
      expect(lookup.MATCH(null, [['text', null, 1, null, true, false]], 0)).to.equal(error.na)

      expect(lookup.MATCH(1, [[0, 1, null, 2, 4]], 0)).to.equal(2)
      expect(lookup.MATCH(1, [[0, '1', null, 2, 4]], 0)).to.equal(error.na)
      expect(lookup.MATCH('1', [[0, 1, null, 2, 4]], 0)).to.equal(error.na)

      expect(lookup.MATCH(true, [[5, 0, 1, true, false]], 0)).to.equal(4)
      expect(lookup.MATCH('true', [[5, 0, 1, true, false]], 0)).to.equal(error.na)
      expect(lookup.MATCH(true, [[5, 0, 1, 'true', false]], 0)).to.equal(error.na)

      expect(lookup.MATCH(false, [[5, 0, 1, true, false]], 0)).to.equal(5)
      expect(lookup.MATCH('false', [[5, 0, 1, true, false]], 0)).to.equal(error.na)
      expect(lookup.MATCH(false, [[5, 0, 1, true, 'false']], 0)).to.equal(error.na)

      expect(lookup.MATCH(5, [[0, true, 2, 3, 4, 100, 7]], 0)).to.equal(error.na)
      expect(lookup.MATCH(5, [[0], [1], [2], [3], [4], [false], [7]], false)).to.equal(error.na)

      expect(lookup.MATCH('jima', [['jima', 'jimb', 'jima', 'bernie']], 0)).to.equal(1)
      expect(lookup.MATCH('j*b', [['jima'], ['jimb'], ['jimc'], ['jimb']], '0')).to.equal(2)
      expect(lookup.MATCH('j?b', [['jima', 'jimb', 'jimc', 'bernie']], 0)).to.equal(error.na)
      expect(lookup.MATCH('j??b', [['jima', 'jimb', 'jimc', 'bernie']], 0)).to.equal(2)
      expect(lookup.MATCH('j???b', [['jima'], ['jimb'], ['jimc'], ['bernie']], 0)).to.equal(error.na)
      expect(lookup.MATCH('j???', [['jima'], ['jimb'], ['jimc'], ['bernie']], 0)).to.equal(1)

      expect(lookup.MATCH('jim\\d/', [['jim'], ['jim*'], ['jimc'], ['jim\\d/']], 0)).to.equal(4)
      expect(lookup.MATCH('~~?', [['~a'], ['jim*'], ['jimc'], ['jim\\d/']], 0)).to.equal(1)
      expect(lookup.MATCH('a~a', [['a~a'], ['jim*'], ['jimc'], ['jim\\d/']], 0)).to.equal(error.na)
      expect(lookup.MATCH('a~a', [['aa'], ['jim*'], ['jimc'], ['jim\\d/']], 0)).to.equal(1)
      expect(lookup.MATCH('a~~a', [['a~a'], ['jim*'], ['jimc'], ['jim\\d/']], 0)).to.equal(1)

      expect(lookup.MATCH('j~?mc', [['jima', 'jimb', 'j?mc', 'bernie']], 0)).to.equal(3)
      expect(lookup.MATCH('berni~*', [['jima'], ['jimb'], ['j?mc'], ['berni*']], 0)).to.equal(4)
      expect(lookup.MATCH('a*B*c*', [['jima'], ['jimb'], ['aa*aaaaaaa'], ['affdfbfsfjdlcasff']], 0)).to.equal(4)

      expect(lookup.MATCH(true, [[false, false, false, true, false]], 0)).to.equal(4)
      expect(lookup.MATCH(true, [[false, true, false, true, false]], 0)).to.equal(2)
      expect(lookup.MATCH(1, [[false, false, false, true, false]], 0)).to.equal(error.na)
      expect(lookup.MATCH(true, [[false, false, false, 1, false]], 0)).to.equal(error.na)
      expect(lookup.MATCH(true, [[false, false, false, 'true', false]], 0)).to.equal(error.na)
      expect(lookup.MATCH('true', [[false, false, false, true, false]], 0)).to.equal(error.na)

      expect(lookup.MATCH(false, [[true, true, false, true, true]], 0)).to.equal(3)
      expect(lookup.MATCH(0, [[true, true, false, true, true]], 0)).to.equal(error.na)
      expect(lookup.MATCH(false, [[true, true, 0, true, true]], 0)).to.equal(error.na)
      expect(lookup.MATCH('false', [[true, true, false, true, true]], 0)).to.equal(error.na)
      expect(lookup.MATCH(false, [[true, true, 'false', true, true]], 0)).to.equal(error.na)
    })

    it('using match_type 1', () => {
      expect(lookup.MATCH(1, [[0, 1, 2, 3, 4, 5, 7]])).to.equal(2)
      expect(lookup.MATCH(4.5, [[0], [1], [2], [3], [4]], '6')).to.equal(5)

      expect(lookup.MATCH(null, [[-1, 0, 1, 2, 3, 4, 5]])).to.equal(2)
      expect(lookup.MATCH(null, [[true, false, true, false, true, false, true]])).to.equal(error.na)

      expect(lookup.MATCH(7.5, [[1, 2, 3, 9, 'text', 6, 7]], 1)).to.equal(3)
      expect(lookup.MATCH(6, [[1], [7], [3], [4], [true], [6], [7]], 10)).to.equal(6)

      expect(lookup.MATCH(6, [[1, 2, 3, 4, 8, 6, 7, 8]], 1)).to.equal(6)
      expect(lookup.MATCH(6, [[1, 2, 3, 4, 8, 6, 7, 8]], 1)).to.equal(6)

      expect(lookup.MATCH(5, [[6, 5, 4, 3, 2, 1, 0]], 1)).to.equal(7)
      expect(lookup.MATCH(6, [[6, 5, 4, 3, 2, 1, 0]], 1)).to.equal(7)
      expect(lookup.MATCH(10, [[6, 5, 4, 3, 2, 1, 0]], 1)).to.equal(7)
      expect(lookup.MATCH(6, [[6, 5, 4, 3, 2, 6, 0]], 1)).to.equal(6)

      expect(lookup.MATCH(true, [[true, 1, 2, 3, 4, 5, false]], 1)).to.equal(7)
      expect(lookup.MATCH(false, [[false, 1, 2, 3, 4, 5, true]], 1)).to.equal(1)

      expect(lookup.MATCH(7.5, [[1, 'text', 'text', 4, 'text', 9, 7]], 1)).to.equal(4)
      expect(lookup.MATCH(2, [[1, 'text', 'text', 4, 'text', 9, 7]], 1)).to.equal(1)

      expect(lookup.MATCH('jimc', [['jima', 'jimb', 'jimd', 'bernie']], true)).to.equal(2)
      expect(lookup.MATCH('jimC', [['jima', 'jimb', 'jimd', 'bernie']], true)).to.equal(2)
      expect(lookup.MATCH(true, [['jima'], ['jimb'], ['jimd'], ['bernie']], 1)).to.equal(error.na)

      expect(lookup.MATCH('test', [['test', 1, 2, 3, 4, 5, 'a']], 1)).to.equal(7)

      expect(lookup.MATCH(1, [[0, 1, 2, 3, 4, 5, 7, 'jima', 'jimb', 'jimd', 'bernie']], 1)).to.equal(2)
      expect(lookup.MATCH('jimc', [[0, 1, 2, 3, 4, 5, 7, 'jima', 'jimb', 'jimd', 'bernie']], 1)).to.equal(9)
      expect(
        lookup.MATCH('jimc', [[null, null, null, null, null, null, null, 'jima', 'jimb', 'jimd', 'bernie']], 1)
      ).to.equal(9)
      expect(lookup.MATCH('jimc', [[0, 1, 2, 3, 4, 5, 7, 'jimd', 'jima', 'jimb', 'bernie']], 1)).to.equal(error.na)
      expect(
        lookup.MATCH('jimc', [[null, null, null, null, null, null, null, 'jimd', 'jima', 'jimb', 'bernie']], 1)
      ).to.equal(error.na)

      expect(lookup.MATCH('jimc', [['jima', 'jimb', 'jimd', 'bernie', 0, 1]], 1)).to.equal(2)
      expect(lookup.MATCH('jimc', [['jima', 'jimb', 'jimd', 'bernie', 0, 1, 2, 3, 4, 5, 7]], 1)).to.equal(2)
      expect(lookup.MATCH('jimc', [['jima', 'jimb', 'bernie', 'jimd', 0, 1, 2, 3, 4, 5, 7]], 1)).to.equal(3)
      expect(lookup.MATCH(1, [['jima', 'jimb', 'jimd', 'bernie', 0, 1, 2, 3, 4, 5, 7]], 1)).to.equal(6)
      expect(lookup.MATCH(1, [['jima', 'jimb', 'jimd', 'bernie', 0, 1]], 1)).to.equal(6)

      expect(
        lookup.MATCH(1, [['jima', error.na, 'jimd', error.na, 0, error.na, error.na, error.na, 4, 5, 7]], 1)
      ).to.equal(5)

      expect(lookup.MATCH(-4, [[-10, -5, 0, 6, 15, 'A', 'g', 'R', 'z', false, true]], 1)).to.equal(2)
      expect(lookup.MATCH(0, [[-10, -5, 0, 6, 15, 'A', 'g', 'R', 'z', false, true]], 1)).to.equal(3)
      expect(lookup.MATCH('E', [[-10, -5, 0, 6, 15, 'A', 'g', 'R', 'z', false, true]], 1)).to.equal(6)
      expect(lookup.MATCH(false, [[-10, -5, 0, 6, 15, 'A', 'g', 'R', 'z', false, true]], 1)).to.equal(10)
    })

    it('using match_type -1', () => {
      expect(lookup.MATCH(6, [[7], [6], [5], [4], [3], [2], [1]], -1)).to.equal(2)
      expect(lookup.MATCH(6.5, [[7, 6, 5, 4, 3, 2, 1]], '-5')).to.equal(1)

      expect(lookup.MATCH(2, [[7, 6, 5, 4, 3, 2, 1]], -60)).to.equal(6)
      expect(lookup.MATCH(2, [[7, 6, 1, 4, 3, 2, 1]], -60)).to.equal(2)

      expect(lookup.MATCH(4, [[7, 6, 'teste', null, 3, 2, 1]], -1)).to.equal(2)

      expect(lookup.MATCH('jimc', [['jime', 'jimb', 'jimd', 'bernie']], -1)).to.equal(1)
      expect(lookup.MATCH('jimC', [['jime', 'jimb', 'jimd', 'bernie']], -1)).to.equal(1)

      expect(lookup.MATCH(true, [[true, 5, 4, 3, 2, 1, false]], -1)).to.equal(1)
      expect(lookup.MATCH(false, [[true, 5, 4, 3, 2, 1, false]], -1)).to.equal(7)
      expect(lookup.MATCH(false, [[false, 5, 4, 3, 2, 1, true]], -1)).to.equal(1)
      expect(lookup.MATCH(true, [[false, 5, 4, 3, 2, 1, true]], -1)).to.equal(error.na)

      expect(
        lookup.MATCH(2, [[5, error.div0, 3, error.div0, error.div0, error.div0, 'jime', 'jimd', 'jimb', 'jima']], -1)
      ).to.equal(3)

      expect(lookup.MATCH(null, [[5, 4, 3, 2, 1, 0, -1]], -1)).to.equal(6)
      expect(lookup.MATCH(null, [[true, false, true, false, true, false, true]], -1)).to.equal(error.na)

      expect(lookup.MATCH(1, [[6, 5, 4, 3, 2, 1, 'jime', 'jimd', 'jimb', 'jima']], -1)).to.equal(6)
      expect(lookup.MATCH('jimc', [[6, 5, 4, 3, 2, 1, 'jime', 'jimd', 'jimb', 'jima']], -1)).to.equal(8)
      expect(lookup.MATCH('jimc', [[null, null, null, null, null, null, 'jime', 'jimd', 'jimb', 'jima']], -1)).to.equal(
        8
      )
      expect(lookup.MATCH('jimc', [[6, 5, 4, 3, 2, 1, 'jima', 'jime', 'jimd', 'jimb']], -1)).to.equal(error.na)
      expect(lookup.MATCH('jimc', [[null, null, null, null, null, null, 'jima', 'jime', 'jimd', 'jimb']], -1)).to.equal(
        error.na
      )
    })

    it('using an invalid match_type', () => {
      expect(lookup.MATCH(4, [[0, 1, 2, 3, 4, 100, 7]], '')).to.equal(error.value)
      expect(lookup.MATCH(4, [[0, 1, 2, 3, 4, 100, 7]], 'text')).to.equal(error.value)
      expect(lookup.MATCH(4, [[0, 1, 2, 3, 4, 100, 7]], 'true')).to.equal(error.value)
    })

    it('using a matrix instead of a row or column', () => {
      expect(
        lookup.MATCH(
          'jima',
          [
            [1, 'A'],
            [2, 'B'],
            [3, 'C'],
            [4, 'D'],
            [2, 'E']
          ],
          1
        )
      ).to.equal(error.na)
    })

    it('using an incorrect number of arguments', () => {
      expect(lookup.MATCH()).to.equal(error.na)
      expect(lookup.MATCH('')).to.equal(error.na)
      expect(lookup.MATCH(1)).to.equal(error.na)
      expect(lookup.MATCH('jima', ['jima', 'jimb', 'jimd', 'bernie'], 0, 1)).to.equal(error.na)
    })

    it('using errors', () => {
      Object.values(error).forEach((err) => {
        expect(lookup.MATCH(err, [[0, 1, 2, 3, 4, 5, 7]])).to.equal(err)
        expect(lookup.MATCH(1, err)).to.equal(error.na)
        expect(lookup.MATCH(1, [[0, 1, 2, 3, 4, 5, 7]], err)).to.equal(error.ref)
      })
    })

    it('using errors inside array', () => {
      expect(lookup.MATCH(4, [[1, 2, 3, error.div0, 5, 7]])).to.equal(3)
      expect(lookup.MATCH(4, [[7], [6], [error.name], [error.div0], [3], [2], [1]], -1)).to.equal(2)
    })
  })

  it('ROWS', () => {
    expect(lookup.ROWS('')).to.equal(1)
    expect(lookup.ROWS('text')).to.equal(1)
    expect(lookup.ROWS('1')).to.equal(1)
    expect(lookup.ROWS(1)).to.equal(1)
    expect(lookup.ROWS(0)).to.equal(1)
    expect(lookup.ROWS(true)).to.equal(1)
    expect(lookup.ROWS(false)).to.equal(1)
    expect(lookup.ROWS(null)).to.equal(1)
    expect(
      lookup.ROWS([
        [1, 2],
        [2, 3],
        [2, 4]
      ])
    ).to.equal(3)
    expect(lookup.ROWS([[1, 2]])).to.equal(1)

    expect(lookup.ROWS()).to.equal(error.na)
    expect(lookup.ROWS(1, 2)).to.equal(error.na)
  })

  describe('SORT', () => {
    it('should sort array containing numbers by column in ascending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
          ],
          1,
          1,
          true
        )
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
      expect(
        lookup.SORT(
          [
            [3, 2, 1],
            [6, 5, 4],
            [9, 8, 7]
          ],
          1,
          1,
          true
        )
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
      expect(
        lookup.SORT(
          [
            [2, 3, 1],
            [5, 6, 4],
            [8, 9, 7]
          ],
          1,
          1,
          true
        )
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
      expect(lookup.SORT([[1, 2, 3]], 1, 1, true)).to.eql([[1, 2, 3]])
      expect(lookup.SORT([[3, 2, 1]], 1, 1, true)).to.eql([[1, 2, 3]])
      expect(lookup.SORT([[2, 3, 1]], 1, 1, true)).to.eql([[1, 2, 3]])
      expect(lookup.SORT([[1], [2], [3]], 1, 1, true)).to.eql([[1], [2], [3]])
      expect(lookup.SORT([[3], [2], [1]], 1, 1, true)).to.eql([[3], [2], [1]])
      expect(lookup.SORT([[2], [3], [1]], 1, 1, true)).to.eql([[2], [3], [1]])
      expect(lookup.SORT([[1]], 1, 1, true)).to.eql([[1]])
    })

    it('should sort array containing strings by column in ascending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
          ],
          1,
          1,
          true
        )
      ).to.eql([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ])
      expect(
        lookup.SORT(
          [
            ['c', 'b', 'a'],
            ['f', 'e', 'd'],
            ['i', 'h', 'g']
          ],
          1,
          1,
          true
        )
      ).to.eql([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ])
      expect(
        lookup.SORT(
          [
            ['b', 'c', 'a'],
            ['e', 'f', 'd'],
            ['h', 'i', 'g']
          ],
          1,
          1,
          true
        )
      ).to.eql([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ])
      expect(lookup.SORT([['a', 'b', 'c']], 1, 1, true)).to.eql([['a', 'b', 'c']])
      expect(lookup.SORT([['c', 'b', 'a']], 1, 1, true)).to.eql([['a', 'b', 'c']])
      expect(lookup.SORT([['b', 'c', 'a']], 1, 1, true)).to.eql([['a', 'b', 'c']])
      expect(lookup.SORT([['a'], ['b'], ['c']], 1, 1, true)).to.eql([['a'], ['b'], ['c']])
      expect(lookup.SORT([['c'], ['b'], ['a']], 1, 1, true)).to.eql([['c'], ['b'], ['a']])
      expect(lookup.SORT([['b'], ['c'], ['a']], 1, 1, true)).to.eql([['b'], ['c'], ['a']])
      expect(lookup.SORT([['a']], 1, 1, true)).to.eql([['a']])
    })

    it('should sort array containing numbers and strings by column in ascending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            ['d', 'e', 'f'],
            [7, 8, 9]
          ],
          1,
          1,
          true
        )
      ).to.eql([
        [1, 2, 3],
        ['d', 'e', 'f'],
        [7, 8, 9]
      ])
      expect(
        lookup.SORT(
          [
            ['a', 2, 3],
            [6, 'e', 'f'],
            [7, 8, 9]
          ],
          1,
          1,
          true
        )
      ).to.eql([
        [2, 3, 'a'],
        ['e', 'f', 6],
        [8, 9, 7]
      ])
      expect(
        lookup.SORT(
          [
            ['a', 2, 3],
            ['d', 5, 6],
            ['g', 8, 9]
          ],
          1,
          1,
          true
        )
      ).to.eql([
        [2, 3, 'a'],
        [5, 6, 'd'],
        [8, 9, 'g']
      ])
      expect(
        lookup.SORT(
          [
            [2, 3, 'a'],
            [5, 6, 'd'],
            [8, 9, 'g']
          ],
          1,
          1,
          true
        )
      ).to.eql([
        [2, 3, 'a'],
        [5, 6, 'd'],
        [8, 9, 'g']
      ])
      expect(lookup.SORT([[2, 3, 'a']], 1, 1, true)).to.eql([[2, 3, 'a']])
      expect(lookup.SORT([['a', 2, 3]], 1, 1, true)).to.eql([[2, 3, 'a']])
      expect(lookup.SORT([['a'], [2], [3]], 1, 1, true)).to.eql([['a'], [2], [3]])
    })

    it('should sort array containing numbers by column in descending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
          ],
          1,
          -1,
          true
        )
      ).to.eql([
        [3, 2, 1],
        [6, 5, 4],
        [9, 8, 7]
      ])
      expect(
        lookup.SORT(
          [
            [3, 2, 1],
            [6, 5, 4],
            [9, 8, 7]
          ],
          1,
          -1,
          true
        )
      ).to.eql([
        [3, 2, 1],
        [6, 5, 4],
        [9, 8, 7]
      ])
      expect(
        lookup.SORT(
          [
            [2, 3, 1],
            [5, 6, 4],
            [8, 9, 7]
          ],
          1,
          -1,
          true
        )
      ).to.eql([
        [3, 2, 1],
        [6, 5, 4],
        [9, 8, 7]
      ])
      expect(lookup.SORT([[1, 2, 3]], 1, -1, true)).to.eql([[3, 2, 1]])
      expect(lookup.SORT([[3, 2, 1]], 1, -1, true)).to.eql([[3, 2, 1]])
      expect(lookup.SORT([[2, 3, 1]], 1, -1, true)).to.eql([[3, 2, 1]])
      expect(lookup.SORT([[1], [2], [3]], 1, -1, true)).to.eql([[1], [2], [3]])
      expect(lookup.SORT([[3], [2], [1]], 1, -1, true)).to.eql([[3], [2], [1]])
      expect(lookup.SORT([[2], [3], [1]], 1, -1, true)).to.eql([[2], [3], [1]])
      expect(lookup.SORT([[1]], 1, -1, true)).to.eql([[1]])
    })

    it('should sort array containing strings by column in descending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
          ],
          1,
          -1,
          true
        )
      ).to.eql([
        ['c', 'b', 'a'],
        ['f', 'e', 'd'],
        ['i', 'h', 'g']
      ])
      expect(
        lookup.SORT(
          [
            ['c', 'b', 'a'],
            ['f', 'e', 'd'],
            ['i', 'h', 'g']
          ],
          1,
          -1,
          true
        )
      ).to.eql([
        ['c', 'b', 'a'],
        ['f', 'e', 'd'],
        ['i', 'h', 'g']
      ])
      expect(lookup.SORT([['a', 'b', 'c']], 1, -1, true)).to.eql([['c', 'b', 'a']])
      expect(lookup.SORT([['c', 'b', 'a']], 1, -1, true)).to.eql([['c', 'b', 'a']])
      expect(lookup.SORT([['b', 'c', 'a']], 1, -1, true)).to.eql([['c', 'b', 'a']])
      expect(lookup.SORT([['a'], ['b'], ['c']], 1, -1, true)).to.eql([['a'], ['b'], ['c']])
      expect(lookup.SORT([['c'], ['b'], ['a']], 1, -1, true)).to.eql([['c'], ['b'], ['a']])
      expect(lookup.SORT([['b'], ['c'], ['a']], 1, -1, true)).to.eql([['b'], ['c'], ['a']])
      expect(lookup.SORT([['a']], 1, -1, true)).to.eql([['a']])
    })

    it('should sort array containing numbers and strings by column in descending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            ['d', 'e', 'f'],
            [7, 8, 9]
          ],
          1,
          -1,
          true
        )
      ).to.eql([
        [3, 2, 1],
        ['f', 'e', 'd'],
        [9, 8, 7]
      ])
      expect(
        lookup.SORT(
          [
            ['a', 2, 3],
            [6, 'e', 'f'],
            [7, 8, 9]
          ],
          1,
          -1,
          true
        )
      ).to.eql([
        ['a', 3, 2],
        [6, 'f', 'e'],
        [7, 9, 8]
      ])
      expect(
        lookup.SORT(
          [
            ['a', 2, 3],
            ['d', 5, 6],
            ['g', 8, 9]
          ],
          1,
          -1,
          true
        )
      ).to.eql([
        ['a', 3, 2],
        ['d', 6, 5],
        ['g', 9, 8]
      ])
      expect(
        lookup.SORT(
          [
            [2, 3, 'a'],
            [5, 6, 'd'],
            [8, 9, 'g']
          ],
          1,
          -1,
          true
        )
      ).to.eql([
        ['a', 3, 2],
        ['d', 6, 5],
        ['g', 9, 8]
      ])
      expect(lookup.SORT([[2, 3, 'a']], 1, -1, true)).to.eql([['a', 3, 2]])
      expect(lookup.SORT([['a', 2, 3]], 1, -1, true)).to.eql([['a', 3, 2]])
      expect(lookup.SORT([['a'], [2], [3]], 1, -1, true)).to.eql([['a'], [2], [3]])
    })

    it('should sort array by column with varying sort index', () => {
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
          ],
          2,
          1,
          true
        )
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
      expect(
        lookup.SORT(
          [
            [3, 2, 1],
            [6, 5, 4],
            [9, 8, 7]
          ],
          3,
          1,
          true
        )
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
      expect(
        lookup.SORT(
          [
            [2, 3, 1],
            [5, 6, 4],
            [8, 9, 7]
          ],
          3,
          -1,
          true
        )
      ).to.eql([
        [3, 2, 1],
        [6, 5, 4],
        [9, 8, 7]
      ])
      expect(
        lookup.SORT(
          [
            ['a', 2, 3],
            [6, 'e', 'f'],
            [7, 8, 9]
          ],
          3,
          -1,
          true
        )
      ).to.eql([
        [3, 2, 'a'],
        ['f', 'e', 6],
        [9, 8, 7]
      ])
      expect(
        lookup.SORT(
          [
            ['a', 2, 3],
            ['d', 5, 6],
            ['g', 8, 9]
          ],
          2,
          1,
          true
        )
      ).to.eql([
        [2, 3, 'a'],
        [5, 6, 'd'],
        [8, 9, 'g']
      ])
      expect(
        lookup.SORT(
          [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
          ],
          2,
          -1,
          true
        )
      ).to.eql([
        ['c', 'b', 'a'],
        ['f', 'e', 'd'],
        ['i', 'h', 'g']
      ])
      expect(
        lookup.SORT(
          [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
          ],
          3,
          1,
          true
        )
      ).to.eql([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ])
      expect(lookup.SORT([[1], [2], [3]], 2, -1, true)).to.eql([[1], [2], [3]])
      expect(lookup.SORT([[3], [2], [1]], 2, -1, true)).to.eql([[3], [2], [1]])
      expect(lookup.SORT([[2], [3], [1]], 3, -1, true)).to.eql([[2], [3], [1]])
      expect(lookup.SORT([['a'], [2], [3]], 2, -1, true)).to.eql([['a'], [2], [3]])
      expect(lookup.SORT([['a'], [2], [3]], 3, 1, true)).to.eql([['a'], [2], [3]])
      expect(lookup.SORT([['a'], ['b'], ['c']], 2, -1, true)).to.eql([['a'], ['b'], ['c']])
      expect(lookup.SORT([['a'], ['b'], ['c']], 3, 1, true)).to.eql([['a'], ['b'], ['c']])
    })

    it('should sort array containing numbers by row in ascending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
          ],
          1,
          1,
          false
        )
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
      expect(
        lookup.SORT([
          [7, 8, 9],
          [4, 5, 6],
          [1, 2, 3]
        ])
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
      expect(
        lookup.SORT([
          [4, 5, 6],
          [7, 8, 9],
          [1, 2, 3]
        ])
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
      expect(lookup.SORT([[1, 2, 3]])).to.eql([[1, 2, 3]])
      expect(lookup.SORT([[3, 2, 1]], 1, 1)).to.eql([[3, 2, 1]])
      expect(lookup.SORT([[2, 3, 1]], 1)).to.eql([[2, 3, 1]])
      expect(lookup.SORT([[1], [2], [3]], 1, 1, false)).to.eql([[1], [2], [3]])
      expect(lookup.SORT([[3], [2], [1]])).to.eql([[1], [2], [3]])
      expect(lookup.SORT([[2], [3], [1]], 1)).to.eql([[1], [2], [3]])
      expect(lookup.SORT([[1]], 1, 1, false)).to.eql([[1]])
    })

    it('should sort array containing strings by row in ascending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
          ],
          1,
          1,
          false
        )
      ).to.eql([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ])
      expect(
        lookup.SORT([
          ['g', 'h', 'i'],
          ['d', 'e', 'f'],
          ['a', 'b', 'c']
        ])
      ).to.eql([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ])
      expect(
        lookup.SORT([
          ['d', 'e', 'f'],
          ['g', 'h', 'i'],
          ['a', 'b', 'c']
        ])
      ).to.eql([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ])
      expect(lookup.SORT([['a', 'b', 'c']])).to.eql([['a', 'b', 'c']])
      expect(lookup.SORT([['c', 'b', 'a']], 1, 1)).to.eql([['c', 'b', 'a']])
      expect(lookup.SORT([['b', 'c', 'a']], 1)).to.eql([['b', 'c', 'a']])
      expect(lookup.SORT([['a'], ['b'], ['c']], 1, 1, false)).to.eql([['a'], ['b'], ['c']])
      expect(lookup.SORT([['c'], ['b'], ['a']])).to.eql([['a'], ['b'], ['c']])
      expect(lookup.SORT([['b'], ['c'], ['a']], 1)).to.eql([['a'], ['b'], ['c']])
      expect(lookup.SORT([['a']], 1, 1, false)).to.eql([['a']])
    })

    it('should sort array containing numbers and strings by row in ascending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            ['a', 'b', 'c'],
            [4, 5, 6]
          ],
          1,
          1,
          false
        )
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        ['a', 'b', 'c']
      ])
      expect(
        lookup.SORT([
          ['a', 'b', 'c'],
          [4, 5, 6],
          [1, 2, 3]
        ])
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        ['a', 'b', 'c']
      ])
      expect(
        lookup.SORT([
          [4, 5, 6],
          ['a', 'b', 'c'],
          [1, 2, 3]
        ])
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6],
        ['a', 'b', 'c']
      ])
      expect(lookup.SORT([[1, 'a', 2]])).to.eql([[1, 'a', 2]])
      expect(lookup.SORT([[2, 'a', 1]], 1, 1)).to.eql([[2, 'a', 1]])
      expect(lookup.SORT([['a', 2, 1]], 1)).to.eql([['a', 2, 1]])
      expect(
        lookup.SORT(
          [
            [1, 'a'],
            [2, 'b'],
            [3, 'c']
          ],
          1,
          1,
          false
        )
      ).to.eql([
        [1, 'a'],
        [2, 'b'],
        [3, 'c']
      ])
      expect(lookup.SORT([['a'], ['b'], [1]])).to.eql([[1], ['a'], ['b']])
      expect(lookup.SORT([[2], ['b'], ['a']], 1)).to.eql([[2], ['a'], ['b']])
    })

    it('should sort array containing numbers by row in descending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
          ],
          1,
          -1,
          false
        )
      ).to.eql([
        [7, 8, 9],
        [4, 5, 6],
        [1, 2, 3]
      ])
      expect(
        lookup.SORT(
          [
            [7, 8, 9],
            [4, 5, 6],
            [1, 2, 3]
          ],
          1,
          -1
        )
      ).to.eql([
        [7, 8, 9],
        [4, 5, 6],
        [1, 2, 3]
      ])
      expect(
        lookup.SORT(
          [
            [4, 5, 6],
            [7, 8, 9],
            [1, 2, 3]
          ],
          1,
          -1,
          false
        )
      ).to.eql([
        [7, 8, 9],
        [4, 5, 6],
        [1, 2, 3]
      ])
      expect(lookup.SORT([[1, 2, 3]], 1, -1)).to.eql([[1, 2, 3]])
      expect(lookup.SORT([[3, 2, 1]], 1, -1)).to.eql([[3, 2, 1]])
      expect(lookup.SORT([[2, 3, 1]], 1, -1)).to.eql([[2, 3, 1]])
      expect(lookup.SORT([[1], [2], [3]], 1, -1, false)).to.eql([[3], [2], [1]])
      expect(lookup.SORT([[3], [2], [1]], 1, -1)).to.eql([[3], [2], [1]])
      expect(lookup.SORT([[2], [3], [1]], 1, -1)).to.eql([[3], [2], [1]])
      expect(lookup.SORT([[1]], 1, -1)).to.eql([[1]])
    })

    it('should sort array containing strings by row in descending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
          ],
          1,
          -1,
          false
        )
      ).to.eql([
        ['g', 'h', 'i'],
        ['d', 'e', 'f'],
        ['a', 'b', 'c']
      ])
      expect(
        lookup.SORT(
          [
            ['g', 'h', 'i'],
            ['d', 'e', 'f'],
            ['a', 'b', 'c']
          ],
          1,
          -1
        )
      ).to.eql([
        ['g', 'h', 'i'],
        ['d', 'e', 'f'],
        ['a', 'b', 'c']
      ])
      expect(
        lookup.SORT(
          [
            ['d', 'e', 'f'],
            ['g', 'h', 'i'],
            ['a', 'b', 'c']
          ],
          1,
          -1,
          false
        )
      ).to.eql([
        ['g', 'h', 'i'],
        ['d', 'e', 'f'],
        ['a', 'b', 'c']
      ])
      expect(lookup.SORT([['a', 'b', 'c']], 1, -1)).to.eql([['a', 'b', 'c']])
      expect(lookup.SORT([['c', 'b', 'a']], 1, -1)).to.eql([['c', 'b', 'a']])
      expect(lookup.SORT([['b', 'c', 'a']], 1, -1)).to.eql([['b', 'c', 'a']])
      expect(lookup.SORT([['a'], ['b'], ['c']], 1, -1, false)).to.eql([['c'], ['b'], ['a']])
      expect(lookup.SORT([['c'], ['b'], ['a']], 1, -1)).to.eql([['c'], ['b'], ['a']])
      expect(lookup.SORT([['b'], ['c'], ['a']], 1, -1)).to.eql([['c'], ['b'], ['a']])
      expect(lookup.SORT([['a']], 1, -1)).to.eql([['a']])
    })

    it('should sort array containing numbers and strings by row in descending order with sort index of 1', () => {
      expect(
        lookup.SORT(
          [
            [1, 'a', 3],
            [4, 'b', 6],
            [7, 'c', 9]
          ],
          1,
          -1,
          false
        )
      ).to.eql([
        [7, 'c', 9],
        [4, 'b', 6],
        [1, 'a', 3]
      ])
      expect(
        lookup.SORT(
          [
            [7, 'c', 9],
            [4, 'b', 6],
            [1, 'a', 3]
          ],
          1,
          -1
        )
      ).to.eql([
        [7, 'c', 9],
        [4, 'b', 6],
        [1, 'a', 3]
      ])
      expect(
        lookup.SORT(
          [
            [4, 'b', 6],
            [7, 'c', 9],
            [1, 'a', 3]
          ],
          1,
          -1,
          false
        )
      ).to.eql([
        [7, 'c', 9],
        [4, 'b', 6],
        [1, 'a', 3]
      ])
      expect(
        lookup.SORT(
          [
            ['a', 1, 'c'],
            ['a', 'b', 'c'],
            [1, 2, 3]
          ],
          1,
          -1,
          false
        )
      ).to.eql([
        ['a', 1, 'c'],
        ['a', 'b', 'c'],
        [1, 2, 3]
      ])
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            ['a', 1, 'c'],
            ['a', 'b', 'c']
          ],
          1,
          -1,
          false
        )
      ).to.eql([
        ['a', 1, 'c'],
        ['a', 'b', 'c'],
        [1, 2, 3]
      ])
      expect(lookup.SORT([['a', 'b', 1]], 1, -1)).to.eql([['a', 'b', 1]])
      expect(lookup.SORT([[1, 'b', 'a']], 1, -1)).to.eql([[1, 'b', 'a']])
      expect(lookup.SORT([['b', 1, 'a']], 1, -1)).to.eql([['b', 1, 'a']])
      expect(lookup.SORT([['a'], ['b'], [1]], 1, -1, false)).to.eql([['b'], ['a'], [1]])
      expect(lookup.SORT([[1], ['b'], ['a']], 1, -1)).to.eql([['b'], ['a'], [1]])
      expect(lookup.SORT([['b']], 1, -1)).to.eql([['b']])
    })

    it('should sort array by row with varying sort index', () => {
      expect(
        lookup.SORT(
          [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
          ],
          2,
          1
        )
      ).to.eql([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ])
      expect(
        lookup.SORT(
          [
            ['g', 'h', 'i'],
            ['d', 'e', 'f'],
            ['a', 'b', 'c']
          ],
          3,
          1
        )
      ).to.eql([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ])
      expect(
        lookup.SORT(
          [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
          ],
          3,
          -1
        )
      ).to.eql([
        ['g', 'h', 'i'],
        ['d', 'e', 'f'],
        ['a', 'b', 'c']
      ])
      expect(
        lookup.SORT(
          [
            [1, 'a', 3],
            [4, 'b', 6],
            [7, 'c', 9]
          ],
          2,
          1
        )
      ).to.eql([
        [1, 'a', 3],
        [4, 'b', 6],
        [7, 'c', 9]
      ])
      expect(
        lookup.SORT(
          [
            [7, 'c', 9],
            [4, 6, 'b'],
            [1, 'a', 3]
          ],
          3,
          -1
        )
      ).to.eql([
        [4, 6, 'b'],
        [7, 'c', 9],
        [1, 'a', 3]
      ])
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            [4, 5, 6]
          ],
          3,
          -1
        )
      ).to.eql([
        [4, 5, 6],
        [1, 2, 3]
      ])
      expect(lookup.SORT([[1, 2, 3]], 2, -1)).to.eql([[1, 2, 3]])
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            [4, 5, 6]
          ],
          2,
          1
        )
      ).to.eql([
        [1, 2, 3],
        [4, 5, 6]
      ])
      expect(lookup.SORT([[1, 2, 3]], 3, 1)).to.eql([[1, 2, 3]])
    })

    it('should sort array containing empty cells', () => {
      expect(
        lookup.SORT(
          [
            ['a', 'b', 'c'],
            ['d', '', 'f'],
            ['', '', '']
          ],
          1,
          -1
        )
      ).to.eql([
        ['d', 0, 'f'],
        ['a', 'b', 'c'],
        [0, 0, 0]
      ])
      expect(
        lookup.SORT(
          [
            ['a', 'b', 'c'],
            ['d', '', 'f'],
            ['', '', '']
          ],
          1,
          1,
          true
        )
      ).to.eql([
        ['a', 'b', 'c'],
        ['d', 0, 'f'],
        [0, 0, 0]
      ])
      expect(lookup.SORT([[''], ['a'], ['b'], [1]], 1, -1, false)).to.eql([['b'], ['a'], [1], [0]])
      expect(lookup.SORT([[1, 2, 3], [], [4, 5, 6]])).to.eql([
        [0, 0, 0],
        [1, 2, 3],
        [4, 5, 6]
      ])
      expect(lookup.SORT([[1, 2, 3], [], [4, 5, 6]], 1, 1, true)).to.eql([
        [1, 2, 3],
        [0, 0, 0],
        [4, 5, 6]
      ])
      expect(lookup.SORT([[1, 2, 3], [], [4, 5, 6]], 1, -1, true)).to.eql([
        [3, 2, 1],
        [0, 0, 0],
        [6, 5, 4]
      ])
      expect(lookup.SORT([[1, 2, 3], ['a']], 1, 1, true)).to.eql([
        [1, 2, 3],
        ['a', 0, 0]
      ])
      expect(
        lookup.SORT(
          [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
          ],
          1,
          -1,
          false
        )
      ).to.eql([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ])
      expect(
        lookup.SORT(
          [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
          ],
          3,
          1,
          true
        )
      ).to.eql([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ])
    })

    it('should sort one dimensional arrays', () => {
      expect(lookup.SORT([1, 2, 3])).to.eql([[1, 2, 3]])
      expect(lookup.SORT([3, 2, 1])).to.eql([[3, 2, 1]])
      expect(lookup.SORT([1, 2, 3], 1, 1, true)).to.eql([[1, 2, 3]])
      expect(lookup.SORT([3, 2, 1], 1, 1, true)).to.eql([[1, 2, 3]])
      expect(lookup.SORT([1, 2, 3], 1, -1)).to.eql([[1, 2, 3]])
      expect(lookup.SORT([1, 2, 3], 1, -1, true)).to.eql([[3, 2, 1]])
      expect(lookup.SORT([3, 2, 1]), 1, -1, false).to.eql([[3, 2, 1]])
      expect(lookup.SORT([3, 2, 1]), 1, -1, true).to.eql([[3, 2, 1]])
    })

    it('should return error with invalid inputs', () => {
      expect(lookup.SORT([[1, 2, 3]], 2, 1, true)).to.eql(error.value)
      expect(lookup.SORT([[1, 2, 3]], 0, 1, true)).to.eql(error.value)
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            ['a', 'b', 'c']
          ],
          1,
          100,
          true
        )
      ).to.eql(error.value)
      expect(
        lookup.SORT(
          [
            [1, 2, 3],
            ['a', 'b', 'c']
          ],
          1,
          1,
          'FALSEEE'
        )
      ).to.eql(error.name)
    })
  })

  it('SORTBY', () => {
    expect(
      lookup.SORTBY(
        [
          ['tom', 52],
          ['fred', 65],
          ['amy', 22],
          ['sal', 73],
          ['fritz', 19]
        ],
        [[52], [65], [22], [73], [19]]
      )
    ).to.eql([
      ['fritz', 19],
      ['amy', 22],
      ['tom', 52],
      ['fred', 65],
      ['sal', 73]
    ])
    expect(
      lookup.SORTBY(
        [
          ['tom', 52],
          ['fred', 65],
          ['amy', 22],
          ['sal', 73],
          ['fritz', 19]
        ],
        2
      )
    ).to.eql(error.value)
    expect(
      lookup.SORTBY(
        [
          ['tom', 52],
          ['fred', 65],
          ['amy', 22],
          ['sal', 73],
          ['fritz', 19]
        ],
        'hello'
      )
    ).to.eql(error.value)
    expect(
      lookup.SORTBY(
        [
          ['tom', 52],
          ['fred', 65],
          ['amy', 22],
          ['sal', 73],
          ['fritz', 19]
        ],
        [[1], [1]]
      )
    ).to.eql(error.value)
    expect(lookup.SORTBY([['tom', 'fred', 'amy', 'sal', 'fritz']], [[1, 1]])).to.eql(error.value)
    expect(
      lookup.SORTBY(
        [
          ['kelvin', 82],
          ['celson', 32]
        ],
        [[2, 1]]
      )
    ).to.eql([
      [82, 'kelvin'],
      [32, 'celson']
    ])
    expect(
      lookup.SORTBY(
        [
          ['kelvin', 82],
          ['celson', 32]
        ],
        [[1, 1]]
      )
    ).to.eql([
      ['kelvin', 82],
      ['celson', 32]
    ])
    expect(
      lookup.SORTBY(
        [
          ['kelvin', 82],
          ['celson', 32]
        ],
        [['bernard', 'ana']]
      )
    ).to.eql([
      [82, 'kelvin'],
      [32, 'celson']
    ])
    expect(
      lookup.SORTBY(
        [
          ['kelvin', 82],
          ['celson', 32]
        ],
        [['ana', 'bernard']]
      )
    ).to.eql([
      ['kelvin', 82],
      ['celson', 32]
    ])
    expect(
      lookup.SORTBY(
        [
          ['kelvin', 82],
          ['celson', 32]
        ],
        [[true, false]]
      )
    ).to.eql([
      [82, 'kelvin'],
      [32, 'celson']
    ])
    expect(
      lookup.SORTBY(
        [
          ['kelvin', 82],
          ['celson', 32]
        ],
        [[false, true]]
      )
    ).to.eql([
      ['kelvin', 82],
      ['celson', 32]
    ])
    expect(
      lookup.SORTBY(
        [
          ['kelvin', 82],
          ['celson', 32]
        ],
        [[1, null]]
      )
    ).to.eql([
      [82, 'kelvin'],
      [32, 'celson']
    ])
    expect(
      lookup.SORTBY(
        [
          ['kelvin', 82],
          ['celson', 32]
        ],
        [[null, 1]]
      )
    ).to.eql([
      ['kelvin', 82],
      ['celson', 32]
    ])
    expect(
      lookup.SORTBY(
        [
          ['tom', 52],
          ['fred', 65],
          ['amy', 22],
          ['sal', 73],
          ['fritz', 19]
        ],
        [[52], [65], [22], [73], [19]],
        -1
      )
    ).to.eql([
      ['sal', 73],
      ['fred', 65],
      ['tom', 52],
      ['amy', 22],
      ['fritz', 19]
    ])
    expect(
      lookup.SORTBY(
        [
          ['tom', 52],
          ['fred', 65],
          ['amy', 19],
          ['sal', 73],
          ['fritz', 19]
        ],
        [[52], [65], [19], [73], [19]],
        -1,
        [[2550], [2300], [6400], [2400], [6600]],
        1
      )
    ).to.eql([
      ['sal', 73],
      ['fred', 65],
      ['tom', 52],
      ['amy', 19],
      ['fritz', 19]
    ])
    expect(
      lookup.SORTBY(
        [
          ['tom', 52],
          ['fred', 65],
          ['amy', 19],
          ['sal', 73],
          ['fritz', 19]
        ],
        [[52], [65], [19], [73], [19]],
        -1,
        [[2550], [2300], [6400], [2400], [6600]],
        -1
      )
    ).to.eql([
      ['sal', 73],
      ['fred', 65],
      ['tom', 52],
      ['fritz', 19],
      ['amy', 19]
    ])
    expect(
      lookup.SORTBY(
        [
          ['tom', 52],
          ['fred', 65],
          ['amy', 19],
          ['sal', 73],
          ['fritz', 19]
        ],
        [[52], [65], [19], [73], [19]],
        1,
        [[2550], [2300], [6400], [2400], [6600]],
        -1
      )
    ).to.eql([
      ['fritz', 19],
      ['amy', 19],
      ['tom', 52],
      ['fred', 65],
      ['sal', 73]
    ])
    expect(lookup.SORTBY([['tom', 'fred', 'amy', 'sal', 'fritz']], [[52, 65, 19, 73, 19]], 1)).to.eql([
      ['amy', 'fritz', 'tom', 'fred', 'sal']
    ])
    expect(
      lookup.SORTBY(
        [['tom', 'fred', 'amy', 'sal', 'fritz']],
        [[52, 65, 19, 73, 19]],
        1,
        [[2550, 2300, 6400, 2400, 6600]],
        -1
      )
    ).to.eql([['fritz', 'amy', 'tom', 'fred', 'sal']])
    expect(lookup.SORTBY([['hello', 'world']], [[1, 2]], -1)).to.eql([['world', 'hello']])
    expect(lookup.SORTBY([['hello', 'world']], [[1, 2]], 1)).to.eql([['hello', 'world']])
    expect(lookup.SORTBY([['hello', 'world']], [[1, 'string']], 1)).to.eql([['hello', 'world']])
    expect(lookup.SORTBY([['hello', 'world']], [[1, 2]], 0)).to.equal(error.value)
    expect(lookup.SORTBY([['hello', 'world']], [[1, 2]], 10)).to.equal(error.value)
    expect(lookup.SORTBY([['hello', 'world']], [[1, 2]], -10)).to.equal(error.value)
    expect(lookup.SORTBY([['hello', 'world']], [[1, 2]], false)).to.equal(error.value)
    expect(lookup.SORTBY([['hello', 'world']], [[1, 2]], [[1, 2]])).to.equal(error.value)
    expect(lookup.SORTBY([['hello', 'world']], 1, 1)).to.eql(error.value)
    expect(lookup.SORTBY([['hello', 'world']], 'hello', 1)).to.eql(error.value)
    expect(lookup.SORTBY([['hello', 'world']], true, 1)).to.eql(error.value)
    expect(lookup.SORTBY([['hello', 'world']], false, 1)).to.eql(error.value)
    expect(lookup.SORTBY([['hello', 'world']], null, 1)).to.eql(error.value)
    expect(lookup.SORTBY([['hello', 'world']], undefined, 1)).to.eql(error.value)
    expect(lookup.SORTBY(1, [[1, 2]], -1)).to.eql(error.value)
    expect(lookup.SORTBY('hello', [[1, 2]], -1)).to.eql(error.value)
    expect(lookup.SORTBY(true, [[1, 2]], -1)).to.eql(error.value)
    expect(lookup.SORTBY(false, [[1, 2]], -1)).to.eql(error.value)
    expect(lookup.SORTBY(null, [[1, 2]], -1)).to.eql(error.value)
    expect(lookup.SORTBY(undefined, [[1, 2]], -1)).to.eql(error.value)

    Object.values(error).forEach((err) => {
      expect(lookup.SORTBY(err, [[1, 2]], 1)).to.eql(err)
      expect(lookup.SORTBY([['hello', 'world']], err, 1)).to.eql(err)
      expect(lookup.SORTBY([['hello', 'world']], [[1, 2]], err)).to.eql(err)
    })
  })

  it('TRANSPOSE', () => {
    expect(lookup.TRANSPOSE(1)).to.equal(1)
    expect(lookup.TRANSPOSE(0)).to.equal(0)
    expect(lookup.TRANSPOSE(-5)).to.equal(-5)
    expect(lookup.TRANSPOSE(true)).to.equal(true)
    expect(lookup.TRANSPOSE(false)).to.equal(false)
    expect(lookup.TRANSPOSE('')).to.equal('')
    expect(lookup.TRANSPOSE('text')).to.equal('text')
    expect(lookup.TRANSPOSE('1')).to.equal('1')
    expect(lookup.TRANSPOSE('true')).to.equal('true')

    expect(lookup.TRANSPOSE([['test 1'], ['test 2'], ['test 3']])).to.eql([['test 1', 'test 2', 'test 3']])

    expect(lookup.TRANSPOSE([[1, 2, 3]])).to.eql([[1], [2], [3]])
    expect(
      lookup.TRANSPOSE([
        [1, 2],
        [3, 4],
        [5, 6]
      ])
    ).to.eql([
      [1, 3, 5],
      [2, 4, 6]
    ])
    expect(
      lookup.TRANSPOSE([
        [1, 2, 3],
        [4, 5, 6]
      ])
    ).to.eql([
      [1, 4],
      [2, 5],
      [3, 6]
    ])

    expect(lookup.TRANSPOSE()).to.equal(error.na)
    expect(lookup.TRANSPOSE(1, 1)).to.equal(error.na)
  })

  it('ADDRESS', () => {
    expect(lookup.ADDRESS('4', 3)).to.equal('$C$4')
    expect(lookup.ADDRESS(4.1, '3.9')).to.equal('$C$4')

    expect(lookup.ADDRESS(0, 3)).to.equal(error.value)
    expect(lookup.ADDRESS(3, 0)).to.equal(error.value)
    expect(lookup.ADDRESS(-1, 5)).to.equal(error.value)
    expect(lookup.ADDRESS(10, -5)).to.equal(error.value)

    expect(lookup.ADDRESS('0', 3)).to.equal(error.value)
    expect(lookup.ADDRESS('3', '0')).to.equal(error.value)
    expect(lookup.ADDRESS(-1, '5')).to.equal(error.value)

    expect(lookup.ADDRESS(true, 'true')).to.equal('$A$1')
    expect(lookup.ADDRESS(false, 1)).to.equal(error.value)
    expect(lookup.ADDRESS(1, false)).to.equal(error.value)
    expect(lookup.ADDRESS(false, 1)).to.equal(error.value)
    expect(lookup.ADDRESS(null, 1)).to.equal(error.value)
    expect(lookup.ADDRESS(1, null)).to.equal(error.value)

    expect(lookup.ADDRESS(1, '')).to.equal(error.value)
    expect(lookup.ADDRESS('', 1)).to.equal(error.value)
    expect(lookup.ADDRESS(1, 'text')).to.equal(error.value)
    expect(lookup.ADDRESS('text', 1)).to.equal(error.value)

    expect(lookup.ADDRESS(1, 1, true)).to.equal('$A$1')
    expect(lookup.ADDRESS(1, 1, 1)).to.equal('$A$1')
    expect(lookup.ADDRESS(1, 1, 2)).to.equal('A$1')
    expect(lookup.ADDRESS(1, 1, 3)).to.equal('$A1')
    expect(lookup.ADDRESS(1, 1, 4)).to.equal('A1')

    expect(lookup.ADDRESS(1, 1, null)).to.equal(error.value)
    expect(lookup.ADDRESS(1, 1, '')).to.equal(error.value)
    expect(lookup.ADDRESS(1, 1, 'text')).to.equal(error.value)
    expect(lookup.ADDRESS(1, 1, 0)).to.equal(error.value)
    expect(lookup.ADDRESS(1, 1, -1)).to.equal(error.value)
    expect(lookup.ADDRESS(1, 1, 5)).to.equal(error.value)
    expect(lookup.ADDRESS(1, 1, false)).to.equal(error.value)
    expect(lookup.ADDRESS(1, 1, 'true')).to.equal(error.value)

    expect(lookup.ADDRESS(1, 1, true, false)).to.equal('R1C1')
    expect(lookup.ADDRESS(1, 1, 1, false)).to.equal('R1C1')
    expect(lookup.ADDRESS(1, 1, 2, false)).to.equal('R1C[1]')
    expect(lookup.ADDRESS(1, 1, 3, false)).to.equal('R[1]C1')
    expect(lookup.ADDRESS(1, 1, 4, false)).to.equal('R[1]C[1]')

    expect(lookup.ADDRESS(1, 1, 1, null)).to.equal('R1C1')
    expect(lookup.ADDRESS(1, 1, 1, '')).to.equal(error.value)
    expect(lookup.ADDRESS(1, 1, 1, 'text')).to.equal(error.value)
    expect(lookup.ADDRESS(1, 1, 1, 0)).to.equal('R1C1')
    expect(lookup.ADDRESS(1, 1, 1, -5)).to.equal('$A$1')
    expect(lookup.ADDRESS(1, 1, 1, 1)).to.equal('$A$1')
    expect(lookup.ADDRESS(1, 1, 1, '1')).to.equal(error.value)
    expect(lookup.ADDRESS(1, 1, 1, true)).to.equal('$A$1')
    expect(lookup.ADDRESS(1, 1, 1, false)).to.equal('R1C1')
    expect(lookup.ADDRESS(1, 1, 1, 'true')).to.equal('$A$1')
    expect(lookup.ADDRESS(1, 1, 1, 'false')).to.equal('R1C1')

    expect(lookup.ADDRESS(1, 1, 1, true, null)).to.equal('!$A$1')
    expect(lookup.ADDRESS(1, 1, 1, false, '')).to.equal('!R1C1')
    expect(lookup.ADDRESS(1, 1, 1, true, 0)).to.equal("'0'!$A$1")
    expect(lookup.ADDRESS(1, 1, 1, false, -5)).to.equal("'-5'!R1C1")
    expect(lookup.ADDRESS(1, 1, 1, true, 3)).to.equal("'3'!$A$1")
    expect(lookup.ADDRESS(1, 1, 1, false, '1')).to.equal("'1'!R1C1")

    expect(lookup.ADDRESS(1, 1, 1, true, true)).to.equal("'TRUE'!$A$1")
    expect(lookup.ADDRESS(1, 1, 1, false, false)).to.equal("'FALSE'!R1C1")
    expect(lookup.ADDRESS(1, 1, 1, true, 'true')).to.equal("'TRUE'!$A$1")
    expect(lookup.ADDRESS(1, 1, 1, false, 'false')).to.equal("'FALSE'!R1C1")
    expect(lookup.ADDRESS(1, 1, 1, true, 'text')).to.equal('text!$A$1')
    expect(lookup.ADDRESS(1, 1, 1, false, 'text1')).to.equal('text1!R1C1')
    expect(lookup.ADDRESS(1, 1, 1, true, '12text')).to.equal("'12text'!$A$1")
    expect(lookup.ADDRESS(1, 1, 1, true, '?text')).to.equal("'?text'!$A$1")

    Object.values(error).forEach((err) => {
      expect(lookup.ADDRESS(err, 1, 1, 1, 1)).to.equal(err)
      expect(lookup.ADDRESS(1, err, 1, 1, 1)).to.equal(err)
      expect(lookup.ADDRESS(1, 1, err, 1, 1)).to.equal(err)
      expect(lookup.ADDRESS(1, 1, 1, err, 1)).to.equal(err)
      expect(lookup.ADDRESS(1, 1, 1, 1, err)).to.equal(err)
    })

    expect(lookup.ADDRESS()).to.equal(error.na)
    expect(lookup.ADDRESS(1)).to.equal(error.na)
    expect(lookup.ADDRESS(1, 1, 1, 1, 1, 1)).to.equal(error.na)
  })

  it('UNIQUE', () => {
    expect(lookup.UNIQUE(1, 2, 3, 4, 5, 6, 6, 3)).to.deep.equal([1, 2, 3, 4, 5, 6])
    expect(lookup.UNIQUE('jima', 'jimb', 'jima', 'jimc')).to.deep.equal(['jima', 'jimb', 'jimc'])
    expect(lookup.UNIQUE()).to.eql([])
    expect(lookup.UNIQUE([])).to.eql([[]])
  })

  it('VLOOKUP', () => {
    expect(lookup.VLOOKUP()).to.equal(error.na)
    expect(lookup.VLOOKUP('')).to.equal(error.na)
    expect(lookup.VLOOKUP(1)).to.equal(error.na)
    expect(lookup.VLOOKUP(1, [[1, 2]])).to.equal(error.na)
    expect(
      lookup.VLOOKUP(
        1,
        [
          [0, 'A'],
          [1, 'B']
        ],
        2,
        false,
        4
      )
    ).to.equal(error.na)

    expect(lookup.VLOOKUP(1, [[2, 1]], 2)).to.equal(error.na)

    expect(lookup.VLOOKUP(1, [[1, 2]], 2, false)).to.equal(2)
    expect(lookup.VLOOKUP(1, [[1, 2]], 2, true)).to.equal(2)
    expect(
      lookup.VLOOKUP(
        3,
        [
          [1, '1'],
          [2, '2']
        ],
        2,
        true
      )
    ).to.equal('2')

    expect(
      lookup.VLOOKUP(
        5,
        [
          [1, 2],
          [3, 4]
        ],
        2,
        false
      )
    ).to.equal(error.na)
    expect(
      lookup.VLOOKUP(
        5,
        [
          [1, 2],
          [3, 4]
        ],
        2
      )
    ).to.equal(4)
    expect(
      lookup.VLOOKUP(
        5,
        [
          [1, 2],
          [3, 4]
        ],
        2,
        true
      )
    ).to.equal(4)

    expect(
      lookup.VLOOKUP(
        2,
        [
          [1, 'A'],
          [2, 'B'],
          [3, 'C'],
          [4, 'D'],
          [2, 'E']
        ],
        2
      )
    ).to.equal('B')
    expect(
      lookup.VLOOKUP(
        1.1,
        [
          [1, 2],
          [3, 4]
        ],
        2,
        true
      )
    ).to.equal(2)
    expect(
      lookup.VLOOKUP(
        0,
        [
          [1, 2],
          [3, 4]
        ],
        2,
        true
      )
    ).to.equal(error.na)
    expect(
      lookup.VLOOKUP(
        'ji',
        [
          ['hector', 2],
          ['jam', 4]
        ],
        2
      )
    ).to.equal(4)
    expect(
      lookup.VLOOKUP(
        'ji',
        [
          ['hector', 2],
          ['jam', 4]
        ],
        2,
        false
      )
    ).to.equal(error.na)
    expect(
      lookup.VLOOKUP(
        'jam',
        [
          ['hector', 2],
          ['jam', 4]
        ],
        2,
        false
      )
    ).to.equal(4)
    expect(
      lookup.VLOOKUP(
        'jam',
        [
          ['hector', -1],
          ['jam', 0]
        ],
        2,
        false
      )
    ).to.equal(0)
    expect(
      lookup.VLOOKUP(
        'james',
        [
          ['jam', 2],
          ['jim', 4]
        ],
        2
      )
    ).to.equal(2)
    expect(
      lookup.VLOOKUP(
        'jim',
        [
          ['jam', 2],
          ['jim', 4]
        ],
        2,
        false
      )
    ).to.equal(4)
    expect(
      lookup.VLOOKUP(
        'john',
        [
          ['john', 4],
          ['jam', 2]
        ],
        2
      )
    ).to.equal(4)
    expect(
      lookup.VLOOKUP(
        'ji',
        [
          ['jim', 2],
          ['jam', 4]
        ],
        3,
        true
      )
    ).to.equal(error.na)
    expect(
      lookup.VLOOKUP(
        0,
        [
          [1, 'Jim'],
          [0, 'John']
        ],
        2,
        false
      )
    ).to.equal('John')
    expect(
      lookup.VLOOKUP(
        0,
        [
          [1, 'Jim'],
          [0, 'John'],
          [2, 'Jack']
        ],
        2,
        true
      )
    ).to.equal('John')
    expect(
      lookup.VLOOKUP(
        1.1,
        [
          [0, 'A'],
          [1, 'B'],
          [2, 'C'],
          [1, 'D']
        ],
        2,
        true
      )
    ).to.equal('B')
    expect(
      lookup.VLOOKUP(
        1,
        [
          [0, 'A'],
          [1, 'B'],
          [2, 'C'],
          [1, 'D']
        ],
        2
      )
    ).to.equal('B')
    expect(
      lookup.VLOOKUP(
        1.1,
        [
          [0, 'A'],
          [1, 'B'],
          [2, 'C'],
          [1, 'D']
        ],
        2,
        false
      )
    ).to.equal(error.na)
    // expect(lookup
    //   .VLOOKUP(
    //     [0, 1, 2, 1],
    //     3,
    //     2,
    //     4
    //   )
    //   ).to.equal(error.ref)
    expect(
      lookup.VLOOKUP(
        false,
        [
          [0, 'A'],
          [1, 'B'],
          [2, 'C'],
          [1, 'D']
        ],
        true,
        false
      )
    ).to.equal(error.na)

    expect(
      lookup.VLOOKUP(
        2,
        [
          [0, 'A'],
          [1, 'B'],
          [4, 'C'],
          [2, 'D'],
          [3, 'e']
        ],
        2
      )
    ).to.equal('B')

    expect(
      lookup.VLOOKUP(
        1,
        [
          [0, 'A'],
          [1, 'B']
        ],
        '2'
      )
    ).to.equal('B')
    expect(
      lookup.VLOOKUP(
        1,
        [
          [0, 'A'],
          [1, 'B']
        ],
        true
      )
    ).to.equal(1)
    expect(
      lookup.VLOOKUP(
        1,
        [
          [0, 'A'],
          [1, 'B']
        ],
        0
      )
    ).to.equal(error.value)
    expect(
      lookup.VLOOKUP(
        1,
        [
          [0, 'A'],
          [1, 'B']
        ],
        false
      )
    ).to.equal(error.value)
    expect(
      lookup.VLOOKUP(
        1,
        [
          [0, 'A'],
          [1, 'B']
        ],
        -1
      )
    ).to.equal(error.value)
    expect(
      lookup.VLOOKUP(
        1,
        [
          [0, 'A'],
          [1, 'B']
        ],
        ''
      )
    ).to.equal(error.value)
    expect(
      lookup.VLOOKUP(
        1,
        [
          [0, 'A'],
          [1, 'B']
        ],
        'text'
      )
    ).to.equal(error.value)

    expect(
      lookup.VLOOKUP(
        1,
        [
          [0, 'A'],
          [1, 'B']
        ],
        2,
        error.calc
      )
    ).to.equal(error.calc)
    expect(
      lookup.VLOOKUP(
        3,
        [
          [0, 'A'],
          [1, 'B'],
          [4, 'C'],
          [2, 'D'],
          [3, 'E']
        ],
        2,
        'tRuE'
      )
    ).to.equal('B')
    expect(
      lookup.VLOOKUP(
        3,
        [
          [0, 'A'],
          [1, 'B'],
          [4, 'C'],
          [2, 'D'],
          [3, 'E']
        ],
        2,
        'fALse'
      )
    ).to.equal('E')
    expect(
      lookup.VLOOKUP(
        3,
        [
          [0, 'A'],
          [1, 'B'],
          [4, 'C'],
          [2, 'D'],
          [3, 'E']
        ],
        2,
        1
      )
    ).to.equal('B')
    expect(
      lookup.VLOOKUP(
        3,
        [
          [0, 'A'],
          [1, 'B'],
          [4, 'C'],
          [2, 'D'],
          [3, 'E']
        ],
        2,
        -5
      )
    ).to.equal('B')
    expect(
      lookup.VLOOKUP(
        3,
        [
          [0, 'A'],
          [1, 'B'],
          [4, 'C'],
          [2, 'D'],
          [3, 'E']
        ],
        2,
        0
      )
    ).to.equal('E')
    expect(
      lookup.VLOOKUP(
        3,
        [
          [0, 'A'],
          [1, 'B'],
          [4, 'C'],
          [2, 'D'],
          [3, 'E']
        ],
        2,
        '1'
      )
    ).to.equal(error.value)

    expect(lookup.VLOOKUP('Joseph', 5, 2, false)).to.equal(error.na)

    expect(lookup.VLOOKUP('Joseph', 'Joseph', 2, false)).to.equal(error.ref)

    expect(lookup.VLOOKUP('Joseph', 'Joseph', 1, false)).to.equal('Joseph')

    Object.values(error).forEach((err) => {
      expect(
        lookup.VLOOKUP(
          err,
          [
            ['ID', 'Last Name', 'First Name'],
            ['1', 'Samuel', 'Jessie'],
            ['2', 'Joseph', 'Gael'],
            ['3', 'Tyrone', 'Mitchell'],
            ['4', 'Stacey', 'Brady'],
            ['5', 'Laz', 'Archie'],
            ['6', 'Coy', 'Jools']
          ],
          2,
          false
        )
      ).to.equal(err)

      expect(lookup.VLOOKUP('Joseph', err, 2, false)).to.equal(error.na)

      expect(
        lookup.VLOOKUP(
          'Joseph',
          [
            ['ID', 'Last Name', 'First Name'],
            ['1', 'Samuel', 'Jessie'],
            ['2', 'Joseph', 'Gael'],
            ['3', 'Tyrone', 'Mitchell'],
            ['4', 'Stacey', 'Brady'],
            ['5', 'Laz', 'Archie'],
            ['6', 'Coy', 'Jools']
          ],
          err,
          false
        )
      ).to.equal(err)

      expect(
        lookup.VLOOKUP(
          'Joseph',
          [
            ['ID', 'Last Name', 'First Name'],
            ['1', 'Samuel', 'Jessie'],
            ['2', 'Joseph', 'Gael'],
            ['3', 'Tyrone', 'Mitchell'],
            ['4', 'Stacey', 'Brady'],
            ['5', 'Laz', 'Archie'],
            ['6', 'Coy', 'Jools']
          ],
          2,
          err
        )
      ).to.equal(err)
    })
  })

  describe('FILTER', () => {
    it('Wrong number of arguments', () => {
      expect(lookup.FILTER()).to.equal(error.na)
      expect(
        lookup.FILTER([
          ['Game', 'Asia', '41334'],
          ['Game', 'Europe', '25234'],
          ['Utility', 'Asia', '54234']
        ])
      ).to.equal(error.na)
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234']
          ],
          [[true], [true], [true]],
          'No match',
          'test'
        )
      ).to.equal(error.na)
    })

    it('Second argument is a matrix', () => {
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234']
          ],
          [
            [true, false, true],
            [true, false, true]
          ]
        )
      ).to.equal(error.value)
    })

    it('Second argument is a column', () => {
      expect(
        lookup.FILTER(
          [
            [null, 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234'],
            ['Utility', 'Europe', '32345']
          ],
          [[true], [false], [1], [0]]
        )
      ).to.eql([
        [0, 'Asia', '41334'],
        ['Utility', 'Asia', '54234']
      ])

      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', error.div0],
            ['Utility', 'Asia', '54234'],
            ['Utility', 'Europe', '32345']
          ],
          [[2], [false], ['true'], ['false']]
        )
      ).to.eql([
        ['Game', 'Asia', '41334'],
        ['Utility', 'Asia', '54234']
      ])

      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234']
          ],
          [[true], ['1'], [true]]
        )
      ).to.equal(error.value)
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234']
          ],
          [[true], [error.name], [error.div0]]
        )
      ).to.equal(error.name)
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234']
          ],
          [[true], [error.div0], [error.name]]
        )
      ).to.equal(error.div0)
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234']
          ],
          [[true], ['test'], [error.name]]
        )
      ).to.equal(error.value)
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234']
          ],
          [[true], [error.name], ['test']]
        )
      ).to.equal(error.name)

      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234'],
            ['Utility', 'Europe', '32345']
          ],
          [[true], [false], [true]]
        )
      ).to.equal(error.value)
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234']
          ],
          [[true], [false], [true], [false]]
        )
      ).to.equal(error.value)

      expect(
        lookup.FILTER(
          [
            ['East', 1],
            ['West', 2],
            ['North', 3]
          ],
          [[false], [false], [false]]
        )
      ).to.equal(error.calc)
      expect(
        lookup.FILTER(
          [
            ['East', 1],
            ['West', 2],
            ['North', 3]
          ],
          [[false], [false], [false]],
          undefined
        )
      ).to.equal(error.calc)
      expect(
        lookup.FILTER(
          [
            ['East', 1],
            ['West', 2],
            ['North', 3]
          ],
          [[false], [false], [false]],
          'No match'
        )
      ).to.equal('No match')
      expect(
        lookup.FILTER(
          [
            ['East', 1],
            ['West', 2],
            ['North', 3]
          ],
          [[false], [false], [false]],
          null
        )
      ).to.equal(0)

      expect(lookup.FILTER(5, [[1], [true]])).to.equal(error.value)
    })

    it('Second argument is a row', () => {
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234']
          ],
          [[true, false]]
        )
      ).to.equal(error.value)
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234']
          ],
          [[true, false, true, false]]
        )
      ).to.equal(error.value)

      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            [null, 'Europe', '25234'],
            ['Utility', 'Asia', '54234'],
            ['Utility', 'Europe', '32345']
          ],
          [[true, false, 1]]
        )
      ).to.eql([
        ['Game', '41334'],
        [0, '25234'],
        ['Utility', '54234'],
        ['Utility', '32345']
      ])

      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234'],
            ['Utility', 'Europe', '32345']
          ],
          [[true, false, '1']]
        )
      ).to.equal(error.value)

      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234'],
            ['Utility', 'Europe', '32345']
          ],
          [[false, false, false]]
        )
      ).to.equal(error.calc)
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234'],
            ['Utility', 'Europe', '32345']
          ],
          [[false, false, false]],
          undefined
        )
      ).to.equal(error.calc)
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234'],
            ['Utility', 'Europe', '32345']
          ],
          [[false, false, false]],
          'No match'
        )
      ).to.equal('No match')
      expect(
        lookup.FILTER(
          [
            ['Game', 'Asia', '41334'],
            ['Game', 'Europe', '25234'],
            ['Utility', 'Asia', '54234'],
            ['Utility', 'Europe', '32345']
          ],
          [[false, false, false]],
          null
        )
      ).to.equal(0)

      expect(lookup.FILTER(4, [[1, true]])).to.equal(error.value)
    })

    it('Second argument is a single item', () => {
      expect(lookup.FILTER(error.na, error.div0)).to.equal(error.div0)

      expect(lookup.FILTER(1, undefined)).to.equal(error.value)
      expect(lookup.FILTER(undefined, true)).to.equal(error.value)

      expect(lookup.FILTER(null, true)).to.equal(0)
      expect(lookup.FILTER('test', true)).to.equal('test')
      expect(lookup.FILTER('test', false)).to.equal(error.calc)
      expect(lookup.FILTER('test', false, undefined)).to.equal(error.calc)
      expect(lookup.FILTER('test', false, null)).to.equal(0)
      expect(lookup.FILTER('test', false, 'No match')).to.equal('No match')

      expect(lookup.FILTER([['Game'], ['Utility']], true)).to.eql([['Game'], ['Utility']])
      expect(lookup.FILTER([['Game', 'Utility']], 'true')).to.eql([['Game', 'Utility']])
      expect(
        lookup.FILTER(
          [
            ['Game', 'Utility'],
            [1, 2]
          ],
          true
        )
      ).to.eql(error.value)
    })
  })

  it('HLOOKUP', () => {
    expect(lookup.HLOOKUP()).to.equal(error.na)
    expect(lookup.HLOOKUP('')).to.equal(error.na)
    expect(lookup.HLOOKUP(1)).to.equal(error.na)
    expect(lookup.HLOOKUP(1, [[1, 2]])).to.equal(error.na)
    expect(lookup.HLOOKUP(1, [[1], [2]], 2)).to.equal(2)
    expect(lookup.HLOOKUP(1, [[1], [2]], 3)).to.equal(error.ref)
    expect(
      lookup.HLOOKUP(
        1,
        [
          [1, 2],
          [3, 4]
        ],
        2
      )
    ).to.equal(3)
    expect(
      lookup.HLOOKUP(
        2,
        [
          [1, 2],
          [3, 4]
        ],
        2
      )
    ).to.equal(4)
    expect(lookup.HLOOKUP(1, [[1], [2]], 2, true)).to.equal(2)
    expect(lookup.HLOOKUP(1, [[1], [2]], 3, true)).to.equal(error.ref)
    expect(
      lookup.HLOOKUP(
        1,
        [
          [1, 2],
          [3, 4]
        ],
        2,
        true
      )
    ).to.equal(3)
    expect(
      lookup.HLOOKUP(
        2,
        [
          [1, 2],
          [3, 4]
        ],
        2,
        true
      )
    ).to.equal(4)
    expect(
      lookup.HLOOKUP(
        'ji',
        [
          ['jim', 'jam'],
          [1, 4]
        ],
        2,
        false
      )
    ).to.equal(error.na)
    expect(
      lookup.HLOOKUP(
        'jb',
        [
          ['jam', 'jim'],
          [1, 4]
        ],
        2,
        true
      )
    ).to.equal(1)
    expect(
      lookup.HLOOKUP(
        'li',
        [
          ['hector', 'jim'],
          [1, 4]
        ],
        2,
        true
      )
    ).to.equal(4)
    expect(
      lookup.HLOOKUP(
        'li',
        [
          ['hector', 'jim'],
          [1, 4]
        ],
        2,
        4,
        true
      )
    ).to.equal(error.na)
    expect(
      lookup.HLOOKUP(
        'ji',
        [
          ['hector', 'jam'],
          [1, 4]
        ],
        3,
        true
      )
    ).to.equal(error.ref)
    expect(
      lookup.HLOOKUP(
        true,
        2,
        [
          ['hector', 'jam'],
          [1, 4]
        ],
        true
      )
    ).to.equal(error.na)
    expect(
      lookup.HLOOKUP(
        'ji',
        [
          ['jim', 'jam'],
          [1, 4]
        ],
        3,
        false
      )
    ).to.equal(error.na)
    expect(
      lookup.HLOOKUP(
        0,
        [
          [1, 0],
          ['jim', 'jam']
        ],
        2,
        false
      )
    ).to.equal('jam')
    expect(
      lookup.HLOOKUP(
        0,
        [
          [0, 1],
          ['jim', 'jam']
        ],
        2
      )
    ).to.equal('jim')
    expect(
      lookup.HLOOKUP(
        1.4,
        [
          [0, 1, 2, 1],
          ['A', 'B', 'C', 'D']
        ],
        2
      )
    ).to.equal('B')
    expect(
      lookup.HLOOKUP(
        1.4,
        [
          [0, 1, 2, 1],
          ['A', 'B', 'C', 'D']
        ],
        2,
        false
      )
    ).to.equal(error.na)
  })

  it('LOOKUP', () => {
    expect(lookup.LOOKUP('Jamie', [['Jim', 'Jack', 'Franck']], [['blue'], ['yellow'], ['red']])).to.equal('red')
    expect(lookup.LOOKUP('Jamie', [['Jim'], ['Jack'], ['Franck']], [['blue'], ['yellow'], ['red']])).to.equal('red')

    expect(lookup.LOOKUP('Jack', [['Jim'], ['Jack'], ['Franck']], [['blue'], ['yellow'], ['red']])).to.equal('yellow')
    expect(
      lookup.LOOKUP(
        3125,
        [[1000], [2000], [3000], [4000], [5000]],
        [['Bronze'], ['Silver'], ['Gold'], ['Platinum'], ['Dinamond']]
      )
    ).to.equal('Gold')

    expect(lookup.LOOKUP(0.23, [[0.1], [0.2], [0.3], [0.4]], [['A'], ['B'], ['C'], ['D']])).to.equal('B')
    expect(lookup.LOOKUP(0.21, [[0.1, 0.2, 0.3, 0.2]], [['A', 'B', 'C', 'D']])).to.equal('B')

    expect(lookup.LOOKUP(3.5, [[4, 3, 1, 8, 6]], [['A', 'B', 'C', 'D']])).to.equal('C')
    expect(lookup.LOOKUP(3.5, [[4, 3, 1, 8, 6]], [['A', 'B']])).to.equal(error.ref)

    expect(
      lookup.LOOKUP(6, [
        [1, 6, 11, 16],
        [2, 7, 12, 17],
        [3, 8, 13, 18],
        [4, 9, 14, 19]
      ])
    ).to.equal(19)
    expect(
      lookup.LOOKUP(6, [
        [1, 6, 11, 16],
        [2, 7, 12, 17],
        [3, 8, 13, 18]
      ])
    ).to.equal(8)

    expect(
      lookup.LOOKUP(
        6,
        [
          [1, 6, 11, 16],
          [2, 7, 12, 17],
          [3, 8, 13, 18],
          [4, 9, 14, 19]
        ],
        [['text 1', 'text 2', 'text 3', 'text 4']]
      )
    ).to.equal('text 4')
    expect(
      lookup.LOOKUP(
        6,
        [
          [1, 6, 11, 16],
          [2, 7, 12, 17],
          [3, 8, 13, 18]
        ],
        [['text 1', 'text 2', 'text 3', 'text 4']]
      )
    ).to.equal('text 2')

    expect(
      lookup.LOOKUP(
        1,
        [
          [1, 6, 11, 16],
          [2, 7, 12, 17],
          [3, 8, 13, 18],
          [4, 9, 14, 19],
          [5, 10, 15, 20]
        ],
        [
          [1, 6, 11, 16],
          [2, 7, 12, 17],
          [3, 8, 13, 18],
          [4, 9, 14, 19],
          [5, 10, 15, 20]
        ]
      )
    ).to.equal(error.na)

    expect(lookup.LOOKUP(6, 4)).to.equal(4)
    expect(lookup.LOOKUP(6, 4, 8)).to.equal(8)

    expect(lookup.LOOKUP(error.div0, [[1], [2], [3], [4], [5]])).to.equal(error.div0)
    expect(lookup.LOOKUP(6, error.div0)).to.equal(error.na)

    expect(lookup.LOOKUP(0, [[0.1, 0.2, 0.3, 0.4]], [['A', 'B', 'C', 'D']])).to.equal(error.na)
    expect(
      lookup.LOOKUP(
        3125,
        [['Bronze'], ['Silver'], ['Gold'], ['Platinum'], ['Dinamond']],
        [[1000], [2000], [3000], [4000], [5000]]
      )
    ).to.equal(error.na)
    expect(lookup.LOOKUP(true, [1, 2, 3])).to.equal(error.na)

    expect(
      lookup.LOOKUP(
        [[1000], [2000], [3000], [4000], [5000]],
        [['Bronze'], ['Silver'], ['Gold'], ['Platinum'], ['Dinamond']]
      )
    ).to.equal(error.na)

    expect(lookup.LOOKUP()).to.equal(error.na)
    expect(lookup.LOOKUP(1)).to.equal(error.na)
    expect(lookup.LOOKUP('')).to.equal(error.na)
    expect(lookup.LOOKUP('Jack', ['Jim', 'Jack', 'Franck'], ['blue', 'yellow', 'red'], 2)).to.equal(error.na)
  })

  describe('INDEX', () => {
    describe('Array form', () => {
      describe('and a single cell', () => {
        it('should return the value', () => {
          expect(lookup.INDEX(4, 1, 1)).to.equal(4)
          expect(lookup.INDEX('text', 0, null)).to.equal('text')
          expect(lookup.INDEX('-5', 1, false)).to.equal('-5')
          expect(lookup.INDEX(false, 0, true)).to.equal(false)

          expect(lookup.INDEX(false, 1)).to.equal(false)
        })

        it('should throw an error if row or column number is out of range', () => {
          expect(lookup.INDEX(true, 2, 0)).to.equal(error.ref)
          expect(lookup.INDEX(true, 0, 2)).to.equal(error.ref)
        })
      })

      const row = [[1, true, 3, '5', 8]]
      describe('and a row', () => {
        it('should return the value', () => {
          expect(lookup.INDEX(row, 1, 4)).to.equal('5')
          expect(lookup.INDEX(row, 1, 5)).to.equal(8)
          expect(lookup.INDEX(row, 1, 2)).to.equal(true)

          expect(lookup.INDEX(row, 1, 0)).to.eql(row)
          expect(lookup.INDEX(row, 1, 1.9)).to.eql(1)
          expect(lookup.INDEX(row, 1, null)).to.eql(row)
          expect(lookup.INDEX(row, 1, '0')).to.eql(row)
          expect(lookup.INDEX(row, 1, '1')).to.eql(1)

          expect(lookup.INDEX(row, '1', 3)).to.equal(3)
          expect(lookup.INDEX(row, 0, 3)).to.equal(3)
          expect(lookup.INDEX(row, true, 3)).to.equal(3)
          expect(lookup.INDEX(row, false, 3)).to.equal(3)
          expect(lookup.INDEX(row, null, 3)).to.equal(3)
        })

        it('should return the correct value in case second parameter is omitted', () => {
          expect(lookup.INDEX(row, 2)).to.equal(true)
        })

        it('should throw an error if row or column number is out of range', () => {
          expect(lookup.INDEX(row, 1, 6)).to.equal(error.ref)
          expect(lookup.INDEX(row, 2, 1)).to.equal(error.ref)

          expect(lookup.INDEX(row, 6)).to.equal(error.ref)
          expect(lookup.INDEX(row, -1)).to.equal(error.value)

          expect(lookup.INDEX(row, 1, -6)).to.equal(error.value)
          expect(lookup.INDEX(row, -6, 1)).to.equal(error.value)

          expect(lookup.INDEX(row, '', 3)).to.equal(error.value)
          expect(lookup.INDEX(row, 'true', 3)).to.equal(error.value)

          expect(lookup.INDEX(row, 1, '')).to.eql(error.value)
          expect(lookup.INDEX(row, 1, 'true')).to.eql(error.value)
        })
      })

      const column = [[1], [false], [5], ['text'], [-2.4]]
      describe('and a column', () => {
        it('should return the value', () => {
          expect(lookup.INDEX(column, 2, 1)).to.equal(false)
          expect(lookup.INDEX(column, 0, 1)).to.eql(column)
          expect(lookup.INDEX(column, '0', 1)).to.eql(column)
          expect(lookup.INDEX(column, null, 1)).to.eql(column)
          expect(lookup.INDEX(column, false, 1)).to.eql(column)
        })

        it('should return the correct value in case second parameter is omitted', () => {
          expect(lookup.INDEX(column, 2)).to.equal(false)
        })

        it('should throw an error if row or column number is out of range', () => {
          expect(lookup.INDEX(column, 1, 2)).to.eql(error.ref)
          expect(lookup.INDEX(column, 1, -1)).to.eql(error.value)
          expect(lookup.INDEX(column, 1, 'text')).to.eql(error.value)

          expect(lookup.INDEX(column, 6, 1)).to.eql(error.ref)
          expect(lookup.INDEX(column, -1, 1)).to.eql(error.value)
          expect(lookup.INDEX(column, '', 1)).to.eql(error.value)
        })
      })

      const twoDimensionRange = [
        ['Banana', 'Apple'],
        ['Strawberry', 'Pineapple']
      ]
      describe('and two dimensions Range', () => {
        it('should return the correct value', () => {
          expect(lookup.INDEX(twoDimensionRange, 2, 1)).to.equal('Strawberry')
          expect(lookup.INDEX(twoDimensionRange, 1, 2)).to.equal('Apple')

          expect(lookup.INDEX(twoDimensionRange, 0, 1)).to.eql([['Banana'], ['Strawberry']])
          expect(lookup.INDEX(twoDimensionRange, 1, 0)).to.eql([['Banana', 'Apple']])
          expect(lookup.INDEX(twoDimensionRange, 0, 0)).to.eql(twoDimensionRange)
        })

        it('should throw an error if row or column number is out of range', () => {
          expect(lookup.INDEX(twoDimensionRange, 1, 3)).to.equal(error.ref)
          expect(lookup.INDEX(twoDimensionRange, 3, 1)).to.equal(error.ref)

          expect(lookup.INDEX(twoDimensionRange, -1, 1)).to.equal(error.value)
          expect(lookup.INDEX(twoDimensionRange, 1, -1)).to.equal(error.value)
        })
      })

      it('should return an error in case of error', () => {
        Object.values(error).forEach((err) => {
          expect(lookup.INDEX(err, 2)).to.equal(err)
          expect(lookup.INDEX(1, err)).to.equal(err)

          expect(lookup.INDEX(err, 1, 1)).to.equal(err)
          expect(lookup.INDEX(1, err, 1)).to.equal(err)
          expect(lookup.INDEX(1, 1, err)).to.equal(err)
        })
      })

      it('should return an error because of incorrect number of arguments', () => {
        expect(lookup.INDEX()).to.equal(error.na)
        expect(lookup.INDEX('')).to.equal(error.na)
        expect(lookup.INDEX(row, 1, 1, 1)).to.equal(error.na)
      })
    })
  })

  xit('AREAS', () => {
    expect(lookup.AREAS).to.throw('AREAS is not implemented')
  })

  xit('FORMULATEXT', () => {
    expect(lookup.FORMULATEXT).to.throw('FORMULATEXT is not implemented')
  })

  xit('GETPIVOTDATA', () => {
    expect(lookup.GETPIVOTDATA).to.throw('GETPIVOTDATA is not implemented')
  })

  xit('RTD', () => {
    expect(lookup.RTD).to.throw('RTD is not implemented')
  })

  it('DROP', () => {
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        2
      )
    ).to.eql([[7, 8, 9]])
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        undefined,
        2
      )
    ).to.eql([[3], [6], [9]])
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        -2
      )
    ).to.eql([[1, 2, 3]])
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        2,
        2
      )
    ).to.eql(9)
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        3,
        0
      )
    ).to.eql(error.calc)
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        -3,
        0
      )
    ).to.eql(error.calc)
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        -2,
        0
      )
    ).not.to.eql(error.calc)
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        4,
        0
      )
    ).to.eql(error.calc)
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        0,
        3
      )
    ).to.eql(error.calc)
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        0,
        -2
      )
    ).not.to.eql(error.calc)
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        0,
        -3
      )
    ).to.eql(error.calc)
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        0,
        4
      )
    ).to.eql(error.calc)
    expect(lookup.DROP('a', 0)).to.eql('a')
    expect(lookup.DROP(555, 0)).to.eql(555)
    expect(lookup.DROP('true', 0)).to.eql('true')
    expect(lookup.DROP(true, 0)).to.eql(true)
    expect(lookup.DROP(false, 0)).to.eql(false)
    expect(lookup.DROP('a', 1)).to.eql(error.calc)
    expect(lookup.DROP(555, 1)).to.eql(error.calc)
    expect(lookup.DROP('true', 1)).to.eql(error.calc)
    expect(lookup.DROP(true, 1)).to.eql(error.calc)
    expect(lookup.DROP(false, 1)).to.eql(error.calc)
    expect(lookup.DROP('a', -1)).to.eql(error.calc)
    expect(lookup.DROP(555, -1)).to.eql(error.calc)
    expect(lookup.DROP('true', -1)).to.eql(error.calc)
    expect(lookup.DROP(true, -1)).to.eql(error.calc)
    expect(lookup.DROP(false, -1)).to.eql(error.calc)
    expect(lookup.DROP(undefined, -1)).to.equal(error.value)
    expect(lookup.DROP(undefined, 0)).to.equal(error.value)
    expect(lookup.DROP(undefined, 1)).to.equal(error.value)
    expect(lookup.DROP(null, -1)).to.equal(error.calc)
    expect(lookup.DROP(null, 0)).to.equal(0)
    expect(lookup.DROP(null, 1)).to.equal(error.calc)
    expect(lookup.DROP([[5], [5]], true)).to.eql(5)
    expect(lookup.DROP([[5], [5]], false)).to.eql([[5], [5]])
    expect(lookup.DROP([[5, 5]], undefined, 0)).to.eql([[5, 5]])
    expect(lookup.DROP([[5, 5]], null, 0)).to.eql([[5, 5]])
    expect(lookup.DROP([[5, 5]], 0, true)).to.eql(5)
    expect(lookup.DROP([[5, 5]], 0, false)).to.eql([[5, 5]])
    expect(lookup.DROP([[5, 5]], 0, undefined)).to.eql([[5, 5]])
    expect(lookup.DROP([[5, 5]], 0, null)).to.eql([[5, 5]])
    expect(lookup.DROP([[5, 5]], undefined, 0)).to.eql([[5, 5]])
    expect(lookup.DROP([[5, 5]], null, 0)).to.eql([[5, 5]])
    expect(lookup.DROP([[5, 5]], 'hello', 0)).to.eql(error.value)
    expect(
      lookup.DROP(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        2,
        2,
        1
      )
    ).to.eql(error.na)
    expect(
      lookup.DROP([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
    ).to.eql(error.na)
    expect(lookup.DROP()).to.eql(error.na)

    Object.values(error).forEach((err) => {
      expect(lookup.DROP(err, 2, 2)).to.eql(error.calc)
      expect(lookup.DROP([[5, 5]], err, 0)).to.equal(err)
      expect(lookup.DROP([[5, 5]], 0, err)).to.equal(err)
    })
  })

  it('EXPAND', () => {
    expect(
      lookup.EXPAND(
        [
          [1, 2],
          [3, 4]
        ],
        3,
        3
      )
    ).to.eql([
      [1, 2, error.na],
      [3, 4, error.na],
      [error.na, error.na, error.na]
    ])
    expect(
      lookup.EXPAND(
        [
          [1, 2],
          [3, 4]
        ],
        3,
        3,
        ''
      )
    ).to.eql([
      [1, 2, ''],
      [3, 4, ''],
      ['', '', '']
    ])
    expect(lookup.EXPAND(1, 3, 3, '-')).to.eql([
      [1, '-', '-'],
      ['-', '-', '-'],
      ['-', '-', '-']
    ])
    expect(lookup.EXPAND(1, 3, 3, '-')).to.eql([
      [1, '-', '-'],
      ['-', '-', '-'],
      ['-', '-', '-']
    ])
    expect(lookup.EXPAND('hello', 2)).to.eql([['hello'], [error.na]])
    expect(lookup.EXPAND('hello', 2, 2)).to.eql([
      ['hello', error.na],
      [error.na, error.na]
    ])
    expect(lookup.EXPAND(true, 2, 2)).to.eql([
      [true, error.na],
      [error.na, error.na]
    ])
    expect(lookup.EXPAND(false, 2, 2)).to.eql([
      [false, error.na],
      [error.na, error.na]
    ])
    expect(
      lookup.EXPAND(
        [
          [1, 2],
          [3, 4]
        ],
        1,
        1
      )
    ).to.eql(error.value)
    expect(lookup.EXPAND('hello', true, 2)).to.eql([['hello', error.na]])
    expect(lookup.EXPAND('hello', false, 2)).to.eql(error.value)
    expect(lookup.EXPAND('hello', [[1, 2]], 2)).to.eql(error.value)
    expect(lookup.EXPAND('hello', 1, [[1, 2]])).to.eql(error.value)
    expect(lookup.EXPAND('hello', 1, 1, [[1, 2]])).to.eql(error.value)
    expect(lookup.EXPAND('hello', 2, true)).to.eql([['hello'], [error.na]])
    expect(lookup.EXPAND('hello', 2, false)).to.eql(error.value)
    expect(lookup.EXPAND(-1, 2, 2)).to.eql([
      [-1, error.na],
      [error.na, error.na]
    ])
    expect(lookup.EXPAND(undefined, 2)).to.equal(error.value)
    expect(lookup.EXPAND(1, undefined)).to.equal(1)
    expect(lookup.EXPAND(1, undefined, undefined)).to.equal(1)
    expect(lookup.EXPAND(1, 2, 2, undefined)[1][1]).to.equal(error.na)
    expect(lookup.EXPAND(null, 2)).to.equal(error.value)
    expect(lookup.EXPAND(1, null)).to.equal(error.value)
    expect(lookup.EXPAND(1, 1, null)).to.equal(error.value)
    expect(lookup.EXPAND(1, 2, 2, null)[1][1]).to.equal(null)
    expect(lookup.EXPAND()).to.eql(error.na)
    expect(
      lookup.EXPAND([
        [1, 2],
        [3, 4]
      ])
    ).to.eql(error.na)
    expect(
      lookup.EXPAND(
        [
          [1, 2],
          [3, 4]
        ],
        3,
        3,
        'pad',
        1
      )
    ).to.eql(error.na)

    Object.values(error).forEach((err) => {
      expect(lookup.EXPAND(err, 2, 2)).to.eql([
        [err, error.na],
        [error.na, error.na]
      ])
      expect(lookup.EXPAND(1, err)).to.equal(err)
      expect(lookup.EXPAND(1, 1, err)).to.equal(err)
      expect(lookup.EXPAND(1, 2, 2, err)).to.eql([
        [1, err],
        [err, err]
      ])
    })
  })

  it('HSTACK', () => {
    expect(
      lookup.HSTACK(
        [
          ['A', 'B', 'C'],
          ['D', 'E', 'F']
        ],
        [
          ['AA', 'BB', 'CC'],
          ['DD', 'EE', 'FF']
        ]
      )
    ).to.eql([
      ['A', 'B', 'C', 'AA', 'BB', 'CC'],
      ['D', 'E', 'F', 'DD', 'EE', 'FF']
    ])
    expect(
      lookup.HSTACK(
        [
          [1, 2],
          [3, 4],
          [5, 6]
        ],
        [
          ['A', 'B'],
          ['C', 'D']
        ],
        [['X', 'Y']]
      )
    ).to.eql([
      [1, 2, 'A', 'B', 'X', 'Y'],
      [3, 4, 'C', 'D', error.na, error.na],
      [5, 6, error.na, error.na, error.na, error.na]
    ])
    expect(
      lookup.HSTACK(
        [
          [1, 2],
          [3, 4],
          [5, 6]
        ],
        [
          ['A', 'B'],
          ['D', 'E']
        ],
        [
          ['C', error.value],
          ['F', null]
        ]
      )
    ).to.eql([
      [1, 2, 'A', 'B', 'C', error.value],
      [3, 4, 'D', 'E', 'F', 0],
      [5, 6, error.na, error.na, error.na, error.na]
    ])
    expect(lookup.HSTACK('Hello')).to.eql('Hello')
    expect(lookup.HSTACK('Hello', 'World')).to.eql([['Hello', 'World']])
    expect(lookup.HSTACK(true)).to.eql(true)
    expect(lookup.HSTACK(true, false)).to.eql([[true, false]])
    expect(lookup.HSTACK(null)).to.eql(0)
    expect(lookup.HSTACK(null, null)).to.eql([[0, 0]])
    expect(lookup.HSTACK(undefined, undefined)).to.eql(error.value)
    expect(lookup.HSTACK(1)).to.eql(1)
    expect(lookup.HSTACK(1, 2)).to.eql([[1, 2]])
    expect(lookup.HSTACK(1, 2, 3)).to.eql([[1, 2, 3]])
    expect(lookup.HSTACK(1, [['A'], ['A']], 2)).to.eql([
      [1, 'A', 2],
      [error.na, 'A', error.na]
    ])

    Object.values(error).forEach((err) => {
      expect(lookup.HSTACK(err)).to.eql(err)
      expect(lookup.HSTACK(err, err)).to.eql([[err, err]])
    })
  })

  it('CHOOSECOLS', () => {
    expect(
      lookup.CHOOSECOLS(
        [
          [99, 3, 3, 4, 5],
          [3, 7, 8, 9, 10],
          [11, 12, 13, 14, 15],
          [16, 17, 18, 19, 20],
          [21, 22, 23, 24, 25],
          [26, 27, 28, 29, 30]
        ],
        1,
        3,
        5,
        1
      )
    ).to.eql([
      [99, 3, 5, 99],
      [3, 8, 10, 3],
      [11, 13, 15, 11],
      [16, 18, 20, 16],
      [21, 23, 25, 21],
      [26, 28, 30, 26]
    ])

    expect(
      lookup.CHOOSECOLS(
        [
          ['A', 'B', 'C', 'D'],
          ['E', 'F', 'G'],
          ['H', 'I', 'J', 'K']
        ],
        1
      )
    ).to.eql([['A'], ['E'], ['H']])

    expect(lookup.CHOOSECOLS(undefined, 1)).to.equal(error.value)
    expect(lookup.CHOOSECOLS([[null]], 1)).to.eql([[0]])
    expect(
      lookup.CHOOSECOLS(
        [
          [1, 2, 3, 4],
          [5, 6, 7, 8]
        ],
        1,
        5
      )
    ).to.equal(error.value)

    expect(
      lookup.CHOOSECOLS(
        [
          [null, 'B', 'C', 'D'],
          [null, 'F', 'G'],
          ['H', 'I', 'J', 'K']
        ],
        1
      )
    ).to.eql([[0], [0], ['H']])

    expect(
      lookup.CHOOSECOLS([
        [99, 3, 3, 4, 5],
        [3, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25],
        [26, 27, 28, 29, 30]
      ])
    ).to.equal(error.na)
    expect(lookup.CHOOSECOLS()).to.equal(error.na)
    expect(lookup.CHOOSECOLS([[null]], 1)).to.eql([[0]])
    expect(lookup.CHOOSECOLS(undefined)).to.equal(error.na)
    expect(lookup.CHOOSECOLS([[1, 2, 3]])).to.equal(error.na)
    expect(lookup.CHOOSECOLS([[1, 2, 3]], undefined, 1)).to.equal(error.value)
    expect(lookup.CHOOSECOLS([[1, 2, 3]], error.calc)).to.equal(error.calc)
    expect(lookup.CHOOSECOLS(undefined, error.calc)).to.equal(error.value)
    expect(lookup.CHOOSECOLS([[1], [0], [2]], error.calc, error.na)).to.equal(error.calc)
  })

  it('CHOOSEROWS', () => {
    expect(
      lookup.CHOOSEROWS(
        [
          [99, 3, 3, 4, 5],
          [3, 7, 8, 9, 10],
          [11, 12, 13, 14, 15],
          [16, 17, 18, 19, 20],
          [21, 22, 23, 24, 25],
          [26, 27, 28, 29, 30]
        ],
        1,
        3,
        5,
        1
      )
    ).to.eql([
      [99, 3, 3, 4, 5],
      [11, 12, 13, 14, 15],
      [21, 22, 23, 24, 25],
      [99, 3, 3, 4, 5]
    ])

    expect(
      lookup.CHOOSEROWS(
        [
          ['A', 'B', 'C', 'D'],
          ['E', 'F', 'G'],
          ['H', 'I', 'J', 'K']
        ],
        1
      )
    ).to.eql([['A', 'B', 'C', 'D']])

    expect(lookup.CHOOSEROWS(undefined, 1)).to.equal(error.value)
    expect(lookup.CHOOSEROWS()).to.equal(error.na)

    expect(lookup.CHOOSEROWS([[null]], 1)).to.eql([[0]])
    expect(
      lookup.CHOOSEROWS(
        [
          [1, 2, 3, 4],
          [5, 6, 7, 8]
        ],
        1,
        5
      )
    ).to.equal(error.value)

    expect(
      lookup.CHOOSEROWS(
        [
          [null, 'B', 'C', 'D'],
          [null, 'F', 'G'],
          ['H', 'I', 'J', 'K']
        ],
        1,
        2
      )
    ).to.eql([
      [0, 'B', 'C', 'D'],
      [0, 'F', 'G']
    ])

    expect(
      lookup.CHOOSEROWS(
        [
          [null, true, false, 'A'],
          [true, null, true, 'B']
        ],
        1,
        2
      )
    ).to.eql([
      [0, true, false, 'A'],
      [true, 0, true, 'B']
    ])

    expect(
      lookup.CHOOSEROWS([
        [99, 3, 3, 4, 5],
        [3, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25],
        [26, 27, 28, 29, 30]
      ])
    ).to.equal(error.na)

    expect(lookup.CHOOSEROWS([[1, 2, 3]], error.calc)).to.equal(error.calc)
    expect(lookup.CHOOSEROWS(undefined, error.calc)).to.equal(error.value)
    expect(lookup.CHOOSEROWS([[1], [0], [2]], error.calc, error.na)).to.equal(error.calc)
  })

  it('XMATCH', () => {
    // numbers with linear search_mode
    expect(lookup.XMATCH(12, [[25, 98, 34, 66, 346, 88]], 1, 1)).to.equal(1)
    expect(lookup.XMATCH(12, [[25, 98, 34, 66, 346, 88]], 0, 1)).to.equal(error.na)
    expect(lookup.XMATCH(66, [[25, 98, 34, 66, 346, 88]], 1, 1)).to.equal(4)
    expect(lookup.XMATCH(33, [[25, 98, 34, 66, 346, 88]], -1, 1)).to.equal(1)
    expect(lookup.XMATCH(33, [[25, 98, 34, 66, 346, 88]], -1, -1)).to.equal(1)
    expect(lookup.XMATCH(1, [[0, 2, 2, 0]], -1, 1)).to.equal(1)
    expect(lookup.XMATCH(0, [[1, 2, 2, 2]], -1, 1)).to.equal(error.na)
    expect(lookup.XMATCH(15000, [[42000, 35000, 25000, 15901, 13801, 12181, 9201]], 1)).to.equal(4)
    // strings with linear search_mode
    expect(lookup.XMATCH('apple', [['Grape', 'Pera', 'Apple', 'Light', 'Dark']], 1, 1)).to.equal(3)
    expect(lookup.XMATCH('apple', [['Grape', 'Pera', 'Apple', 'Light', 'Dark']], -1, 1)).to.equal(3)
    expect(lookup.XMATCH('apple', [['Grape', 'Apple', 'Light', 'Dark']], -1, -1)).to.equal(2)
    expect(lookup.XMATCH('apple', [['Grape', 'Light', 'Dark', 'Apple']], -1, -1)).to.equal(4)
    expect(lookup.XMATCH('gra', [['Grape', 'Light', 'Dark', 'Apple']], -1, -1)).to.equal(3)
    expect(lookup.XMATCH('gra', [['Grape', 'Light', 'Dark', 'Apple']], 1, -1)).to.equal(1)
    expect(lookup.XMATCH('grapee', [['Grape', 'Dark']], 1, 1)).to.equal(error.na)
    expect(lookup.XMATCH('grapee', [['Grape', 'Dark', 'Carlos', 'Let']], 1, 1)).to.equal(4)
    expect(lookup.XMATCH('grapee', [['Grape', 'Dark', 'Carlos', 'Let']], -1, 1)).to.equal(1)
    expect(lookup.XMATCH('grapee', [['Grape', 'Dark', 'Carlos', 'Let']], 1, -1)).to.equal(4)
    expect(lookup.XMATCH('grapee', [['Grape', 'Dark', 'Carlos', 'Let']], -1, -1)).to.equal(1)
    expect(lookup.XMATCH('grapee', [['Grape', 'Dark', 'Carlos', 'Let']], 0, 1)).to.equal(error.na)

    // booleans with linear search_mode
    expect(lookup.XMATCH(true, [[true, false]], 0, 1)).to.equal(1)
    expect(lookup.XMATCH(true, [[false, false, false]], 0, 1)).to.equal(error.na)
    expect(lookup.XMATCH(true, [[false, false, true, false]], 0, 1)).to.equal(3)
    expect(lookup.XMATCH(true, [[false, true, true, false]], 1, 1)).to.equal(2)
    expect(lookup.XMATCH(true, [[false, true, true, false]], 1, 1)).to.equal(2)
    expect(lookup.XMATCH(true, [[false, true, true, false]], -1, 1)).to.equal(2)

    // numbers with binary search, when search_mode in [2, -2]
    expect(lookup.XMATCH(7, [[1, 3, 5, 7, 9, 11, 13, 15, 17]], 1, 2)).to.equal(4)
    expect(lookup.XMATCH(6, [[1, 3, 5, 7, 9, 11, 13, 15, 17]], -1, 2)).to.equal(3)
    expect(lookup.XMATCH(15.99, [[-9, 4.5, 7, 9, 11, 13, 15, 17, 888]], -1, 2)).to.equal(7)
    expect(lookup.XMATCH(15.99, [[-9, 4.5, 7, 9, 11, 13, 15, 17, 888]], -1, 2)).to.equal(7)
    expect(lookup.XMATCH(15.99, [[0, 22]], -1, 2)).to.equal(1)
    expect(lookup.XMATCH(15.99, [[0]], -1, 2)).to.equal(1)
    expect(lookup.XMATCH(15.99, [[0, 22]], 1, 2)).to.equal(2)
    expect(lookup.XMATCH(1, [[0, 1, 1, 0]], 1, 2)).to.equal(2)
    expect(lookup.XMATCH(1, [[9, 9, 8, 7]], 1, 2)).to.equal(1)
    expect(lookup.XMATCH(1, [[9, 9, 8, 7, 9, 9, 8, 7]], 1, 2)).to.equal(1)
    expect(lookup.XMATCH(1, [[1, 1, 0, 0, 1, 1, 1, 1]], 1, 2)).to.equal(5)
    expect(lookup.XMATCH(1, [[1, 1, 0, 0, 1, 1, 1, 0]], 1, 2)).to.equal(5)

    // numbers with binary search, when search_mode = -2
    expect(lookup.XMATCH(1, [[1, 1, 0, 1, 1, 1, 1, 1]], 1, -2)).to.equal(8)
    expect(lookup.XMATCH(22, [[34, 98, 12, 0, -99, 3]], 1, -2)).to.equal(2)
    expect(lookup.XMATCH(22, [[21.9, -1, 12, 0, -99, 3]], 1, -2)).to.equal(error.na)
    expect(lookup.XMATCH(-100, [[21.9, -1, 12, 0, -99, 3]], 1, -2)).to.equal(6)
    expect(lookup.XMATCH(0, [[21.9, -1, 12, 0, -99, 3]], 1, -2)).to.equal(4)
    expect(lookup.XMATCH(3, [[21.9, -1, 12, 0, -99, 3]], 1, -2)).to.equal(3)
    expect(lookup.XMATCH(3, [[false, -1, true, true, false, 3]], 1, -2)).to.equal(6)
    expect(lookup.XMATCH(3, [[false, -1, true, true, false, -3]], 1, -2)).to.equal(5)

    // numbers with binary search, when match_mode = -1 and search_mode = -2
    expect(lookup.XMATCH(3, [[21.9, -1, 12, 0, -99, 3]], -1, -2)).to.equal(4)
    expect(lookup.XMATCH(3, [[false, -1, true, true, false, -3]], -1, -2)).to.equal(6)
    expect(lookup.XMATCH(3, [[false, -1, true, true, false, 6]], -1, -2)).to.equal(error.na)
    expect(lookup.XMATCH(3, [[false, 1, 2, true, false, 6]], -1, -2)).to.equal(2)
    expect(lookup.XMATCH(true, [[false, 1, 2, true, false, 6]], -1, -2)).to.equal(1)

    // numbers with binary search with exact match (match_mode = 0)
    expect(lookup.XMATCH(3, [[21.9, -1, 12, 0, -99, 3]], 0, 2)).to.equal(error.na)
    expect(lookup.XMATCH(-99, [[21.9, -1, 12, 0, -99, 3]], 0, 2)).to.equal(error.na)
    expect(lookup.XMATCH(12, [[21.9, -1, 12, 0, -99, 3]], 0, 2)).to.equal(3)
    expect(lookup.XMATCH(0, [[21.9, -1, -6, 0, 4, 3]], 0, 2)).to.equal(4)
    expect(lookup.XMATCH(0, [[21.9, -1, -6]], 0, 2)).to.equal(error.na)
    expect(lookup.XMATCH(21.9, [[21.9, -1, -6]], 0, 2)).to.equal(error.na)
    expect(lookup.XMATCH(-1, [[21.9, -1, -6]], 0, 2)).to.equal(2)
    expect(lookup.XMATCH(3, [[21.9, -1, 3]], 0, 2)).to.equal(3)
    expect(lookup.XMATCH(0, [[0, 1]], 0, 2)).to.equal(1)
    expect(lookup.XMATCH(1, [[0, 1]], 0, 2)).to.equal(2)
    expect(lookup.XMATCH(1, [[0, 1, 0, 0, 1]], 0, 2)).to.equal(5)

    expect(lookup.XMATCH(1, [[0, 1, 0, 0, 1]], 0, -2)).to.equal(error.na)
    expect(lookup.XMATCH(1, [[1, 1, 0, 0, 1]], 0, -2)).to.equal(2)
    expect(lookup.XMATCH(1, [[true, false, 1]], 0, -2)).to.equal(3)

    // data merge search tests
    expect(lookup.XMATCH('zipzap', [[false, 0, 1, true, true]], 1, 1)).to.equal(1)
    expect(lookup.XMATCH('grape', [[false, 0, 1, true, true, 'zebra']], 1, 1)).to.equal(6)
    expect(lookup.XMATCH('grape', [[false, 0, 1, true, true, 'zebra']], 1, -1)).to.equal(6)
    expect(lookup.XMATCH('grape', [[false, 0, 1, true, true, 'zebra']], -1, -1)).to.equal(3)
    expect(lookup.XMATCH('grape', [[false, 'kvc', true]], -1, -1)).to.equal(error.na)
    expect(lookup.XMATCH('grape', [[false, 'kvc', true]], 1, -1)).to.equal(2)

    // binary search with strings
    expect(lookup.XMATCH('apple', [['Grape', 'Pera', 'Apple', 'Light', 'Dark']], 1, 2)).to.equal(3)
    expect(lookup.XMATCH('apple', [['Grape', 'Pera', 'Apple', 'Light', 'Dark']], 1, -2)).to.equal(3)
    expect(lookup.XMATCH('apple', [['Grape', 'Pera', 'Apple', 'Light', 'Dark']], 0, 2)).to.equal(3)
    expect(lookup.XMATCH('apple', [['Grape', 'Apple', 'Pera', 'Light', 'Dark']], -1, 2)).to.equal(error.na)
    expect(lookup.XMATCH('apple', [['Grape', 'Apple', 'Pera', 'Light', 'Dark']], 0, 2)).to.equal(error.na)
    expect(lookup.XMATCH('grapee', [['Grape', 'Dark', 'Carlos', 'Let']], -1, 2)).to.equal(3)

    // empty lookup_range tests
    expect(lookup.XMATCH('a', undefined, 0, 1)).to.equal(error.value)
    expect(lookup.XMATCH(undefined, undefined, 2, 0)).to.equal(error.value)
    expect(lookup.XMATCH(123, undefined, 1, 1)).to.equal(error.value)
    expect(lookup.XMATCH(123, undefined, -1, 1)).to.equal(error.value)
    expect(lookup.XMATCH(123, undefined, 1, -1)).to.equal(error.value)
    expect(lookup.XMATCH(123, undefined, -1, -1)).to.equal(error.value)
    expect(lookup.XMATCH(15.99, undefined, -1, 2)).to.equal(error.value)
    expect(lookup.XMATCH(15.99, undefined, 1, 2)).to.equal(error.value)
    expect(lookup.XMATCH(15.99, undefined, 1, -2)).to.equal(error.value)
    expect(lookup.XMATCH(15.99, undefined, -1, -2)).to.equal(error.value)

    // omitted arguments
    expect(lookup.XMATCH(undefined, [[false, 'kvc', null, true, true, 'zebra']], 1, 1)).to.equal(3)
    expect(lookup.XMATCH(undefined, [[false, null, null, true, true, 'zebra']], 1, 1)).to.equal(2)
    expect(lookup.XMATCH(7, undefined, 1, 1)).to.equal(error.value)
    expect(lookup.XMATCH(undefined, undefined, 1, 1)).to.equal(error.value)
  })

  describe('XLOOKUP', () => {
    const testArray1 = [
      ['tesTe 1'],
      ['teste 3'],
      [''],
      [false],
      [true],
      [null],
      [-3],
      ['-3'],
      [-1.5],
      ['-1.5'],
      [0],
      ['0'],
      [3],
      ['3'],
      ['false'],
      ['true'],
      [error.nil],
      [error.div0],
      [error.value],
      [error.ref],
      [error.name],
      [error.num],
      [error.na],
      [error.calc],
      [error.spill]
    ]

    const testArray2 = [
      [1],
      [2],
      [3],
      [4],
      [5],
      [6],
      [7],
      [8],
      [9],
      [10],
      [11],
      [12],
      [13],
      [14],
      [15],
      [16],
      [17],
      [18],
      [19],
      [20],
      [21],
      [22],
      [23],
      [24],
      [25]
    ]

    describe('search_mode -2', () => {
      it('match_mode -1', () => {
        expect(
          lookup.XLOOKUP('BOB', [['john'], ['carlos'], ['bOb'], ['ana']], [[1], [2], [3], [4]], 'test', -1, -2)
        ).to.eql([[3]])
        expect(
          lookup.XLOOKUP('BO', [['john'], ['bOb'], ['carlos'], ['ana']], [[1], [2], [3], [4]], 'test', -1, -2)
        ).to.eql([[4]])
        expect(
          lookup.XLOOKUP('*', [['john'], ['carlos'], ['bob'], ['ana']], [[1], [2], [3], [4]], 'test', -1, -2)
        ).to.eql([[4]])

        expect(lookup.XLOOKUP(21, [[20], [6], [17], [11]], [[1], [2], [3], [4]], 'test', -1, -2)).to.eql([[1]])
        expect(lookup.XLOOKUP(6, [[20], [6], [17], [11]], [[1], [2], [3], [4]], 'test', -1, -2)).to.eql([[1]])
        expect(lookup.XLOOKUP(5, [[20], [6], [17], [11]], [[1], [2], [3], [4]], 'test', -1, -2)).to.eql([['test']])

        expect(lookup.XLOOKUP(20, [['20'], ['6'], ['17'], ['11']], [[1], [2], [3], [4]], 'test', -1, -2)).to.eql([
          ['test']
        ])
        expect(lookup.XLOOKUP('17', [[20], [6], [17], [11]], [[1], [2], [3], [4]], 'test', -1, -2)).to.eql([[1]])
        expect(lookup.XLOOKUP('a', [[20], [6], [17], [11]], [[1], [2], [3], [4]], 'test', -1, -2)).to.eql([[1]])
      })

      it('match_mode 0', () => {
        expect(lookup.XLOOKUP('bob', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 0, -2)).to.eql([[3]])
        expect(lookup.XLOOKUP(3, [[4, 3, 2, 1]], [['ana', 'bob', 'carlos', 'john']], 0, 0, -2)).to.eql([['bob']])
        expect(lookup.XLOOKUP([[3, 4]], [[4, 3, 2, 1]], [['ana', 'bob', 'carlos', 'john']], 0, 0, -2)).to.eql([
          ['bob', 'ana']
        ])
      })

      it('match_mode 1', () => {})

      it('match_mode 2', () => {
        expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 2, -2)).to.eql([
          [error.value]
        ])
      })
    })

    describe('search_mode -1', () => {
      it('match_mode -1', () => {
        expect(lookup.XLOOKUP(46500, [[9700, 39500, 84000, 160000]], [[0.1, 0.2, 0.3, 0.35]], 0, -1, -1)).to.eql([
          [0.2]
        ])

        expect(lookup.XLOOKUP(4, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', -1, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP(5, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', -1, -1)).to.eql([[2]])
        expect(lookup.XLOOKUP(6, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', -1, -1)).to.eql([[2]])
        expect(lookup.XLOOKUP(10, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', -1, -1)).to.eql([[4]])

        expect(lookup.XLOOKUP('*', testArray1, testArray2, 'test', -1, -1)).to.eql([[3]])
        expect(lookup.XLOOKUP('=*', testArray1, testArray2, 'test', -1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', -1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('', testArray1, testArray2, 'test', -1, -1)).to.eql([[3]])
        expect(lookup.XLOOKUP(false, testArray1, testArray2, 'test', -1, -1)).to.eql([[4]])
        expect(lookup.XLOOKUP('false', testArray1, testArray2, 'test', -1, -1)).to.eql([[15]])
        expect(lookup.XLOOKUP(true, testArray1, testArray2, 'test', -1, -1)).to.eql([[5]])
        expect(lookup.XLOOKUP('true', testArray1, testArray2, 'test', -1, -1)).to.eql([[16]])
        expect(lookup.XLOOKUP(null, testArray1, testArray2, 'test', -1, -1)).to.eql([[6]])
        expect(lookup.XLOOKUP(0, testArray1, testArray2, 'test', -1, -1)).to.eql([[11]])
        expect(lookup.XLOOKUP('0', testArray1, testArray2, 'test', -1, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP(3, testArray1, testArray2, 'test', -1, -1)).to.eql([[13]])
        expect(lookup.XLOOKUP('3', testArray1, testArray2, 'test', -1, -1)).to.eql([[10]])
        expect(lookup.XLOOKUP(-1.5, testArray1, testArray2, 'test', -1, -1)).to.eql([[9]])
        expect(lookup.XLOOKUP('-1.5', testArray1, testArray2, 'test', -1, -1)).to.eql([[10]])
        expect(lookup.XLOOKUP('=false', testArray1, testArray2, 'test', -1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('=3', testArray1, testArray2, 'test', -1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('>0', testArray1, testArray2, 'test', -1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('<>', testArray1, testArray2, 'test', -1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', -1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('TESTE 1', testArray1, testArray2, 'test', -1, -1)).to.eql([[1]])
        expect(lookup.XLOOKUP('#*', testArray1, testArray2, 'test', -1, -1)).to.eql([[3]])
        expect(lookup.XLOOKUP('#nome?', testArray1, testArray2, 'test', -1, -1)).to.eql([[3]])
        expect(lookup.XLOOKUP('<>#*', testArray1, testArray2, 'test', -1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('<>#nome?', testArray1, testArray2, 'test', -1, -1)).to.eql([[14]])

        expect(lookup.XLOOKUP(true, true, error.calc, 'test', -1, -1)).to.eql([[error.calc]])

        Object.values(error).forEach((err) => {
          expect(lookup.XLOOKUP(err, testArray1, testArray2, 'test', -1, -1)).to.eql([[err]])
        })
      })

      it('match_mode 0', () => {
        expect(lookup.XLOOKUP(4, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP(5, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 0, -1)).to.eql([[2]])
        expect(lookup.XLOOKUP(6, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP(10, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 0, -1)).to.eql([['test']])

        expect(lookup.XLOOKUP('*', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('=*', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('', testArray1, testArray2, 'test', 0, -1)).to.eql([[3]])
        expect(lookup.XLOOKUP(false, testArray1, testArray2, 'test', 0, -1)).to.eql([[4]])
        expect(lookup.XLOOKUP('false', testArray1, testArray2, 'test', 0, -1)).to.eql([[15]])
        expect(lookup.XLOOKUP(true, testArray1, testArray2, 'test', 0, -1)).to.eql([[5]])
        expect(lookup.XLOOKUP('true', testArray1, testArray2, 'test', 0, -1)).to.eql([[16]])
        expect(lookup.XLOOKUP(null, testArray1, testArray2, 'test', 0, -1)).to.eql([[6]])
        expect(lookup.XLOOKUP(0, testArray1, testArray2, 'test', 0, -1)).to.eql([[11]])
        expect(lookup.XLOOKUP('0', testArray1, testArray2, 'test', 0, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP(3, testArray1, testArray2, 'test', 0, -1)).to.eql([[13]])
        expect(lookup.XLOOKUP('3', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP(-1.5, testArray1, testArray2, 'test', 0, -1)).to.eql([[9]])
        expect(lookup.XLOOKUP('-1.5', testArray1, testArray2, 'test', 0, -1)).to.eql([[10]])
        expect(lookup.XLOOKUP('=false', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('=3', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('>0', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('TESTE 1', testArray1, testArray2, 'test', 0, -1)).to.eql([[1]])
        expect(lookup.XLOOKUP('#*', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('#nome?', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>#*', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>#nome?', testArray1, testArray2, 'test', 0, -1)).to.eql([['test']])

        expect(lookup.XLOOKUP(true, true, error.calc, 'test', 0, -1)).to.eql([[error.calc]])

        Object.values(error).forEach((err) => {
          expect(lookup.XLOOKUP(err, testArray1, testArray2, 'test', 0, -1)).to.eql([[err]])
        })
      })

      it('match_mode 1', () => {
        expect(
          lookup.XLOOKUP(46500, [[9700], [39500], [84000], [160000]], [[0.1], [0.2], [0.3], [0.35]], 0, 1, -1)
        ).to.eql([[0.3]])

        expect(lookup.XLOOKUP(4, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, -1)).to.eql([[2]])
        expect(lookup.XLOOKUP(5, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, -1)).to.eql([[2]])
        expect(lookup.XLOOKUP(6, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, -1)).to.eql([[6]])
        expect(lookup.XLOOKUP(10, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, -1)).to.eql([['test']])

        expect(lookup.XLOOKUP('*', testArray1, testArray2, 'test', 1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('=*', testArray1, testArray2, 'test', 1, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 1, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP('', testArray1, testArray2, 'test', 1, -1)).to.eql([[3]])
        expect(lookup.XLOOKUP(false, testArray1, testArray2, 'test', 1, -1)).to.eql([[4]])
        expect(lookup.XLOOKUP('false', testArray1, testArray2, 'test', 1, -1)).to.eql([[15]])
        expect(lookup.XLOOKUP(true, testArray1, testArray2, 'test', 1, -1)).to.eql([[5]])
        expect(lookup.XLOOKUP('true', testArray1, testArray2, 'test', 1, -1)).to.eql([[16]])
        expect(lookup.XLOOKUP(null, testArray1, testArray2, 'test', 1, -1)).to.eql([[6]])
        expect(lookup.XLOOKUP(0, testArray1, testArray2, 'test', 1, -1)).to.eql([[11]])
        expect(lookup.XLOOKUP('0', testArray1, testArray2, 'test', 1, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP(3, testArray1, testArray2, 'test', 1, -1)).to.eql([[13]])
        expect(lookup.XLOOKUP('3', testArray1, testArray2, 'test', 1, -1)).to.eql([[8]])
        expect(lookup.XLOOKUP(-1.5, testArray1, testArray2, 'test', 1, -1)).to.eql([[9]])
        expect(lookup.XLOOKUP('-1.5', testArray1, testArray2, 'test', 1, -1)).to.eql([[10]])
        expect(lookup.XLOOKUP('=false', testArray1, testArray2, 'test', 1, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP('=3', testArray1, testArray2, 'test', 1, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP('>0', testArray1, testArray2, 'test', 1, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP('<>', testArray1, testArray2, 'test', 1, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 1, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP('TESTE 1', testArray1, testArray2, 'test', 1, -1)).to.eql([[1]])
        expect(lookup.XLOOKUP('#*', testArray1, testArray2, 'test', 1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('#nome?', testArray1, testArray2, 'test', 1, -1)).to.eql([[14]])
        expect(lookup.XLOOKUP('<>#*', testArray1, testArray2, 'test', 1, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP('<>#nome?', testArray1, testArray2, 'test', 1, -1)).to.eql([[12]])

        expect(lookup.XLOOKUP(true, true, error.calc, 'test', 1, -1)).to.eql([[error.calc]])

        Object.values(error).forEach((err) => {
          expect(lookup.XLOOKUP(err, testArray1, testArray2, 'test', 1, -1)).to.eql([[err]])
        })
      })

      it('match_mode 2', () => {
        expect(lookup.XLOOKUP('?xcel', [['Axcel', 'Excel', 'Hello', 'Test']], [[1, 2, 3, 4]], 0, 2, -1)).to.eql([[2]])
        expect(
          lookup.XLOOKUP('?xcel', [['Axcel'], ['Excel'], ['Hello'], ['Test']], [[1], [2], [3], [4]], 0, 2, -1)
        ).to.eql([[2]])

        expect(lookup.XLOOKUP(4, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP(5, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 2, -1)).to.eql([[2]])
        expect(lookup.XLOOKUP(6, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP(10, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 2, -1)).to.eql([['test']])

        expect(lookup.XLOOKUP('*', testArray1, testArray2, 'test', 2, -1)).to.eql([[16]])
        expect(lookup.XLOOKUP('=*', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('', testArray1, testArray2, 'test', 2, -1)).to.eql([[3]])
        expect(lookup.XLOOKUP(false, testArray1, testArray2, 'test', 2, -1)).to.eql([[4]])
        expect(lookup.XLOOKUP('false', testArray1, testArray2, 'test', 2, -1)).to.eql([[15]])
        expect(lookup.XLOOKUP(true, testArray1, testArray2, 'test', 2, -1)).to.eql([[5]])
        expect(lookup.XLOOKUP('true', testArray1, testArray2, 'test', 2, -1)).to.eql([[16]])
        expect(lookup.XLOOKUP(null, testArray1, testArray2, 'test', 2, -1)).to.eql([[6]])
        expect(lookup.XLOOKUP(0, testArray1, testArray2, 'test', 2, -1)).to.eql([[11]])
        expect(lookup.XLOOKUP('0', testArray1, testArray2, 'test', 2, -1)).to.eql([[12]])
        expect(lookup.XLOOKUP(3, testArray1, testArray2, 'test', 2, -1)).to.eql([[13]])
        expect(lookup.XLOOKUP('3', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP(-1.5, testArray1, testArray2, 'test', 2, -1)).to.eql([[9]])
        expect(lookup.XLOOKUP('-1.5', testArray1, testArray2, 'test', 2, -1)).to.eql([[10]])
        expect(lookup.XLOOKUP('=false', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('=3', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('>0', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('TESTE 1', testArray1, testArray2, 'test', 2, -1)).to.eql([[1]])
        expect(lookup.XLOOKUP('#*', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('#nome?', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>#*', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>#nome?', testArray1, testArray2, 'test', 2, -1)).to.eql([['test']])

        expect(lookup.XLOOKUP(true, true, error.calc, 'test', 2, -1)).to.eql([[error.calc]])

        Object.values(error).forEach((err) => {
          expect(lookup.XLOOKUP(err, testArray1, testArray2, 'test', 2, -1)).to.eql([[err]])
        })
      })
    })

    describe('search_mode 1', () => {
      it('match_mode -1', () => {
        expect(lookup.XLOOKUP(46500, [[9700, 39500, 84000, 160000]], [[0.1, 0.2, 0.3, 0.35]], 0, -1)).to.eql([[0.2]])
        expect(
          lookup.XLOOKUP(46500, [[9700], [39500], [84000], [160000]], [[0.1], [0.2], [0.3], [0.35]], 0, -1)
        ).to.eql([[0.2]])
        expect(lookup.XLOOKUP(9700, [[9700], [39500], [84000], [160000]], [[0.1], [0.2], [0.3], [0.35]], 0, -1)).to.eql(
          [[0.1]]
        )
        expect(lookup.XLOOKUP(9699, [[9700], [39500], [84000], [160000]], [[0.1], [0.2], [0.3], [0.35]], 0, -1)).to.eql(
          [[0]]
        )

        expect(lookup.XLOOKUP(4, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP(5, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP(6, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP(10, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, 1)).to.eql([[4]])

        expect(lookup.XLOOKUP('*', testArray1, testArray2, 'test', 1, 1)).to.eql([[3]])
        expect(lookup.XLOOKUP('=*', testArray1, testArray2, 'test', 1, 1)).to.eql([[14]])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 1, 1)).to.eql([[14]])
        expect(lookup.XLOOKUP('', testArray1, testArray2, 'test', 1, 1)).to.eql([[3]])
        expect(lookup.XLOOKUP(false, testArray1, testArray2, 'test', 1, 1)).to.eql([[4]])
        expect(lookup.XLOOKUP('false', testArray1, testArray2, 'test', 1, 1)).to.eql([[15]])
        expect(lookup.XLOOKUP(true, testArray1, testArray2, 'test', 1, 1)).to.eql([[5]])
        expect(lookup.XLOOKUP('true', testArray1, testArray2, 'test', 1, 1)).to.eql([[16]])
        expect(lookup.XLOOKUP(null, testArray1, testArray2, 'test', 1, 1)).to.eql([[6]])
        expect(lookup.XLOOKUP(0, testArray1, testArray2, 'test', 1, 1)).to.eql([[11]])
        expect(lookup.XLOOKUP('0', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP(3, testArray1, testArray2, 'test', 1, 1)).to.eql([[13]])
        expect(lookup.XLOOKUP('3', testArray1, testArray2, 'test', 1, 1)).to.eql([[10]])
        expect(lookup.XLOOKUP(-1.5, testArray1, testArray2, 'test', 1, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('-1.5', testArray1, testArray2, 'test', 1, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('=false', testArray1, testArray2, 'test', 1, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('=3', testArray1, testArray2, 'test', 1, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('>0', testArray1, testArray2, 'test', 1, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>', testArray1, testArray2, 'test', 1, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 1, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('TESTE 1', testArray1, testArray2, 'test', 1, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP('#*', testArray1, testArray2, 'test', 1, 1)).to.eql([[3]])
        expect(lookup.XLOOKUP('#nome?', testArray1, testArray2, 'test', 1, 1)).to.eql([[3]])
        expect(lookup.XLOOKUP('<>#*', testArray1, testArray2, 'test', 1, 1)).to.eql([[14]])
        expect(lookup.XLOOKUP('<>#nome?', testArray1, testArray2, 'test', 1, 1)).to.eql([[14]])

        expect(lookup.XLOOKUP(true, true, error.calc, 'test', 1, 1)).to.eql([[error.calc]])

        Object.values(error).forEach((err) => {
          expect(lookup.XLOOKUP(err, testArray1, testArray2, 'test', 1, 1)).to.eql([[err]])
        })
      })

      it('match_mode 0', () => {
        expect(
          lookup.XLOOKUP(
            'Brazil',
            [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
            [['+86', '+91', '+1', '+62', '+55']]
          )
        ).to.eql([['+55']])
        expect(
          lookup.XLOOKUP(
            'Brazil',
            [['China'], ['India'], ['United States'], ['Indonesia'], ['Brazil']],
            [['+86'], ['+91'], ['+1'], ['+62'], ['+55']]
          )
        ).to.eql([['+55']])
        expect(
          lookup.XLOOKUP(
            [['Brazil', 'China']],
            [['China'], ['India'], ['United States'], ['Indonesia'], ['Brazil']],
            [['+86'], ['+91'], ['+1'], ['+62'], ['+55']]
          )
        ).to.eql([['+55', '+86']])
        expect(
          lookup.XLOOKUP(
            [['Brazil'], ['China']],
            [['China'], ['India'], ['United States'], ['Indonesia'], ['Brazil']],
            [['+86'], ['+91'], ['+1'], ['+62'], ['+55']]
          )
        ).to.eql([['+55'], ['+86']])

        expect(
          lookup.XLOOKUP(
            8389,
            [[4390], [8604], [8389], [4937]],
            [
              ['Ned Lanning', 'Marketing'],
              ['Margo Hendrix', 'Sales'],
              ['Dianne Pugh', 'Finance'],
              ['Earlene McCarty', 'Accounting']
            ]
          )
        ).to.eql([['Dianne Pugh', 'Finance']])
        expect(
          lookup.XLOOKUP(
            'a',
            [['a'], ['b'], ['c'], ['d']],
            [
              [1, 'john'],
              [2, 'joseph'],
              [3, 'maria'],
              [4, 'ana']
            ]
          )
        ).to.eql([[1, 'john']])
        expect(
          lookup.XLOOKUP(
            [['a'], ['b']],
            [['a'], ['b'], ['c'], ['d']],
            [
              [1, 'john'],
              [2, 'joseph'],
              [3, 'maria'],
              [4, 'ana']
            ]
          )
        ).to.eql([[1], [2]])
        expect(
          lookup.XLOOKUP(
            'a',
            [['a', 'b', 'c', 'd']],
            [
              [1, 2, 3, 4],
              ['john', 'joseph', 'maria', 'ana']
            ]
          )
        ).to.eql([[1], ['john']])
        expect(
          lookup.XLOOKUP(
            [['a', 'b']],
            [['a', 'b', 'c', 'd']],
            [
              [1, 2, 3, 4],
              ['john', 'joseph', 'maria', 'ana']
            ]
          )
        ).to.eql([[1, 2]])

        expect(lookup.XLOOKUP(4, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP(5, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 0, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP(6, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP(10, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 0, 1)).to.eql([['test']])

        expect(lookup.XLOOKUP('*', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('=*', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('', testArray1, testArray2, 'test', 0, 1)).to.eql([[3]])
        expect(lookup.XLOOKUP(false, testArray1, testArray2, 'test', 0, 1)).to.eql([[4]])
        expect(lookup.XLOOKUP('false', testArray1, testArray2, 'test', 0, 1)).to.eql([[15]])
        expect(lookup.XLOOKUP(true, testArray1, testArray2, 'test', 0, 1)).to.eql([[5]])
        expect(lookup.XLOOKUP('true', testArray1, testArray2, 'test', 0, 1)).to.eql([[16]])
        expect(lookup.XLOOKUP(null, testArray1, testArray2, 'test', 0, 1)).to.eql([[6]])
        expect(lookup.XLOOKUP(0, testArray1, testArray2, 'test', 0, 1)).to.eql([[11]])
        expect(lookup.XLOOKUP('0', testArray1, testArray2, 'test', 0, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP(3, testArray1, testArray2, 'test', 0, 1)).to.eql([[13]])
        expect(lookup.XLOOKUP('3', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP(-1.5, testArray1, testArray2, 'test', 0, 1)).to.eql([[9]])
        expect(lookup.XLOOKUP('-1.5', testArray1, testArray2, 'test', 0, 1)).to.eql([[10]])
        expect(lookup.XLOOKUP('=false', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('=3', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('>0', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('TESTE 1', testArray1, testArray2, 'test', 0, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP('#*', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('#nome?', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>#*', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>#nome?', testArray1, testArray2, 'test', 0, 1)).to.eql([['test']])

        expect(lookup.XLOOKUP(true, true, error.calc, 'test', 0, 1)).to.eql([[error.calc]])

        Object.values(error).forEach((err) => {
          expect(lookup.XLOOKUP(err, testArray1, testArray2, 'test', 0, 1)).to.eql([[err]])
        })
      })

      it('match_mode 1', () => {
        expect(lookup.XLOOKUP(46500, [[9700, 39500, 84000, 160000]], [[0.1, 0.2, 0.3, 0.35]], 0, 1)).to.eql([[0.3]])
        expect(lookup.XLOOKUP(46500, [[9700], [39500], [84000], [160000]], [[0.1], [0.2], [0.3], [0.35]], 0, 1)).to.eql(
          [[0.3]]
        )
        expect(
          lookup.XLOOKUP(160000, [[9700], [39500], [84000], [160000]], [[0.1], [0.2], [0.3], [0.35]], 0, 1)
        ).to.eql([[0.35]])
        expect(
          lookup.XLOOKUP(160001, [[9700], [39500], [84000], [160000]], [[0.1], [0.2], [0.3], [0.35]], 0, 1)
        ).to.eql([[0]])

        expect(lookup.XLOOKUP(4, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP(5, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP(6, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, 1)).to.eql([[3]])
        expect(lookup.XLOOKUP(10, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 1, 1)).to.eql([['test']])

        expect(lookup.XLOOKUP('*', testArray1, testArray2, 'test', 1, 1)).to.eql([[14]])
        expect(lookup.XLOOKUP('=*', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP('', testArray1, testArray2, 'test', 1, 1)).to.eql([[3]])
        expect(lookup.XLOOKUP(false, testArray1, testArray2, 'test', 1, 1)).to.eql([[4]])
        expect(lookup.XLOOKUP('false', testArray1, testArray2, 'test', 1, 1)).to.eql([[15]])
        expect(lookup.XLOOKUP(true, testArray1, testArray2, 'test', 1, 1)).to.eql([[5]])
        expect(lookup.XLOOKUP('true', testArray1, testArray2, 'test', 1, 1)).to.eql([[16]])
        expect(lookup.XLOOKUP(null, testArray1, testArray2, 'test', 1, 1)).to.eql([[6]])
        expect(lookup.XLOOKUP(0, testArray1, testArray2, 'test', 1, 1)).to.eql([[11]])
        expect(lookup.XLOOKUP('0', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP(3, testArray1, testArray2, 'test', 1, 1)).to.eql([[13]])
        expect(lookup.XLOOKUP('3', testArray1, testArray2, 'test', 1, 1)).to.eql([[8]])
        expect(lookup.XLOOKUP(-1.5, testArray1, testArray2, 'test', 1, 1)).to.eql([[9]])
        expect(lookup.XLOOKUP('-1.5', testArray1, testArray2, 'test', 1, 1)).to.eql([[10]])
        expect(lookup.XLOOKUP('=false', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP('=3', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP('>0', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP('<>', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP('TESTE 1', testArray1, testArray2, 'test', 1, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP('#*', testArray1, testArray2, 'test', 1, 1)).to.eql([[14]])
        expect(lookup.XLOOKUP('#nome?', testArray1, testArray2, 'test', 1, 1)).to.eql([[14]])
        expect(lookup.XLOOKUP('<>#*', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP('<>#nome?', testArray1, testArray2, 'test', 1, 1)).to.eql([[12]])

        expect(lookup.XLOOKUP(true, true, error.calc, 'test', 1, 1)).to.eql([[error.calc]])

        Object.values(error).forEach((err) => {
          expect(lookup.XLOOKUP(err, testArray1, testArray2, 'test', 1, 1)).to.eql([[err]])
        })
      })

      it('match_mode 2', () => {
        expect(lookup.XLOOKUP('Ya*', [['Axcel', 'Excel', 'Hello', 'Test']], [[1, 2, 3, 4]], 0, 2)).to.eql([[0]])
        expect(lookup.XLOOKUP('?xcel', [['Axcel', 'Excel', 'Hello', 'Test']], [[1, 2, 3, 4]], 0, 2)).to.eql([[1]])
        expect(lookup.XLOOKUP([['Ex*', 'Ex*']], [['Axcel', 'Excel', 'Hello', 'Test']], [[1, 2, 3, 4]], 0, 2)).to.eql([
          [2, 2]
        ])
        expect(lookup.XLOOKUP([['Ex*'], ['Ex*']], [['Axcel', 'Excel', 'Hello', 'Test']], [[1, 2, 3, 4]], 0, 2)).to.eql([
          [2],
          [2]
        ])

        expect(lookup.XLOOKUP('?xcel', [['Axcel', 'Excel', 'Hello', 'Test']], [[1, 2, 3, 4]], 0, 2, 1)).to.eql([[1]])
        expect(
          lookup.XLOOKUP('?xcel', [['Axcel'], ['Excel'], ['Hello'], ['Test']], [[1], [2], [3], [4]], 0, 2, 1)
        ).to.eql([[1]])

        expect(lookup.XLOOKUP(4, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP(5, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 2, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP(6, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP(10, [[5, 5, 8, 9]], [[1, 2, 3, 4]], 'test', 2, 1)).to.eql([['test']])

        expect(lookup.XLOOKUP('*', testArray1, testArray2, 'test', 2, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP('=*', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('', testArray1, testArray2, 'test', 2, 1)).to.eql([[3]])
        expect(lookup.XLOOKUP(false, testArray1, testArray2, 'test', 2, 1)).to.eql([[4]])
        expect(lookup.XLOOKUP('false', testArray1, testArray2, 'test', 2, 1)).to.eql([[15]])
        expect(lookup.XLOOKUP(true, testArray1, testArray2, 'test', 2, 1)).to.eql([[5]])
        expect(lookup.XLOOKUP('true', testArray1, testArray2, 'test', 2, 1)).to.eql([[16]])
        expect(lookup.XLOOKUP(null, testArray1, testArray2, 'test', 2, 1)).to.eql([[6]])
        expect(lookup.XLOOKUP(0, testArray1, testArray2, 'test', 2, 1)).to.eql([[11]])
        expect(lookup.XLOOKUP('0', testArray1, testArray2, 'test', 2, 1)).to.eql([[12]])
        expect(lookup.XLOOKUP(3, testArray1, testArray2, 'test', 2, 1)).to.eql([[13]])
        expect(lookup.XLOOKUP('3', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP(-1.5, testArray1, testArray2, 'test', 2, 1)).to.eql([[9]])
        expect(lookup.XLOOKUP('-1.5', testArray1, testArray2, 'test', 2, 1)).to.eql([[10]])
        expect(lookup.XLOOKUP('=false', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('=3', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('>0', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>*', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('TESTE 1', testArray1, testArray2, 'test', 2, 1)).to.eql([[1]])
        expect(lookup.XLOOKUP('#*', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('#nome?', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>#*', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])
        expect(lookup.XLOOKUP('<>#nome?', testArray1, testArray2, 'test', 2, 1)).to.eql([['test']])

        expect(lookup.XLOOKUP(true, true, error.calc, 'test', 2, 1)).to.eql([[error.calc]])

        Object.values(error).forEach((err) => {
          expect(lookup.XLOOKUP(err, testArray1, testArray2, 'test', 2, 1)).to.eql([[err]])
        })
      })

      it('if_not_found', () => {
        expect(lookup.XLOOKUP('a', [['a', 'b', 'c', 'd']], [[1, 2, 3, 4]])).to.eql([[1]])
        expect(lookup.XLOOKUP('l', [['a', 'b', 'c', 'd']], [[1, 2, 3, 4]])).to.eql([[error.na]])
        expect(lookup.XLOOKUP('l', [['a', 'b', 'c', 'd']], [[1, 2, 3, 4]], 'Not Found')).to.eql([['Not Found']])
        expect(lookup.XLOOKUP([['c', 'l']], [['a', 'b', 'c', 'd']], [[1, 2, 3, 4]], 'Not Found')).to.eql([
          [3, 'Not Found']
        ])
      })
    })

    describe('search_mode 2', () => {
      it('match_mode -1', () => {
        expect(lookup.XLOOKUP(3, [[4, 5, 7, 8]], [[1, 2, 3, 4]], 'something', -1, 2)).to.eql([['something']])
        expect(lookup.XLOOKUP(6, [[4, 5, 7, 8]], [[1, 2, 3, 4]], 'something', -1, 2)).to.eql([[2]])
        expect(lookup.XLOOKUP(10, [[4, 5, 7, 8]], [[1, 2, 3, 4]], 'something', -1, 2)).to.eql([[4]])
      })

      it('match_mode 0', () => {
        expect(lookup.XLOOKUP('Ex*', [['Axcel', 'Excel', 'Hello', 'Test']], [[1, 2, 3, 4]], 0, 2)).to.eql([[2]])
        expect(lookup.XLOOKUP('=Ex*', [['Axcel', 'Excel', 'Hello', 'Test']], [[1, 2, 3, 4]], 0, 2)).to.eql([[0]])

        expect(lookup.XLOOKUP('bob', [['ana', 'bob', 'carlos', 'john']], [[1, 2, 3, 4]], 0, 0, 2)).to.eql([[2]])
        expect(lookup.XLOOKUP('john', [['ana', 'bob', 'carlos', 'john']], [[1, 2, 3, 4]], 0, 0, 2)).to.eql([[4]])
        expect(lookup.XLOOKUP(3, [[1, 2, 3, 4]], [['ana', 'bob', 'carlos', 'john']], 0, 0, 2)).to.eql([['carlos']])
        expect(lookup.XLOOKUP([['bob', 'ana']], [['ana', 'bob', 'carlos', 'john']], [[1, 2, 3, 4]], 0, 0, 2)).to.eql([
          [2, 1]
        ])
      })

      it('match_mode 1', () => {
        expect(lookup.XLOOKUP(3, [[4, 5, 7, 8]], [[1, 2, 3, 4]], 'something', 1, 2)).to.eql([[1]])
        expect(lookup.XLOOKUP(6, [[4, 5, 7, 8]], [[1, 2, 3, 4]], 'something', 1, 2)).to.eql([[3]])
        expect(lookup.XLOOKUP(10, [[4, 5, 7, 8]], [[1, 2, 3, 4]], 'something', 1, 2)).to.eql([['something']])
      })

      it('match_mode 2', () => {
        expect(lookup.XLOOKUP('b?b', [['ana', 'bob', 'carlos', 'john']], [[1, 2, 3, 4]], 0, 2, 2)).to.eql([
          [error.value]
        ])
      })
    })

    // invalid number of arguments
    it('invalid number of arguments', () => {
      expect(lookup.XLOOKUP('bob', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 0, -2, 1)).to.eql(error.na)
      expect(lookup.XLOOKUP('bob', [['john', 'carlos', 'bob', 'ana']])).to.eql(error.na)
      expect(lookup.XLOOKUP('bob')).to.eql(error.na)
      expect(lookup.XLOOKUP()).to.eql(error.na)
    })

    // invalid modes
    it('invalid modes', () => {
      expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 2, [['2', '2']])).to.eql(
        error.value
      )
      expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, [[1, 1]], 2)).to.eql(
        error.value
      )
      expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 2, -3)).to.eql(error.value)
      expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 2, 0)).to.eql(error.value)
      expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 2, 3)).to.eql(error.value)
      expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, -2, 2)).to.eql(error.value)
      expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, -3, 2)).to.eql(error.value)
      expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, -4, 2)).to.eql(error.value)
      expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 3, 2)).to.eql(error.value)
      expect(lookup.XLOOKUP('b?b', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 4, 2)).to.eql(error.value)
    })

    it('others tests', () => {
      // undefined values
      expect(
        lookup.XLOOKUP(
          undefined,
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']]
        )
      ).to.eql(error.na)
      expect(lookup.XLOOKUP('Brazil', undefined, [['+86', '+91', '+1', '+62', '+55']])).to.eql(error.na)
      expect(lookup.XLOOKUP('Brazil', [['China', 'India', 'United States', 'Indonesia', 'Brazil']], undefined)).to.eql(
        error.na
      )
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          undefined
        )
      ).to.eql([['+55']])
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          0,
          undefined
        )
      ).to.eql([['+55']])
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          0,
          1,
          undefined
        )
      ).to.eql([['+55']])

      // null values
      expect(
        lookup.XLOOKUP(
          null,
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']]
        )
      ).to.eql(error.value)
      expect(lookup.XLOOKUP('Brazil', null, [['+86', '+91', '+1', '+62', '+55']])).to.eql(error.value)
      expect(lookup.XLOOKUP('Brazil', [['China', 'India', 'United States', 'Indonesia', 'Brazil']], null)).to.eql(
        error.value
      )
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          null
        )
      ).to.eql([['+55']])
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          0,
          null
        )
      ).to.eql([['+55']])
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          0,
          1,
          null
        )
      ).to.eql(error.value)

      // boolean values
      expect(
        lookup.XLOOKUP(
          true,
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']]
        )
      ).to.eql([[error.na]])
      expect(lookup.XLOOKUP(true, [[true, false]], [['one value', 'another value']])).to.eql([['one value']])
      expect(lookup.XLOOKUP('Brazil', true, [['+86', '+91', '+1', '+62', '+55']])).to.eql(error.value)
      expect(lookup.XLOOKUP('Brazil', [['China', 'India', 'United States', 'Indonesia', 'Brazil']], true)).to.eql(
        error.value
      )
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          true
        )
      ).to.eql([['+55']])
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          0,
          true
        )
      ).to.eql([['+55']])
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          0,
          1,
          true
        )
      ).to.eql([['+55']])
      expect(
        lookup.XLOOKUP(
          false,
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']]
        )
      ).to.eql([[error.na]])
      expect(lookup.XLOOKUP(false, [[true, false]], [['one value', 'another value']])).to.eql([['another value']])
      expect(lookup.XLOOKUP('Brazil', false, [['+86', '+91', '+1', '+62', '+55']])).to.eql(error.value)
      expect(lookup.XLOOKUP('Brazil', [['China', 'India', 'United States', 'Indonesia', 'Brazil']], false)).to.eql(
        error.value
      )
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          false
        )
      ).to.eql([['+55']])
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          0,
          false
        )
      ).to.eql([['+55']])
      expect(
        lookup.XLOOKUP(
          'Brazil',
          [['China', 'India', 'United States', 'Indonesia', 'Brazil']],
          [['+86', '+91', '+1', '+62', '+55']],
          0,
          1,
          false
        )
      ).to.eql(error.value)

      Object.values(error).forEach((err) => {
        expect(lookup.XLOOKUP(err, [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 0, -2)).to.eql(err)
        expect(lookup.XLOOKUP('bob', err, [[1, 2, 3, 4]], 0, 0, -2)).to.eql(err)
        expect(lookup.XLOOKUP('bob', [['john', 'carlos', 'bob', 'ana']], err, 0, 0, -2)).to.eql(err)
        // if_not_found argument in particular works with errors
        expect(lookup.XLOOKUP('bob', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], err, 0, -2)).not.to.eql(err)
        expect(lookup.XLOOKUP('bob', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, err, -2)).to.eql(err)
        expect(lookup.XLOOKUP('bob', [['john', 'carlos', 'bob', 'ana']], [[1, 2, 3, 4]], 0, 0, err)).to.eql(err)
      })
    })
  })
})
