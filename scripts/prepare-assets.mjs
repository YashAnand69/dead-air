import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';
for(const asset of JSON.parse(readFileSync(new URL('../assets/manifest.json',import.meta.url),'utf8'))){const content=Buffer.concat(asset.parts.map(part=>readFileSync(new URL('../'+part,import.meta.url))));if(createHash('sha256').update(content).digest('hex')!==asset.sha256)throw new Error('Asset integrity failed: '+asset.output);const path=new URL('../'+asset.output,import.meta.url);mkdirSync(dirname(path.pathname),{recursive:true});writeFileSync(path,content);console.log('Verified',asset.output);}
