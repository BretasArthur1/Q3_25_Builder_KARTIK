import ConnectWallet from "./Connectwalllet";
import { SiVaultwarden } from "react-icons/si";

const Header = ()=>{

    return(
        <>
        <div className="flex justify-between py-5 ">
            <div>
            <SiVaultwarden size={45} />
               {/* <img src="https://i.pinimg.com/736x/14/89/e2/1489e2ed41b7d33afa303f053771aed1.jpg" alt="" className="h-12 rounded-xl" />  */}
            </div>

            <div>
                <ConnectWallet />
            </div>
        </div>
        </>
    )
}

export default Header;