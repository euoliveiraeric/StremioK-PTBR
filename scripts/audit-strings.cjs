const fs=require('fs'),path=require('path'),acorn=require('../tests/deps.cjs')('acorn');
const root=path.resolve(__dirname,'..'),strings=[],files=[];
for(const dir of ['js','service'])for(const f of fs.readdirSync(path.join(root,dir)).filter(x=>x.endsWith('.js')&&!['i18n.js','qrcode.js'].includes(x)))files.push(dir+'/'+f);
for(const file of files){
    const source=fs.readFileSync(path.join(root,file),'utf8');
    function walk(n,parents){
        if(n.type==='Literal'&&typeof n.value==='string'){
            const localized=parents.some(p=>p.type==='CallExpression'&&p.callee.type==='MemberExpression'&&p.callee.object.name==='I18n'&&p.callee.property.name==='t');
            const phone=parents.some(p=>p.type==='VariableDeclarator'&&p.id.name==='PHONE_PT')||parents.some(p=>p.type==='ConditionalExpression'&&/e\.lang/.test(source.slice(p.test.start,p.test.end)));
            const parent=parents[parents.length-1];
            strings.push({file,line:n.loc.start.line,text:n.value,role:localized?'interface-key':phone?'phone-localization':parent&&parent.type==='Property'&&parent.key===n?'object-key':'preserved-logic-data-or-technical-text'});
        }
        for(const k in n){if(k==='loc')continue;const v=n[k];if(Array.isArray(v))v.forEach(x=>x&&x.type&&walk(x,parents.concat(n)));else if(v&&v.type)walk(v,parents.concat(n));}
    }
    walk(acorn.parse(source,{ecmaVersion:5,locations:true}),[]);
}
const counts=strings.reduce((a,x)=>(a[x.role]=(a[x.role]||0)+1,a),{});
fs.writeFileSync(path.join(root,'locales/inventory.json'),JSON.stringify({upstream:'d37839db2b0f03cf7e70060550f6605dcf72dec3',scope:'Every string literal in app-owned js/ and service/. The compiled catalogue is in locales/pt-BR.json. Third-party qrcode and vendor libraries are preserved.',note:'Preserved literals include keys, protocols, selectors, metadata and technical error tokens. This inventory is not proof of exhaustive linguistic or device validation.',files:files.length,counts,strings},null,2)+'\n');
console.log(JSON.stringify({files:files.length,counts}));
