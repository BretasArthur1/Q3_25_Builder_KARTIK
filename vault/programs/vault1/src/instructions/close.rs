use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer}
};

use crate::state::VaultState;

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut)]
    pub user : Signer<'info>,

    #[account(
        mut,
        seeds = [b"state", user.key().as_ref()],
        bump = vault_state.state_bump,
        close = user
    )]

    pub vault_state : Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump = vault_state.vault_bump
    )]

    pub vault : SystemAccount<'info>,

    pub system_program : Program<'info, System>,
}

impl Close<'_>{

    pub fn close(&mut self)-> Result<()> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts: Transfer<'_> = Transfer{
            from : self.vault.to_account_info(),
            to : self.user.to_account_info()
        };

        let user_key = self.user.key();
        let bump = [self.vault_state.vault_bump];
        
        let seeds: &[&[u8]] = &[
            b"vault",
            user_key.as_ref(),
            &bump
        ];

        let signer_seed: &[&[&[u8]]] = &[&seeds[..]];
        
        let cpi_ctx = CpiContext::new_with_signer(
            cpi_program,
            cpi_accounts,           
            signer_seed
        );
        
        transfer(cpi_ctx, self.vault.lamports())?;
        Ok(())
    }

}
