// Online storage (Firebase Firestore, free plan). Local cache + cloud sync.
import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getFirestore,collection,doc,getDocs,setDoc,deleteDoc,writeBatch}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import{getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const cfg=window.JC_FIREBASE;
if(!cfg||!cfg.apiKey){JC._res()}else{
 JC.cloud=true;const app=initializeApp(cfg),db=getFirestore(app),auth=getAuth(app);
 const PUB=['products','settings'],PRIV=['suppliers','purchases','expenses','moves'],CH=700000,T={};let known=new Set();
 const loc=(k,v)=>localStorage.setItem(JC.P+k,JSON.stringify(v));
 async function pullCol(c){const snap=await getDocs(collection(db,c)),g={},out={};snap.forEach(d=>{const x=d.data();(g[x.k]=g[x.k]||[]).push(x)});
  for(const k in g){const a=g[k].sort((p,q)=>p.i-q.i),n=a[0].n;if(a.length>=n)out[k]=JSON.parse(a.slice(0,n).map(x=>x.d).join(''))}return out}
 async function pushKey(c,k,v){const s=JSON.stringify(v),b=writeBatch(db),n=Math.max(1,Math.ceil(s.length/CH));
  for(let i=0;i<n;i++)b.set(doc(db,c,k+'~'+i),{k,i,n,d:s.slice(i*CH,(i+1)*CH)});for(let j=n;j<n+8;j++)b.delete(doc(db,c,k+'~'+j));await b.commit()}
 async function pullPub(){const o=await pullCol('pub');PUB.forEach(k=>{if(o[k]!==undefined)loc(k,o[k])});return Object.keys(o).length}
 async function pullPriv(){const o=await pullCol('priv');PRIV.forEach(k=>{if(o[k]!==undefined)loc(k,o[k])});
  const s=await getDocs(collection(db,'orders')),os=[];s.forEach(d=>os.push(d.data()));os.sort((a,b)=>new Date(a.date)-new Date(b.date));known=new Set(os.map(o=>o.id));loc('orders',os)}
 async function seed(){for(const k of PUB)await pushKey('pub',k,JC.get(k));for(const k of PRIV)await pushKey('priv',k,JC.get(k,[]))}
 JC.onSet=(k,v)=>{if(!JC.user)return;clearTimeout(T[k]);T[k]=setTimeout(async()=>{try{
  if(PUB.includes(k))await pushKey('pub',k,v);else if(PRIV.includes(k))await pushKey('priv',k,v);
  else if(k=='orders'){const ids=new Set(v.map(o=>o.id));for(const o of v)await setDoc(doc(db,'orders',o.id),o);for(const id of known)if(!ids.has(id))await deleteDoc(doc(db,'orders',id));known=ids}
 }catch(e){alert('Could not save online: '+e.message)}},500)};
 JC.submitOrder=o=>setDoc(doc(db,'orders',o.id),o);
 JC.login=async(e,p)=>{const c=await signInWithEmailAndPassword(auth,e,p);JC.user=c.user;if(!(await pullPub()))await seed();await pullPriv()};
 JC.logout=()=>signOut(auth);
 onAuthStateChanged(auth,async u=>{if(JC._done)return;JC._done=1;JC.user=u;
  try{if(u){if(!(await pullPub()))await seed();await pullPriv()}else await pullPub()}catch(e){console.error(e)}JC._res()});
}
