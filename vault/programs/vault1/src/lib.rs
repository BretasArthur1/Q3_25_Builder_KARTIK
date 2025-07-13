pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("BHXfw6zfZcJ8grDZZFacT55YYgCb5JciVqCaDydG6MqK");

#[program]
pub mod vault1 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
          ctx.accounts.initialize(&ctx.bumps);
          Ok(())
    }

    pub fn deposit(ctx: Context<Hold>, amount: u64) -> Result<()> {
          ctx.accounts.deposit(amount);
          Ok(())
    }

    pub fn withdraw(ctx: Context<Hold>, amount: u64) -> Result<()> {
          ctx.accounts.withdraw(amount);
          Ok(())    
    }

    pub fn close(ctx: Context<Close>) -> Result<()> {
          ctx.accounts.close();
          Ok(())
    }
}







