use crate::state::*;

use anchor_lang::prelude::*;

// we are dealing with the tokens.
use anchor_spl::{
   associated_token::AssociatedToken,
   token::{transfer, Mint, Token, TokenAccount, Transfer}
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
pub struct Stake<'info>{

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
        seeds = [b"stake", admin.key().as_ref(), nft_mint.key().as_ref()],
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

impl<'info> Stake<'info>{
    
    pub fn stake(&mut self, bumps: StakeBumps) -> Result<()> {
        let clock = Clock::get()?;

        self.stake_account.set_inner(
            StakeAccount{
                owner: self.admin.key(),
                mint: self.nft_mint.key(),
                staked_at: clock.unix_timestamp,
                bump: bumps.stake_account
            }
        );

        // Update user's staked count
        self.user_account.amount_staked = self.user_account.amount_staked.saturating_add(1);

        let cpi_accounts = Transfer{
            from: self.user_nft_ata.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.admin.to_account_info()
        };

        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);

        transfer(cpi_ctx, 1)?;

        Ok(())
    }
}

