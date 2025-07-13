use anchor_lang::prelude::*;

use crate::state::VaultState;

#[derive(Accounts)]

pub struct Initialize<'info>{
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init, 
        payer = payer,
        space = 8 + VaultState::INIT_SPACE, 
        seeds = [b"vault", payer.key().as_ref()],
        bump,
    )]

    pub vault_state: Account<'info, VaultState>,


    #[account(
        seeds = [b"vault", payer.key().as_ref()],
        bump,
    )]

    pub vault : SystemAccount<'info>,

    pub system_program : Program<'info, System>

}


impl Initialize<'_> {

    pub fn initialize(&mut self, bumps : &InitializeBumps) -> Result<()> {
        self.vault_state.vault_bump = bumps.vault;
        self.vault_state.state_bump = bumps.vault_state;
        Ok(())
    }
}
