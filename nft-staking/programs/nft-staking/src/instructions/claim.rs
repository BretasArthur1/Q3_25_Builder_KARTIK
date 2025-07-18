use crate::state::*;
use crate::error::CustomError;

use anchor_lang::prelude::*;

// we are dealing with the tokens.
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, transfer, Mint, Token, TokenAccount, MintTo, Transfer}
};

// basically init account for everything here as the name suggests.. 
// admin
// user_account
// config_account
// Nft Mint to be staked
// user_nft_ata (Src nft transfer..)
// Vault token account where NFT will be stored..
// Stake record pda for tracking NFT

#[derive(Accounts)]
pub struct Claim<'info>{

    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"user", admin.key().as_ref()], 
        bump = user_account.bump 
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, StakeConfig>,

    pub nft_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = admin
    )]
    pub user_nft_ata: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = admin,
        seeds = [b"vault", nft_mint.key().as_ref()],
        bump,
        token::mint = nft_mint,
        token::authority = config
    )]
    pub vault: Account<'info, TokenAccount>,

    // keep a track of Stake records of NFT with Stake PDA
    #[account(
        init,
        payer = admin,
        seeds = [b"unstake", admin.key().as_ref(), nft_mint.key().as_ref()],
        bump,
        space = 8 + StakeAccount::INIT_SPACE
    )]
    pub stake_account: Account<'info, StakeAccount>,

    // reqs.. 
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> Claim<'info>{
    
    pub fn claim(&mut self, bumps: ClaimBumps) -> Result<()> {
       
       // Freeze period has passed ?: 
       let clock = Clock::get()?;
       let now = clock.unix_timestamp;
       if now - self.stake_account.staked_at < self.config.freeze_period as i64 {
           return Err(CustomError::NotFrozen.into());
       }
       
       if self.user_account.amount_staked == 0 {
           return Err(CustomError::NothingToUnstake.into());
       }

       self.user_account.amount_staked = self.user_account.amount_staked.saturating_sub(1);

       self.user_account.points = self.user_account.points.saturating_add(self.config.points_per_stake as u32);

       let seeds: &[&[u8]] = &[b"config", &[self.config.bump]];
       let signer: &[&[&[u8]]; 1] = &[seeds];

       let cpi_accounts = Transfer{
        from: self.vault.to_account_info(),
        to: self.user_nft_ata.to_account_info(),
        authority: self.config.to_account_info()
       };

       let cpi_ctx = CpiContext::new_with_signer(
        self.token_program.to_account_info(),
        cpi_accounts,
        signer
       );

       transfer(cpi_ctx, 1)?;

        Ok(())
    }
}

