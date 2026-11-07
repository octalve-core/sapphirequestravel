export function PackagePrice({amount,currency="NGN",discount=0}:{amount:number|null;currency?:string;discount?:number}) {
 if(amount==null||amount<=0)return <span className="text-xs text-muted">Price on enquiry</span>;
 const current=Math.round(amount*(100-discount))/100;
 const format=(value:number)=>new Intl.NumberFormat("en-NG",{style:"currency",currency,maximumFractionDigits:0}).format(value);
 return <div className="flex flex-wrap items-center gap-2"><strong className="text-lg font-semibold text-navy">{format(current)}</strong>{discount>0&&<><del className="text-xs text-muted">{format(amount)}</del><span className="rounded-full bg-[#e6f7eb] px-2 py-1 text-[10px] font-bold text-green-700">{discount}% off</span></>}</div>;
}
