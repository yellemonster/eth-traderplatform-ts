import { HardhatUserConfig } from "hardhat/config";
import "tsconfig-paths/register";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: "0.8.20",
};

export default config;
