use anchor_lang::prelude::*;


#[account]
#[drive(
    InitSpace
)]

pub struct StakeAccount{
    pub owner : PubKey, 
    pub staked_at : i64,
    pub mint : PubKey,
    pub bump : u8 
}