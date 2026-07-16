
for(let i=0;i<120;i++){
 let s=document.createElement('div');
 s.className='star';
 let z=Math.random()*3+1;
 s.style.width=s.style.height=z+'px';
 s.style.left=Math.random()*100+'vw';
 s.style.top=Math.random()*100+'vh';
 s.style.animationDelay=(Math.random()*2)+'s';
 document.body.appendChild(s);
}
