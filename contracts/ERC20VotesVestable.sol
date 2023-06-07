//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A vesting contract, which maintains the current amout of tokens yet to be vested
 * for the given beneficiary address.
 */
interface Vesting {

    /**
     * Gets the total amount of tokens locked in the contract for the given address.
     *
     * @param _beneficiary address to receive vested tokens
     * @return uint256 amount of tokens in the vesting contract for the beneficiary
     */
    function getPending(address _beneficiary) external view returns(uint256);
}

/**
 * An `ERC20Votes` token that integrates with a "vesting" contract, which holds tokens on behalf of another address
 * until a predetermined release time.
 *
 * The purpose of this contract is to allow for address with unvested tokens to still vote with those tokens,
 * despite not actually holding them themselves.
 *
 * This is done by moving voting power from the vesting contract to the holders address at initialization, as well
 * as during token transfers and delegation by calling the normally private `_moveVotingPower` function via
 * a call to `super._afterTokenTransfer`.
 *
 * The `super._afterTokenTransfer` of `ERC20Votes` simply moves voting power according to its parameters, along with
 * a call to its own super, which is an empty implementation.
 *
 * see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/dfef6a68ee18dbd2e1f5a099061a3b8a0e404485/contracts/token/ERC20/extensions/ERC20Votes.sol#LL217C6-L217C6
 * see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/dfef6a68ee18dbd2e1f5a099061a3b8a0e404485/contracts/token/ERC20/ERC20.sol#L364
 */
abstract contract ERC20VotesVestable is ERC20Votes, Ownable {

    /** The vesting contract */
    Vesting public vest;

    error AlreadyInitialized();

    /**
     * Sets up the initial state of voting power.
     *
     * This is intended to be called *after* the tokens are already added to the vesting contract, which
     * establishes the balance of the contract and allows that voting power to be transferred to the 
     * token vestees instead.
     *
     * @param _vestingAddress address of the Vesting contract
     * @param _vestees list of addresses in the vesting contract that are allocated tokens
     */
    function setUpVestingVotingPower(address _vestingAddress, address[] memory _vestees) external onlyOwner {
        if (address(vest) != address(0)) revert AlreadyInitialized();
    
        // self delegate the vesting contract, establishing its voting power as its balance
        _delegate(_vestingAddress, _vestingAddress);

        vest = Vesting(_vestingAddress);

        for (uint i = 0; i < _vestees.length; i++) {
            address vestee = _vestees[i];

            // self delegate the vestee to allow them to receive voting power
            _delegate(vestee, vestee);

            // transfer voting power from the vesting contract to the vestee, equal to
            // their token allocation in the contract
            super._afterTokenTransfer(_vestingAddress, vestee, vest.getPending(vestee));
        }
    }

    /**
     * Hook that is called after any transfer of tokens. This includes minting and burning.
     *
     * This is overridded in order to prevent voting power being moved as tokens are claimed from
     * the vesting contract, which does not actually have voting power to give, as all of it has
     * already been moved via the `setUpVestingVotingPower` initialization.
     *
     * @param _from address tokens were tranferred from
     * @param _to address that received the tokens
     * @param _amount amount of tokens transferred
     */
    function _afterTokenTransfer(address _from, address _to, uint256 _amount) internal override {
        // if it's the vesting contract, don't transfer any voting power when it leaves vesting, the 
        // power will remain with whoever it's been delegated to already
        if (address(vest) != _from) {
            super._afterTokenTransfer(_from, _to, _amount);
        }
    }

    /**
     * Change delegation for `_delegator` to `_delegatee`.
     *
     * This is overridded in order to also move voting power equal to delegator's
     * vesting balance to the delegatee's power as well.
     *
     * @param _delegator address delegating their voting power to another address
     * @param _delegatee address that will vote on behalf of the delegator
     */
    function _delegate(address _delegator, address _delegatee) internal override {
        super._delegate(_delegator, _delegatee);

        // TODO if Vesting has a single end time, we can probably capture that in
        // this contract as `uint256 vestEndTime` and avoid calling out to another
        // contract once vesting is over with via `if (block.timestamp > vestEndTime)`

        uint256 vestingBalance = vest.getPending(_delegator);
        if (vestingBalance > 0) {
            // add the vesting balance to the new delegatee's voting power
            super._afterTokenTransfer(_delegator, _delegatee, vestingBalance);
        }
    }
}