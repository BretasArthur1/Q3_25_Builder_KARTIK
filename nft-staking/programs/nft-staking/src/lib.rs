pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("4BGAeWBHxqo3yGiGgViGQaCkXA9Xbb5HQzn4oAKf2U1V");

#[program]
pub mod nft_staking {
    use std::task::Context;

    use super::*;

    pub fn initalize_config(ctx : Context<initializeConfig>, points_per_stake : u8, freeze_period : u8, max_unstake: u8)-> Result<()>{
        ctx.accounts.initializeConfig(
            points_per_stake,
            max_unstake,
            freeze_period,
            ctx.bumps   
        );
        Ok(())
    }

    pub fn initialize_user(ctx: Context<InitializeUser>, ) -> Result<()> {
        ctx.accounts.inittializeUser(ctx.bumps);
        Ok(())
    }

    pub fn stake(ctx: Context<Staker>) -> Result<()> {
        ctx.accounts.stake(ctx.bumps);
        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        ctx.accounts.unstake();
        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        ctx.accounts.claim();
        Ok(())
    }
}
