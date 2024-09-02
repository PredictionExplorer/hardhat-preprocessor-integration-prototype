#!/usr/bin/bash

'clear'

(
	export ENABLE_HARDHAT_PREPROCESSOR='true'
	export ENABLE_ASSERTS='true'
	export ENABLE_SMTCHECKER='true'

	# Comment-202409012 applies.
	'npx' 'hardhat' 'clean' '--global' && 'npx' 'hardhat' 'clean'
	
	time 'npx' 'hardhat' 'compile'
	# 'time' 'npx' 'hardhat' 'compile'
)
