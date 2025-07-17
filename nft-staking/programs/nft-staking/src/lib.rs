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

    pub fn initializeConfig(ctx : Context<initializeConfig>, points_per_stake : u8, freeze_period : u8, max_unstake: u8)-> Result<()>{
        ctx.accounts.initializeConfig(
            points_per_stake,
            max_unstake,
            freeze_period,
            ctx.bumps   
        );
        Ok(())
    }

    pub fn initializeUser(ctx: Context<initializeUser>, ) -> Result<()> {
        ctx.accounts.inittializeUser(ctx.bumps);
        Ok(())
    }
}
