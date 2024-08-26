// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.24;

// Comment-202408174 applies.
// #enableAssertions import "hardhat/console.sol";

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

	function badMax(int256[] memory a) public pure returns (int256) {
		int256 m = 0;

		for ( uint i = 0; i < a.length; ++ i )
			if (a[i] > m)
				m = a[i];

		// #enableAssertions for ( uint i = 0; i < a.length; ++ i )
		// #enableAssertions 	assert(m >= a[i]);

		return m;
	}

	function monotonicFunction(uint256 x) internal pure returns (uint256) {
		// // Without this requirement, SMTChecker will find an overflow bug.
		// require(x < type(uint128).max);

		return x * 42;
	}

	// #enableSMTChecker /// @notice This function exists solely for SMTChecker to analyze.
	// #enableSMTChecker function testMonotonicFunction(uint256 a, uint256 b) public pure {
	// #enableSMTChecker 	require(b > a);
	// #enableSMTChecker 	assert(monotonicFunction(b) > monotonicFunction(a));
	// #enableSMTChecker }

	function function2() public view {
		// This kind of notation would be incorrect if we disable Hardhat Preprocessor.
		// #enableAssertions assert
		// #disableAssertions require
			(owner != address(0));

		// [Comment-202408174]
		// It makes sense to keep assertions enabled during development.
		// So we can log something if assertions are enabled.
		// [/Comment-202408174]
		// #enableAssertions console.log(unlockTime);
	}

	// #disableSMTChecker /*
	/// @notice Hardhat Preprocessor can comment out this function.
	function function3() public pure {
	}
	// #disableSMTChecker */

	/// @notice See https://docs.soliditylang.org/en/latest/smtchecker.html#natspec-function-abstraction
	/// @custom:smtchecker abstract-function-nondet
	function function4() public pure {
	}

	/// @notice As of Aug 2024, this feature is still under development.
	/// See https://docs.soliditylang.org/en/latest/smtchecker.html#natspec-function-abstraction
	/// @custom:smtchecker abstract-function-uf
	function function5() public pure {
	}

	// #endregion
}
