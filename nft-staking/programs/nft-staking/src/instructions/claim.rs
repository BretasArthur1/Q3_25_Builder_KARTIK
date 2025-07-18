use crate::states::*;
use std::alloc::System;

use anchor_lang::prelude::*;

// we are dealing with the tokens.
use anchor_spl::{
    Mint,
    mint_to,
    TokenAccount,
    Token,
    MintTo
};

// basically init account for everything here as the name suggests.. 
// admin
// user_account
// config_account
// Nft Mint to be staked
// user_nft_ata (Src nft tarnsfer..)
// Vault token account where NFT will be stored..
// Stake record pda for tracking NFT

#[derive(Accounts)]
pub struct Claim<'info>{

    #[account(mut)]
    pub admin : Signer<'info>,

    #[account(
        mut,
        seeds = [b"user", admin.key().as_ref()], 
        bump = user_account.bump 
    )]

    pub user_account : Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]

    pub config : Account<'info, StakeConfig>,

    pub nft_mint : Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = admin
    )]

    pub user_nft_ata : Account<'info, TokenAccounte>,
    
    #[account(
        init_if_needed,
        payer = admin,
        seeds = [b"vault",nft_mint.key().as_ref()],
        bump,
        token::mint = nft_mint,
        token::authority = config
    )]

    pub vault : Account<'info, TokenAccount>,

    // keep a track of Stake records of NFT with Stake PDA
    #[account(
        init,
        payer = admin,
        seeds = [b"unstake", admin.key().as_ref(), nft_mint.key().as_ref()],
        bump,
        space = 8 + StakeAccount::INIT_SPACE
    )]

    pub stake_account : Account<'info, StakeAccount>,

    // reqs.. 

    pub token_program : Program<'info, Token>,
    pub associated_token_program : Program <'info, AssociatedToken>,
    pub system_program : Program <'info, System>,
    pub rent : System<'info, Rent>,
    pub clock : System<'info, Clock>, // for TimeStamp... 

}

impl<'info> Claim<'info>{
    
    pub fn claim(&mut self, bumps : StakeBumps) -> Result<()> {
       
       // Freeze period has passed ?: 
       let now = clock::get?.unix_timestamp;
       require!(
         now - self.stake_account.stake_at >= self.config.freeze_period as id,
         CustomError::NotFrozen
       );
       
       require!(
         self.user_account.amount_staked >= 0,
         CustomError::NothingToUnstake
       );

       self.user_account.amount_staked = self.user_account.amount_staked.checked_sub(1).ok_or(
        CustomError::Underflow
       );

       self.user_account.points = self.user_account.points.checked_add(self.config.points_per_stake as u32);

       let seeds : &[&[u8]] = &["config", &[self.config.bump]];
       let signer : &[&[u8]; 1] = &[seeds];

       let cpi_accounts = Transfer{
        from : self.vault.to_account_infO(),
        to : self.admin.to_account_info(),
        authority : self.config.to_account_info()
       };

       let cpi_ctx = CpiContext::new_with_signer(
        self.token_program.to_account_info(),
        signer,
        cpi_accounts
       );

       transfer(cpi_ctx, 1)?;

        Ok(())
    }


}

