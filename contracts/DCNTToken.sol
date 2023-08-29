//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { ERC20, ERC20Votes, ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

// @todo handle initial minting correctly. Can it be done inside the constructor?

/// @notice the dcnt token
contract DCNTToken is ERC20Votes, Ownable {
    /// @param _supply amount of tokens to mint at Token Generation Event
    constructor(uint256 _supply, address _owner) ERC20("Decent", "DCNT") ERC20Permit("Decent") {
        _mint(msg.sender, _supply);
        _transferOwnership(_owner);
    }

    /// @notice public mint function to be used for minting new tokens
    /// @param dest address to assign newly minted tokens to
    /// @param amount amount of tokens to mint
    /// @dev only the `owner` is authorized to mint more tokens
    function mint(address dest, uint256 amount) external onlyOwner {
        _mint(dest, amount);
    }

    /// @dev holders can burn their own tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
