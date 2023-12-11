// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/governance/utils/Votes.sol";

/**
 * This contract creates token release schedules to linearly release those tokens over the defined duration.
 */
contract LockRelease is Votes {
    using SafeERC20 for IERC20;

    /** Represents a release schedule for a specific beneficiary. */
    struct Schedule {
        uint256 total; // total tokens that the beneficiary will receive over the duration
        uint256 released; // already released tokens to the beneficiary
    }

    address public immutable token; // address of the token being released
    uint128 public immutable start; // start timestamp of the release schedule
    uint128 public immutable duration; // duration of the release schedule in seconds

    /** Represents a release schedule for a specific beneficiary. */
    mapping(address => Schedule) private schedules;

    /** Emitted when a release schedule is created. */
    event ScheduleStarted(
        address token,
        address[] beneficiaries,
        uint256[] amounts,
        uint128 start,
        uint128 duration
    );

    /** Emitted when tokens are released to a recipient. */
    event TokensReleased(address indexed beneficiary, uint256 amount);

    error InvalidArrayLengths();
    error ZeroDuration();
    error InvalidBeneficiary();
    error InvalidToken();
    error InvalidAmount();
    error DuplicateBeneficiary();
    error NothingToRelease();

    /** Deploys the LockRelease contract and sets up all beneficiary release schedules.
     *
     * @param _token address of the beneficiary
     * @param _beneficiaries array of beneficiary addresses to create release schedules for
     * @param _amounts array of the amount of tokens to be locked and released for each beneficiary
     * @param _start the timestamp that the release schedule begins releasing tokens at
     * @param _duration the time period in seconds that tokens are released over
     */
    constructor(
        address _token,
        address[] memory _beneficiaries,
        uint256[] memory _amounts,
        uint128 _start,
        uint128 _duration
    ) EIP712("DecentLockRelease", "1.0.0") {
        if (_token == address(0)) revert InvalidToken();
        if (_duration == 0) revert ZeroDuration();
        if (_beneficiaries.length != _amounts.length)
            revert InvalidArrayLengths();

        for (uint16 i = 0; i < _beneficiaries.length; ) {
            uint256 amount = _amounts[i];
            if (amount == 0) revert InvalidAmount();

            address beneficiary = _beneficiaries[i];
            if (beneficiary == address(0)) revert InvalidBeneficiary();
            if (schedules[beneficiary].total != 0)
                revert DuplicateBeneficiary();

            schedules[beneficiary] = Schedule(amount, 0);

            // mint the beneficiary voting units
            _transferVotingUnits(address(0), beneficiary, amount);

            // beneficiary delegates to themselves
            _delegate(beneficiary, beneficiary);

            unchecked {
                ++i;
            }
        }

        token = _token;
        start = _start;
        duration = _duration;

        emit ScheduleStarted(
            _token,
            _beneficiaries,
            _amounts,
            _start,
            _duration
        );
    }

    /** Release all releasable tokens to the caller. */
    function release() external {
        uint256 releasable = getReleasable(msg.sender);

        if (releasable == 0) revert NothingToRelease();

        // Update released amount
        schedules[msg.sender].released =
            schedules[msg.sender].released +
            releasable;

        // Burn the released voting units
        _transferVotingUnits(msg.sender, address(0), releasable);

        // Transfer tokens to recipient
        IERC20(token).safeTransfer(msg.sender, releasable);

        emit TokensReleased(msg.sender, releasable);
    }

    /** Returns the total tokens that will be released to the beneficiary over the duration.
     *
     * @param _beneficiary address of the beneficiary
     * @return uint256 total tokens that will be released to the beneficiary
     */
    function getTotal(address _beneficiary) external view returns (uint256) {
        return schedules[_beneficiary].total;
    }

    /** Returns the total tokens already released to the beneficiary.
     *
     * @param _beneficiary address of the beneficiary
     * @return uint256 total tokens already released to the beneficiary
     */
    function getReleased(address _beneficiary) public view returns (uint256) {
        return schedules[_beneficiary].released;
    }

    /** Returns the total tokens that have matured until now according to the release schedule.
     *
     * @param _beneficiary address of the beneficiary
     * @return uint256 total tokens that have matured
     */
    function getTotalMatured(
        address _beneficiary
    ) public view returns (uint256) {
        if (block.timestamp < start) return 0;

        Schedule memory schedule = schedules[_beneficiary];

        if (block.timestamp >= start + duration) return schedule.total;

        return (schedule.total * (block.timestamp - start)) / duration;
    }

    /** Returns the total tokens that can be released now.
     *
     * @param _beneficiary address of the beneficiary
     * @return uint256 the total tokens that can be released now
     */
    function getReleasable(address _beneficiary) public view returns (uint256) {
        return getTotalMatured(_beneficiary) - getReleased(_beneficiary);
    }

    /** Returns the current amount of votes that the account has.
     *
     * @param _account the address to check current votes for
     * @return uint256 the current amount of votes that the account has
     */
    function getVotes(address _account) public view override returns (uint256) {
        return super.getVotes(_account) + IERC5805(token).getVotes(_account);
    }

    /** Returns the amount of votes that the account had at a specific moment in the past.
     *
     * @param _account the address to check current votes for
     * @param _blockNumber the past block number to check the account's votes at
     * @return uint256 the amount of votes
     */
    function getPastVotes(
        address _account,
        uint256 _blockNumber
    ) public view virtual override returns (uint256) {
        return
            super.getPastVotes(_account, _blockNumber) +
            IERC5805(token).getPastVotes(_account, _blockNumber);
    }

    /** Returns the current number of voting units held by an account.
     * @param _account the address to check voting units for
     * @return uint256 the amount of voting units
     */
    function _getVotingUnits(
        address _account
    ) internal view override returns (uint256) {
        return schedules[_account].total - schedules[_account].released;
    }
}
