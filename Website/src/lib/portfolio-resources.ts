import type { Metadata } from "next";
import content from "./portfolio-resources.json";
export const RESOURCE_SITE = content;
export const RESOURCE_PAGES = content.pages;
export type ResourcePage = typeof RESOURCE_PAGES[number];
export const resourceOrigin = `https://${content.domain}`;
export function resourceApplication(page: ResourcePage) {
  const params = new URLSearchParams({ref:content.slug,source_path:page.path,resource:page.kind});
  if(page.kind === "builder" || page.kind === "utah-growth") {
    params.set("resource", page.kind === "utah-growth" ? "utah-lead-generation" : "builder"); return `https://leadfranchise.org/learn-more?${params.toString()}#apply-today`;
  }
  return `https://aisempire.org/${page.kind === "partnership" ? "partnerships/lead-franchise" : "ai-employees"}?${params.toString()}#apply`;
}
export function resourceMetadata(page?: ResourcePage): Metadata {
 const path=page?.path ?? "/resources", title=page?.title ?? `${content.name}: website & AI resources`, description=page?.description ?? content.hubDescription;
 const image=`${resourceOrigin}/social/resources/${page?.key ?? "index"}.png`, alt=page?.shareAlt ?? `${content.name} — ${content.hubTitle}`;
 return { title:{absolute:title},description,authors:[{name:"Lead Franchise",url:"https://leadfranchise.org"}],alternates:{canonical:resourceOrigin+path+"/"},robots:{index:true,follow:true},
  openGraph:{type:page ? "article" : "website",locale:"en_US",siteName:content.name,url:resourceOrigin+path+"/",title,description,images:[{url:image,width:1200,height:630,type:"image/png",alt}]},
  twitter:{card:"summary_large_image",title,description,images:[{url:image,alt}]},
 };
}
export function resourceGraph(page?: ResourcePage) {
 const path=page?.path ?? "/resources", url=resourceOrigin+path+"/", title=page?.title ?? `${content.name}: website & AI resources`;
 const host={"@id":resourceOrigin+content.entity};
 return {"@context":"https://schema.org","@graph":[
  {"@type":content.schemaType,"@id":host["@id"],name:content.name,url:resourceOrigin},
  {"@type":"Organization","@id":"https://leadfranchise.org/#organization",name:"Lead Franchise",url:"https://leadfranchise.org"},
  {"@type":"Organization","@id":"https://aisempire.org/#organization",name:"AIS Empire",url:"https://aisempire.org"},
  {"@type":"WebPage","@id":url+"#webpage",url,name:title,description:page?.description ?? content.hubDescription,about:host,breadcrumb:{"@id":url+"#breadcrumb"}},
  {"@type":"BreadcrumbList","@id":url+"#breadcrumb",itemListElement:[{"@type":"ListItem",position:1,name:content.name,item:resourceOrigin},{"@type":"ListItem",position:2,name:"Resources",item:resourceOrigin+"/resources/"},...(page ? [{"@type":"ListItem",position:3,name:page.title,item:url}] : [])]},
  ...(page ? [{"@type":"Article","@id":url+"#article",headline:page.title,description:page.intro,dateModified:"2026-10-14",author:{"@id":"https://leadfranchise.org/#organization"},publisher:host,mainEntityOfPage:{"@id":url+"#webpage"},about:[host,{"@id":page.kind === "builder" || page.kind === "utah-growth" ? "https://leadfranchise.org/#organization" : "https://aisempire.org/#organization"}],image:resourceOrigin+"/social/resources/"+page.key+".png"}] : []),
 ]};
}
