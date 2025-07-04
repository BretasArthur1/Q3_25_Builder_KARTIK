import wallet from "./wallet/turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"


// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = "https://gateway.irys.xyz/2Cjtpc2DoTJNvhFSobHaSFnz9eP2HKwedNHFcaDTgqbp"
        const metadata = {
            name: "Rugged Jeff",
            symbol: "jf",
            description: "Jeff pfp",
            image,
            attributes: [
                {trait_type: 'rarity', value: 'legend'}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri : image
                    },
                ]
            },
            creators: []
        };
        const myUri = await umi.uploader.uploadJson(metadata)
        console.log("Your metadata URI: ", myUri);
        // https://gateway.irys.xyz/8qnM4nvUX9jNe8ufLnGTSPxaS44cMwL3B5Vj2hhww6Ny
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
