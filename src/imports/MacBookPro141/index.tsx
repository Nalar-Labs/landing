import imgImage1 from "./ca5977976c68f88287748f94f0a4b0aecdde4e87.png";

function Group() {
  return (
    <div className="absolute contents left-[346px] top-[142px]">
      <div className="absolute bg-[#d9d9d9] border border-black border-solid h-[84px] left-[346px] rounded-[53px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[142px] w-[784px]" />
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal h-[28px] leading-[normal] left-[417.9px] not-italic text-[21px] text-black top-[177px] w-[112.978px]">Portofolio</p>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal h-[17.765px] leading-[normal] left-[611.88px] not-italic text-[21px] text-black top-[176.82px] w-[100.584px]">Services</p>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal h-[17.765px] leading-[normal] left-[793.16px] not-italic text-[21px] text-black top-[176.82px] w-[64.327px]">Team</p>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal h-[17.765px] leading-[normal] left-[793.16px] not-italic text-[21px] text-black top-[176.82px] w-[64.327px]">Team</p>
      <div className="absolute bg-[#d9d9d9] border border-black border-solid h-[57.56px] left-[925.32px] top-[154.79px] w-[159.063px]" />
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal h-[35px] leading-[normal] left-[936px] not-italic text-[21px] text-black top-[170px] w-[177px]">Contact Us</p>
    </div>
  );
}

export default function MacBookPro() {
  return (
    <div className="bg-white relative size-full" data-name="MacBook Pro 14' - 1">
      <Group />
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Instrument_Serif:Regular',sans-serif] h-[257px] justify-center leading-[0] left-[150px] not-italic text-[57px] text-black text-center top-[76.5px] w-[484px]">
        <p className="leading-[normal]">Nalar Labs</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Instrument_Serif:Regular',sans-serif] h-[157px] justify-center leading-[0] left-[726px] not-italic text-[47px] text-black text-center top-[331.5px] w-[1152px]">
        <p className="leading-[normal]">{`We’re a world class team of AI-Native Designer & Engineers`}</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Instrument_Serif:Regular',sans-serif] h-[157px] justify-center leading-[0] left-[726px] not-italic text-[47px] text-black text-center top-[450.5px] w-[1152px]">
        <p className="leading-[normal]">{`Ready to help you & your business evolve`}</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Instrument_Serif:Regular',sans-serif] h-[157px] justify-center leading-[0] left-[738px] not-italic text-[47px] text-black text-center top-[544.5px] w-[1152px]">
        <p className="leading-[normal]">View our work</p>
      </div>
      <div className="absolute h-[971px] left-[86px] top-[525px] w-[1280px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
    </div>
  );
}