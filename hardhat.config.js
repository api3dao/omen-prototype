require('dotenv').config();
require('@nomiclabs/hardhat-waffle');
require('hardhat-deploy');

module.exports = {
  networks: {
    xdai: {
      url: process.env.PROVIDER_URL,
      accounts: { mnemonic: process.env.MNEMONIC },
    },
  },
  solidity: '0.6.12',
};
