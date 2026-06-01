const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
    const wallet = ethers.Wallet.createRandom().connect(provider);
    
    console.log("Checking if GoodDollar pool accepts CELO...");
    try {
        const gas = await provider.estimateGas({
            from: wallet.address,
            to: "0x0d43131f1577310D6349bAF9D6Da4fC1Cd39764C",
            value: ethers.parseEther("0.001")
        });
        console.log("Success! Gas estimated:", gas.toString());
    } catch (e) {
        console.log("Reverted! Pool 1 rejects CELO:");
        console.log(e.message);
    }

    console.log("Checking if Nigerian pool accepts CELO...");
    try {
        const gas = await provider.estimateGas({
            from: wallet.address,
            to: "0xDd1c12f197E6D1E2FBA15487AaAE500eF6e07BCA",
            value: ethers.parseEther("0.001")
        });
        console.log("Success! Gas estimated:", gas.toString());
    } catch (e) {
        console.log("Reverted! Pool 2 rejects CELO:");
        console.log(e.message);
    }
}

main();
