import { notFound } from "next/navigation";
import { RESOURCE_PAGES, resourceMetadata } from "@/lib/portfolio-resources";
import ResourceView from "../ResourceView";
export const dynamicParams=false;
export function generateStaticParams(){return RESOURCE_PAGES.map(p=>({slug:p.key}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {const {slug}=await params;const p=RESOURCE_PAGES.find(p=>p.key===slug);if(!p)notFound();return resourceMetadata(p);}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=RESOURCE_PAGES.find(p=>p.key===slug);if(!p)notFound();return <ResourceView page={p}/>;}
