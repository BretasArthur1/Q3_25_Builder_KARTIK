"use client";

import { useState } from "react";




const Vault = ()=>{

    const [stored, setStored] = useState(0);

    return(
        <>
        <div className="flex justify-center">
            <div className="flex flex-col gap-5">
                <div className="">
                    <h1 className="text-white text-2xl text-center mb-5 ">{stored}.00 Sol</h1>
                </div>
        <div className="flex justify-center gap-5">
            <button className="py-2 px-4 rounded-xl border-2 border-gray-800 bg-green-400 text-black cursor-pointer hover:underline transition duration-400">Deposit</button>
            <button className="py-2 px-4 rounded-xl  border-2 border-gray-800 cursor-pointer hover:underline transition duration-400">Withdraw</button>
            <button className="py-2 px-4 rounded-xl border-2 bg-red-500 border-gray-800 cursor-pointer hover:underline transition duration-400">Close</button>
        </div>
        </div>
            </div>
        </>
    )
}

export default Vault;