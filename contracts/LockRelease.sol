//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Votes, IERC5805, EIP712} from "@openzeppelin/contracts/governance/utils/Votes.sol";
import {ILockRelease} from "./ILockRelease.sol";

/**
 * This contract allows to create token release schedules and to release those tokens.
 */
contract LockRelease is ILockRelease, Votes {
    using SafeERC20 for IERC20;

    address public token; // address of the token being released
    uint128 public start; // start timestamp of the release schedule
    uint128 public duration; // duration of the release schedule in seconds

    address[] public beneficiaries; // list of beneficiaries

    /** Represents a release schedule for a specific beneficiary. */
    struct Schedule {
        uint256 total; // total tokens that the beneficiary will receive over the duration
        uint256 released; // already released tokens to the beneficiary
    }

    /** Represents a release schedule for a specific beneficiary. */
    mapping(address => Schedule) private schedules;

    /** Emitted when a release schedule is created. */
    event ScheduleStarted(uint256 total, uint128 start, uint128 duration);

    /** Emitted when tokens are released to a recipient. */
    event TokensReleased(address indexed beneficiary, uint256 amount);

    error InvalidInputs();
    error ZeroDuration();
    error InvalidBeneficiary();
    error InvalidToken();
    error InvalidAmount();
    error DuplicateBeneficiary();
    error NothingToRelease();
    error FutureLookup();

    // @todo: Ensure that the hardcoded EIP712 constructor args are what we want/need
    constructor(
        address _token,
        address[] memory _beneficiaries,
        uint256[] memory _amounts,
        uint128 _start,
        uint128 _duration
    ) EIP712("DecentLockRelease", "1.0.0") {
        if (token == address(0)) revert InvalidToken();
        if (duration == 0) revert ZeroDuration();
        if (_beneficiaries.length != _amounts.length) revert InvalidInputs();

        token = _token;
        start = _start;
        duration = _duration;

        uint256 total = 0;

        for (uint16 i = 0; i < _beneficiaries.length; i++) {
            uint256 amount = _amounts[i];
            if (amount == 0) revert InvalidAmount();

            total += amount;

            address beneficiary = _beneficiaries[i];
            if (beneficiary == address(0)) revert InvalidBeneficiary();
            if (schedules[beneficiary].total != 0)
                revert DuplicateBeneficiary();

            Schedule memory schedule = Schedule(amount, 0);
            schedules[beneficiary] = schedule;

            // @todo: Ensure the following lines are correct
            // give the beneficiary voting units
            _transferVotingUnits(address(0), beneficiary, amount);

            // beneficiary delegates to themselves
            _delegate(beneficiary, beneficiary);
        }

        beneficiaries = _beneficiaries;

        // Transfer tokens from sender to contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), total);

        emit ScheduleStarted(total, _start, _duration);
    }

    /** Returns the beneficiaries. */
    function getBeneficiaries() external view returns (address[] memory) {
        return beneficiaries;
    }

    /** Returns the total tokens that will be released to the beneficiary over the duration. */
    function getTotal(address _beneficiary) external view returns (uint256) {
        return schedules[_beneficiary].total;
    }

    /** Returns the total tokens already released to the beneficiary. */
    function getReleased(address _beneficiary) public view returns (uint256) {
        return schedules[_beneficiary].released;
    }

    /** Returns the total tokens that have matured until now according to the release schedule. */
    function getTotalMatured(
        address _beneficiary
    ) public view returns (uint256) {
        if (block.timestamp < start) return 0;

        Schedule memory schedule = schedules[_beneficiary];

        if (block.timestamp >= start + duration) return schedule.total;

        return (schedule.total * (block.timestamp - start)) / duration;
    }

    /** Returns the total tokens that can be released now. */
    function getReleasable(address _beneficiary) public view returns (uint256) {
        return getTotalMatured(_beneficiary) - getReleased(_beneficiary);
    }

    /** Returns the total tokens yet to be released to the beneficiary over the total duration. */
    function getPending(address _beneficiary) external view returns (uint256) {
        return schedules[_beneficiary].total - schedules[_beneficiary].released;
    }

    /** Release all releasable tokens to the caller. */
    function release() external {
        uint256 releasable = getReleasable(msg.sender);

        if (releasable == 0) revert NothingToRelease();

        // Update released amount
        schedules[msg.sender].released =
            schedules[msg.sender].released +
            releasable;

        // Transfer the voting units
        // @todo: ensure the following line is correct
        _transferVotingUnits(msg.sender, address(0), releasable);

        // Transfer tokens to recipient
        IERC20(token).safeTransfer(msg.sender, releasable);

        emit TokensReleased(msg.sender, releasable);
    }

    /** Must return the voting units held by an account. */
    function _getVotingUnits(
        address _account
    ) internal view override returns (uint256) {
        // @todo: Ensure this line below is correct
        return schedules[_account].total - schedules[_account].released;
    }

    /** Returns the current amount of votes that `account` has. */
    function getVotes(address account) public view override returns (uint256) {
        // @todo: ensure this following line is correct
        return super.getVotes(account) + IERC5805(token).getVotes(account);
    }

    /** Returns the amount of votes that `account` had at a specific moment in the past. If the `clock()` is
     * configured to use block numbers, this will return the value at the end of the corresponding block. */
    function getPastVotes(
        address account,
        uint256 timepoint
    ) public view virtual override returns (uint256) {
        // @todo: ensure this following line is correct
        return
            super.getPastVotes(account, timepoint) +
            IERC5805(token).getPastVotes(account, timepoint);
    }
}
