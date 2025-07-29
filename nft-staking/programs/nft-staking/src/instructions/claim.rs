use crate::state::*;
use crate::error::CustomError;

use anchor_lang::prelude::*;

use anchor_spl::token::{
    mint_to,
    Mint,
    MintTo,
    Token,
    TokenAccount,
};

#[derive(Accounts)]
pub struct Claim<'info>{
    #[account(
        mut
    )]
    pub admin : Signer<'info>,

    #[account(
        mut,
        seeds = [b"user", admin.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account : Account<'info, UserAccount>,


    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]

    pub config : Account<'info, StakeConfig>,

    #[account(
        mut,
        seeds = [b"rewards", config.key().as_ref()],
        bump = config.reward_bump
    )]
    pub rewards_mint : Account<'info, Mint>,

    #[account(
        mut, 
        associated_token::mint = rewards_mint,
        associated_token::authority = admin,
    )]
    pub user_reward_ata : Account<'info, TokenAccount>,

    pub token_program : Program<'info, Token>,
    
}


impl<'info> Claim<'info>{
    pub fn claim(&mut self) -> Result<()> {
        let amount = self.user_account.points;

        // Don't allow claiming if no points
        require!(amount > 0, CustomError::NoRewardsToClaim);

        // Mint reward tokens to user's ATA
        let seeds: &[&[u8]] = &[b"config", &[self.config.bump]];
        let signer = &[seeds];

        let cpi_accounts = MintTo {
            mint: self.rewards_mint.to_account_info(),
            to: self.user_reward_ata.to_account_info(),
            authority: self.config.to_account_info(),
        };

        let cpi_ctx =
            CpiContext::new_with_signer(self.token_program.to_account_info(), cpi_accounts, signer);

        mint_to(cpi_ctx, amount.into())?;

        // Reset user points after claiming
        self.user_account.points = 0;

        Ok(())
    } 
}