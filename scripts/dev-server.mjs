#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root=process.cwd(),port=Number(process.env.PORT||4173);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".md":"text/markdown; charset=utf-8"};
const server=http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,"http://localhost");
  const pathname=decodeURIComponent(url.pathname);
  const filename=path.resolve(root,"."+pathname+(pathname.endsWith("/")?"index.html":""));
  const relative=path.relative(root,filename);
  if(relative.startsWith("..")||path.isAbsolute(relative)||relative.split(path.sep).includes(".private")||relative.split(path.sep).some(p=>p.startsWith("." )&&p!==".well-known")){res.writeHead(403);res.end("Forbidden");return}
  fs.readFile(filename,(err,bytes)=>{
   if(err){res.writeHead(err.code==="ENOENT"?404:500);res.end("Not found");return}
   res.writeHead(200,{"Content-Type":mime[path.extname(filename)]||"application/octet-stream","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
   res.end(bytes);
  });
 }catch{res.writeHead(400);res.end("Bad request")}
});
server.listen(port,"127.0.0.1",()=>console.log("REAL ENGLISH disponível somente neste computador: http://127.0.0.1:"+port));
