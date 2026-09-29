// Run: npm install --no-save playwright && npx playwright install chromium && node tests/demo.cjs
// Tests real UI and exported values: skipped counts, double posting, stale reset,
// incorrect conversion/coverage, unvalidated input and mobile overflow must fail.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req,res)=>{
  const file = path.join(root, req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!file.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{res.writeHead(err?404:200, {'Content-Type': file.endsWith('.html')?'text/html':'text/plain'});res.end(err?'Not found':data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base = `http://127.0.0.1:${server.address().port}`;
 const browser = await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/demo.html');
  assert.equal(await page.getByRole('button',{name:'Start the opening count',exact:true}).count(),1,'one-click guided entrance is available');
  await page.getByRole('button',{name:'Start the opening count',exact:true}).click();
  await page.getByLabel('Counted containers').fill('-1');
  await page.getByRole('button',{name:'Save count',exact:true}).click();
  assert.equal(await page.locator('#guideFeedback').textContent(),'Enter a quantity from 0 to 999, with up to two decimal places.');
  await page.getByLabel('Counted containers').fill('2');
  await page.getByRole('button',{name:'Save count',exact:true}).click();
  assert.match(await page.locator('#guideFeedback').textContent(),/4 kg/);
  assert.match(await page.locator('#guideFeedback').textContent(),/8 kg/);
  const originalStamp=await page.evaluate(()=>({time:entries[0].time,start:startTime,date:dateStr}));
  await page.clock.install({time:new Date('2026-10-08T15:30:00Z')});
  await page.reload();
  assert.deepEqual(await page.evaluate(()=>({time:entries[0].time,start:startTime,date:dateStr})),originalStamp,'reload retains audit timestamps');
  assert.match(await page.locator('#guideFeedback').textContent(),/4 kg/,'guided progress survives reload');
  await page.getByRole('button',{name:'Next stop',exact:true}).click();
  await page.getByLabel('Counted containers').fill('4');
  await page.getByRole('button',{name:'Save count',exact:true}).click();
  await page.getByRole('button',{name:'Next stop',exact:true}).click();
  await page.getByLabel('Counted containers').fill('3');
  await page.getByRole('button',{name:'Save count',exact:true}).click();
  await page.getByRole('button',{name:'See the opening brief',exact:true}).click();
  assert.match(await page.locator('#guideSummary').textContent(),/2 corrections/);
  assert.match(await page.locator('#guideSummary').textContent(),/0.67 days/);
  const [dl]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download count CSV',exact:true}).click()]);
  const csv=fs.readFileSync(await dl.path(),'utf8');
  assert.match(csv,/"Mozzarella","6","12","2","4","-4","-8","DISCREPANCY"/);
  assert.match(csv,/"Flour","4","100","4","100","0","0","MATCH"/);
  assert.match(csv,/"Tomato sauce","0","0","3","9","3","9","ADDED"/);
  assert.equal(csv.trim().split('\r\n').length,4);
  await page.screenshot({path:process.env.QA_DIR?path.join(process.env.QA_DIR,'summary-desktop.png'):'/tmp/summary-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Explore the full workspace',exact:true}).click();
  await page.getByRole('button',{name:/System vs Actual/}).click();
  assert.match(await page.locator('#recoBody').textContent(),/Mozzarella/,'reconciliation includes guided storage counts');
  await page.locator('#recoClose').click();
  assert.deepEqual(await page.evaluate(()=>recoData().map(r=>[r.mat,r.dC]).sort()),[['Flour',0],['Mozzarella',-8],['Tomato sauce',9]]);
  const vals=await page.evaluate(()=>dosRows().find(r=>r.mat==='Mozzarella'));
  assert.equal(vals.inv,2);assert.equal(vals.inbound,4);assert.equal(vals.projDos,2);
  await page.evaluate(()=>{receiveLoad('DEMO-01');receiveLoad('DEMO-01');});
  const received=await page.evaluate(()=>dosRows().find(r=>r.mat==='Mozzarella'));
  assert.equal(received.inv,6,'same delivery cannot be counted twice');assert.equal(received.inbound,0);
  page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Restart demo',exact:true}).click();
  assert.equal(await page.evaluate(()=>entries.length),4,'cancel reset preserves work');
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Restart demo',exact:true}).click();
  await page.getByRole('button',{name:'Start the opening count',exact:true}).click();
  assert.equal(await page.evaluate(()=>entries.length),0,'restart clears counts');
  assert.equal(await page.evaluate(()=>inboundFor('KITCHEN','Mozzarella').qty),4,'restart restores sample delivery');
  await page.getByLabel('Counted containers').fill('0');await page.getByRole('button',{name:'Save count',exact:true}).click();
  assert.match(await page.locator('#guideFeedback').textContent(),/0 kg/,'zero is an intentional count');
  await page.getByLabel('Counted containers').fill('1.25');await page.getByRole('button',{name:'Save count',exact:true}).click();
  assert.equal(await page.evaluate(()=>entries.length),1,'edits replace a count');
  assert.equal(await page.evaluate(()=>entries[0].countedConv),2.5,'partial containers convert correctly');
  await page.getByRole('button',{name:'Explore workspace',exact:true}).click();
  await page.getByRole('button',{name:/Days of Stock/}).click();
  assert.match(await page.locator('#dosBody').textContent(),/Not counted/,'uncounted ingredients are not zero stock');
  await page.locator('#dosClose').click();
  const [backup]=await Promise.all([page.waitForEvent('download'),page.locator('#btnBackup').click()]);
  const backupPath=await backup.path();
  const backupCount=await page.evaluate(()=>entries[0].countedConv);
  await page.evaluate(()=>{entries[0].countedConv=123;});
  const [picker]=await Promise.all([page.waitForEvent('filechooser'),page.getByRole('button',{name:'Restore backup',exact:true}).click()]);
  await picker.setFiles(backupPath);
  await page.waitForFunction(v=>entries[0].countedConv===v,backupCount);
  assert.equal(await page.evaluate(()=>entries[0].countedConv),backupCount,'backup restore is reachable and restores inventory');
  assert.equal(await page.evaluate(()=>recoData().length),1,'reconciliation does not invent shortages for uncounted ingredients');
  const fullSaved=await page.evaluate(()=>entries.length);await page.reload();
  assert.equal(await page.evaluate(()=>entries.length),fullSaved,'workspace progress survives reload');
  for(const width of [375,768,1440]){
   await page.setViewportSize({width,height:900});
   for(const file of ['index.html','project-writeup.html','demo.html']){
    await page.goto(base+'/'+file);
    const dim=await page.evaluate(()=>({w:innerWidth,s:document.documentElement.scrollWidth}));
    assert.ok(dim.s<=dim.w,`${file} overflows at ${width}px: ${dim.s}`);
    if(process.env.QA_DIR)await page.screenshot({path:path.join(process.env.QA_DIR,`${file}-${width}.png`),fullPage:true});
   }
  }
  await page.goto(base+'/index.html');
  assert.match(await page.locator('#savings').textContent(),/240 hours/);
  await page.getByLabel('After · minutes / count').fill('45');
  assert.match(await page.locator('#savings').textContent(),/75 min saved/);
  assert.match(await page.locator('#savings').textContent(),/300 hours/);
  await page.getByLabel('After · minutes / count').fill('150');
  assert.match(await page.locator('#savings').textContent(),/30 min longer/);
  await page.goto(base+'/demo.html');
  // A fresh mobile guide, including the final summary.
  await page.evaluate(()=>localStorage.clear());await page.reload();await page.setViewportSize({width:375,height:850});
  await page.getByRole('button',{name:'Start the opening count',exact:true}).click();
  for(const [i,q] of ['2','4','3'].entries()){
   await page.getByLabel('Counted containers').fill(q);await page.getByRole('button',{name:'Save count',exact:true}).click();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(process.env.QA_DIR && i===0)await page.screenshot({path:path.join(process.env.QA_DIR,'guide-mobile.png'),fullPage:true});
   await page.getByRole('button',{name:i===2?'See the opening brief':'Next stop',exact:true}).click();
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(process.env.QA_DIR)await page.screenshot({path:path.join(process.env.QA_DIR,'summary-mobile.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: guided count, validation, reload, edits, conversion, stock coverage, idempotent receiving, CSV, reset/cancel, partial counts, and 375/768/1440px layouts.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
