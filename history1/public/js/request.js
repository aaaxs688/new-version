let request={
    strQuery(obj){
        let arr=[];
        for(let k in obj){
            arr.push(`${k}=${obj[k]}`)
        }
        return arr.join('&');
    },
    get(url,query,cb){
        url=url+'?'+this.strQuery(query)
        let xhr=new XMLHttpRequest();
        xhr.open('get',url,true)
        xhr.send(null);
        xhr.onreadystatechange=function(){
            if(xhr.readyState===4){
                cb&&cb(xhr.responseText)
            }
        }
    },
    post(url,body,cb){
        body=JSON.stringify(body);
        let xhr=new XMLHttpRequest();
        xhr.open('post',url,true)
        
        xhr.setRequestHeader('Content-Type','application/json')
        xhr.send(body);
        xhr.onreadystatechange=function(){
            if(xhr.readyState===4){
                cb&&cb(xhr.responseText)
            }
        }
    }
}