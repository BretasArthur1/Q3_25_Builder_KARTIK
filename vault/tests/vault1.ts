import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault1 } from "../target/types/vault1";
import { expect } from "chai";

describe("vault1", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const signer = anchor.web3.Keypair.generate();
  
  // @ts-ignore
  const program = anchor.workspace.Vault1 as Program<Vault1>;

  let vault: anchor.web3.PublicKey;
  let vaultState: anchor.web3.PublicKey;

  before(async () => {
    // Fund the test account
    await provider.connection.requestAirdrop(signer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    
    // Wait for airdrop to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate PDAs with correct seeds
    [vault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), signer.publicKey.toBuffer()],
      program.programId
    );

    [vaultState] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), signer.publicKey.toBuffer()],
      program.programId
    );

    // Initialize the vault
    await program.methods.initialize().accounts({
      payer: signer.publicKey,
      vault: vault,
      vaultState: vaultState,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([signer]).rpc();
  });

  it("should initialize vault", async () => {
    // @ts-ignore
    const vaultStateAccount = await program.account.vaultState.fetch(vaultState);
    
    expect(vaultStateAccount.vaultBump).to.be.a("number");
    expect(vaultStateAccount.stateBump).to.be.a("number");
    console.log("Vault initialized with bumps:", vaultStateAccount);
  });

  it("should deposit funds", async () => {
    const amount = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL);
    
    const vaultBalanceBefore = await provider.connection.getBalance(vault);
    
    const tx = await program.methods.deposit(amount).accounts({
      user: signer.publicKey,
      vault: vault,
      vaultState: vaultState,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([signer]).rpc();

    console.log("Deposit tx:", tx);

    const vaultBalanceAfter = await provider.connection.getBalance(vault);
    expect(vaultBalanceAfter).to.be.greaterThan(vaultBalanceBefore);
    
    console.log("Vault balance increased by:", vaultBalanceAfter - vaultBalanceBefore);
  });

  it("should withdraw funds", async () => {
    const amount = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL / 2);
    
    const vaultBalanceBefore = await provider.connection.getBalance(vault);
    
    const tx = await program.methods.withdraw(amount).accounts({
      user: signer.publicKey,
      vault: vault,
      vaultState: vaultState,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([signer]).rpc();

    console.log("Withdraw tx:", tx);

    const vaultBalanceAfter = await provider.connection.getBalance(vault);
    expect(vaultBalanceAfter).to.be.lessThan(vaultBalanceBefore);
    
    console.log("Vault balance decreased by:", vaultBalanceBefore - vaultBalanceAfter);
  });
});



