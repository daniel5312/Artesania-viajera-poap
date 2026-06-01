// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {BaseScript} from "./Base.s.sol";
import {ReFiSplitter} from "../src/ReFiSplitter.sol";
import {console} from "forge-std/console.sol";

/**
 * @title Script de Despliegue Unificado (Artesanía Viajera)
 * @dev [BLOCKCHAIN] Este script automatiza la inyección del contrato en Celo Mainnet.
 * Arquitectura Híbrida: Soporta G$ (Smart Contracts) y CELO/USDT (EOAs) en un solo contrato.
 */
contract DeployReFiSplitter is BaseScript {
    function run() external broadcast {
        
        // [REFI] 1. Tesorería DApp (Recibe 5%)
        address treasuryPool = 0x6178B5B1447B2E48E0283cd19f0D8eEF2e7C8C1E;

        // [REFI] 2. Pools Exclusivos para G$ (Contratos de GoodDollar) (Reciben 5% dividido)
        address[] memory gdPools = new address[](2);
        gdPools[0] = 0x4016bcD00595304b7B0d366c8B6e507De7896D8B; 
        gdPools[1] = 0x98a19b36E2bCbC8DC69BB82ddedBc3AEc8f71221; 

        // [REFI] 3. Pools para CELO / USDT (Billeteras de Cripto Nativas) (Reciben 5% dividido)
        address[] memory cryptoPools = new address[](2);
        // Tesorería pool artesanos (2.5%)
        cryptoPools[0] = 0x6178B5B1447B2E48E0283cd19f0D8eEF2e7C8C1E;
        // Wallet auto-fondeo gas (2.5%)
        cryptoPools[1] = 0x9158C35f1a054F25f9D45EA47107D54a2ea25945;

        // [CELO] 4. Instanciamos el contrato y lo enviamos a la red.
        ReFiSplitter splitter = new ReFiSplitter(treasuryPool, gdPools, cryptoPools);
        
        // [BLOCKCHAIN] Mostramos la dirección final en la terminal de forma clara.
        console.log("---------------------------------------------------------");
        console.log(unicode"✅ ReFi Splitter (ARQUITECTURA DUAL) desplegado con exito!");
        console.log(unicode"👉 DIRECCION DEL SMART CONTRACT:");
        console.log(address(splitter));
        console.log("---------------------------------------------------------");
    }
}
