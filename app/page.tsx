import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="text-center flex flex-col items-center gap-10">
        <div className="mb-5">
          <Image
            src="/Frame 14.png"
            alt="VOYA Logo"
            width={120}
            height={120}
            className="drop-shadow-[0_4px_8px_rgba(255,255,255,0.1)]"
          />
        </div>
        <div className="flex flex-col items-center gap-5">
          <button className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white border-none py-4 px-10 text-lg font-semibold rounded-[50px] cursor-pointer transition-all duration-300 shadow-[0_8px_25px_rgba(102,126,234,0.3)] tracking-wider min-w-[200px] hover:translate-y-[-2px] hover:shadow-[0_12px_35px_rgba(102,126,234,0.4)] hover:bg-gradient-to-r hover:from-[#764ba2] hover:to-[#667eea] active:translate-y-0 active:shadow-[0_4px_15px_rgba(102,126,234,0.3)]">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
