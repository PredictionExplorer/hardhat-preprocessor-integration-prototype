// #region

"use strict";

// #endregion
// #region

// Disable this when running any Hardhat task against a mainnet.
// Doing so will eliminate the risk of Hardhat Preprocessor bugs breaking things.
// If you forget to, we will throw an error near Comment-202408261.
// Comment-202408155 relates.
const ENABLE_HARDHAT_PREPROCESSOR = parseBooleanEnvironmentVariable("ENABLE_HARDHAT_PREPROCESSOR", false);

// Comment-202408156 relates.
// [Comment-202408155]
// This is ignored and treated as `false` when `! ENABLE_HARDHAT_PREPROCESSOR`.
// [/Comment-202408155]
const ENABLE_ASSERTS = ENABLE_HARDHAT_PREPROCESSOR && parseBooleanEnvironmentVariable("ENABLE_ASSERTS", false);

// [Comment-202408156]
// When enabling SMTChecker, you typically need to enable asserts as well.
// [/Comment-202408156]
// Comment-202408155 applies.
// Comment-202408173 relates.
const ENABLE_SMTCHECKER = ENABLE_HARDHAT_PREPROCESSOR && parseBooleanEnvironmentVariable("ENABLE_SMTCHECKER", false);

// #endregion
// #region

// [Comment-202409011]
// Issue. Hardhat would automatically install solcjs, but solcjs fails to execute SMTChecker.
// It could be a solcjs bug.
// So we are telling Hardhat to use the native solc of the given version.
// Remember to manually install it.
// The simplest option is to install the solc package globally:
//    sudo add-apt-repository ppa:ethereum/ethereum
//    sudo apt install solc
// Another option is to use the "solc-select" tool.
// Remember that depending on how your system upates are configured and how you installed the solc package,
// the package can be updated at any moment, so you might want to disable quiet automatic updates.
// Hardhat will not necesarily validate solc of what version it's executing.
// [/Comment-202409011]
const solidityCompilerPath = "/usr/bin/solc";

// Comment-202409011 applies.
const solidityVersion = "0.8.26";

// Comment-202409011 applies.
const solidityCompilerLongVersion = solidityVersion + "+commit.8a97fa7a.Linux.g++";

// #endregion
// #region

if (ENABLE_HARDHAT_PREPROCESSOR) {
	console.warn("Warning. Hardhat Preprocessor is enabled. Assuming it's intentional.");

	// if (( ! ENABLE_SMTCHECKER ) && ( ! ENABLE_ASSERTS )) {
	// 	console.warn("Warning. Neither SMTChecker nor asserts are enabled. Is it intentional?");
	// }

	if (ENABLE_SMTCHECKER && ( ! ENABLE_ASSERTS )) {
		console.warn("Warning. SMTChecker is enabled, but asserts are disabled. Is it intentional?");
	}
} else {
	console.warn("Warning. Hardhat Preprocessor is disabled. Assuming it's intentional.");
}

console.warn(`Warning. Make sure "${solidityCompilerPath}" version is "${solidityCompilerLongVersion}". Hardhat will not necesarily validate that.`);

// #endregion
// #region

require("@nomicfoundation/hardhat-toolbox");
const { subtask, } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, } = require("hardhat/builtin-tasks/task-names");

if (ENABLE_HARDHAT_PREPROCESSOR) {
	require("hardhat-preprocessor");
}

// #endregion
// #region parseBooleanEnvironmentVariable

/**
 * @param {string} environmentVariableName
 * @param {boolean} defaultValue
 * @returns {boolean}
 * @throws {Error}
 */
function parseBooleanEnvironmentVariable(environmentVariableName, defaultValue) {
	const rawValue = process.env[environmentVariableName];

	switch (rawValue) {
		case undefined:
			return defaultValue;
		case "true":
			return true;
		case "false":
			return false;
		default:
			throw new Error(`Invalid value for environment variable ${environmentVariableName}: "${rawValue}". Expected "true" or "false".`);
	}
}

// #endregion
// #region

/**
In the production code, I named this `networkIsMainNet`.
@type boolean | undefined
*/
let isDeployingContractsToMainNet = undefined;

