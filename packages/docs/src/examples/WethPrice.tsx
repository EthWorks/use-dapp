import React from 'react'
import ReactDOM from 'react-dom'
import { useCoingeckoTokenPrice } from '@usedapp/coingecko'
import styles from './styles/styles.module.css'

ReactDOM.render(
    <App />,
    document.getElementById('root')
)

export function App()  {
    const WETH_CONTRACT = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    const wethPrice = useCoingeckoTokenPrice(WETH_CONTRACT, 'usd')

    return (<div className={styles.Balance}>Wrapped ether price: <p className={styles.Bold}>{wethPrice} $</p></div>)
}
