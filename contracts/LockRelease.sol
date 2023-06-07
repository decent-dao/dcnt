//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * This contract allows to create token release schedules and to release those tokens.
 */
contract LockRelease {

    using SafeERC20 for IERC20;

    address public token; // address of the token being released
    uint128 public start; // start timestamp of the release schedule
    uint128 public duration; // duration of the release schedule in seconds

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
    event TokensReleased(
        address indexed beneficiary,
        address recipient,
        uint256 amount,
        address indexed releasor
    );

    error InvalidInputs();
    error ZeroDuration();
    error InvalidBeneficiary();
    error InvalidToken();
    error InvalidAmount();
    error DuplicateBeneficiary();
    error NothingToRelease();

    constructor(address _token, address[] memory _beneficiaries, uint256[] memory _amounts, uint128 _start, uint128 _duration) {
        
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
            if (schedules[beneficiary].total != 0) revert DuplicateBeneficiary();

            Schedule memory schedule = Schedule(amount, 0);
            schedules[beneficiary] = schedule;
        }

        // Transfer tokens from sender to contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), total);

        emit ScheduleStarted(total, _start, _duration);
    }

    /** Returns the total tokens that will be released to the beneficiary over the duration. */
    function getTotal(address _beneficiary) public view returns (uint256) {
        return schedules[_beneficiary].total;
    }

    /** Returns the total tokens already released to the beneficiary. */
    function getReleased(address _beneficiary) public view returns (uint256) {
        return schedules[_beneficiary].released;
    }

    /** Returns the total tokens yet to be released to the beneficiary over the total duration. */
    function getPending(address _beneficiary) public view returns (uint256) {
        return schedules[_beneficiary].total - schedules[_beneficiary].released;
    }

    /** Returns the total tokens that have matured until now according to the release schedule. */
    function getTotalMatured(address _beneficiary) public view returns (uint256) {
        if (block.timestamp < start) return 0;

        Schedule memory schedule = schedules[_beneficiary];

        if (block.timestamp >= start + duration) return schedule.total;

        return (schedule.total * (block.timestamp - start)) / duration;
    }

    /** Returns the total tokens that can be released now. */
    function getReleasable(address _beneficiary) public view returns (uint256) {
        return getTotalMatured(_beneficiary) - getReleased(_beneficiary);
    }

    /** Release tokens to beneficiary. */
    function release(address _beneficiary, uint256 _amount) public {
        _release(_beneficiary, _beneficiary, _amount);
    }

    /** Release all releasable tokens to beneficiary. */
    function release(address _beneficiary) public {
        release(_beneficiary, getReleasable(_beneficiary));
    }

    /** Release tokens to a different recipient. */
    function releaseTo(address _recipient, uint256 _amount) public {
        _release(msg.sender, _recipient, _amount);
    }

    /** Release all releasable tokens to a different recipient. */
    function releaseTo(address _recipient) public {
        releaseTo(_recipient, getReleasable(msg.sender));
    }

    /** Internal function to release tokens according to the release schedule. */
    function _release(address _beneficiary, address _recipient, uint256 _amount) private {
        
        uint256 unreleased = getReleasable(_beneficiary);

        if (_amount == 0 || _amount > unreleased) revert InvalidAmount();
        if (unreleased == 0) revert NothingToRelease();

        // Update released amount
        schedules[_beneficiary].released = schedules[_beneficiary].released + _amount;

        // Transfer tokens to recipient
        IERC20(token).safeTransfer(_recipient, _amount);
        
        emit TokensReleased(_beneficiary, _recipient, _amount, msg.sender);
    }
}

/**
 * Factory contract for creating new LockRelease instances.
 */
contract LockReleaseFactory {
    function createLockRelease(address _token, address[] memory _beneficiaries, uint256[] memory _amounts, uint128 _start, uint128 _duration) external {
        new LockRelease(_token, _beneficiaries, _amounts, _start, _duration);
    }
}
