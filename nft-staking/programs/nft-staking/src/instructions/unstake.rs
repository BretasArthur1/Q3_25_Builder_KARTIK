use crate::states::*;
use std::alloc::System;

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
// user_nft_ata (Src nft tarnsfer..)
// Vault token account where NFT will be stored..
// Stake record pda for tracking NFT


#[derive(Accounts)]
pub struct Unstake<'info>{

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

    #[account(
        mut,
        seeds = [b"rewards", config.key().as_ref()],
        bump = config.rewards_bump
    )]

    pub rewards_mint : Account<'info, Mint>,

   
    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = admin
    )]

    pub user_reward_ata : Account<'info, TokenAccounte>,


    // reqs.. 
    // sequeze out the tokens... 

    pub token_program : Program<'info, Token>,
}

impl<'info> Claim<'info>{
    
    pub fn claim(&mut self) -> Result<()> {
        let amount = self.user_account.points;

        require!(amount>0, CustomError::NoRewardsToClaim);

        let seeds : &[&[u8]] = &[b"config", &[self.config.bump]];
        let signer =        &[seeds];

        let cpi_account = MintTo{
            mint : self.rewards_mint.to_account_info(),
            to : self.user_reward_ata.to_account_info(),
            authority : self.config.to_account_info()
        };

        let cpi_ctx = CpiContext::new_with_signer(self.token_program.to_account_info(), cpi_account, signer);
        mint_to(cpi_ctx , amount.into());
        
        self.user_account.points = 0; // reward has been claimed !

        Ok(())
    }


}

