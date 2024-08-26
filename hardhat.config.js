// #region

"use strict";

// #endregion
// #region

// You might want to disable this when deploying to the mainnet.
// Doing so will eliminate the risk that Hardhat Preprocessor bugs will break things.
// Obviously, our code will need to be designed to not require any preprocessing.
// Comment-202408155 relates.
// todo-0 Should we take this from an environmemt variable?
const enableHardhatPreProcessor = true;

// Remember to disable this in the production code.
// Comment-202408156 relates.
// [Comment-202408155]
// This is ignored when `! enableHardhatPreProcessor`.
// [/Comment-202408155]
// todo-0 Should we take this from an environmemt variable?
const enableAssertions = true;

// [Comment-202408156]
// When enabling SMTChecker, you typically need to enable assertions as well.
// [/Comment-202408156]
// Comment-202408155 applies.
// Comment-202408173 relates.
// todo-0 Should we take this from an environmemt variable?
const enableSMTChecker = true;

// Issue. Hardhat would automatically install solcjs, but solcjs doesn't appear to support SMTChecker.
// It could be a solcjs bug.
// So we are telling Hardhat to use the native solc of the given version.
// Remember to manually install it.
// The simplest option is to install the solc package globally.
// Another option is to use the "solc-select" tool.
// Remember that depending on how your system upates are configured and how you installed the solc package,
// the package can be updated at any moment, so it's recommended to disable automatic quiet updates.
// Hardhat will not necesarily validate what version it's executing.
const solidityCompilerPath = "/usr/bin/solc";
const solidityVersion = "0.8.26";
const solidityCompilerLongVersion = solidityVersion + "+commit.8a97fa7a.Linux.g++";

// #endregion
// #region

if (enableHardhatPreProcessor) {
	console.warn("Warning. Hardhat Preprocessor is ENABLED. Assuming it's intentional.");

	if (enableSMTChecker && ( ! enableAssertions )) {
		console.warn("Warning. SMTChecker is enabled, but assertions are not. Is it intentional?");
	}
} else {
	console.warn("Warning. Hardhat Preprocessor is disabled. Assuming it's intentional.");
}

console.warn(`Make sure "${solidityCompilerPath}" version is "${solidityCompilerLongVersion}".`);

// #endregion
// #region

require("@nomicfoundation/hardhat-toolbox");
const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, } = require("hardhat/builtin-tasks/task-names");

if (enableHardhatPreProcessor) {
	require("hardhat-preprocessor");
}

// #endregion
// #region

/** @type boolean | undefined */
let isDeployingContractsToMainNet = undefined;

/**
@param {import("hardhat/types").HardhatRuntimeEnvironment} hre
*/
function populateIsDeployingContractsToMainNetOnce(hre) {
	if(isDeployingContractsToMainNet != undefined) {
		return;
	}

	// To be safe, checking if the network is a known testnet. Otherwise we will suspect that it could be a mainnet.
	// Issue. When we are executing a non-deployment task, at least in some cases, should we avoid throwing an error
	// near Comment-202408261?
	// But this logic doesn't evaluate what task we are executing.
	// Remember that there are 2 possible deployment tasks: "deploy" and "ignition deploy".
	// Any more sophisticated logic would need to be perpared for the case when a deployment happens without a recompile.
	// That said, it's really better to not make this logic any more complicated -- to stay on the safe side.
	switch(hre.network.name) {
		case "hardhat":
		case "rinkeby":
		case "arbigoerli":
		case "sepolia":
		case "localhost": {
			isDeployingContractsToMainNet = false;
			break;
		}

		default: {
			isDeployingContractsToMainNet = true;
			break;
		}
	}
}

// #endregion
// #region

subtask(
	TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD,
	async (args, hre, runSuper) => {
		if (args.solcVersion === solidityVersion) {
			return {
				compilerPath: solidityCompilerPath,
				isSolcJs: false,
				version: solidityVersion,

				// This is used as extra information in the build-info files, but other than that is not important.
				longVersion: solidityCompilerLongVersion,
			};
		}
	
		// This point is supposed to be unreachable.
		throw new Error(`Hardhat is trying to use a wrong Solidity compiler version: "${args.solcVersion}".`);

		// // Calling the default subtask.
		// return runSuper();
 	}
);

