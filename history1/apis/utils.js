import fs from 'fs'
export function readF(url){
    let result=fs.readFileSync(url,'utf-8');
    if(typeof result===''){
        result='[]'
    }
    return JSON.parse(result);
}


export function writeF(url,result){
    if(typeof result!=='string'){
        result=JSON.stringify(result)
    }
    fs.writeFileSync(url,result,'utf-8')
}