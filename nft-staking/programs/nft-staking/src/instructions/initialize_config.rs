use crate::state::*;

use anchor_lang::prelude::*;

use anchor_spl::{
   associated_token::AssociatedToken,
   token::{Mint, Token, TokenAccount}
};

// basically init account for everything here as the name suggests.. 
// admin
// config_account
// rewardMint (SPL Token)

#[derive(Accounts)]
#[instruction(points_per_stake: u8, max_unstake: u8, freeze_period: u8)]
pub struct InitializeConfig<'info>{

    #[account(mut)]
    pub admin : Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [b"config"], 
        bump,
        space = 8 + StakeConfig::INIT_SPACE 
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

    // reqs.. 

    pub token_program : Program<'info, Token>,
    pub associated_token_program : Program <'info, AssociatedToken>,
    pub system_program : Program <'info, System>,
    pub rent : Sysvar<'info, Rent>

}

impl<'info> InitializeConfig<'info>{
    
    pub fn initialize_config(
        &mut self,
        points_per_stake : u8,
        max_unstake : u8,
        freeze_period : u8,
        bumps : InitializeConfigBumps,
    )-> Result<()> {

        self.config.set_inner(
            StakeConfig{
                points_per_stake,
                max_unstaked: max_unstake,
                freeze_period: freeze_period as u32,
                reward_bump: bumps.reward_mint,
                bump: bumps.config
            }
        );

        Ok(())
    }


}

