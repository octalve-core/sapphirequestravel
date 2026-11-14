import { BarChart3, ClipboardList, FileCheck2, Inbox, LayoutDashboard, Package } from "lucide-react";

export const adminNavigation = [
  {title:"Workspace", items:[
    {label:"Overview",href:"/admin",icon:LayoutDashboard},
    {label:"Reports & insights",href:"/admin/reports",icon:BarChart3},
    {label:"Enquiries",href:"/admin/enquiries",icon:Inbox},
    {label:"Package enquiries",href:"/admin/package-enquiries",icon:ClipboardList},
    {label:"Visa enquiries",href:"/admin/visa-enquiries",icon:FileCheck2},
  ]},
  {title:"Catalogue", items:[
    {label:"Packages",href:"/admin/packages",icon:Package},
  ]},
] as const;

export const searchScopes=[
  {label:"Enquiries",href:"/admin/enquiries"},
  {label:"Packages",href:"/admin/package-enquiries"},
  {label:"Visa",href:"/admin/visa-enquiries"},
] as const;

export function currentAdminSection(path:string){
 const items=[...adminNavigation[0].items,...adminNavigation[1].items];
 const match=items.filter(item=>path===item.href||(item.href!=="/admin"&&path.startsWith(item.href+"/")))
   .sort((a,b)=>b.href.length-a.href.length)[0]||items[0];
 const isDetail=path!==match.href;
 return {label:match.label,href:match.href,isDetail,detail:isDetail?(path.endsWith("/new")?"New record":path.endsWith("/edit")?"Edit":"Details"):""};
}
