#![allow(deprecated)]
#![allow(unexpected_cfgs)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("Aj6e6DbzbgwQrHK7DACMHWqgaacKpHanF4ePa8BjMVzx");


#[program]
pub mod escrow {
    use super::*;

    pub fn make(ctx : Context<Make>, seed : u64, receive : u64, deposit : u64)->Result<()> {
        ctx.accounts.init_escrow(
            seed,
            receive,
            &ctx.bumps
        )?;

        ctx.accounts.deposit(deposit)?;

        Ok(())
    }

    pub fn take(ctx : Context<Take>)->Result<()> {
        ctx.accounts.withdraw_and_close_vault()?;
        Ok(())
    }
    
}