// #endregion
// #region Solidity line preprocessing prototype.

{
	const regExpPatternPart1 =
		// "enableAssertions";
		// "enableSMTChecker";
		"enableAssertions|enableSMTChecker";
	const regExpPatternPart2 = `\\/\\/[ \\t]*\\#(?:${regExpPatternPart1})(?: |\\b)`;
	const regExpPattern = `^([ \\t]*)${regExpPatternPart2}(?:[ \\t]*${regExpPatternPart2})*`;
	const regExp = new RegExp(regExpPattern, "s");
	let str = "\t\t// #enableAssertions // #enableAssertions // #enableSMTChecker//#enableAssertions  \t  //  \t  #enableSMTChecker \t\treturn 5;";
	str = str.replace(regExp, "[$1]");
	console.log(str);
}

// #endregion
// #region

const solidityLinePreProcessingRegExp = enableHardhatPreProcessor ? createSolidityLinePreProcessingRegExp() : undefined;

function createSolidityLinePreProcessingRegExp()
{
	const regExpPatternPart1 =
		(enableAssertions ? "enableAssertions" : "disableAssertions") +
		"|" +
		(enableSMTChecker ? "enableSMTChecker" : "disableSMTChecker");
	const regExpPatternPart2 = `\\/\\/[ \\t]*\\#(?:${regExpPatternPart1})(?: |\\b)`;
	const regExpPattern = `^([ \\t]*)${regExpPatternPart2}(?:[ \\t]*${regExpPatternPart2})*`;
	const regExp = new RegExp(regExpPattern, "s");
	return regExp;
}

// #endregion
// #region

/**
@param {import("hardhat/types").HardhatRuntimeEnvironment} hre
@param {string} line
*/
function preProcessSolidityLine(hre, line) {
	// todo-0 In the production project, try to execute this validation before the preprocessor gets a chance to run.
	// todo-0 But maybe do nothing if the preprocessor is disabled.
	// if (enableAssertions || enableSMTChecker)
	{
		populateIsDeployingContractsToMainNetOnce(hre);

		if (isDeployingContractsToMainNet) {
			// [Comment-202408261/]
			// throw new Error("You forgot to disable assertions and/or SMTChecker.");
			throw new Error("You forgot to disable Hardhat Preprocessor.");
		}
	}

	// if (line.length <= 0) {
	// 	line = line + `// ${hre.network.name} ${enableAssertions} ${enableSMTChecker}`;
	// }

	// @ts-ignore No overload matches this call.
	line = line.replace(solidityLinePreProcessingRegExp, "$1");

	// console.log(line);
	return line;
}

// #endregion
// #region

