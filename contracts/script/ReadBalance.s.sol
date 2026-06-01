// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import "forge-std/Script.sol";
import "forge-std/console.sol";

contract ReadBalance is Script {
    function run() external view {
        address agent = 0xD9c10131d92f50335569a48A4b58d74f1865Da01;
        console.log("Agent CELO Balance:", agent.balance);
    }
}
