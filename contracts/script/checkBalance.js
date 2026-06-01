const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
    const address = "0xD9c10131d92f50335569a48A4b58d74f1865Da01";
    const balance = await provider.getBalance(address);
    console.log("Balance of", address, ":", ethers.formatEther(balance), "CELO");
}

main();