{
	// #region

	/** @type import("hardhat/config").HardhatUserConfig */
	const hardhatUserConfig = {
		solidity: {
			version: solidityVersion,

			settings: {
				evmVersion: "cancun",

				optimizer: {
					enabled: true,
					runs: 234,
				},
			},
		},

		networks: {
			rinkeby: {
				url: `https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
				accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
			},
			arbigoerli: {
				url: `https://goerli-rollup.arbitrum.io/rpc`,
				accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
			},
			arbitrum: {
				url: `https://arb1.arbitrum.io/rpc`,
				accounts: process.env.MAINNET_PRIVATE_KEY !== undefined ? [process.env.MAINNET_PRIVATE_KEY] : [],
			},
			sepolia: {
				url: `http://170.187.142.12:22545/`,
				accounts: process.env.SEPOLIA_PRIVATE_KEY !== undefined ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
				gasMultiplier: 2,
			},
			localhost: {
				url: `http://localhost:8545/`,
				gasMultiplier: 4,
			},
		},

		// "hardhat-preprocessor" package configuration.
		preprocess: {
			eachLine:
				(hre) =>
				(
					{
						// In case the preprocessor is disabled, it doesn't matter whether this object exists or changed.
						// In that case, Hardhat will recompile only modified contracts, which is the normal behavior if Hardhat.
						// Further comments apply if the preprocesor is enabled.
						// Regardless if this object exists or changed, Hardhat will unconditionally execute the preprocesor.
						// As a result, the logic that can lead to an error being thrown near Comment-202408261 is guaranteed to run.
						// If this object doesn't exist or if it changed, Hardhat will unconditionally recompile all contracts.
						// Otherwise, if the preprocessor generats a different output, Hardhat will recompile the changed contracts.
						settings:
						{
							enableAssertions: enableAssertions,
							enableSMTChecker: enableSMTChecker,
						},

						// // This undocumented parameter appears to make it possible to specify what files to preprocess.
						// // It appears to be unnecessary to configure this.
						// // Comment-202408173 relates.
						// files: "???",

						transform: (line) => { return preProcessSolidityLine(hre, line); },
					}
				),
		},
	};

	// #endregion
	// #region

	if (enableSMTChecker) {
		// See https://docs.soliditylang.org/en/latest/using-the-compiler.html#compiler-input-and-output-json-description
		// On that page, find: modelChecker
		// @ts-ignore Property is possibly undefined. Property doesn't exist.
		hardhatUserConfig.solidity.settings.modelChecker = {
			// By default, all contracts under the "contracts" folder tree, except abstract ones, will be analyzed.
			// But it probably makes sense to analyze 1 contract at a time.
			// [Comment-202408173]
			// Issue. Even if you select only some contracts here, we will still preprocess all Solidity sources.
			// [/Comment-202408173]
			contracts: {
				// "contracts/Source1.sol": ["Contract1"],
				// "contracts/Source2.sol": ["Contract2", "Contract3"],
				"contracts/Lock.sol": ["Lock"],
		   },

			// // It appears to be unnecessary to configure this.
			// // See https://docs.soliditylang.org/en/latest/smtchecker.html#division-and-modulo-with-slack-variables
			// divModNoSlacks: ...

			// By default, all model checking engines will run, which is probably the best option.
			// Issue. Actually, without this being configured explicitly, SMTChecker doesn't appear to run.
			// See https://docs.soliditylang.org/en/latest/smtchecker.html#model-checking-engines
			// See https://docs.soliditylang.org/en/latest/smtchecker.html#bounded-model-checker-bmc
			// See https://docs.soliditylang.org/en/latest/smtchecker.html#constrained-horn-clauses-chc
			engine: "all",

			// When we make an external call like `Contract1(address1).function1()`, SMTChecker will, by default, expect that
			// we are calling into potentially malicious code.
			// This parameter results in SMTChecker assuming that we are calling our own known contract.
			// This implies that for this to work correct we must cast an address to a specific contract, rather than to its interface.
			// todo-0 So maybe we don't actually need to bother with defining intefaces.
			// A problem is that we make a lot of low level calls, like `call` or `delegatecall`, but SMTChecker doesn't recognize those.
			// So it would be beneficial at least in the mode in which SMTChecker is enabled to make high level calls.
			// See https://docs.soliditylang.org/en/latest/smtchecker.html#trusted-external-calls
			extCalls: "trusted",

			// By default, these won't be reported.
			// todo-0 Do we really need these?
			// See https://docs.soliditylang.org/en/latest/smtchecker.html#reported-inferred-inductive-invariants
			invariants: ["contract", "reentrancy",],

			// // See https://docs.soliditylang.org/en/latest/smtchecker.html#proved-targets
			// // todo-0 Do we need this?
			// showProved: true,

			// See https://docs.soliditylang.org/en/latest/smtchecker.html#unproved-targets
			showUnproved: true,

			// See https://docs.soliditylang.org/en/latest/smtchecker.html#unsupported-language-features
			showUnsupported: true,

			// // It appears to be unnecessary to configure this.
			// // See https://docs.soliditylang.org/en/latest/smtchecker.html#smt-and-horn-solvers
			// solvers: ["z3"],

			// By default, overflow and underflow won't be checked.
			// To enable checking those, list them explicitly, together with whatever others.
			// todo-0 Do we really need to check them?
			// See https://docs.soliditylang.org/en/latest/smtchecker.html#verification-targets
			targets: [
				"assert",
				"underflow",
				"overflow",
				"divByZero",
				"constantCondition",
				"popEmptyArray",
				"outOfBounds",
				"balance",
				//"default",
			],

			// Milliseconds.
			// timeout: 1 * 1000,
			timeout: 999 * 1000,
		};
	}

	// #endregion
	// #region

	module.exports = hardhatUserConfig;

	// #endregion
}

// #endregion
