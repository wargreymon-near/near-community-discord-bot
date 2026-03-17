const axios = require('axios');

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';
const NEAR_BLOCKS_URL = 'https://api.nearblocks.io/v1';

async function getNearPrice() {
  const { data } = await axios.get(`${COINGECKO_URL}/simple/price`, {
    params: { ids: 'near', vs_currencies: 'usd,btc,eth', include_24hr_change: true },
  });
  return data.near;
}

async function getGasPrice() {
  const { data } = await axios.get(`${NEAR_BLOCKS_URL}/stats`);
  return {
    gasPrice: data.stats?.gas_price ?? 'N/A',
    avgBlockTime: data.stats?.avg_block_time ?? 'N/A',
    tps: data.stats?.tps ?? 'N/A',
  };
}

async function getMarketplaceActivity() {
  // Paras.id - largest NEAR NFT marketplace
  const { data } = await axios.get('https://api-v2-mainnet.paras.id/activities', {
    params: { limit: 5, type: 'nft_transfer,resolve_purchase' },
  });
  return data.data?.results ?? [];
}

async function getNearStats() {
  const { data } = await axios.get(`${NEAR_BLOCKS_URL}/stats`);
  return data.stats ?? {};
}

module.exports = { getNearPrice, getGasPrice, getMarketplaceActivity, getNearStats };
