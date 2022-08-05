import { expect } from 'chai'
import { defaultAccounts, deployContract } from 'ethereum-waffle'
import { useCall, useEthers, useBlockMeta } from '../hooks'
import { doublerContractABI, reverterContractABI } from '../constants'
import { mineBlock, renderDAppHook, setupTestingConfig, sleep } from '../testing'
import multicall2ABI from '../constants/abi/MultiCall2.json'

import Ganache, { Server } from 'ganache'
import { constants, providers, Wallet } from 'ethers'

describe('useCall Resilency tests', () => {
  for (const multicallVersion of [1] as const) {
    for (const fastMulticallEncoding of [false] as const) {
      describe(`Multicall v${multicallVersion} configured: fastMulticallEncoding=${fastMulticallEncoding}`, () => {
        it('Other hooks work when one call reverts', async function () {
          if (multicallVersion === 1) this.skip() // This cannot work in multicall 1 as the whole batch reverts.
          const { config, network1 } = await setupTestingConfig({ multicallVersion })
          const revertContract = await deployContract(network1.deployer, reverterContractABI)
          const doublerContract = await deployContract(network1.deployer, doublerContractABI)

          const { result, waitForCurrent } = await renderDAppHook(
            () => {
              const revertResult = useCall({
                contract: revertContract,
                method: 'doRevert',
                args: [],
              })
              const doubleResult = useCall({
                contract: doublerContract,
                method: 'double',
                args: [3],
              })
              return { revertResult, doubleResult }
            },
            {
              config: { ...config, fastMulticallEncoding },
            }
          )
          await waitForCurrent((val) => val.doubleResult !== undefined && val.revertResult !== undefined)

          expect(result.current.revertResult?.error).to.not.be.undefined

          expect(result.current.doubleResult?.error).to.be.undefined
          expect(result.current.doubleResult?.value?.[0]?.eq(6)).to.be.true
        })

        it('Continues to work when one call stops reverting', async () => {
          const { config, network1 } = await setupTestingConfig({ multicallVersion })
          const revertContract = await deployContract(network1.deployer, reverterContractABI)
          const doublerContract = await deployContract(network1.deployer, doublerContractABI)

          const { result, waitForCurrent, rerender } = await renderDAppHook(
            (num: number) => {
              const revertResult = useCall({
                contract: revertContract,
                method: 'revertOnOdd',
                args: [num],
              })
              const doubleResult = useCall({
                contract: doublerContract,
                method: 'double',
                args: [num],
              })
              return { revertResult, doubleResult }
            },
            {
              config,
              renderHook: {
                initialProps: 5,
              },
            }
          )

          await waitForCurrent((val) => val.doubleResult !== undefined && val.revertResult !== undefined)
          if (multicallVersion !== 1) {
            // This cannot work in multicall 1 as the whole batch reverts.
            expect(result.current.doubleResult?.value?.[0]?.eq(10)).to.be.true
          }
          expect(result.current.revertResult?.error).to.not.be.undefined

          rerender(4)
          await waitForCurrent((val) => val.doubleResult?.value?.[0]?.eq(8))
          expect(result.current.doubleResult?.error).to.be.undefined
          expect(result.current.revertResult?.error).to.be.undefined
        })

        describe('Multichain with RPC servers', () => {
          let ganacheServers: Server<'ethereum'>[]

          before(async () => {
            ganacheServers = [
              Ganache.server({chain: {chainId: 1337}, logging: {quiet: true}, wallet: {accounts: defaultAccounts}}),
              Ganache.server({chain: {chainId: 31337}, logging: {quiet: true}, wallet: {accounts: defaultAccounts}})]
            await ganacheServers[0].listen(18800)
            await ganacheServers[1].listen(18801)
          })

          after(async () => {
            try {await ganacheServers[0].close()} catch {}
            try {await ganacheServers[1].close() } catch {}
          })


          it.only('Continues to work when secondary RPC endpoint fails', async () => {
            const miner0 = new Wallet(defaultAccounts[0].secretKey, new providers.StaticJsonRpcProvider('http://localhost:18800'))
            const miner1 = new Wallet(defaultAccounts[0].secretKey, new providers.StaticJsonRpcProvider('http://localhost:18801'))

            const multicall0 = await deployContract(miner0, multicall2ABI)
            const multicall1 = await deployContract(miner1, multicall2ABI)

            const { result, waitForCurrent, rerender, unmount } = await renderDAppHook(
              () => {
                const { chainId, account, activateBrowserWallet, deactivate } = useEthers()
                const {blockNumber: firstChainBlockNumber} = useBlockMeta({chainId: 1337})
                const {blockNumber: secondChainBlockNumber} = useBlockMeta({chainId: 31337})
                return { chainId, secondChainBlockNumber, firstChainBlockNumber }
              },
              {
                config: {
                  readOnlyChainId: 1337,
                  readOnlyUrls: {
                    [1337]: 'http://localhost:18800',
                    [31337]: 'http://localhost:18801',
                  },
                  pollingInterval: 200,
                  multicallAddresses: {
                    [1337]: multicall0.address,
                    [31337]: multicall1.address,
                  }
                },
              }
            )

            await waitForCurrent((val) => val.chainId !== undefined && val.secondChainBlockNumber !== undefined && val.firstChainBlockNumber !== undefined)
            expect(result.current.chainId).to.be.equal(1337)
            expect(result.current.secondChainBlockNumber).to.be.equal(1)
            expect(result.current.firstChainBlockNumber).to.be.equal(1)

            await ganacheServers[1].close()
            await miner0.sendTransaction({to: constants.AddressZero})
            await waitForCurrent((val) => val.firstChainBlockNumber === 2)
            await sleep(1000)
            console.log('>>>>', {current: result.current})
            expect(result.current.firstChainBlockNumber).to.be.equal(2)
            expect(result.current.secondChainBlockNumber).to.be.equal(1)
            expect(result.current.chainId).to.be.equal(1337)
          })
        })
      })
    }
  }
})
