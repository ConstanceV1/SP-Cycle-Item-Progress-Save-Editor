'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {EJSON}=require('mongodb').BSON;
const {execFile}=require('child_process');
async function assertGameClosed(){
 if(process.platform!=='win32')return;
 const result=await new Promise((resolve,reject)=>execFile('tasklist.exe',['/FI','IMAGENAME eq Prospect-Win64-Shipping.exe','/FO','CSV','/NH'],{windowsHide:true,timeout:5000},(e,out)=>e?reject(e):resolve(out)));
 if(/Prospect-Win64-Shipping\.exe/i.test(result))throw Error('Close the game before editing saved progress. Your changes have not been written.');
}
function scopeDatabase(raw,player,backupDir,guard=assertGameClosed){
 let writing=false;
 return {collection(name){const c=raw.collection(name);if(name==='UserStats')return c;
 const scoped=f=>({$and:[f||{},player===null?{PlayFabId:{$exists:false}}:{PlayFabId:player}]});
 const wrap=Object.create(c);
 for(const method of ['findOne','find','countDocuments'])wrap[method]=(f,...args)=>c[method](scoped(f),...args);
 async function write(fn){if(writing)throw Error('Another save is in progress. Try again.');writing=true;try{await guard();return await fn();}finally{writing=false;}}
 wrap.updateOne=(f,u,...args)=>write(async()=>{
  const filter=scoped(f),before=await c.findOne(filter);
  if(before){fs.mkdirSync(backupDir,{recursive:true});fs.writeFileSync(path.join(backupDir,Date.now()+'-'+crypto.randomUUID()+'.json'),EJSON.stringify({collection:name,document:before}),{flag:'wx'});}
  const safe=before&&Object.hasOwn(before,'Value')?{$and:[filter,{_id:before._id,Value:before.Value}]}:filter;
  const result=await c.updateOne(safe,u,...args);
  if(before&&result.matchedCount!==1)throw Error('The save changed while editing. Reload before retrying; backup retained.');
  return result;
 });
 wrap.insertOne=(doc,...args)=>write(()=>c.insertOne({...doc,...(player===null?{}:{PlayFabId:player})},...args));
 return wrap;}};
}
function validateWrite(route,body){
 if(route==='/inventory'){
  if(!Array.isArray(body)||body.length>4096)throw Error('Inventory must be an array of at most 4096 items.');
  const ids=new Set();for(const item of body){if(!item||typeof item!=='object'||Array.isArray(item)||typeof item.itemId!=='string'||!item.itemId||ids.has(item.itemId)||typeof item.baseItemId!=='string'||!Number.isSafeInteger(item.amount)||item.amount<0||item.amount>100000||!Number.isFinite(item.durability))throw Error('Invalid inventory item or duplicate item ID.');ids.add(item.itemId);}
 }
 if(route==='/faction'&&(!['ICA','Korolev','Osiris'].includes(body.faction)||!Number.isSafeInteger(Number(body.value))||Number(body.value)<0))throw Error('Invalid faction or progress value.');
 if(route==='/max-quarters'&&(!Number.isInteger(Number(body.level))||Number(body.level)<0||Number(body.level)>10))throw Error('Invalid quarters level.');
 if(route==='/balance'&&(!body||Object.keys(body).some(k=>!['AU','SC','IN'].includes(k))||Object.values(body).some(n=>!Number.isSafeInteger(n)||n<0||n>2147483647)))throw Error('Invalid currency balance.');
}
module.exports={scopeDatabase,validateWrite};