/**
In the production code, I named this `populateNetworkIsMainNetOnce`.
@param {import("hardhat/types").HardhatRuntimeEnvironment} hre
*/
function populateIsDeployingContractsToMainNetOnce(hre) {
	if(isDeployingContractsToMainNet != undefined) {
		return;
	}

	// [Comment-202408313]
	// To be safe, checking if the network is a known testnet. Otherwise we will suspect that it could be a mainnet.
	// Issue. When we are executing a non-deployment task, at least in some cases, should we avoid throwing an error
	// near Comment-202408261?
	// But this logic doesn't evaluate what task we are executing.
	// Remember that there are 2 possible deployment tasks: "deploy" and "ignition deploy".
	// Any more sophisticated logic would need to be perpared for the case when a deployment happens without a recompile.
	// That said, it's really better to not make this logic any more complicated -- to stay on the safe side.
	// [/Comment-202408313]
	switch(hre.network.name) {
		case "hardhat":
		case "localhost":
		case "rinkeby":
		case "sepolia":
		case "arbigoerli": {
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
		// @ts-ignore 'args' is of type 'unknown'.
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
		
		// @ts-ignore 'args' is of type 'unknown'.
		throw new Error(`Hardhat is trying to use a wrong Solidity compiler version: "${args.solcVersion}".`);

		// // Calling the default implementation.
		// return runSuper();
 	}
);

// #endregion
// #region Solidity line preprocessing prototype.

{
	const regExpPatternPart1 =
		// "enable_asserts";
		// "enable_smtchecker";
		"enable_asserts|enable_smtchecker";
	const regExpPatternPart2 = `\\/\\/[ \\t]*\\#(?:${regExpPatternPart1})(?: |\\b)`;
	const regExpPattern = `^([ \\t]*)${regExpPatternPart2}(?:[ \\t]*${regExpPatternPart2})*`;
	const regExp = new RegExp(regExpPattern, "s");
	let str = "\t\t// #enable_asserts // #enable_asserts // #enable_smtchecker//#enable_asserts  \t  //  \t  #enable_smtchecker \t\treturn 5;";
	str = str.replace(regExp, "[$1]");
	console.log(str);
}

// #endregion
// #region

const solidityLinePreProcessingRegExp = ENABLE_HARDHAT_PREPROCESSOR ? createSolidityLinePreProcessingRegExp() : undefined;

function createSolidityLinePreProcessingRegExp()
{
	const regExpPatternPart1 =
		(ENABLE_ASSERTS ? "enable_asserts" : "disable_asserts") +
		"|" +
		(ENABLE_SMTCHECKER ? "enable_smtchecker" : "disable_smtchecker");
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
	// if (ENABLE_ASSERTS || ENABLE_SMTCHECKER)
	{
		populateIsDeployingContractsToMainNetOnce(hre);

		if (isDeployingContractsToMainNet) {
			// [Comment-202408261/]
			// throw new Error("You forgot to disable asserts and/or SMTChecker.");
			throw new Error("The network is a mainnet, but you forgot to disable Hardhat Preprocessor.");
		}
	}

	// if (line.length <= 0) {
	// 	line = line + `// ${hre.network.name} ${ENABLE_ASSERTS} ${ENABLE_SMTCHECKER}`;
	// }

	// @ts-ignore No overload matches this call.
	line = line.replace(solidityLinePreProcessingRegExp, "$1");

	// console.log(line);
	return line;
}

// #endregion
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

	// "hardhat-preprocessor" package configuration.
	preprocess: {
		eachLine:
			(hre) =>
			(
				{
					// In case the preprocessor is disabled, it doesn't matter whether this object exists or changed.
					// In that case, Hardhat will recompile only modified contracts, which is the normal behavior of Hardhat.
					// Further comments apply if the preprocesor is enabled.
					// Regardless if this object exists or changed, Hardhat will unconditionally execute the preprocesor.
					// As a result, the logic that can lead to an error being thrown near Comment-202408261 is guaranteed to run.
					// If this object doesn't exist or if it changed, Hardhat will recompile all contracts.
					// Otherwise, if the preprocessor generats a different output, Hardhat will recompile the changed contracts.
					settings:
					{
						enableAsserts: ENABLE_ASSERTS,
						enableSMTChecker: ENABLE_SMTCHECKER,
					},

					// // This undocumented parameter appears to make it possible to specify what files to preprocess.
					// // It appears to be unnecessary to configure this.
					// // Comment-202408173 relates.
					// files: "???",

					transform: (line) => { return preProcessSolidityLine(hre, line); },
				}
			),
	},

	// When you make changes to the networks, remember to refactor the logic near Comment-202408313.
	networks: {
		hardhat :{
			allowUnlimitedContractSize: true
		},
		localhost: {
			url: `http://localhost:8545/`,
			gasMultiplier: 4,
		},
		rinkeby: {
			url: `https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
		sepolia: {
			url: `http://170.187.142.12:22545/`,
			accounts: process.env.SEPOLIA_PRIVATE_KEY !== undefined ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
			gasMultiplier: 2,
		},
		arbigoerli: {
			url: `https://goerli-rollup.arbitrum.io/rpc`,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
		arbitrum: {
			url: `https://arb1.arbitrum.io/rpc`,
			accounts: process.env.MAINNET_PRIVATE_KEY !== undefined ? [process.env.MAINNET_PRIVATE_KEY] : [],
		},
	},

	etherscan: {
		apiKey: "AKT1G1CBKHPHG5W6D8QK5YQ5G313V7JANK",
	},

	gasReporter: {
		// // Hardhat will set this based on the `REPORT_GAS` environment variable.
		// enabled: true,

		// offline: true,
		// excludeContracts: [ "MyContract" ],

		// // Issue. Do we need this for upgradable contarcts?
		// // See https://github.com/cgewecke/hardhat-gas-reporter/blob/master/docs/advanced.md#proxy-resolvers
		// proxyResolver: ???,

		// // Issue. This doesn't appear to make a difference.
		// includeIntrinsicGas: false,

		// Issue. Do we really need this?
		// @ts-ignore Object literal may only specify known properties, and 'reportPureAndViewMethods' does not exist in type 'Partial<EthGasReporterConfig>'.
		reportPureAndViewMethods: true,

		excludeAutoGeneratedGetters: false,

		// Issue. What exactly is this?
		trackGasDeltas: parseBooleanEnvironmentVariable("GAS_GOLF", false),

		showMethodSig: true,
		L1:
			"ethereum",
			// "moonbeam",
		// L2: "arbitrum",

		// Issue. This is supposed to be fetched automatically, but for some reason it's not happening. Is it a temporary glitch?
		// todo-1 To be revisited.
		gasPrice: 1.221,

		currency: 'USD',
		// token: "ETH",
		coinmarketcap: "ec58164c-e5bc-4bad-8d15-30b7a11004f1",
		L1Etherscan: "AKT1G1CBKHPHG5W6D8QK5YQ5G313V7JANK",
		// L2Etherscan: "AKT1G1CBKHPHG5W6D8QK5YQ5G313V7JANK",
		// tokenPrice: 1.0,
		reportFormat:
			// "markdown",
			"terminal",
		outputFile:
			// "gas-report.md",
			"gas-report.txt",
		// forceTerminalOutput: true,
		// forceTerminalOutputFormat: "terminal",
		noColors: true,
		// darkMode: true,
	},
};

// #endregion
// #region

if (ENABLE_SMTCHECKER) {
	// See https://docs.soliditylang.org/en/latest/using-the-compiler.html#compiler-input-and-output-json-description
	// On that page, find: modelChecker
	// @ts-ignore Property is possibly undefined. Property doesn't exist.
	hardhatUserConfig.solidity.settings.modelChecker = {
		// If you don't list any contracts here, all contracts under the "contracts" folder tree, except abstract ones, will be analyzed.
		// [Comment-202408173]
		// Issue. The preprocessor always preprocesses all Solidity sources, regardless of what you select here, if anything.
		// [/Comment-202408173]
		// [Comment-202409012]
		// Issue. Previously compiled contracts that don't need a recompile won't be analyzed.
		// Therefore remember to force-compile them.
		// [/Comment-202409012]
		// See https://docs.soliditylang.org/en/latest/smtchecker.html#verified-contracts
		contracts: {
			// "contracts/Source1.sol": ["Contract1"],
			// "contracts/Source2.sol": ["Contract2", "Contract3"],
			"contracts/Lock.sol": ["Lock"],
		},

		// // It appears to be unnecessary to configure this.
		// // See https://docs.soliditylang.org/en/latest/smtchecker.html#division-and-modulo-with-slack-variables
		// divModNoSlacks: ...

		// It appears to be documented that by default, all model checking engines will run, which is probably the best option.
		// Issue. Actually, without this being configured explicitly, no engines appear to run.
		// See https://docs.soliditylang.org/en/latest/smtchecker.html#model-checking-engines
		// See https://docs.soliditylang.org/en/latest/smtchecker.html#bounded-model-checker-bmc
		// See https://docs.soliditylang.org/en/latest/smtchecker.html#constrained-horn-clauses-chc
		engine: "all",

		// When we make an external call like `Contract1(address1).function1()`, SMTChecker will, by default, expect that
		// we are calling into potentially malicious code.
		// This parameter results in SMTChecker assuming that we are calling our own known contract.
		// This implies that for this to work correct we must cast an address to a specific contract, rather than to its interface.
		// A problem is that we make a lot of low level calls, like `call` or `delegatecall`, but SMTChecker doesn't recognize those.
		// So it would be beneficial at least in the mode in which SMTChecker is enabled to make high level calls.
		// See https://docs.soliditylang.org/en/latest/smtchecker.html#trusted-external-calls
		extCalls: "trusted",

		// By default, these won't be reported.
		// todo-0 Do we really need these?
		// See https://docs.soliditylang.org/en/latest/smtchecker.html#reported-inferred-inductive-invariants
		invariants: ["contract", "reentrancy",],

		// // We probably rarely need this.
		// // See https://docs.soliditylang.org/en/latest/smtchecker.html#proved-targets
		// showProvedSafe: true,

		// See https://docs.soliditylang.org/en/latest/smtchecker.html#unproved-targets
		showUnproved: true,

		// See https://docs.soliditylang.org/en/latest/smtchecker.html#unsupported-language-features
		showUnsupported: true,

		// // It appears to be unnecessary to configure this.
		// // See https://docs.soliditylang.org/en/latest/smtchecker.html#smt-and-horn-solvers
		// solvers: ["z3"],

		// By default, SMTChecker won't discover integer overflow and underflow.
		// To enable discovering those, list them explicitly, together with whatever others.
		// todo-0 Do we really need to discover them?
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
		timeout: 20 * 60 * 60 * 1000,
	};
}

// #endregion
// #region

module.exports = hardhatUserConfig;

// #endregion
