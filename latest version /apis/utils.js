import fs from 'fs'
export function readF(url){
    let result=fs.readFileSync(url,'utf-8'); // Read file contents
    if(typeof result===''){
        result='[]'  // Check whether the read result is an empty string
    }
    return JSON.parse(result);  //Parses the string into a JSON object and returns it
}


export function writeF(url,result){
    if(typeof result!=='string'){
        result=JSON.stringify(result)
    } // If result is not a string, it is converted to a JSON string using JSON.stringify.
    fs.writeFileSync(url,result,'utf-8')
}