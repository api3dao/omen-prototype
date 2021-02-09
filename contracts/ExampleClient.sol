//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;

import "@api3/airnode-protocol/contracts/AirnodeClient.sol";


contract ExampleClient is AirnodeClient {
    event RequestMade(bytes32 indexed requestId);
    event RequestFulfilled(bytes32 indexed requestId, int256 data);

    mapping(bytes32 => bool) public incomingFulfillments;
    mapping(bytes32 => int256) public fulfilledData;

    constructor (address airnodeAddress)
        public
        AirnodeClient(airnodeAddress)
    {}

    // Parameters are encoded off-chain
    function makeRequest(
        bytes32 providerId,
        bytes32 endpointId,
        uint256 requesterInd,
        address designatedWallet,
        bytes calldata parameters
        )
        external
    {
        bytes32 requestId = airnode.makeFullRequest(
            providerId,
            endpointId,
            requesterInd,
            designatedWallet,
            address(this),
            this.fulfill.selector,
            parameters
            );
        incomingFulfillments[requestId] = true;
        emit RequestMade(requestId);
    }

    // Parameters are encoded on-chain, refer to:
    // https://github.com/api3dao/api3-docs/blob/e793f7ec876e0a8e042f92388c6686f639c80458/airnode/airnode-abi-specifications.md
    function encodeAndMakeRequest(
        bytes32 providerId,
        bytes32 endpointId,
        uint256 requesterInd,
        address designatedWallet,
        bytes32 id,
        bytes32 date
        )
        external
    {
        bytes memory parameters = abi.encode(
            bytes32("1bb"),
            bytes32("id"), id,
            bytes32("date"), date
            );
        bytes32 requestId = airnode.makeFullRequest(
            providerId,
            endpointId,
            requesterInd,
            designatedWallet,
            address(this),
            this.fulfill.selector,
            parameters
            );
        incomingFulfillments[requestId] = true;
        emit RequestMade(requestId);
    }

    function fulfill(
        bytes32 requestId,
        uint256 statusCode,
        int256 data
        )
        external
        onlyAirnode()
    {
        require(incomingFulfillments[requestId], "No such request made");
        delete incomingFulfillments[requestId];
        if (statusCode == 0)
        {
            fulfilledData[requestId] = data;
        }
        emit RequestFulfilled(requestId, data);
    }
}
