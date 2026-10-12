const $=s=>document.querySelector(s),E=JC.esc,cfg=()=>JC.get('settings',{});
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
const ims=p=>{const a=JC.imgs(p);return a.length?a:[JC.ph(p)]};
const fb=p=>'this.onerror=null;this.src=JC.ph('+JSON.stringify({name:p.name,category:p.category}).replace(/"/g,'&quot;')+')';
function cardHTML(p){const st=JC.stock(p);return `<div class="card"><img class="p" src="${E(ims(p)[0])}" onerror="${fb(p)}" onclick="openP('${p.id}')" alt="${E(p.name)}"><div>${E(p.name)}</div><div><span class="price">${JC.inr(p.price)}</span><span class="mrp">${JC.inr(p.mrp)}</span></div><small>${st>0?st+' in stock':'<span class="badge b-low">Out of stock</span>'}</small><div style="margin-top:6px"><button class="sm" onclick="openP('${p.id}')">View</button></div></div>`}
function render(){const all=JC.get('products',[]).filter(p=>p.active),cs=$('#cat');
 if(!cs.options.length)cs.innerHTML='<option value="">All categories</option>'+[...new Set(all.map(p=>p.category))].map(c=>`<option>${E(c)}</option>`).join('');
 const q=$('#q').value.toLowerCase(),c=cs.value;
 const l=all.filter(p=>(!q||(p.name+p.category+p.sku).toLowerCase().includes(q))&&(!c||p.category==c)).sort((a,b)=>new Date(b.created)-new Date(a.created));
 const f=!q&&!c;$('#feat').style.display=$('#ft').style.display=f?'':'none';
 $('#feat').innerHTML=all.filter(p=>p.featured).map(cardHTML).join('');
 $('#list').innerHTML=l.length?l.map(cardHTML).join(''):'<div class="empty">No products found.</div>';
 const s=cfg();$('#about').innerHTML=`<b>${E(s.store)}</b><br>📍 ${E(s.address)}<br>📞 <a href="tel:${E(s.phone)}">${E(s.phone)}</a>`;$('#foot').textContent='© '+s.store;
 $('#cc').textContent=JC.get('cart',[]).reduce((n,i)=>n+i.qty,0)}
['q','cat'].forEach(i=>$('#'+i).addEventListener('input',render));
function openP(id){const p=JC.get('products',[]).find(x=>x.id==id),I=ims(p),L=I.length;let k=0;
 const sizes=[...new Set(p.variants.map(v=>v.size))],cols=[...new Set(p.variants.map(v=>v.colour))];
 $('#pd').innerHTML=`<div style="position:relative"><img id="mi" src="${E(I[0])}" onerror="${fb(p)}" style="width:100%;max-height:320px;object-fit:cover;border-radius:12px">${L>1?'<button class="sm" id="pvb" style="position:absolute;left:6px;top:45%">‹</button><button class="sm" id="nxb" style="position:absolute;right:6px;top:45%">›</button>':''}</div>
 ${L>1?`<div class="row" style="justify-content:center">${I.map((s,n)=>`<img src="${E(s)}" data-n="${n}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;cursor:pointer;flex:0">`).join('')}</div>`:''}
 <h3>${E(p.name)}</h3><p>${E(p.description)}</p><div class="price">${JC.inr(p.price)} <span class="mrp">${JC.inr(p.mrp)}</span></div>
 <div class="row"><select id="vs">${sizes.map(s=>`<option>${E(s)}</option>`)}</select><select id="vc">${cols.map(s=>`<option>${E(s)}</option>`)}</select></div><div id="vst"></div>
 <div class="row"><button id="add">Add to cart</button><button id="buy" style="background:var(--bk)">Buy now</button><button class="ghost" onclick="$('#pd').close()">Close</button></div>`;
 const show=n=>{k=(n+L)%L;$('#mi').src=I[k]};
 if(L>1){$('#pvb').onclick=()=>show(k-1);$('#nxb').onclick=()=>show(k+1);$('#pd').querySelectorAll('[data-n]').forEach(t=>t.onclick=()=>show(+t.dataset.n))}
 const cur=()=>p.variants.find(x=>x.size==$('#vs').value&&x.colour==$('#vc').value);
 const upd=()=>{const v=cur();$('#vst').innerHTML=v&&v.qty>0?`${v.qty} available`:'<span class="badge b-low">Out of stock</span>';$('#add').disabled=$('#buy').disabled=!(v&&v.qty>0)};
 $('#vs').onchange=$('#vc').onchange=upd;upd();
 $('#add').onclick=()=>{const size=$('#vs').value,colour=$('#vc').value,v=cur(),cart=JC.get('cart',[]);let it=cart.find(i=>i.pid==id&&i.size==size&&i.colour==colour);
  if(it){if(it.qty+1>v.qty)return toast('Not enough stock');it.qty++}else cart.push({pid:id,size,colour,qty:1});JC.set('cart',cart);$('#pd').close();render();toast('Added to cart')};
 $('#buy').onclick=()=>{JC.set('cart',[{pid:id,size:$('#vs').value,colour:$('#vc').value,qty:1}]);$('#pd').close();render();drawCart('co');$('#drawer').classList.add('open')};
 $('#pd').showModal()}
function cartTotals(){const ps=JC.get('products',[]),s=cfg();const items=JC.get('cart',[]).map(i=>({...i,p:ps.find(p=>p.id==i.pid)})).filter(i=>i.p);
 const sub=items.reduce((n,i)=>n+i.p.price*i.qty,0);const del=sub==0||sub>=s.freeAbove?0:+s.delivery;return{items,sub,del,total:sub+del}}
function drawCart(view){const t=cartTotals(),b=$('#cartBody'),s=cfg();
 if(!t.items.length){b.innerHTML='<div class="empty">Your cart is empty.</div>';return}
 if(view=='co'){b.innerHTML=`<form id="cf"><input name="name" placeholder="Your name *" required style="width:100%;margin:4px 0"><input name="mobile" placeholder="Mobile number *" pattern="[0-9]{10}" maxlength="10" inputmode="numeric" required style="width:100%;margin:4px 0"><textarea name="address" placeholder="Full address *" required style="width:100%;margin:4px 0"></textarea>
  <p><b>Payment</b></p><label><input type="radio" name="payment" value="Cash on Delivery" checked> Cash on Delivery</label><br>${s.upi?'<label><input type="radio" name="payment" value="UPI"> UPI (PhonePe / GPay / Paytm)</label>':''}
  <p>Items ${JC.inr(t.sub)} + Delivery ${t.del?JC.inr(t.del):'Free'}<br><b>Total: ${JC.inr(t.total)}</b></p><div class="row"><button>Place order</button><button type="button" class="ghost" onclick="drawCart()">Back</button></div></form>`;
  $('#cf').onsubmit=e=>{e.preventDefault();placeOrder(Object.fromEntries(new FormData(e.target)))};return}
 b.innerHTML=t.items.map((i,n)=>`<div class="row"><span style="flex:3">${E(i.p.name)}<br><small>${E(i.size)} / ${E(i.colour)} · ${JC.inr(i.p.price)}</small></span><span><button class="sm ghost" onclick="qty(${n},-1)">−</button> ${i.qty} <button class="sm ghost" onclick="qty(${n},1)">+</button></span><button class="sm danger" onclick="qty(${n},-99)" style="flex:0">✕</button></div>`).join('')+`<hr><div>Subtotal: ${JC.inr(t.sub)}</div><div>Delivery: ${t.del?JC.inr(t.del):'Free'}</div><h3>Total: ${JC.inr(t.total)}</h3><button onclick="drawCart('co')">Checkout</button>`}
function qty(n,d){const cart=JC.get('cart',[]),i=cart[n],p=JC.get('products',[]).find(x=>x.id==i.pid),v=p.variants.find(x=>x.size==i.size&&x.colour==i.colour);
 if(d>0&&i.qty+d>v.qty)return toast('Not enough stock');i.qty+=d;if(i.qty<=0)cart.splice(n,1);JC.set('cart',cart);drawCart();render()}
function home(){$('#drawer').classList.remove('open');scrollTo({top:0,behavior:'smooth'});render()}
async function placeOrder(c){const t=cartTotals(),orders=JC.get('orders',[]),s=cfg();
 for(const i of t.items){const v=i.p.variants.find(x=>x.size==i.size&&x.colour==i.colour);if(!v||v.qty<i.qty)return toast('Stock changed for '+i.p.name)}
 const no=JC.cloud?'JC-'+Date.now().toString().slice(-7):'JC-'+String(1000+orders.length+1),upi=c.payment=='UPI';
 if(!JC.cloud)t.items.forEach(i=>JC.adjust(i.pid,i.size,i.colour,-i.qty,'Order '+no));
 const od=({id:JC.uid('o'),no,date:new Date().toISOString(),customer:{name:c.name,mobile:c.mobile,address:c.address},items:t.items.map(i=>({pid:i.pid,name:i.p.name,size:i.size,colour:i.colour,qty:i.qty,price:i.p.price,cost:i.p.cost})),delivery:t.del,total:t.total,paid:0,status:'Pending',payment:c.payment,applied:!JC.cloud});
 if(JC.cloud){try{await JC.submitOrder(od)}catch(e){return toast('Order failed. Please call us.')}}else{orders.push(od);JC.set('orders',orders)}
 JC.set('cart',[]);render();
 const link=upi?`upi://pay?pa=${encodeURIComponent(s.upi)}&pn=${encodeURIComponent(s.store)}&am=${t.total}&cu=INR&tn=${encodeURIComponent('Order '+no)}`:'';
 $('#cartBody').innerHTML=`<h3>✅ Order placed successfully!</h3><p>Order <b>${no}</b> · ${JC.inr(t.total)}<br>We will contact you on ${E(c.mobile)}.</p>${upi?`<p>Opening your UPI app… if it does not open, tap below.</p><a class="btn" href="${link}" style="display:inline-block">Pay ${JC.inr(t.total)} with UPI</a><br><br>`:''}<button class="ghost" onclick="home()">Go to main menu</button>`;
 if(upi)location.href=link;else setTimeout(home,4000)}
$('#cartBtn').onclick=()=>{drawCart();$('#drawer').classList.add('open')};$('#cx').onclick=()=>$('#drawer').classList.remove('open');
JC.ready.then(render);
