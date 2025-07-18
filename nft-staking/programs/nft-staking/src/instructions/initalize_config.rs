use crate::states::*;

use std::alloc::System;

use anchor_lang::prelude::*;
use anchor_spl::token::{
    Mint,
    Token
};

// basically init account for everything here as the name suggests.. 
// user, 
// config_account..
// system_program 
// token_program 
// rent
// reward_account


#[derive(Accounts)]
pub struct InitializeConfig<'info>{

    #[account(mut)]
    pub admin : Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [b"config"],
        bump,
        space = 8 + StakeConfig::INIT_SPACE,
    )]
    pub config : Account<'info, StakeConfig>,

    #[account(
        init,
        payer = admin,
        seeds = [b"reward", config.key().as_ref()],
        bump,
        mint::decimals = 0,
        mint::authority = config
    )]

    pub reward_mint : Account<'info, Mint>,

    pub system_program : Program<'info, System>,
    pub token_program : Program<'info, Token>,
    pub rent : System<'info, Rent>

}

impl<'info> InitializeConfig<'info>{
    pub fn initialize_config(
        &mut self,
        points_per_stake : u8,
        max_unstake : u8,
        freeze_period : u8,
        bumps : initializeConfigBumps,
    )-> Result<()> {

        self.config.set_inner(StakeConfig {
            points_per_stake,
            max_unstake,
            freeze_period,
            reward_bumps : bumps.reward_bumps,
            bump : bumps.config,
        });
        
        
        Ok(())
    }
}

