const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {createRequire}=require('node:module');
const appRequire=createRequire(path.resolve('Website/package.json'));
const ts=appRequire('typescript'),React=appRequire('react'),{renderToStaticMarkup}=appRequire('react-dom/server');
function load(file,mocks={},extra={}){
 const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,require:name=>Object.hasOwn(mocks,name)?mocks[name]:appRequire(name),...extra},{filename:file});
 return module.exports;
}
function tracker(){
 const listeners=new Map(),cleanups=[],beacons=[],storage=new Map();
 const pathname='/archive/law-of-deliberate-action/';
 const window={location:{origin:'https://secretimperium.com',pathname,href:`https://secretimperium.com${pathname}?email=never-copy@example.test#private`},innerWidth:390,innerHeight:844,addEventListener:(name,handler)=>listeners.set(name,handler),removeEventListener:(name,handler)=>{if(listeners.get(name)===handler)listeners.delete(name);}};
 const document={referrer:'',documentElement:{scrollHeight:2000},addEventListener:window.addEventListener,removeEventListener:window.removeEventListener};
 const api=load('Website/src/components/InboundTracker.tsx',{
  react:{useEffect:effect=>cleanups.push(effect()),useRef:value=>({current:value})},
  'next/navigation':{usePathname:()=>pathname,useSearchParams:()=>new URLSearchParams('email=never-copy@example.test')},
 },{window,document,navigator:{sendBeacon:(url,body)=>{beacons.push({url,body});return true;}},sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},localStorage:{getItem:()=>null,setItem:()=>{}},Date,Math,Blob,URLSearchParams,fetch:()=>{throw Error('No network permitted');}});
 api.default();
 return{beacons,listeners,unmount:()=>cleanups.forEach(cleanup=>cleanup?.()),click:target=>listeners.get('click')?.({target}),events:async()=>Promise.all(beacons.map(async item=>({url:item.url,body:JSON.parse(await item.body.text())})))};
}

test('membership action gains a semantic tracking label while retaining its configured checkout destination',()=>{
 const checkout='https://buy.stripe.com/synthetic-approved-destination';
 const Icon=()=>React.createElement('svg');
 const component=load('Website/src/components/MembershipCta.tsx',{
  'next/link':props=>React.createElement('a',props),
  'lucide-react':{ArrowRight:Icon,ArrowUpRight:Icon,Check:Icon},
  '@/lib/brand':{BRAND:{priceMonthly:'$20/month'},STRIPE_CHECKOUT_URL:checkout},
 });
 const html=renderToStaticMarkup(React.createElement(component.MembershipCta));
 assert.match(html,/href="https:\/\/buy\.stripe\.com\/synthetic-approved-destination" data-track="membership_join" data-track-area="membership"/);
 assert.match(html,/Join Imperium Elite/);assert.match(html,/\$20\/month/);assert.doesNotMatch(html,/<form/);
});

test('nested membership click produces one native observation with the absolute current page and no query or fragment',async()=>{
 const t=tracker();
 const area={getAttribute:()=> 'membership'};
 const target={getAttribute:name=>name==='data-track'?'membership_join':null,closest:selector=>selector==='[data-track-area]'?area:null};
 t.click({closest:selector=>selector==='[data-track]'?target:null});
 const events=await t.events(),clicks=events.filter(event=>event.body.event_type==='click');
 assert.equal(clicks.length,1);assert.equal(clicks[0].url,'https://omnileadsagi.com/api/inbound/imperium/events');
 assert.equal(clicks[0].body.target_id,'membership_join');assert.equal(clicks[0].body.target_area,'membership');
 assert.equal(clicks[0].body.page_url,'https://secretimperium.com/archive/law-of-deliberate-action/');
 assert.equal(clicks[0].body.page_path,'/archive/law-of-deliberate-action/');
 assert.doesNotMatch(JSON.stringify(clicks[0].body),/never-copy|email=|#private/);
});

test('ordinary archive links remain unclassified and route cleanup removes the native click listener',async()=>{
 const t=tracker();t.click({closest:()=>null});
 assert.equal((await t.events()).filter(event=>event.body.event_type==='click').length,0);
 t.unmount();assert.equal(t.listeners.has('click'),false);
});

test('production and compatibility app trees retain the same narrow CTA patch',()=>{
 for(const file of ['src/components/MembershipCta.tsx','src/components/InboundTracker.tsx'])assert.equal(fs.readFileSync(`Website/${file}`,'utf8'),fs.readFileSync(`web/${file}`,'utf8'),file);
});
