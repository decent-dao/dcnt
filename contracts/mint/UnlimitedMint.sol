//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { IDCNTMintAuthorization, IERC20 } from "./IDCNTMintAuthorization.sol";

/// @notice an implementation of IDCNTMintAuthorization that allows all mint requests
contract UnlimitedMint is IDCNTMintAuthorization {
    
    /// @notice simply returns true, indicating that the mint request is authorized
    function authorizeMint(address, uint256) external pure returns (bool) {
        return true;
    }
}