"use client";
import {useState} from "react";
import {Share2} from "lucide-react";
export function ShareArticle({title}:{title:string}){
 const[status,setStatus]=useState("");
 async function share(){try{const url=window.location.href;if(navigator.share)await navigator.share({title,url});else{await navigator.clipboard.writeText(url);setStatus("Link copied.");}}catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))setStatus("Copy the page address from your browser to share.");}}
 return <div className="in-article-share"><button type="button" className="in-button" onClick={share}><Share2 size={18} aria-hidden="true"/>Share</button><span role="status">{status}</span></div>;
}
