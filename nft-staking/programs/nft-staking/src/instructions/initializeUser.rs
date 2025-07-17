use crate::states::*;
use anchor_lang::prelude::*;

// basically init account for everything here as the name suggests.. 
// payer,
// system, token
// user_account


#[derive(Accounts)]
pub struct initializeUser<'info>{

    #[account(mut)]
    pub admin : Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [b"user",  user.key().as_ref()],
        bump,
        space = 8 + UserAccount::INIT_SPACE
    )]
    pub user_account : Account<'info, UserAccount>,  // ?

    pub system_account : Program<'info, System>,

}

impl<'info> initializeUser<'info>{

    pub fn initialize_user (&mut self, bump : initializeUserBumps ) -> Result<()> {
       
        self.user_account.set_inner(UserAccount{
            points : 0,
            amount_staked : 0,
            bump : bump.user_account
        });

        Ok(())
    }
    
}

