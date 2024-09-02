#!/usr/bin/bash

'clear'

# Issue. This will not necessarily work on any Linux distro, let alone on MacOS.
# todo-3 To be fixed.
'gio' 'trash' '--force' '--' 'gas-report.txt'

(
	export ENABLE_HARDHAT_PREPROCESSOR='false'
	export ENABLE_ASSERTS='false'
	export ENABLE_SMTCHECKER='false'

	export REPORT_GAS='true'

	time 'npx' 'hardhat' 'test'
)

'cat' '--' 'gas-report.txt'
