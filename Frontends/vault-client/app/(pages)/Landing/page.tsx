import Header from "../../components/Header"
import Hero from "@/app/components/Hero"

const Landing = ()=>{
    return(
        <>
        <div className="bg-black/95 h-screen flex justify-center text-white">
        <div className="flex flex-col gap-28">
            <div className="w-300">
                <Header />
            </div>

            <div className="">
                <Hero />
            </div>
        </div>
        </div>
        </>
    )
}

export default Landing