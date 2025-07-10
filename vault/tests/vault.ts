import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { expect } from "chai";

describe("vault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Vault as Program<Vault>;
  const provider = anchor.AnchorProvider.env();
  
  // Test accounts
  const user = anchor.web3.Keypair.generate();
  let vaultPda: anchor.web3.PublicKey;
  let vaultStatePda: anchor.web3.PublicKey;
  let vaultBump: number;
  let stateBump: number;

  before(async () => {
    // Airdrop SOL to user for testing
    const signature = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Derive PDAs
    [vaultStatePda, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), user.publicKey.toBuffer()],
      program.programId
    );

    [vaultPda, vaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vaultStatePda.toBuffer()],
      program.programId
    );
  });

  it("Initializes the vault", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        signer: user.publicKey,
        vault: vaultPda,
        vaultState: vaultStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Initialize transaction signature", tx);

    // Check that vault state was created
    const vaultStateAccount = await program.account.vaultState.fetch(vaultStatePda);
    expect(vaultStateAccount.vaultBump).to.equal(vaultBump);
    expect(vaultStateAccount.stateBump).to.equal(stateBump);

    // Check that vault account exists
    const vaultAccountInfo = await provider.connection.getAccountInfo(vaultPda);
    expect(vaultAccountInfo).to.not.be.null;
    expect(vaultAccountInfo?.lamports).to.equal(0);
  });

  it("Deposits SOL to the vault", async () => {
    const depositAmount = 0.5 * anchor.web3.LAMPORTS_PER_SOL;
    
    const userBalanceBefore = await provider.connection.getBalance(user.publicKey);
    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

    const tx = await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        signer: user.publicKey,
        vault: vaultPda,
        vaultState: vaultStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Deposit transaction signature", tx);

    const userBalanceAfter = await provider.connection.getBalance(user.publicKey);
    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);

    // Check balances changed correctly (accounting for transaction fees)
    expect(vaultBalanceAfter - vaultBalanceBefore).to.equal(depositAmount);
    expect(userBalanceBefore - userBalanceAfter).to.be.greaterThan(depositAmount); // Including tx fees
  });

  it("Fails to deposit zero amount", async () => {
    try {
      await program.methods
        .deposit(new anchor.BN(0))
        .accounts({
          signer: user.publicKey,
          vault: vaultPda,
          vaultState: vaultStatePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();
      
      expect.fail("Should have failed with invalid amount");
    } catch (error) {
      expect(error.message).to.include("InvalidAmount");
    }
  });

  it("Withdraws SOL from the vault", async () => {
    const withdrawAmount = 0.2 * anchor.web3.LAMPORTS_PER_SOL;
    
    const userBalanceBefore = await provider.connection.getBalance(user.publicKey);
    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

    const tx = await program.methods
      .withdraw(new anchor.BN(withdrawAmount))
      .accounts({
        signer: user.publicKey,
        vault: vaultPda,
        vaultState: vaultStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Withdraw transaction signature", tx);

    const userBalanceAfter = await provider.connection.getBalance(user.publicKey);
    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);

    // Check balances changed correctly
    expect(vaultBalanceBefore - vaultBalanceAfter).to.equal(withdrawAmount);
    expect(userBalanceAfter - userBalanceBefore).to.be.lessThan(withdrawAmount); // Minus tx fees
  });

  it("Fails to withdraw more than vault balance", async () => {
    const vaultBalance = await provider.connection.getBalance(vaultPda);
    const excessiveAmount = vaultBalance + 1000000; // More than available

    try {
      await program.methods
        .withdraw(new anchor.BN(excessiveAmount))
        .accounts({
          signer: user.publicKey,
          vault: vaultPda,
          vaultState: vaultStatePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();
      
      expect.fail("Should have failed with insufficient funds");
    } catch (error) {
      expect(error.message).to.include("InsufficientFunds");
    }
  });

  it("Fails to withdraw zero amount", async () => {
    try {
      await program.methods
        .withdraw(new anchor.BN(0))
        .accounts({
          signer: user.publicKey,
          vault: vaultPda,
          vaultState: vaultStatePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();
      
      expect.fail("Should have failed with invalid amount");
    } catch (error) {
      expect(error.message).to.include("InvalidAmount");
    }
  });

  it("Closes the vault and returns remaining funds", async () => {
    const userBalanceBefore = await provider.connection.getBalance(user.publicKey);
    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

    const tx = await program.methods
      .close()
      .accounts({
        signer: user.publicKey,
        vault: vaultPda,
        vaultState: vaultStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Close transaction signature", tx);

    const userBalanceAfter = await provider.connection.getBalance(user.publicKey);

    // Check that vault state account is closed
    try {
      await program.account.vaultState.fetch(vaultStatePda);
      expect.fail("Vault state should be closed");
    } catch (error) {
      expect(error.message).to.include("Account does not exist");
    }

    // Check that user received vault funds and rent
    expect(userBalanceAfter).to.be.greaterThan(userBalanceBefore);
    
    // Vault should still exist but with 0 balance after manual transfer
    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
    expect(vaultBalanceAfter).to.equal(0);
  });
});
