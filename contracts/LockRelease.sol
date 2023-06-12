//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { ILockRelease } from "./ILockRelease.sol";

/**
 * This contract allows to create token release schedules and to release those tokens.
 */
contract LockRelease is ILockRelease {

    using SafeERC20 for IERC20;

    /** Represents a release schedule for a specific beneficiary. */
    struct Schedule {
        uint256 total; // total tokens that the beneficiary will receive over the duration
        uint256 released; // already released tokens to the beneficiary
    }

    struct Checkpoint {
        uint32 fromBlock;
        uint224 votes;
    }

    mapping(address => address) private _delegates;
    mapping(address => Checkpoint[]) private _checkpoints;

    address public token; // address of the token being released
    uint128 public start; // start timestamp of the release schedule
    uint128 public duration; // duration of the release schedule in seconds

    address[] public beneficiaries; // list of beneficiaries



    /** Represents a release schedule for a specific beneficiary. */
    mapping(address => Schedule) private schedules;

    /** Emitted when a release schedule is created. */
    event ScheduleStarted(uint256 total, uint128 start, uint128 duration);

    /** Emitted when tokens are released to a recipient. */
    event TokensReleased(
        address indexed beneficiary,
        uint256 amount,
        address indexed releasor
    );

    /**Emitted when an account changes their delegate. */
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);

    /** @dev Emitted when a token transfer or delegate change results in changes to a delegate's number of votes. */
    event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);

    error InvalidInputs();
    error ZeroDuration();
    error InvalidBeneficiary();
    error InvalidToken();
    error InvalidAmount();
    error DuplicateBeneficiary();
    error NothingToRelease();
    error FutureLookup();

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

            // @todo: Ensure the following lines are correct
            _delegate(beneficiary, beneficiary);
            _moveVotingPower(address(0), beneficiary, amount);
        }

        beneficiaries = _beneficiaries;

        // Transfer tokens from sender to contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), total);

        emit ScheduleStarted(total, _start, _duration);
    }

    // ---------- Start new delegate functions ---------- \\

    function delegate(address delegatee) public {
        _delegate(msg.sender, delegatee);
    }

    function _writeCheckpoint(
        Checkpoint[] storage ckpts,
        function(uint256, uint256) view returns (uint256) op,
        uint256 delta
    ) private returns (uint256 oldWeight, uint256 newWeight) {
        uint256 pos = ckpts.length;

        unchecked {
            Checkpoint memory oldCkpt = pos == 0 ? Checkpoint(0, 0) : _unsafeAccess(ckpts, pos - 1);

            oldWeight = oldCkpt.votes;
            newWeight = op(oldWeight, delta);

            if (pos > 0 && oldCkpt.fromBlock == clock()) {
                _unsafeAccess(ckpts, pos - 1).votes = SafeCast.toUint224(newWeight);
            } else {
                ckpts.push(Checkpoint({fromBlock: SafeCast.toUint32(clock()), votes: SafeCast.toUint224(newWeight)}));
            }
        }
    }

    function _delegate(address delegator, address delegatee) internal virtual {
        address currentDelegate = delegates(delegator);
        // @todo: ensure the line below is correct
        uint256 delegatorBalance = schedules[delegator].total - schedules[delegator].released;
        _delegates[delegator] = delegatee;

        emit DelegateChanged(delegator, currentDelegate, delegatee);

        _moveVotingPower(currentDelegate, delegatee, delegatorBalance);
    }

    function _moveVotingPower(address src, address dst, uint256 amount) private {
        if (src != dst && amount > 0) {
            if (src != address(0)) {
                (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(_checkpoints[src], _subtract, amount);
                emit DelegateVotesChanged(src, oldWeight, newWeight);
            }

            if (dst != address(0)) {
                (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(_checkpoints[dst], _add, amount);
                emit DelegateVotesChanged(dst, oldWeight, newWeight);
            }
        }
    }

    /** Access an element of the array without performing bounds check. The position is assumed to be within bounds. */
    function _unsafeAccess(Checkpoint[] storage ckpts, uint256 pos) private pure returns (Checkpoint storage result) {
        assembly {
            mstore(0, ckpts.slot)
            result.slot := add(keccak256(0, 0x20), pos)
        }
    }

    function _add(uint256 a, uint256 b) private pure returns (uint256) {
        return a + b;
    }

    function _subtract(uint256 a, uint256 b) private pure returns (uint256) {
        return a - b;
    }

    function _checkpointsLookup(Checkpoint[] storage ckpts, uint256 timepoint) private view returns (uint256) {
        // We run a binary search to look for the last (most recent) checkpoint taken before (or at) `timepoint`.
        //
        // Initially we check if the block is recent to narrow the search range.
        // During the loop, the index of the wanted checkpoint remains in the range [low-1, high).
        // With each iteration, either `low` or `high` is moved towards the middle of the range to maintain the invariant.
        // - If the middle checkpoint is after `timepoint`, we look in [low, mid)
        // - If the middle checkpoint is before or equal to `timepoint`, we look in [mid+1, high)
        // Once we reach a single value (when low == high), we've found the right checkpoint at the index high-1, if not
        // out of bounds (in which case we're looking too far in the past and the result is 0).
        // Note that if the latest checkpoint available is exactly for `timepoint`, we end up with an index that is
        // past the end of the array, so we technically don't find a checkpoint after `timepoint`, but it works out
        // the same.
        uint256 length = ckpts.length;

        uint256 low = 0;
        uint256 high = length;

        if (length > 5) {
            uint256 mid = length - Math.sqrt(length);
            if (_unsafeAccess(ckpts, mid).fromBlock > timepoint) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (_unsafeAccess(ckpts, mid).fromBlock > timepoint) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        unchecked {
            return high == 0 ? 0 : _unsafeAccess(ckpts, high - 1).votes;
        }
    }

    /** Clock used for flagging checkpoints. Can be overridden to implement timestamp based checkpoints (and voting). */
    function clock() public view returns (uint48) {
        return SafeCast.toUint48(block.number);
    }

    /** Get the address `account` is currently delegating to. */
    function delegates(address account) public view returns (address) {
        return _delegates[account];
    }

    /** @dev Gets the current votes balance for `account` */
    function getVotes(address account) public view returns (uint256) {
        uint256 pos = _checkpoints[account].length;
        unchecked {
            return pos == 0 ? 0 : _checkpoints[account][pos - 1].votes;
        }
    }

    /** Retrieve the number of votes for `account` at the end of `timepoint`. */
    function getPastVotes(address account, uint256 timepoint) public view returns (uint256) {
        if (timepoint >= clock()) revert FutureLookup();
        return _checkpointsLookup(_checkpoints[account], timepoint);
    }

    // ---------- End new delegate functions ---------- \\

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

    /** Returns the total tokens yet to be released to the beneficiary over the total duration. */
    function getPending(address _beneficiary) external view returns (uint256) {
        return schedules[_beneficiary].total - schedules[_beneficiary].released;
    }

    /** Release all releasable tokens to the beneficiary. */
    function release(address _beneficiary) external {
        
        uint256 releasable = getReleasable(_beneficiary);

        if (releasable == 0) revert NothingToRelease();

        // Update released amount
        schedules[_beneficiary].released = schedules[_beneficiary].released + releasable;

        // @todo: Ensure the following line is correct
        _moveVotingPower(_beneficiary, address(0), releasable);

        // Transfer tokens to recipient
        IERC20(token).safeTransfer(_beneficiary, releasable);
        
        emit TokensReleased(_beneficiary, releasable, msg.sender);
    }
}

