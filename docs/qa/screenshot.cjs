const fs=require('node:fs');
// OneDrive can briefly lock an existing evidence file while synchronizing it.
module.exports=async function screenshot(page,options){
 const {path:file,...capture}=options,buffer=await page.screenshot(capture);
 for(let attempt=0;attempt<8;attempt++){
  try{fs.writeFileSync(file,buffer);return;}
  catch(error){if(attempt===7)throw error;await new Promise(resolve=>setTimeout(resolve,500));}
 }
};
