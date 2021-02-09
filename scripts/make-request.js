require('dotenv').config();
const airnodeAbi = require('@api3/airnode-abi');
const ExampleClient = require('../deployments/xdai/ExampleClient.json');

// From *.receipt.json
const providerId = '0xf082eb9f63235922d4724f66b5da8f23e4a2c94f35b4ae0e0c62b9323a99d449';
// From config.json
const endpointId = '0xcfbb4287751a89c7132f36de279f07486f7270ac3abaa8be17413e27fc80a78d';

// User-specific
const requesterIndex = '2';
const designatedWallet = '0xa294029873360Edb86FF588F33911f434396A9cb';

// Request parameters
const id = 'ethereum';
const date = '31-01-2021';

// Encodes the parameters off-chain using @api3/airnode-abi and makes the request.
async function makeRequestWithEncodedParameters(exampleClient) {
  const receipt = await exampleClient.makeRequest(
    providerId,
    endpointId,
    requesterIndex,
    designatedWallet,
    airnodeAbi.encode([
      { name: 'id', type: 'bytes32', value: id },
      { name: 'date', type: 'bytes32', value: date }
    ]));
  return new Promise((resolve) =>
    exampleClient.provider.once(receipt.hash, (tx) => {
      const log = (tx.logs.filter(log => log.address == exampleClient.address))[0];
      const parsedLog = exampleClient.interface.parseLog(log);
      resolve(parsedLog.args.requestId);
    })
  );
}

// Makes the request with the parameters directly. The parameters get encoded on-chain.
async function makeRequestWithRawParameters(exampleClient) {
  const receipt = await exampleClient.encodeAndMakeRequest(
    providerId,
    endpointId,
    requesterIndex,
    designatedWallet,
    ethers.utils.formatBytes32String(id),
    ethers.utils.formatBytes32String(date)
  );
  return new Promise((resolve) =>
    exampleClient.provider.once(receipt.hash, (tx) => {
      const log = (tx.logs.filter(log => log.address == exampleClient.address))[0];
      const parsedLog = exampleClient.interface.parseLog(log);
      resolve(parsedLog.args.requestId);
    })
  );
}

function fulfilled(exampleClient, requestId) {
  return new Promise((resolve) =>
    exampleClient.provider.once(exampleClient.filters.RequestFulfilled(requestId), resolve)
  );
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC).connect(provider);
  const exampleClient = new ethers.Contract(
    ExampleClient.address,
    ExampleClient.abi,
    wallet
  );

  console.log('Making the request with encoded parameters...');
  const requestIdEncoded = await makeRequestWithEncodedParameters(exampleClient);
  console.log(`Made the request with ID ${requestIdEncoded}.\nWaiting for it to be fulfilled...`);
  await fulfilled(exampleClient, requestIdEncoded);
  console.log('Request fulfilled');
  console.log(`${id} price was ${(await exampleClient.fulfilledData(requestIdEncoded)) / 1e6} USD on ${date}`);

  // Repeat
  console.log('Making the request with raw parameters...');
  const requestIdRaw = await makeRequestWithRawParameters(exampleClient);
  console.log(`Made the request with ID ${requestIdRaw}.\nWaiting for it to be fulfilled...`);
  await fulfilled(exampleClient, requestIdRaw);
  console.log('Request fulfilled');
  console.log(`${id} price was ${(await exampleClient.fulfilledData(requestIdRaw)) / 1e6} USD on ${date}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
