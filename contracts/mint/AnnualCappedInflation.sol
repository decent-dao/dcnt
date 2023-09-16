//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IDCNTMintAuthorization, IERC20 } from "./IDCNTMintAuthorization.sol";

/// @notice an implementation of IDCNTMintAuthorization that limits mint requests to a capped annual inflation
contract AnnualCappedInflation is Ownable, IDCNTMintAuthorization {
    IERC20 public token;
    uint128 public nextMint; // Timestamp
    uint32 public constant MINIMUM_MINT_INTERVAL = 365 days;
    uint8 public constant MINT_CAP_BPS = 200; // 2%

    error MintExceedsMaximum();
    error MintTooSoon();

    constructor(IERC20 _token, uint128 _nextMint, address _owner) {
        token = _token;
        nextMint = _nextMint;
        _transferOwnership(_owner);
    }

    /// @notice mint can be called at most once every 365 days, and with an amount no more than 2% of the current supply
    /// @param amount amount of tokens to mint
    function canMint(address, uint256 amount) public view returns (bool) {
        if (amount > (token.totalSupply() * MINT_CAP_BPS) / 10000) {
            revert MintExceedsMaximum();
        }

        if (block.timestamp < nextMint) {
            revert MintTooSoon();
        }

        return true;
    }

    /// @notice mint can be called at most once every 365 days, and with an amount no more than 2% of the current supply
    /// @param destination address where new tokens will be minted to
    /// @param amount amount of tokens to mint
    function authorizeMint(address destination, uint256 amount) external onlyOwner returns (bool) {
        if (!canMint(destination, amount)) {
            return false;
        }

        nextMint = uint128(block.timestamp + MINIMUM_MINT_INTERVAL);
        return true;
    }
}
