// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {ArtesaniaBadge} from "../src/ArtesaniaBadge.sol";
import {console} from "forge-std/console.sol";

contract DeployArtesaniaBadge is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        ArtesaniaBadge badge = new ArtesaniaBadge();

        console.log("--------------------------------------------------");
        console.log("ARTESANIA BADGE (ERC-1155) DESPLEGADO EN:");
        console.log(address(badge));
        console.log("--------------------------------------------------");

        vm.stopBroadcast();
    }
}
