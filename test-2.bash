#!/usr/bin/bash
clear

# Issue. This will not necessarily work on any Linux distro, let alone on MacOS.
# todo-3 To be fixed.
gio trash --force gas-report.txt

REPORT_GAS=true npx hardhat test
cat gas-report.txt
