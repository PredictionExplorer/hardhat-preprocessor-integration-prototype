#!/usr/bin/bash
clear
gio trash --force gas-report.txt
REPORT_GAS=true npx hardhat test
cat gas-report.txt
