use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct StakeConfig{
    pub points_per_stake: u8,
    pub max_unstaked: u8, // max amount of NFT can be unstake.. 
    pub freeze_period: u32,
    pub reward_bump: u8,
    pub bump: u8
}