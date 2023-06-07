//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A lock contract, which maintains the current amout of tokens yet to be released
 * to the given beneficiary address.
 */
interface ILockRelease {

    /**
     * Gets the total amount of tokens locked in the contract for the given address.
     *
     * @param _beneficiary address to receive locked tokens
     * @return uint256 amount of tokens in the lock contract for the beneficiary
     */
    function getPending(address _beneficiary) external view returns(uint256);

    /**
     * Gets the list of beneficiaries in the lock contract.
     *
     * @return address[] addresses to receive locked tokens
     */
    function getBeneficiaries() external view returns (address[]);
}

/**
 * An `ERC20Votes` token that integrates with a "lock" contract, which holds tokens on behalf of another address
 * until a predetermined release time.
 *
 * The purpose of this contract is to allow for address with locked tokens to still vote with those tokens,
 * despite not actually holding them themselves.
 *
 * This is done by moving voting power from the lock contract to the holder's address at initialization, as well
 * as during token transfers and delegation by calling the normally private `_moveVotingPower` function via
 * a call to `super._afterTokenTransfer`.
 *
 * The `super._afterTokenTransfer` of `ERC20Votes` simply moves voting power according to its parameters, along with
 * a call to its own super, which is an empty implementation.
 *
 * see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/dfef6a68ee18dbd2e1f5a099061a3b8a0e404485/contracts/token/ERC20/extensions/ERC20Votes.sol#LL217C6-L217C6
 * see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/dfef6a68ee18dbd2e1f5a099061a3b8a0e404485/contracts/token/ERC20/ERC20.sol#L364
 */
abstract contract ERC20VotesLockable is ERC20Votes, Ownable {

    /** The LockRelease contract */
    ILockRelease public lock;

    error AlreadyInitialized();

    /**
     * Sets up the initial state of voting power.
     *
     * This is intended to be called *after* the tokens are already added to the lock contract, which
     * establishes the balance of the contract and allows that voting power to be transferred to the 
     * token beneficiaries instead.
     *
     * @param _lockAddress address of the lock contract
     */
    function setUpLockedVotingPower(address _lockAddress) external onlyOwner {
        if (address(lock) != address(0)) revert AlreadyInitialized();
    
        // self delegate the lock contract, establishing its voting power as its balance
        _delegate(_lockAddress, _lockAddress);

        lock = ILockRelease(_lockAddress);

        address[] memory beneficiaries = lock.getBeneficiaries();

        for (uint i = 0; i < beneficiaries.length; i++) {
            address beneficiary = beneficiaries[i];

            // self delegate the beneficiary to allow them to receive voting power
            _delegate(beneficiary, beneficiary);

            // transfer voting power from the lock contract to the beneficiary, equal to
            // their token allocation in the contract
            super._afterTokenTransfer(_lockAddress, beneficiary, lock.getPending(beneficiary));
        }
    }

    /**
     * Hook that is called after any transfer of tokens. This includes minting and burning.
     *
     * This is overridded in order to prevent voting power being moved as tokens are claimed from
     * the lock contract, which does not actually have voting power to give, as all of it has
     * already been moved via the `setUpLockedVotingPower` initialization.
     *
     * @param _from address tokens were tranferred from
     * @param _to address that received the tokens
     * @param _amount amount of tokens transferred
     */
    function _afterTokenTransfer(address _from, address _to, uint256 _amount) internal override {
        // if it's the lock contract, don't transfer any voting power when it leaves the contract,
        // the power will remain with whoever it's been delegated to already
        if (address(lock) != _from) {
            super._afterTokenTransfer(_from, _to, _amount);
        }
    }

    /**
     * Change delegation for `_delegator` to `_delegatee`.
     *
     * This is overridded in order to also move voting power equal to delegator's
     * locked balance to the delegatee's power as well.
     *
     * @param _delegator address delegating their voting power to another address
     * @param _delegatee address that will vote on behalf of the delegator
     */
    function _delegate(address _delegator, address _delegatee) internal override {
        super._delegate(_delegator, _delegatee);

        uint256 lockedBalance = lock.getPending(_delegator);
        if (lockedBalance > 0) {
            // add the locked balance to the new delegatee's voting power
            super._afterTokenTransfer(_delegator, _delegatee, lockedBalance);
        }
    }
}
