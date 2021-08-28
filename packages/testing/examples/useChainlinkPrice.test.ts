import { MockProvider } from '@ethereum-waffle/provider'
import { FixedNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useChainlinkPrice } from '@usedapp/chainlink'
import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { renderWeb3Hook } from '../src'
import { deployMockChainlinkPriceFeed } from '../src/utils/deployMockChainlinkPriceFeed'

chai.use(solidity)

describe('useChainlinkPrice', () => {
  const mockProvider = new MockProvider()
  const [deployer] = mockProvider.getWallets()
  let feed: Contract

  beforeEach(async () => {
    feed = await deployMockChainlinkPriceFeed(deployer)
  })

  it('returns price', async () => {
    const { result, waitForCurrent } = await renderWeb3Hook(() => useChainlinkPrice(feed.address), {
      mockProvider,
    })
    await waitForCurrent((val) => val !== undefined)
    expect(result.error).to.be.undefined
    expect(result.current?.toString()).to.eq(FixedNumber.from(10000).toString())
  })
})
