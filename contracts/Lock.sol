// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.26;

import { AssertionsHelpers } from "./libraries/AssertionsHelpers.sol";

/*
// Comment-202408174 applies.
// #enableAssertions import "hardhat/console.sol";
*/

contract Lock {
	// #region Hardhat Generated Code

    uint public unlockTime;
    address payable public owner;

    event Withdrawal(uint amount, uint when);

    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);

        owner.transfer(address(this).balance);
    }

	// #endregion
	// #region SMTChecker Prototyping

	// #enableAssertions // #enableSMTChecker /// @notice This function will be uncommented if both assertions and SMTChecker are enabled.
	// #enableAssertions // #enableSMTChecker function function1() public pure returns (uint) {
	// #enableAssertions // #enableSMTChecker 	return 5;
	// #enableAssertions // #enableSMTChecker }

	function badMax(uint256[] memory a) public pure returns (uint256) {
		uint256 m = type(uint256).min;

		for ( uint256 i = 1; i < a.length; ++ i )
			if (a[i] > m)
				m = a[i];

		// #enableAssertions for ( uint256 i = 0; i < a.length; ++ i )
		// #enableAssertions 	assert(m >= a[i]);

		return m;
	}

	function badMonotonicFunction1(uint256 x) internal pure returns (uint256) {
		// // Without this requirement, SMTChecker will find an overflow bug.
		// require(x < type(uint128).max);

		return x * 42;
	}

	function badMonotonicFunction2(uint256 x) internal pure returns (uint256) {
		// // Without this requirement, SMTChecker will find an `assert` failure in `testBadMonotonicFunction2`.
		// require(x < type(uint128).max);

		unchecked { return x * 42; }
	}

	// #enableSMTChecker /// @notice This function exists solely for SMTChecker to analyze.
	// #enableSMTChecker function testBadMonotonicFunction2(uint256 a, uint256 b) public pure {
	// #enableSMTChecker 	require(b > a);
	// #enableSMTChecker 	assert(badMonotonicFunction2(b) > badMonotonicFunction2(a));
	// #enableSMTChecker }

	/// @notice This demonstrates how to avoid the ugliness of commented out code.
	/// The compiler will optimize out unused local variables.
	/// The compiler will optimize out the entire `if` statement if at compile time its condition is known to be `false`.
	/// But a problem is that's all theory. The reality isn't that perfect.
	/// Another problem is that this generates "Condition is always true" warnings, which is impossible to suppress.
	function function2() external returns (uint256) {
		uint256 unlockTimeCopy;

		if(AssertionsHelpers.ENABLE_ASSERTIONS) {
			unlockTimeCopy = unlockTime;
		}

		unchecked { unlockTime += block.timestamp; }

		if(AssertionsHelpers.ENABLE_ASSERTIONS) {
			// assert(unlockTimeCopy <= block.timestamp);
			assert(unlockTimeCopy > block.timestamp);
			unlockTimeCopy = unlockTime;
		}

		++ unlockTime;

		if(AssertionsHelpers.ENABLE_ASSERTIONS) {
			assert(unlockTimeCopy > block.timestamp);
		}

		return unlockTime;
	}

	function function4() public view {
		// This kind of notation would be incorrect if we disable Hardhat Preprocessor.
		// #enableAssertions assert
		// #disableAssertions require
			(owner != address(0));

/*
		// [Comment-202408174]
		// It makes sense to keep assertions enabled during development.
		// So we can log something if assertions are enabled.
		// But I have commented this out for now because the console code takes long for SMTChecker to analyze.
		// [/Comment-202408174]
		// #enableAssertions console.log(unlockTime);
*/
	}

	// #disableSMTChecker /*
	/// @notice Hardhat Preprocessor can comment out this function.
	function function5() public pure {
	}
	// #disableSMTChecker */

	/// @notice See https://docs.soliditylang.org/en/latest/smtchecker.html#natspec-function-abstraction
	/// @custom:smtchecker abstract-function-nondet
	function function6() public pure {
	}

	/*
	/// @notice As of Aug 2024, this feature is still under development.
	/// See https://docs.soliditylang.org/en/latest/smtchecker.html#natspec-function-abstraction
	/// @custom:smtchecker abstract-function-uf
	function function6() public pure {
	}
	*/

	// #endregion
}
