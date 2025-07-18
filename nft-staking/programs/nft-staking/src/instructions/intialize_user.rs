use crate::{states::*, UserAccount};
use anchor_lang::prelude::*;

// basically init account for everything here as the name suggests.. 
// payer,
// system, token
// user_account


#[derive(Accounts)]
pub struct InitializeUser<'info>{

    #[account(mut)]
    pub admin : Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [b"user",  admin.key().as_ref()],
        bump,
        space = 8 + UserAccount::INIT_SPACE
    )]
    pub user_account : Account<'info, UserAccount>,

    pub system_program : Program<'info, System>

}

impl<'info> InitializeUser<'info>{

    pub fn initialize_user (&mut self, bump : InitializeUserBumps ) -> Result<()> {
       
        self.user_account.set_inner(UserAccount{
            points : 0,
            amount_staked : 0,
            bump : bumps.user_account
        });

        Ok(())
    }
    
}

