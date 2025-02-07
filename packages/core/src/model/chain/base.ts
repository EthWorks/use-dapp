import { Chain } from '../../constants'
import { getAddressLink, getTransactionLink } from '../../helpers/chainExplorerLink'

const baseGoerliUrl = 'https://goerli.basescan.org'

export const BaseGoerli: Chain = {
  chainId: 84531,
  chainName: 'Base Goerli',
  isTestChain: true,
  isLocalChain: false,
  multicallAddress: '0x1Be882bE320C2C21849891E441da4829a34e0627',
  rpcUrl: 'https://goerli.base.org',
  nativeCurrency: {
    name: 'Goerli Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrl: baseGoerliUrl,
  getExplorerAddressLink: getAddressLink(baseGoerliUrl),
  getExplorerTransactionLink: getTransactionLink(baseGoerliUrl),
}

const baseUrl = 'https://basescan.org'

export const Base: Chain = {
  chainId: 8453,
  chainName: 'Base',
  isTestChain: false,
  isLocalChain: false,
  multicallAddress: '0x38641b7a50CDcfde75a7A83eB7c02581F3279362',
  rpcUrl: 'https://mainnet.base.org',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrl: baseUrl,
  getExplorerAddressLink: getAddressLink(baseUrl),
  getExplorerTransactionLink: getTransactionLink(baseUrl),
}

export default {
  BaseGoerli,
  Base,
}
