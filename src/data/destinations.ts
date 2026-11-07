export type Destination = {name:string,country:string,image:string,summary:string,href:string};
export const destinations: Destination[] = [
 {name:"Singapore",country:"Southeast Asia",image:"/images/singapore.webp",summary:"Striking architecture and remarkable city experiences.",href:"/request?service=flight&to=SIN"},
 {name:"Global connections",country:"Business & discovery",image:"/images/global-routes.webp",summary:"Thoughtfully planned routes that bring people together.",href:"/request?service=flight"},
 {name:"Coastal escapes",country:"Travel inspiration",image:"/images/coastal.webp",summary:"Breathtaking shores and time to reconnect.",href:"/request?service=holiday"},
 {name:"Meaningful moments",country:"Travel inspiration",image:"/images/travel-moment.webp",summary:"Experiences that stay with you long after the return.",href:"/request?service=holiday"}
];
