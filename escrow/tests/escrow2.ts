import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";

describe("escrow", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.escrow as Program<Escrow>;

  it("Can call make instruction", async () => {
    // Dummy values for demonstration
    const seed = new anchor.BN(1);
    const receive = new anchor.BN(1000);
    const deposit = new anchor.BN(1000);

    // You will need to fill in the correct accounts here
    // This is just a placeholder to show the correct method usage
    try {
      await program.methods.make(seed, receive, deposit).accounts({
        // Fill in the required accounts here
        // maker: ...,
        // mintA: ...,
        // mintB: ...,
        // makerAtaA: ...,
        // escrow: ...,
        // vault: ...,
        // associatedTokenProgram: ...,
        // tokenProgram: ...,
        // systemProgram: ...,
      }).rpc();
    } catch (e) {
      // This will likely fail until you fill in the correct accounts
      console.log("Expected error (fill in accounts):", e.message);
    }
  });
});
