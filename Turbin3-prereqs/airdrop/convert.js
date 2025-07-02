"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bs58_1 = require("bs58");
var prompt_sync_1 = require("prompt-sync");
var prompt = (0, prompt_sync_1.default)();
// Convert Base58 → Wallet Bytes
function base58ToWallet() {
    var base58Key = prompt("Enter base58 private key: ");
    try {
        var walletBytes = bs58_1.default.decode(base58Key);
        console.log("✅ Wallet bytes:\n", walletBytes);
        console.log("\nSolana CLI array format:\n[", walletBytes.toString(), "]");
    }
    catch (err) {
        console.error("❌ Invalid base58 input:", err);
    }
}
// Convert Wallet Bytes → Base58
function walletToBase58() {
    var jsonInput = prompt("Enter wallet byte array (e.g. [12,34,...]): ");
    try {
        var byteArray = JSON.parse(jsonInput);
        var base58Key = bs58_1.default.encode(Uint8Array.from(byteArray));
        console.log("✅ Base58 private key:\n", base58Key);
    }
    catch (err) {
        console.error("❌ Invalid input array:", err);
    }
}
var option = prompt("Choose:\n1. Base58 → Wallet Bytes\n2. Wallet Bytes → Base58\n> ");
if (option === "1")
    base58ToWallet();
else if (option === "2")
    walletToBase58();
else
    console.log("❌ Invalid option.");
