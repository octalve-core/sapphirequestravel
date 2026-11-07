import Image from "next/image";
export function PackageImage({src,alt,className=""}:{src?:string;alt:string;className?:string}) {
 return src ? <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" className={`h-full w-full object-cover ${className}`}/>
  : <div className="flex h-full w-full items-center justify-center bg-[#f1f6fe] px-8"><Image src="/branding/sapphire-quest-icon.png" width={150} height={150} alt="Sapphire Quest official emblem" className="h-[43%] w-auto object-contain opacity-75"/></div>;
}
