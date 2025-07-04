import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "./wallet/turbin3-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    
    let tx = await createNft(umi, {
        mint,
        name : "Rugged Jeff",
        symbol : "jf",
        uri : " https://gateway.irys.xyz/BXmHot17gCrVf3aVbgx5PawcWKpkavissufxvSadzZ4k",
        sellerFeeBasisPoints : percentAmount(5)
    });

    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);
    
    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);

    //  6no83nnVLzUabrkje7Sr4Tx4phabY6GUsc1j4guYJJEJ

    // https://explorer.solana.com/tx/52Xqpu4vUDShKv1ZvBrbTit3B9YwzWAZit6WsXdcsH7FZbfUMkuYWCWQAQRKRV4Ubsac78G3zXCKY1SpiTFRHFQW?cluster=devnet
})();