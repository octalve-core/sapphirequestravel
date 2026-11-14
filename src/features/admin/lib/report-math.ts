export type ReportDays=7|30|90|365;
export type TrendPoint={period:string;general:number;packages:number;visa:number;total:number};
export function readReportDays(value:unknown):ReportDays{
 return value==="7"||value===7?7:value==="90"||value===90?90:value==="365"||value===365?365:30;
}
export function bucketForDays(days:ReportDays):"day"|"week"|"month"{
 return days===90?"week":days===365?"month":"day";
}
function dayKey(date:Date){return date.toISOString().slice(0,10);}
function bucketStart(date:Date,unit:"day"|"week"|"month"){
 const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
 if(unit==="month")d.setUTCDate(1);
 else if(unit==="week")d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));
 return d;
}
function nextBucket(date:Date,unit:"day"|"week"|"month"){
 const d=new Date(date);
 if(unit==="month")d.setUTCMonth(d.getUTCMonth()+1);
 else d.setUTCDate(d.getUTCDate()+(unit==="week"?7:1));
 return d;
}
export function fillReportTrend(raw:{period:string;source:string;total:number}[],days:ReportDays,asOf:string):TrendPoint[]{
 const unit=bucketForDays(days),end=new Date(asOf),from=new Date(end.getTime()-days*86400000);
 const result=new Map<string,TrendPoint>();
 for(let date=bucketStart(from,unit);date<=end;date=nextBucket(date,unit)){
  const period=dayKey(date);
  result.set(period,{period,general:0,packages:0,visa:0,total:0});
 }
 for(const row of raw){
  const p=result.get(row.period);
  if(!p)continue;
  const v=Math.max(0,Number(row.total)||0);
  if(row.source==="General")p.general+=v;
  else if(row.source==="Packages")p.packages+=v;
  else if(row.source==="Visa")p.visa+=v;
  p.total=p.general+p.packages+p.visa;
 }
 return [...result.values()];
}
