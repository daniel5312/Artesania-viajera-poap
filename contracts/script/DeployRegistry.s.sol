// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {ArtesaniaRegistry} from "../src/ArtesaniaRegistry.sol";
import {console} from "forge-std/console.sol";

contract DeployRegistry is Script {
    function run() public {
        // 1. Cargamos tu clave privada del archivo .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // 2. La dirección de tu Passport que ya está en Sepolia
        address passportAddress = 0x86b6E480a423f49C4104EeAcC13c262263c24ee9;

        vm.startBroadcast(deployerPrivateKey);

        // 3. Desplegamos el Registry pasando la dirección del Passport al constructor
        ArtesaniaRegistry registry = new ArtesaniaRegistry(passportAddress);

        console.log("--------------------------------------------------");
        console.log("REGISTRY (SOCIAL STORE) DESPLEGADO EN:");
        console.log(address(registry));
        console.log("CONECTADO AL PASAPORTE:", passportAddress);
        console.log("--------------------------------------------------");

        vm.stopBroadcast();
    }
}
