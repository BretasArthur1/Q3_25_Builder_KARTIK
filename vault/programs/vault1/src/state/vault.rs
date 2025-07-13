use anchor_lang::prelude::*;

#[account]
pub struct VaultState {
    pub vault_bump: u8, // bump for the vault pda
    pub state_bump: u8, // bump for this pda itself
}

impl Space for VaultState {
    const INIT_SPACE: usize = 1 + 1 + 32 + 8 + 8; // vault_bump + state_bump + vault_authority + total_amount + total_depositors
}