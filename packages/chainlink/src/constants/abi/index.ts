import { Interface } from '@ethersproject/abi'
import ChainlinkPriceFeedMock from './ChainlinkPriceFeed.json'

const ChainlinkPriceFeedInterface = new Interface(ChainlinkPriceFeedMock.abi)

export { ChainlinkPriceFeedMock, ChainlinkPriceFeedInterface }
