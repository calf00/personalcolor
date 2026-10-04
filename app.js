'use strict';
const COLORS = [
  ['オフホワイト','#E7E8DF'],['サンド','#D4C8B3'],['キャメル','#AC865D'],['テラコッタ','#A85841'],['ローズ','#BD8795'],['ラベンダー','#B4A9C6'],['ミストブルー','#BACCD3'],['セージ','#A9B69A'],['レモン','#DDD08A'],
  ['ホワイト','#FAFAF7'],['ライトグレー','#C9CBC7'],['チャコール','#4B4D4B'],['ネイビー','#354B5A'],['ブルー','#6482A0'],['ボルドー','#7B414B'],['モスグリーン','#5A6850'],['チョコレート','#6A5144'],['ブラック','#272B2A']
];
const RECIPES = [
 {name:'いつもの、を少し新しく。',label:'EVERYDAY',colors:['#E7E8DF','#354B5A','#A85841']},
 {name:'穏やかな色で、軽やかに。',label:'SOFT & LIGHT',colors:['#BACCD3','#D4C8B3','#FAFAF7']},
 {name:'シンプルに、きりっと。',label:'CLEAN & SIMPLE',colors:['#FAFAF7','#4B4D4B','#7B414B']},
 {name:'好きな色を、ひとさじ。',label:'A LITTLE PLAY',colors:['#B4A9C6','#354B5A','#DDD08A']}
];
const PARTS=['トップス','ボトムス','小物'];
const state={colors:[...RECIPES[0].colors],part:0,recipe:0};
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const hexValid=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
const colorName=hex=>COLORS.find(c=>c[1].toLowerCase()===hex.toLowerCase())?.[0]||'カスタムカラー';
function luminance(hex){const values=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return values[0]*.2126+values[1]*.7152+values[2]*.0722;}
function contrastInk(hex){const light=luminance(hex);const dark='#2A302A';if((light+.05)/(luminance(dark)+.05)>=4.5)return dark;return (light+.05)/.05>=4.5?'#000000':'#FFFFFF';}
let saved=[];try{const raw=JSON.parse(localStorage.getItem('iroha-palettes-v1')||'[]');if(Array.isArray(raw))saved=raw.filter(x=>x&&Array.isArray(x.colors)&&x.colors.length===3&&x.colors.every(hexValid)&&typeof x.id==='string').slice(0,24);}catch{}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),3400);}
function swatchButton(color,index){const button=document.createElement('button');button.className='swatch';button.style.backgroundColor=color[1];button.setAttribute('aria-label',`${color[0]} ${color[1]}`);button.title=color[0];button.dataset.color=color[1];button.addEventListener('click',()=>setColor(color[1]));return button;}
COLORS.forEach((c,i)=>$('#color-swatches').append(swatchButton(c,i)));
function setPart(index){state.part=index;renderPalette();}
function setColor(hex){if(!hexValid(hex))return;state.colors[state.part]=hex.toUpperCase();renderPalette();}
function applyRecipe(index){state.colors=[...RECIPES[index].colors];state.recipe=index;renderPalette();}
function renderPalette(){
 $$('.color-area').forEach((area,i)=>{area.style.backgroundColor=state.colors[i];area.style.color=contrastInk(state.colors[i]);area.setAttribute('aria-label',`${PARTS[i]}：${colorName(state.colors[i])}。色を編集`);});
 $('#palette-legend').innerHTML=state.colors.map((hex,i)=>`<div class="legend-item"><span class="legend-chip" style="background:${hex}"></span><span>${colorName(hex)}<small>${hex}</small></span></div>`).join('');
 $$('[data-part]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.part)===state.part)));
 $$('.swatch').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.color.toUpperCase()===state.colors[state.part])));
 $('#selected-color-name').textContent=colorName(state.colors[state.part]);$('#selected-color-hex').textContent=state.colors[state.part];$('#custom-color').value=state.colors[state.part];
 $('#palette-counter').textContent=`0${state.recipe+1} / ${RECIPES[state.recipe].label}`;
 const delta=Math.abs(luminance(state.colors[0])-luminance(state.colors[1]));
 $('#palette-insight').textContent=delta>.28?'トップスとボトムスの明暗差が大きい配色。小物の色を変えて、どこに目が向くか比べてみましょう。':delta>.08?'トップスとボトムスにほどよい明暗差があります。小物で色を繰り返すと、全体のまとまりを試せます。':'トップスとボトムスの明るさが近い配色。小物を明るく、または暗くすると、境目をつくれます。';
}
$$('[data-part]').forEach(b=>b.addEventListener('click',()=>setPart(Number(b.dataset.part))));
$$('[data-select-part]').forEach(b=>b.addEventListener('click',()=>setPart(Number(b.dataset.selectPart))));
$('#custom-color').addEventListener('input',e=>setColor(e.target.value));
$('#reset-palette').addEventListener('click',()=>{state.part=0;applyRecipe(0);toast('初期の配色に戻しました');});
$('#recipe-grid').innerHTML=RECIPES.map((r,i)=>`<button class="recipe" data-recipe="${i}" aria-label="${r.name}の配色を試す"><span class="recipe-colors">${r.colors.map(c=>`<span style="background:${c}"></span>`).join('')}</span><span class="recipe-label">${r.name}<small>${r.label}</small></span></button>`).join('');
$$('[data-recipe]').forEach(b=>b.addEventListener('click',()=>{applyRecipe(Number(b.dataset.recipe));toast('配色を切り替えました');}));
function persistSaved(next){try{localStorage.setItem('iroha-palettes-v1',JSON.stringify(next));saved=next;$('#saved-count').textContent=saved.length;return true;}catch{toast('保存できませんでした。ブラウザの保存設定をご確認ください。');return false;}}
$('#save-palette').addEventListener('click',()=>{if(saved.some(x=>x.colors.join()===state.colors.join())){toast('この配色は保存済みです');return;}if(saved.length>=24){toast('保存は24件までです。不要な配色を削除してからお試しください。');return;}if(persistSaved([{id:String(Date.now()),colors:[...state.colors]},...saved]))toast('配色を保存しました');});
function renderSaved(){const list=$('#saved-list');list.replaceChildren();if(!saved.length){list.innerHTML='<p class="empty-saved">気になる配色ができたら、<br>「この配色を保存」で集めてみましょう。</p>';return;}saved.forEach(item=>{const row=document.createElement('div');row.className='saved-item';row.innerHTML=`<div class="recipe-colors">${item.colors.map(c=>`<span style="background:${c}"></span>`).join('')}</div><div class="saved-item-meta"><span>${item.colors.map(colorName).join(' / ')}</span><div class="saved-item-actions"><button data-action="use">使う</button><button data-action="delete" aria-label="この配色を削除">削除</button></div></div>`;$('[data-action="use"]',row).addEventListener('click',()=>{state.colors=[...item.colors];renderPalette();$('#saved-dialog').close();location.hash='palette';toast('保存した配色を読み込みました');});$('[data-action="delete"]',row).addEventListener('click',()=>{if(persistSaved(saved.filter(x=>x.id!==item.id)))renderSaved();});list.append(row);});}
$('#open-saved').addEventListener('click',()=>{renderSaved();$('#saved-dialog').showModal();});$('#close-saved').addEventListener('click',()=>$('#saved-dialog').close());$('#saved-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close();}});
function route(){if(location.hash==='#main')return;let key=location.hash.slice(1)||'drape';if(!['drape','palette','suit','notes'].includes(key))key=key.startsWith('note-')?'notes':'drape';$$('.page').forEach(el=>el.hidden=el.id!==`page-${key}`);$$('[data-nav]').forEach(a=>{if(a.dataset.nav===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});const titles={drape:'ドレープ診断を、みんなで。',palette:'自分の色を、見つけよう。',compare:'顔まわりで比べる',suit:'スーツと柄',notes:'色のノート'};document.title=`iroha — ${titles[key]}`;if(['drape','palette','suit','notes',''].includes(location.hash.slice(1)))window.scrollTo({top:0,behavior:'instant'});else requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());}
window.addEventListener('hashchange',route);
$('#saved-count').textContent=saved.length;renderPalette();route();
