// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {ArtesaniaPassport} from "../src/ArtesaniaPassport.sol";
import {console} from "forge-std/console.sol";

contract DeployPassport is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        ArtesaniaPassport passport = new ArtesaniaPassport();

        console.log("--------------------------------------------------");
        console.log(
            "PASAPORTE HIBRIDO (HACKATHON) DESPLEGADO EN:",
            address(passport)
        );
        console.log("--------------------------------------------------");

        vm.stopBroadcast();
    }
}
