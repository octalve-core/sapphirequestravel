import assert from "node:assert/strict";
import { readReportDays,bucketForDays,fillReportTrend } from "../src/features/admin/lib/report-math";

assert.equal(readReportDays("7"),7);
assert.equal(readReportDays("30"),30);
assert.equal(readReportDays("90"),90);
assert.equal(readReportDays("365"),365);
for(const unsafe of ["0","99999","30;drop table","-7",null,{},["7"]]){
 assert.equal(readReportDays(unsafe),30);
}
assert.equal(bucketForDays(7),"day");
assert.equal(bucketForDays(90),"week");
assert.equal(bucketForDays(365),"month");
const end="2026-11-14T12:00:00.000Z";
const out=fillReportTrend([
 {period:"2026-11-12",source:"General",total:3},
 {period:"2026-11-12",source:"Packages",total:2},
 {period:"2026-11-14",source:"Visa",total:4},
 {period:"2026-10-01",source:"General",total:88},
],7,end);
assert.ok(out.length>=7);
assert.deepEqual(out.find(x=>x.period==="2026-11-12"),{
 period:"2026-11-12",general:3,packages:2,visa:0,total:5,
});
assert.equal(out.find(x=>x.period==="2026-11-13")?.total,0);
assert.equal(out.find(x=>x.period==="2026-11-14")?.total,4);
assert.equal(out.reduce((sum,x)=>sum+x.total,0),9);
const weekly=fillReportTrend([{period:"2026-11-09",source:"Visa",total:1}],90,end);
assert.equal(weekly.find(x=>x.period==="2026-11-09")?.visa,1);
const monthly=fillReportTrend([{period:"2026-11-01",source:"Packages",total:2}],365,end);
assert.equal(monthly.find(x=>x.period==="2026-11-01")?.packages,2);
assert.equal(fillReportTrend([],30,end).every(x=>x.total===0),true);
console.log("Reports rolling date filters, aggregated series and empty period coverage: PASS.");
