import { expect } from 'chai'
import {
  shortenIfTransactionHash,
  shortenTransactionHash,
  isTransactionSlow,
  StoredTransaction,
  TransactionStatus,
} from '../../src'
import { TransactionReceipt } from '@ethersproject/providers'
describe('transactionHelpers', () => {
  describe('shortenTransactionHash', () => {
    it('correct hash', () => {
      const hash = '0x19b22589c0e4340c03da1a0732e452048d3c2b851c99cf2bac7d3bdc8f1f9e37'

      expect(shortenTransactionHash(hash)).to.eq('0x19b2...9e37')
    })

    it('hash length equal to 10', () => {
      const hash = '1234567890'

      expect(shortenTransactionHash(hash)).to.eq('123456...7890')
    })

    it('hash too short', () => {
      const hash = 'abcd'

      expect(() => shortenTransactionHash(hash)).to.throw(
        'Invalid input, transaction hash need to have at least 10 characters'
      )
    })
  })

  describe('shortenIfTransactionHash', () => {
    it('correct hash', () => {
      const hash = '0x19b22589c0e4340c03da1a0732e452048d3c2b851c99cf2bac7d3bdc8f1f9e37'

      expect(shortenTransactionHash(hash)).to.eq('0x19b2...9e37')
    })

    const testCases = [
      { description: '0', value: 0 as const },
      { description: 'null', value: null },
      { description: 'undefined', value: undefined },
      { description: 'empty string', value: '' as const },
      { description: 'false', value: false as const },
    ]
    testCases.forEach(({ description, value }) => {
      it(description, () => {
        expect(shortenIfTransactionHash(value)).to.eq('')
      })
    })
  })
  describe('isTransactionSlow', () => {
    it('is slow', () => {
      const transaction = ({ submittedAt: Date.now() - 17000 } as unknown) as StoredTransaction
      expect(isTransactionSlow(transaction, 15000)).to.be.eq(true)
    })

    it('not slow', () => {
      const transaction = ({ submittedAt: Date.now() - 1000 } as unknown) as StoredTransaction
      expect(isTransactionSlow(transaction, 15000)).to.be.eq(false)
    })

    it('already mined', () => {
      const receipt = ({ status: 1 } as unknown) as TransactionReceipt
      const transaction = ({ submittedAt: Date.now() - 17000, receipt } as unknown) as StoredTransaction
      expect(isTransactionSlow(transaction, 15000)).to.be.eq(false)
    })
  })
})
