import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
import { ChainlinkPriceFeedInterface } from '../constants'
import { Falsy } from '../model/types'
import { useContractCalls } from '@usedapp/core'

export function useChainlinkPrice(address: string | Falsy): FixedNumber | undefined {
  const [rawDecimals, rawAnswer] = useContractCalls(
    address
      ? [
          {
            abi: ChainlinkPriceFeedInterface,
            address,
            method: 'decimals',
            args: [],
          },
          {
            abi: ChainlinkPriceFeedInterface,
            address,
            method: 'latestAnswer',
            args: [],
          },
        ]
      : []
  )
  if (!rawDecimals || !rawAnswer) return

  const decimals = rawDecimals[0] as number
  const answer = rawAnswer[0] as BigNumber
  return FixedNumber.fromValue(answer, decimals)
}
