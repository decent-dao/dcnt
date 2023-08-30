//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { ERC20, ERC20Votes, ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

// @todo handle initial minting correctly. Can it be done inside the constructor?

/// @notice the dcnt token
contract DCNTToken is ERC20Votes, AccessControl {
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    constructor(uint256 _supply, address _owner) ERC20("Decent", "DCNT") ERC20Permit("Decent") {
        _grantRole(MINT_ROLE, _owner);
        _mint(msg.sender, _supply);
    }

    /// @notice public function to be used for minting new tokens
    /// @param dest address to assign newly minted tokens to
    /// @param amount amount of tokens to mint
    /// @dev only accounts with `MINT_ROLE` (the DAO) are authorized to mint more tokens
    function mint(address dest, uint256 amount) external onlyRole(MINT_ROLE) {
        _mint(dest, amount);
    }

    /// @notice holders can burn their own tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
