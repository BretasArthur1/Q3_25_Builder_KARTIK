import wallet from "../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// Define our Mint address
const mint = publicKey("GP2pdr2sRGHFthbcaaLQ8Lx6mgVw8xZXcFXJ8PMMYAvs")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint, 
            mintAuthority : signer
        }

        let data: DataV2Args = {
            name: "Zenitsu",
            symbol: "Zen",
            uri: "https://imgs.search.brave.com/YKnxDhd09y3gJ6IBtmdHpHfF-Zxraij0-2CpnMT687w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hdmF0/YXJzLnBmcHRvd24u/Y29tLzg5Ni96ZW5p/dHN1LXBmcC0xNzAy/LnBuZw",
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data : data,
            isMutable : true,
            collectionDetails : null
        }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi);
        console.log(bs58.encode(result.signature));
        // sign : 4grcAUkrzMBFvV2Gjopu5oJXQpUVpdnwNF2UTAynLqr3uBKfznVLJBnHYnFDF3KaWFVKXTbucEz6oXdDXqpoVLk4
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
