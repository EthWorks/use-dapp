Chainlink API
#############

Hooks
*****

useChainlinkPrice
=================
Returns price from a given Chainlink oracle.

**Parameters**

- ``oracleAddress: string | Falsy`` - address of an oracle contract

**Returns**

- ``price: number | undefined`` - price from oracle which is float or undefined if address is *Falsy* or not connected

**Example**

.. code-block:: javascript

  const ETH_USD_FEED = 'eth-usd.data.eth'
  const ethPrice = useChainlinkPrice(ETH_USD_FEED)

  return (
    ethPrice ? <p>ETH Price: {ethPrice} USD</p> : <></>
  )