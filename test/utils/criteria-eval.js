import { expect } from 'chai'

import * as criteriaEval from '../../src/utils/criteria-eval.js'

describe('Utils => criteria eval', () => {
  it('parse', () => {
    expect(criteriaEval.parse('')).to.deep.equal([])
    expect(criteriaEval.parse('test')).to.deep.equal([
      { type: 'operator', value: '=' },
      { type: 'literal', value: 'test' }
    ])
    expect(criteriaEval.parse('10')).to.deep.equal([
      { type: 'operator', value: '=' },
      { type: 'literal', value: 10 }
    ])
    expect(criteriaEval.parse('=10')).to.deep.equal([
      { type: 'operator', value: '=' },
      { type: 'literal', value: 10 }
    ])
    expect(criteriaEval.parse('<10')).to.deep.equal([
      { type: 'operator', value: '<' },
      { type: 'literal', value: 10 }
    ])
    expect(criteriaEval.parse('<=10')).to.deep.equal([
      { type: 'operator', value: '<=' },
      { type: 'literal', value: 10 }
    ])
    expect(criteriaEval.parse('<>10')).to.deep.equal([
      { type: 'operator', value: '<>' },
      { type: 'literal', value: 10 }
    ])
    expect(criteriaEval.parse('>10')).to.deep.equal([
      { type: 'operator', value: '>' },
      { type: 'literal', value: 10 }
    ])
    expect(criteriaEval.parse('>=10')).to.deep.equal([
      { type: 'operator', value: '>=' },
      { type: 'literal', value: 10 }
    ])
    expect(criteriaEval.parse('==10')).to.deep.equal([
      { type: 'operator', value: '=' },
      { type: 'literal', value: '==10' }
    ])
    expect(criteriaEval.parse('==10>')).to.deep.equal([
      { type: 'operator', value: '=' },
      { type: 'literal', value: '==10>' }
    ])
    expect(criteriaEval.parse('>test')).to.deep.equal([
      { type: 'operator', value: '>' },
      { type: 'literal', value: 'test' }
    ])
    expect(criteriaEval.parse('>=test')).to.deep.equal([
      { type: 'operator', value: '>=' },
      { type: 'literal', value: 'test' }
    ])
    expect(criteriaEval.parse('<=test')).to.deep.equal([
      { type: 'operator', value: '<=' },
      { type: 'literal', value: 'test' }
    ])
    expect(criteriaEval.parse('==test')).to.deep.equal([
      { type: 'operator', value: '=' },
      { type: 'literal', value: '==test' }
    ])
    expect(criteriaEval.parse('`')).to.deep.equal([
      { type: 'operator', value: '=' },
      { type: 'literal', value: '`' }
    ])
    expect(criteriaEval.parse('!@#$%^&*()_+')).to.deep.equal([
      { type: 'operator', value: '=' },
      { type: 'literal', value: '!@#$%^&*()_+' }
    ])
    expect(criteriaEval.parse('>!@#$%^&*()_+')).to.deep.equal([
      { type: 'operator', value: '>' },
      { type: 'literal', value: '!@#$%^&*()_+' }
    ])
    expect(criteriaEval.parse('>=!@#$%^&*()_+')).to.deep.equal([
      { type: 'operator', value: '>=' },
      { type: 'literal', value: '!@#$%^&*()_+' }
    ])
  })

  it('parse', () => {
    try {
      criteriaEval.createToken('test')
    } catch (ex) {
      expect(ex.message).to.equal('Unsupported token type: undefined')
    }

    try {
      criteriaEval.createToken('test', 'operatorr')
    } catch (ex) {
      expect(ex.message).to.equal('Unsupported token type: operatorr')
    }

    try {
      criteriaEval.createToken('test', 'literall')
    } catch (ex) {
      expect(ex.message).to.equal('Unsupported token type: literall')
    }

    expect(criteriaEval.createToken('test', 'operator')).to.deep.equal({ type: 'operator', value: 'test' })
    expect(criteriaEval.createToken('test', 'literal')).to.deep.equal({ type: 'literal', value: 'test' })
  })

  it('compute', () => {
    expect(
      criteriaEval.compute([
        { type: 'literal', value: '1' },
        { type: 'operator', value: '>' },
        { type: 'literal', value: '1' }
      ])
    ).to.equal(false)

    expect(
      criteriaEval.compute([
        { type: 'literal', value: '1' },
        { type: 'operator', value: '>=' },
        { type: 'literal', value: '1' }
      ])
    ).to.equal(true)

    expect(
      criteriaEval.compute([
        { type: 'literal', value: '3' },
        { type: 'operator', value: '=' },
        { type: 'literal', value: '1' }
      ])
    ).to.equal(false)

    expect(
      criteriaEval.compute([
        { type: 'literal', value: 'test' },
        { type: 'operator', value: '=' },
        { type: 'literal', value: 'test' }
      ])
    ).to.equal(true)

    expect(
      criteriaEval.compute([
        { type: 'literal', value: 'a' },
        { type: 'operator', value: '>' },
        { type: 'literal', value: 'b' }
      ])
    ).to.equal(false)

    expect(
      criteriaEval.compute([
        { type: 'literal', value: 'z' },
        { type: 'operator', value: '>' },
        { type: 'literal', value: 'b' }
      ])
    ).to.equal(true)

    // Multiple literal values are not supported, only 3=1 is computed.
    expect(
      criteriaEval.compute([
        { type: 'literal', value: '3' },
        { type: 'operator', value: '=' },
        { type: 'literal', value: '1' },
        { type: 'operator', value: '=' },
        { type: 'literal', value: '6' }
      ])
    ).to.equal(false)

    // Multiple literal values are not supported, only 3>1 is computed.
    expect(
      criteriaEval.compute([
        { type: 'literal', value: '3' },
        { type: 'operator', value: '>' },
        { type: 'literal', value: '1' },
        { type: 'operator', value: '<' },
        { type: 'literal', value: '6' }
      ])
    ).to.equal(false)
  })

  it('stringCompare', () => {
    expect(criteriaEval.stringCompare('acccccb', 'a*~b')).to.equal(true)
    expect(criteriaEval.stringCompare('ab', 'a*~b')).to.equal(true)
    expect(criteriaEval.stringCompare('accccc', 'a*~b')).to.equal(false)
    expect(criteriaEval.stringCompare('cccccb', 'a*~b')).to.equal(false)

    expect(criteriaEval.stringCompare('affdfbfsfjdlcasfbf', 'a*b*c*')).to.equal(true)
    expect(criteriaEval.stringCompare('ffdfbfsfjdlcasff', 'a*b*c*')).to.equal(false)
    expect(criteriaEval.stringCompare('affcdfbfsfjdlasff', 'a*b*c*')).to.equal(false)

    expect(criteriaEval.stringCompare('affdfbfsfjdlc', 'a*b*c')).to.equal(true)
    expect(criteriaEval.stringCompare('affdfbfsfjdlca', 'a*b*c')).to.equal(false)

    expect(criteriaEval.stringCompare('a*a', 'a~*a')).to.equal(true)
    expect(criteriaEval.stringCompare('aa', 'a~*a')).to.equal(false)

    expect(criteriaEval.stringCompare('a', 'a*~')).to.equal(true)
    expect(criteriaEval.stringCompare('adfsdf', 'a*~')).to.equal(true)
    expect(criteriaEval.stringCompare('*', 'a*~')).to.equal(false)

    expect(criteriaEval.stringCompare('aafabdfvabfdabdfvabcfda', 'a*ab*abc*a')).to.equal(true)
    expect(criteriaEval.stringCompare('aafabdfvabfdabdfvabfda', 'a*ab*abc*a')).to.equal(false)

    expect(criteriaEval.stringCompare('bbaa', 'bb***aa')).to.equal(true)
    expect(criteriaEval.stringCompare('bbgffghbaa', 'bb***aa')).to.equal(true)
    expect(criteriaEval.stringCompare('bba', 'bb***aa')).to.equal(false)
    expect(criteriaEval.stringCompare('baa', 'bb***aa')).to.equal(false)

    expect(criteriaEval.stringCompare('ba', '*?*a')).to.equal(true)
    expect(criteriaEval.stringCompare('a', '*?*a')).to.equal(false)

    expect(criteriaEval.stringCompare('*a', '*~*a')).to.equal(true)
    expect(criteriaEval.stringCompare('fsdf*a', '*~*a')).to.equal(true)
    expect(criteriaEval.stringCompare('fsdfa', '*~*a')).to.equal(false)
    expect(criteriaEval.stringCompare('fsdf*', '*~*a')).to.equal(false)
  })
})
