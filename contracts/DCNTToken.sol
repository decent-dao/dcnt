//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { ERC20, ERC20Votes, ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IDCNTMintAuthorization } from "./mint/IDCNTMintAuthorization.sol";

// @todo handle initial minting correctly. Can it be done inside the constructor?

/// @notice the dcnt token
contract DCNTToken is ERC20Votes, AccessControl {
    IDCNTMintAuthorization public mintAuthorization;
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");
    bytes32 public constant UPDATE_MINT_AUTHORIZATION_ROLE = keccak256("UPDATE_MINT_AUTHORIZATION_ROLE");
    error MintAuthorization();

    constructor(uint256 _supply, address _owner, IDCNTMintAuthorization _mintAuthorization) ERC20("Decent", "DCNT") ERC20Permit("Decent") {
        _grantRole(MINT_ROLE, _owner);
        _grantRole(UPDATE_MINT_AUTHORIZATION_ROLE, _owner);
        _mint(msg.sender, _supply);
        mintAuthorization = _mintAuthorization;
    }

    /// @notice public function to be used for minting new tokens
    /// @param dest address to assign newly minted tokens to
    /// @param amount amount of tokens to mint
    /// @dev only accounts with `MINT_ROLE` (the DAO) are authorized to mint more tokens
    function mint(address dest, uint256 amount) external onlyRole(MINT_ROLE) {
        if (!mintAuthorization.authorizeMint(dest, amount)) {
            revert MintAuthorization();
        }
        _mint(dest, amount);
    }

    /// @notice holders can burn their own tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /// @notice public function to update contract used for mint authorization
    /// @param newMintAuthorization address to use for the new mint authorization contract
    /// @dev only accounts with `UPDATE_MINT_AUTHORIZATION_ROLE` (the DAO) are authorized to update mint authorization
    function updateMintAuthorization(IDCNTMintAuthorization newMintAuthorization) external onlyRole(UPDATE_MINT_AUTHORIZATION_ROLE) {
        mintAuthorization = newMintAuthorization;
    }
}
