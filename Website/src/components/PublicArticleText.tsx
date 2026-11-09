export function PublicArticleText({text}: {text: string}) {
 return text.split(/(\[[^\]]+\]\(https:\/\/[^\s)]+\))/g).map((part,index)=> {
  const match=/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/.exec(part);
  if(!match)return part;
  try {const url=new URL(match[2]);if(url.username||url.password)return part;}catch{return part;}
  return <a key={index} href={match[2]}>{match[1]}</a>;
 });
}
