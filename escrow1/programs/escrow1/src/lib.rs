pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("FJBrDNKhLaBPDbU5EWYhMJMYV6hhkAnLQs1aEUVG5ZcL");

#[derive(Accounts)]
pub struct Close<'info> {
    /// CHECK: This is the maker account
    pub maker: UncheckedAccount<'info>,
}

#[program]
pub mod escrow1 {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, recieve_amount: u64, amount: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, recieve_amount, &ctx.bumps)?;
        ctx.accounts.deposit(amount)?;
        Ok(())
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.deposit()?;
        Ok(())
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund_and_close()?;
        Ok(())
    }
}
