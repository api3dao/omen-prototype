# Omen prototype

> Customized [`airnode-starter`](https://github.com/api3dao/airnode-starter) that serves historic asset price data on xDai for Omen

*Refer to the [protocol docs](https://github.com/api3dao/api3-docs/tree/e793f7ec876e0a8e042f92388c6686f639c80458#requestresponse-protocol) for more information.*

## Warning

The Airnode protocol used in this project is independently audited.
However, we are working on an updated version that improves the node operator UX.
This means that your [requester records](https://github.com/api3dao/api3-docs/blob/e793f7ec876e0a8e042f92388c6686f639c80458/request-response-protocol/requester.md) and thus [designated wallets](https://github.com/api3dao/api3-docs/blob/e793f7ec876e0a8e042f92388c6686f639c80458/request-response-protocol/designated-wallet.md) are temporary.
**Do not fund your designated wallets with large amounts.**

## Quick demo

1. Create a `.env` file
```sh
cp example.env .env
```

2. Enter your wallet's mnemonic in `.env` (it should be funded for gas)

3. Make requests and watch them getting fulfilled
```sh
npm run make-request
```

Note that these requests will be fulfilled by the designated wallet `0xa294029873360Edb86FF588F33911f434396A9cb` that belongs to requester `#2`.
You may need to fund it if it runs out (1 xDAI is more than enough).

`make-request` demonstrates two alternative ways of providing request parameters.
You can either encode them off-chain and pass them as a single `bytes` variable, or pass them individually and encode them in your contract (see `ExampleClient.sol`).

## How to deploy your own contract and make requests from it?

*Use the same `mnemonic` in the following steps for simplicity.*

1. Create a requester.
`requesterAdmin` should be the address associated with your mnemonic.

```sh
npx @api3/airnode-admin@0.1.5 create-requester \
  --providerUrl https://rpc.xdaichain.com/ \
  --mnemonic "nature about salad..." \
  --requesterAdmin 0x1Da...
```

This will assign you a `requesterIndex`.

2. Derive your `designatedWalletAddress`.
Use the `requesterIndex` assigned to you in the previous step.

```sh
npx @api3/airnode-admin@0.1.5 derive-designated-wallet \
  --providerUrl https://rpc.xdaichain.com/ \
  --providerId 0xf082eb9f63235922d4724f66b5da8f23e4a2c94f35b4ae0e0c62b9323a99d449 \
  --requesterIndex 1...
```

This will return you a `designatedWalletAddress`.
Fund it (with <=1 xDAI if you are only testing).
You will need to use this and the `requesterIndex` in your client contract to make requests.

3. Endorse your client contract (the contract that will make the requests).
Use the `requesterIndex` assigned to you in the previous steps.
`clientAddress` is the address of the contract that will make the requests.

```sh
npx @api3/airnode-admin endorse-client \
  --providerUrl https://rpc.xdaichain.com/ \
  --mnemonic "nature about salad..." \
  --requesterIndex 1... \
  --clientAddress 0x794...
```

Now the requests that the client contract makes will be fulfilled.
You only need to repeat step 3 if you want to redeploy your client contract.
All the client contracts you have endorsed with a single requester index will share the same designated wallet.

## Full setup

*Follow if you want to try deploying your own node (not recommended)*

1. Create `.env` and `config/.env` files based on the examples.

2. Run the command below in `config/`

```sh
docker run -it --rm \
  --env-file .env \
  --env COMMAND=deploy-first-time \
  -v $(pwd):/airnode/out \
  api3/airnode:latest
```

3. Update the authorizers

```sh
npx @api3/airnode-admin@0.1.5 update-authorizers \
  --providerUrl https://rpc.xdaichain.com/ \
  --mnemonic "nature about salad..." \
  --providerId 0xf08... \
  --endpointId 0xcfbb4287751a89c7132f36de279f07486f7270ac3abaa8be17413e27fc80a78d \
  --authorizersFilePath config/authorizers.json
```
