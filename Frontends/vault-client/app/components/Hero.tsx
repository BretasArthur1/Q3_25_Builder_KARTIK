"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useMemo } from 'react';
import Vault from "./vault";


const Hero = ()=>{
    
    const {publicKey, disconnect, Connected} = useWallet();
    const isConnected = !!publicKey;
    const [balance, setBalance] = useState<number | null>(null);
    const [showVault, setshowVault] = useState(false)

    const {setVisible} = useWalletModal();

    const WalletAddress = useMemo(()=>{
        if (!publicKey) return null;
        return `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;
    }, [publicKey])  // why ? 


    useEffect(()=>{
        const getBalance = async ()=>{
            if(!publicKey) return;

            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            try{
                const lamports = await connection.getBalance(publicKey);
                const sol = lamports/1e9;
                const finalVal : any = sol?.toFixed(4);
                setBalance(finalVal);
            }
            catch(error){
                console.error(error);
                toast.error("Failed...")
            }


        }
        getBalance();
    }, [publicKey]);

    const handleClick = async ()=>{
        try{
            if(isConnected){
                setshowVault(true);
            }
            else{
                toast("Connect wallet");

                return;
            }
        }
        catch(error){
            console.error(error)
        }
    }


    return(
        <>
        <div className="flex justify-center">
            <div className="flex flex-col gap-30">

            <div className="flex justify-center">
                <h1 className="text-4xl font-serif text-white">Securely store and withdraw your  <br />  <div className="flex justify-center">
                     <span className="text-green-300 px-2">crypto</span>  from the vault at any time!</div></h1>
            </div>

            <div className="flex flex-col">
                {
                   isConnected ?   <div className="flex justify-between  mb-2 font-bold">
                   <h1>Connected</h1>
                    <h1 className="text-xl font-italic">Balance {balance} Sol</h1>
               </div>
               : <>
                 <div className="flex justify-center  mb-2 font-bold">
                     <h1>Connect your wallet</h1>
               </div>
               </>
                }
                
            <div className="border-2 border-gray-900 py-40 px-40 rounded-l flex justify-center">
                {
                    !showVault && !isConnected ?  <> <button onClick={handleClick} className="bg-green-400 py-2 px-5 rounded-xl text-xl text-black font-mono font-bold border-2 border-dotted cursor-pointer hover:underline border-gray-900 transition duration-400">Start</button> </>  : <> 
                       <Vault />
                     </>
                }
               
            </div>
            </div>
            </div>
        </div>
        </>
    )
}

export default Hero;




// "use client";

// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { toast } from "react-toastify";

// const Vault = ()=>{

//     const [stored, setStored] = useState(0);
//     const [depositDialogOpen, setDepositDialogOpen] = useState(false);
//     const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
//     const [amount, setAmount] = useState("");

//     const handleDeposit = () => {
//         if (!amount || parseFloat(amount) <= 0) {
//             toast.error("Please enter a valid amount");
//             return;
//         }
        
//         const depositAmount = parseFloat(amount);
//         setStored(prev => prev + depositAmount);
//         setDepositDialogOpen(false);
//         setAmount("");
//         toast.success(`Deposited ${depositAmount} SOL`);
//     };

//     const handleWithdraw = () => {
//         if (!amount || parseFloat(amount) <= 0) {
//             toast.error("Please enter a valid amount");
//             return;
//         }
        
//         const withdrawAmount = parseFloat(amount);
//         if (withdrawAmount > stored) {
//             toast.error("Insufficient funds");
//             return;
//         }
        
//         setStored(prev => prev - withdrawAmount);
//         setWithdrawDialogOpen(false);
//         setAmount("");
//         toast.success(`Withdrew ${withdrawAmount} SOL`);
//     };

//     return(
//         <>
//         <div className="flex justify-center">
//             <div className="flex flex-col gap-5">
//                 <div className="">
//                     <h1 className="text-white text-2xl text-center mb-5 ">{stored}.00 Sol</h1>
//                 </div>
//                 <div className="flex justify-center gap-5">
//                     {/* Deposit Button with Dialog */}
//                     <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
//                         <DialogTrigger asChild>
//                             <button className="py-2 px-4 rounded-xl border-2 border-gray-800 bg-green-400 text-black cursor-pointer hover:underline transition duration-400">
//                                 Deposit
//                             </button>
//                         </DialogTrigger>
//                         <DialogContent className="sm:max-w-md">
//                             <DialogHeader>
//                                 <DialogTitle>Deposit Amount</DialogTitle>
//                             </DialogHeader>
//                             <div className="space-y-4">
//                                 <div>
//                                     <label htmlFor="deposit-amount" className="block text-sm font-medium mb-2">
//                                         Amount (SOL)
//                                     </label>
//                                     <input
//                                         id="deposit-amount"
//                                         type="number"
//                                         step="0.001"
//                                         min="0"
//                                         value={amount}
//                                         onChange={(e) => setAmount(e.target.value)}
//                                         placeholder="Enter amount to deposit"
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
//                                     />
//                                 </div>
//                                 <div className="flex gap-2 justify-end">
//                                     <button
//                                         onClick={() => {
//                                             setDepositDialogOpen(false);
//                                             setAmount("");
//                                         }}
//                                         className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         onClick={handleDeposit}
//                                         className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
//                                     >
//                                         Deposit
//                                     </button>
//                                 </div>
//                             </div>
//                         </DialogContent>
//                     </Dialog>

//                     {/* Withdraw Button with Dialog */}
//                     <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
//                         <DialogTrigger asChild>
//                             <button className="py-2 px-4 rounded-xl border-2 border-gray-800 cursor-pointer hover:underline transition duration-400">
//                                 Withdraw
//                             </button>
//                         </DialogTrigger>
//                         <DialogContent className="sm:max-w-md">
//                             <DialogHeader>
//                                 <DialogTitle>Withdraw Amount</DialogTitle>
//                             </DialogHeader>
//                             <div className="space-y-4">
//                                 <div>
//                                     <label htmlFor="withdraw-amount" className="block text-sm font-medium mb-2">
//                                         Amount (SOL)
//                                     </label>
//                                     <input
//                                         id="withdraw-amount"
//                                         type="number"
//                                         step="0.001"
//                                         min="0"
//                                         max={stored}
//                                         value={amount}
//                                         onChange={(e) => setAmount(e.target.value)}
//                                         placeholder="Enter amount to withdraw"
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
//                                     />
//                                     <p className="text-sm text-gray-500 mt-1">
//                                         Available: {stored} SOL
//                                     </p>
//                                 </div>
//                                 <div className="flex gap-2 justify-end">
//                                     <button
//                                         onClick={() => {
//                                             setWithdrawDialogOpen(false);
//                                             setAmount("");
//                                         }}
//                                         className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         onClick={handleWithdraw}
//                                         className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//                                     >
//                                         Withdraw
//                                     </button>
//                                 </div>
//                             </div>
//                         </DialogContent>
//                     </Dialog>

//                     {/* Close Button */}
//                     <button className="py-2 px-4 rounded-xl border-2 bg-red-500 border-gray-800 cursor-pointer hover:underline transition duration-400">
//                         Close
//                     </button>
//                 </div>
//             </div>
//         </div>
//         </>
//     )
// }

// export default Vault;