// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {BaseScript} from "./Base.s.sol";
import {ReFiSplitter} from "../src/ReFiSplitter.sol";
import {console} from "forge-std/console.sol";

contract DeployReFiSplitter is BaseScript {
    function run() external broadcast {
        // 1. Tesorería de la Ruta (La DApp, recibe el 5%)
        // Por defecto usará la wallet con la que despliegas
        address treasuryPool = broadcaster; 

        // 2. GoodPools Iniciales (El otro 5% se divide entre estos 2 pools, es decir 2.5% cada uno)
        address[] memory initialPools = new address[](2);
        // Pool 1: GoodDollar UBI+ for Women – Colombia
        initialPools[0] = 0x0d43131f1577310D6349bAF9D6Da4fC1Cd39764C; 
        // Pool 2: GoodDollar UBI+ for Women – Nigeria
        initialPools[1] = 0xDd1c12f197E6D1E2FBA15487AaAE500eF6e07BCA; 

        // 3. Despliegue del Nuevo Contrato Único
        ReFiSplitter splitter = new ReFiSplitter(treasuryPool, initialPools);
        
        console.log("-----------------------------------------");
        console.log("ReFi Splitter (UNIFICADO) deployed to:", address(splitter));
        console.log("Treasury DApp (5%):", treasuryPool);
        console.log("GoodPool 1 (2.5%):", initialPools[0]);
        console.log("GoodPool 2 (2.5%):", initialPools[1]);
        console.log("-----------------------------------------");
        console.log("ACTUALIZA TU .env.local y constantes con esta unica direccion!");
    }
}
