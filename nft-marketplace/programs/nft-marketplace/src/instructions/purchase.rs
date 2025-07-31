use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::state::{Listing, Marketplace};

#[derive(Accounts)]
pub struct Purchase<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,
    pub maker: SystemAccount<'info>,

    #[account(
        mut,
        associated_token::mint = maker_mint,
        associated_token::authority = taker,
    )]
    pub taker_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        seeds = [b"marketplace",marketplace.name.as_bytes()],
        bump=marketplace.bump,
    )]
    pub marketplace: Account<'info, Marketplace>,

    pub maker_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = maker_mint,
        associated_token::authority = listing,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        close = taker,
        seeds = [marketplace.key().as_ref(),maker_mint.key().as_ref()],
        bump = listing.bump,
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        seeds = [b"treasury",marketplace.key().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}
impl<'info> Purchase<'info> {
    pub fn purchase(&mut self) -> Result<()> {
        let fee = self
            .listing
            .price
            .checked_mul(self.listing.price)
            .unwrap()
            .checked_div(10000_u64)
            .unwrap();

        let cpi_accounts = Transfer {
            from: self.taker.to_account_info(),
            to: self.maker.to_account_info(),
        };
        let fee_cpi_accounts = Transfer {
            from: self.taker.to_account_info(),
            to: self.treasury.to_account_info(),
        };
        let ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);
        let fee_ctx = CpiContext::new(self.token_program.to_account_info(), fee_cpi_accounts);
        transfer(fee_ctx, fee)?;

        transfer(ctx, self.listing.price)?;
        self.deposit_nft()?;
        self.close_mint_vault()

        // todo!()
    }

    pub fn deposit_nft(&mut self) -> Result<()> {
        let cpi_ctx = CpiContext::new(
            self.token_program.to_account_info(),
            TransferChecked {
                from: self.vault.to_account_info(),
                mint: self.maker_mint.to_account_info(),
                to: self.taker_ata.to_account_info(),
                authority: self.maker.to_account_info(),
            },
        );
        transfer_checked(cpi_ctx, 1, self.maker_mint.decimals)
        // todo!()
    }

    pub fn close_mint_vault(&mut self) -> Result<()> {
        let seeds: &[&[u8]; 3] = &[
            &self.marketplace.key().to_bytes()[..],
            &self.maker_mint.key().to_bytes()[..],
            &[self.listing.bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let cpi_program = self.token_program.to_account_info();

        let close_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(),
            authority: self.listing.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, close_accounts, signer_seeds);

        close_account(cpi_ctx)
    }
}