//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice interface that all potential mint authorization contracts must conform to
interface IDCNTMintAuthorization {
    /// @notice function to confirm if a given mint action is authorized or not
    /// @param destination address of the recipient of the new tokens
    /// @param amount amount of tokens being requested
    /// @return bool indicating whether or not the request is authorized or not
    function authorizeMint(address destination, uint256 amount) external returns (bool);
}