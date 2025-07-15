'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useMemo } from 'react';

export default function ConnectButton() {
    const {publicKey, disconnect} = useWallet();
    const {setVisible} = useWalletModal();

    const WalletAddress = useMemo(()=>{
        if (!publicKey) return null;
        return `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;
    }, [publicKey])  // why ? 

  return (
    <>
    <button
       onClick={()=>{
          if(publicKey) disconnect();

          else setVisible(true);
       }}
       className="bg-green-400 py-3 px-5 rounded-xl text-l text-black/95 font-sans font-bold hover:bg-green-300 cursor-pointer transition duration-400"
    >
        {WalletAddress ?? "Select Wallet"}
    </button>
    </>
  );
}
