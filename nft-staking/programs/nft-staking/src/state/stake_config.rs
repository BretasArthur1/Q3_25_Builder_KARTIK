use anchor_lang::prelude::*;

#[account]
#[drive(
    InitSpace
)]

// this is for handeling the info not the tokens...

pub struct StakeConfig{
    pub points_per_stake : u8,
    pub max_unstaked : u8, // max amount of NFT can be unstake.. 
    freeze_period : u32,
    reward_bump : u8,
    bump : u8
}