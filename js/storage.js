// Storage, demo data, CSV helpers. Everything is saved in this browser only (localStorage).
const JC={
 P:'jc_',
 get(k,d){try{const v=localStorage.getItem(JC.P+k);return v===null?d:JSON.parse(v)}catch{return d}},
 set(k,v){try{localStorage.setItem(JC.P+k,JSON.stringify(v))}catch(e){alert('Browser storage is full. Remove some product photos.')}},
 uid(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,5)},
 inr(n){return '₹'+Number(n||0).toLocaleString('en-IN')},
 esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))},
 KEYS:['products','suppliers','purchases','orders','expenses','moves','settings'],
 // Placeholder picture (SVG) used when a product has no photo or the photo fails to load.
 ph(p){const col={Jeans:'#2b4a7a',Shirts:'#8a6d3b','T-Shirts':'#444',Trousers:'#6b5b4b','Cargo Pants':'#4d5a3a',Jackets:'#5a3a2a'}[p?.category]||'#555';
  const t=encodeURIComponent((p?.name||'J&C').slice(0,22));
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="${col}"/><text x="200" y="240" font-size="64" text-anchor="middle" fill="#FF7A00" font-family="Arial" font-weight="bold">J&amp;C</text><text x="200" y="290" font-size="20" text-anchor="middle" fill="#fff" font-family="Arial">${decodeURIComponent(t).replace(/&/g,'&amp;')}</text></svg>`)}`},
 imgs(p){return p.images?.length?p.images:(p.image?[p.image]:[])},
 async hash(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('jc|'+s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')},
 stock(p){return (p.variants||[]).reduce((s,v)=>s+(+v.qty||0),0)},
 addMove(pid,size,colour,qty,reason){const m=JC.get('moves',[]);m.unshift({id:JC.uid('m'),date:new Date().toISOString(),pid,size,colour,qty,reason});JC.set('moves',m)},
 adjust(pid,size,colour,delta,reason){const ps=JC.get('products',[]);const p=ps.find(x=>x.id===pid);if(!p)return false;
  const v=p.variants.find(x=>x.size===size&&x.colour===colour);if(!v||v.qty+delta<0)return false;v.qty+=delta;JC.set('products',ps);JC.addMove(pid,size,colour,delta,reason);return true},
 init(){if(localStorage.getItem(JC.P+'ready')=='2')return;JC.reset(true)},
 reset(silent){JC.KEYS.forEach(k=>localStorage.removeItem(JC.P+k));JC.set('cart',[]);const d=JC.demo();JC.KEYS.forEach(k=>JC.set(k,d[k]));localStorage.setItem(JC.P+'ready','2')},
 backup(){const o={app:'jc-jeans',version:1,date:new Date().toISOString()};JC.KEYS.forEach(k=>o[k]=JC.get(k));return JSON.stringify(o,null,1)},
 restore(txt){const o=JSON.parse(txt);if(o.app!=='jc-jeans'||!Array.isArray(o.products)||!Array.isArray(o.orders))throw new Error('This is not a valid J&C backup file.');JC.KEYS.forEach(k=>{if(o[k]!==undefined)JC.set(k,o[k])})},
 demo(){
  const S=['S','M','L','XL'];
  const L=[['Classic Blue Denim Jeans','Jeans',999,1499,520,['Blue']],['Slim Fit Black Jeans','Jeans',1199,1799,640,['Black']],['Regular Fit Denim Jeans','Jeans',899,1399,470,['Blue','Grey']],
  ['Premium White T-Shirt','T-Shirts',499,799,220,['White']],['Classic Black T-Shirt','T-Shirts',449,699,200,['Black']],['Casual Cotton Shirt','Shirts',799,1199,400,['Sky Blue','White']],
  ['Checked Casual Shirt','Shirts',899,1299,430,['Red Check','Green Check']],['Slim Fit Formal Shirt','Shirts',999,1499,480,['White','Blue']],['Utility Cargo Pants','Cargo Pants',1099,1599,580,['Olive','Black']],
  ['Everyday Casual Trousers','Trousers',899,1299,450,['Khaki','Navy']],['Denim Jacket','Jackets',1499,2199,800,['Blue']],['Lightweight Casual Jacket','Jackets',1299,1899,700,['Black','Olive']]];
  const products=L.map((r,i)=>({id:'p'+(i+1),sku:'JC-'+String(i+1).padStart(3,'0'),name:r[0],category:r[1],description:r[0]+' — comfortable, durable everyday wear.',price:r[2],mrp:r[3],cost:r[4],
   images:[],min:i%5==4?30:5,featured:i%3==0,active:true,created:new Date(Date.now()-i*864e5*3).toISOString(),
   variants:r[5].flatMap(c=>S.map(s=>({size:s,colour:c,qty:(i==4&&s=='S')?0:(i==9?2:8)})))}));
  const day=n=>new Date(Date.now()-n*864e5).toISOString();
  return{products,suppliers:[],purchases:[],orders:[],expenses:[],moves:[],settings:{store:'J&C Jeans & Company',phone:'',address:'Garhwa, Jharkhand',delivery:50,freeAbove:1500,lowStock:5,upi:''}}},
 // CSV
 toCSV(rows,cols){const q=v=>{v=String(v??'');return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};return '\ufeff'+[cols.join(',')].concat(rows.map(r=>cols.map(c=>q(r[c])).join(','))).join('\r\n')},
 download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'text/csv;charset=utf-8'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),999)},
 parseCSV(t){t=t.replace(/^\ufeff/,'');const rows=[];let r=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];
  if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==','){r.push(f);f=''}else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;r.push(f);f='';if(r.some(x=>x!==''))rows.push(r);r=[]}else f+=c}
  r.push(f);if(r.some(x=>x!==''))rows.push(r);const h=(rows.shift()||[]).map(x=>x.trim().toLowerCase());return rows.map(a=>Object.fromEntries(h.map((k,i)=>[k,(a[i]||'').trim()])))}
};
JC.init();
