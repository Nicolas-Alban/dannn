// Maneja apertura/cierre de la carta, animaciones de sello y corazones-confetti
document.addEventListener('DOMContentLoaded', ()=>{
    const envelope = document.getElementById('envelope');
    const sealBtn = document.getElementById('sealBtn');
    const sealImg = document.getElementById('sealImg');
    const paper = document.getElementById('paper');
    const closeBtn = document.getElementById('closeBtn');
    const acceptBtn = document.getElementById('acceptBtn');
    const heartsLayer = document.getElementById('heartsLayer');

    let openState = false;
    let streamInterval = null;
    let heartImgAvailable = true;

    // test if local heart image exists; fallback to inline SVG hearts if not
    (function testHeart(){
        const t = new Image();
        t.src = 'images/heart.png';
        t.onload = ()=>{ heartImgAvailable = true; };
        t.onerror = ()=>{ heartImgAvailable = false; };
    })();

    function spawnHeart(xPercent){
        const left = (typeof xPercent === 'number') ? xPercent : (35 + Math.random()*30);
        const size = 14 + Math.random()*36;

        if(heartImgAvailable){
            const h = document.createElement('div');
            h.className = 'floating-heart';
            h.style.backgroundImage = "url('images/heart.png')";
            h.style.width = size + 'px';
            h.style.height = size + 'px';
            h.style.left = left + '%';
            h.style.bottom = '12%';
            heartsLayer.appendChild(h);
            const dx = (Math.random()*160 - 80);
            const duration = 1200 + Math.random()*1200;
            h.animate([
                {transform:`translateX(0px) translateY(0px) rotate(0deg) scale(1)`, opacity:1},
                {transform:`translateX(${dx}px) translateY(-${120 + Math.random()*220}px) rotate(${360*Math.random()}deg) scale(.6)`, opacity:0}
            ],{duration, easing:'cubic-bezier(.2,.8,.2,1)'}).onfinish = ()=>h.remove();
            return;
        }

        // fallback: create inline SVG heart when no image available
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox','0 0 24 24');
        svg.style.position = 'absolute';
        svg.style.left = left + '%';
        svg.style.bottom = '12%';
        svg.style.zIndex = 220;
        svg.classList.add('floating-heart');
        const path = document.createElementNS(svgNS,'path');
        path.setAttribute('d','M12 21s-7-4.35-9-6.27C-1.2 11.1 3.3 4 8.5 6.5 10 7.4 12 9 12 9s2-1.6 3.5-2.5C20.7 4 25.2 11.1 21 14.73 19 16.65 12 21 12 21z');
        path.setAttribute('fill','#ff4d4f');
        svg.appendChild(path);
        heartsLayer.appendChild(svg);

        const dx = (Math.random()*160 - 80);
        const duration = 1200 + Math.random()*1200;
        svg.animate([
            {transform:`translateX(0px) translateY(0px) rotate(0deg) scale(1)`, opacity:1},
            {transform:`translateX(${dx}px) translateY(-${120 + Math.random()*220}px) rotate(${360*Math.random()}deg) scale(.6)`, opacity:0}
        ],{duration, easing:'cubic-bezier(.2,.8,.2,1)'}).onfinish = ()=>svg.remove();
    }

    function burstHearts(count){
        for(let i=0;i<count;i++){
            setTimeout(()=>spawnHeart(45 + Math.random()*20), i*40);
        }
    }

    function startStream(){
        if(streamInterval) return;
        streamInterval = setInterval(()=>spawnHeart(), 700);
    }
    function stopStream(){ if(streamInterval){ clearInterval(streamInterval); streamInterval = null; } }

    function openEnvelope(){
        envelope.classList.add('open');
        paper.setAttribute('aria-hidden','false');
        // animate seal
        sealImg.animate([{transform:'scale(1)'},{transform:'scale(.92) rotate(-14deg)'},{transform:'scale(.98) rotate(-6deg)'}],{duration:900,easing:'cubic-bezier(.2,.8,.2,1)'});
        openState = true;
        // burst + start stream
        burstHearts(14);
        startStream();
    }

    function closeEnvelope(){
        envelope.classList.remove('open');
        paper.setAttribute('aria-hidden','true');
        stopStream();
        openState = false;
    }

    sealBtn.addEventListener('click',(e)=>{
        e.preventDefault();
        if(openState) closeEnvelope(); else openEnvelope();
    });

    // keyboard accessibility
    sealBtn.addEventListener('keydown',(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); sealBtn.click(); } });

    closeBtn.addEventListener('click',()=>{ closeEnvelope(); });

    acceptBtn.addEventListener('click',()=>{
        acceptBtn.textContent = '¡Perfecto! 💫';
        acceptBtn.disabled = true;
        burstHearts(24);
    });

    // touch: allow tap to also spawn tiny hearts when paper open
    paper.addEventListener('click',(e)=>{
        if(openState){
            // spawn a few at tap position
            const rect = heartsLayer.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            for(let i=0;i<6;i++) setTimeout(()=>spawnHeart(x + (Math.random()*8-4)), i*60);
        }
    });

    // initial accessibility: if images missing, keep behavior but visuals degrade gracefully
});
