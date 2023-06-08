//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

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
    function getBeneficiaries() external view returns (address[] memory);
}