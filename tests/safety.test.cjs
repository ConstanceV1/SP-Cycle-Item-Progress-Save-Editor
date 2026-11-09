const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const {scopeDatabase,validateWrite}=require('../editor-safety');
test('writes are player scoped, backed up, and protected against lost updates',async()=>{
 let filter,update;const doc={_id:'one',PlayFabId:'alice',Key:'Inventory',Value:'old'};
 const c={findOne:async f=>{filter=f;return doc},updateOne:async(f,u)=>{filter=f;update=u;return{matchedCount:1}},find:f=>f,countDocuments:async()=>1,insertOne:async d=>d};
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'spc-editor-test-'));
 const db=scopeDatabase({collection:()=>c},'alice',folder,async()=>{});
 await db.collection('PlayFabUserData').updateOne({Key:'Inventory'},{$set:{Value:'new'}});
 assert.equal(filter.$and[0].$and[1].PlayFabId,'alice');assert.equal(filter.$and[1].Value,'old');assert.equal(fs.readdirSync(folder).length,1);assert.equal(JSON.parse(fs.readFileSync(path.join(folder,fs.readdirSync(folder)[0]))).document.Value,'old');
 c.updateOne=async()=>({matchedCount:0});await assert.rejects(db.collection('PlayFabUserData').updateOne({Key:'Inventory'},{}),/save changed/);
 const inserted=await db.collection('PlayFabUserData').insertOne({Key:'Balance',PlayFabId:'bob'});assert.equal(inserted.PlayFabId,'alice');
});
test('invalid writes rejected and running-game guard prevents writes',async()=>{
 assert.throws(()=>validateWrite('/faction',{faction:'Wrong',value:5}));assert.throws(()=>validateWrite('/inventory',[null]));assert.throws(()=>validateWrite('/max-quarters',{level:999}));
 const db=scopeDatabase({collection:()=>({findOne:async()=>{throw Error('must not access')}})},null,'unused',async()=>{throw Error('game running')});await assert.rejects(db.collection('x').updateOne({},{}),/game running/);
});
test('HTTP server binds loopback and protects writes/static files',async()=>{
 const port=33137,token='test-session-only';const child=spawn(process.execPath,[path.join(__dirname,'../server.js')],{env:{...process.env,PORT:String(port),SPC_EDITOR_SESSION:token},stdio:'ignore'});
 try{let ready=false;for(let i=0;i<40;i++){try{await fetch('http://127.0.0.1:'+port+'/api/health');ready=true;break}catch{}await new Promise(r=>setTimeout(r,100));}assert(ready);
 const base='http://127.0.0.1:'+port;
 const health=await(await fetch(base+'/api/health')).json();assert.equal(health.application,'spcycle-editor');assert.equal(health.session,null);
 assert.equal((await fetch(base+'/api/connect',{method:'POST'})).status,403);
 assert.equal((await fetch(base+'/api/connect',{method:'POST',headers:{Origin:'https://evil.example','X-SPC-Session':token}})).status,403);
 assert.equal((await fetch(base+'/api/inventory',{method:'PUT',headers:{'X-SPC-Session':token,'Content-Type':'application/json'},body:'[null]'})).status,400);
 assert.equal((await fetch(base+'/server.js')).status,404);
 const html=await(await fetch(base+'/')).text();assert(html.includes('X-SPC-Session'));assert(html.includes(token));
 }finally{child.kill();}
});
