#!/usr/bin/bash
clear
rm gas-report.txt
# REPORT_GAS=true npx hardhat test
npx hardhat test
cat gas-report.txt
