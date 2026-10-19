const header=document.querySelector('.site-header');
const menu=document.querySelector('.menu-btn');
menu?.addEventListener('click',()=>header.classList.toggle('open'));
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>header.classList.remove('open')));

const form=document.getElementById('joinForm');
form?.addEventListener('submit',e=>{
  e.preventDefault();
  const name=document.getElementById('name').value.trim();
  const status=document.getElementById('status').value;
  const goal=document.getElementById('goal').value.trim();
  const preferredOffice=document.getElementById('officeLocation')?.value.trim()||'Not specified';
  const text=`Hello Olalekan, my name is ${name}. I am a ${status}. I saw your FHG website and I would like to join or learn more. My preferred office location is: ${preferredOffice}. What I want to improve right now is: ${goal}. Please help me find a suitable office close to this location.`;
  window.open('https://wa.me/2347061427683?text='+encodeURIComponent(text),'_blank');
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
  })
},{threshold:.12});
document.querySelectorAll('.split-media,.split-copy,.wealth-copy,.wealth-gallery,.story-card,.video-placeholder,.lifestyle-cards article,.journey-flow article,.testimonial-gallery figure').forEach(el=>{
  el.style.opacity='0';el.style.transform='translateY(22px)';el.style.transition='opacity .7s ease,transform .7s ease';observer.observe(el)
});
const style=document.createElement('style');
style.textContent='.visible{opacity:1!important;transform:translateY(0)!important}';
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded',()=>{
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.desktop-nav a').forEach(a=>{
    const href=(a.getAttribute('href')||'').split('#')[0].toLowerCase();
    if((current==='index.html' && (href===''||href==='index.html')) || href===current){
      a.classList.add('active');
    }
  });
});




// Carousels stay still until the visitor swipes, scrolls or chooses an arrow.
// Native scroll preserves vertical page gestures on touch screens.
function setUpManualCarousel(root, trackSelector, previousSelector, nextSelector){
  const track=root.querySelector(trackSelector);
  if(!track)return;
  const previous=root.querySelector(previousSelector);
  const next=root.querySelector(nextSelector);
  const step=()=>{
    const first=track.querySelector(':scope > *');
    if(!first)return Math.max(250,track.clientWidth*.8);
    const gap=parseFloat(getComputedStyle(track).columnGap)||14;
    return first.getBoundingClientRect().width+gap;
  };
  const move=dir=>track.scrollBy({left:dir*step(),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  previous?.addEventListener('click',()=>move(-1));
  next?.addEventListener('click',()=>move(1));
  const update=()=>{
    const max=track.scrollWidth-track.clientWidth;
    if(previous)previous.disabled=track.scrollLeft<3;
    if(next)next.disabled=track.scrollLeft>=max-3 || max<=0;
  };
  track.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update,{passive:true});
  track.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      event.preventDefault();move(event.key==='ArrowRight'?1:-1);
    }
  });
  requestAnimationFrame(update);
}
document.querySelectorAll('[data-carousel]').forEach(root=>
  setUpManualCarousel(root,'.result-carousel-track','.carousel-arrow.prev','.carousel-arrow.next')
);
document.querySelectorAll('[data-team-carousel]').forEach(root=>{
  const section=root.closest('.home-testimonials');
  if(section)setUpManualCarousel(section,'.testimonial-track','.team-slider-arrow.prev','.team-slider-arrow.next');
});

// Evidence gallery: accessible, keyboard-friendly details for every result.
(function setupResultStories(){
  const modal=document.getElementById('proofModal');
  if(!modal)return;
  const cards=Array.from(document.querySelectorAll('.story-result-card'));
  const visual=document.getElementById('proofModalVisual');
  const heading=document.getElementById('proofModalTitle');
  const category=document.getElementById('proofModalCategory');
  const statistic=document.getElementById('proofModalStat');
  const description=document.getElementById('proofModalDescription');
  const relationship=document.getElementById('proofModalRelationship');
  const panel=modal.querySelector('.proof-modal-panel');
  const prev=document.getElementById('proofPrevious');
  const next=document.getElementById('proofNext');
  let current=0;
  let previousFocus=null;

  function show(index){
    current=(index+cards.length)%cards.length;
    const card=cards[current];
    heading.textContent=card.dataset.proofTitle||'Shared result';
    category.textContent=card.dataset.proofLabel||'Achievement';
    statistic.textContent=card.dataset.proofStat||'';
    description.textContent=card.dataset.proofDescription||'';
    if(relationship){
      const memberRole=card.dataset.proofRelationship||'';
      relationship.textContent=memberRole?'Oyekunle Olalekan Musodiq · '+memberRole:'';
      relationship.hidden=!memberRole;
    }
    visual.replaceChildren();
    const image=card.querySelector('.story-result-media img');
    if(image){
      const large=document.createElement('img');
      large.src=image.getAttribute('src');
      large.alt=image.alt||heading.textContent;
      large.decoding='async';
      visual.appendChild(large);
    }else{
      const fallback=card.querySelector('.proof-image-unavailable');
      if(fallback)visual.appendChild(fallback.cloneNode(true));
    }
    prev.setAttribute('aria-label','Previous result, '+(cards[(current-1+cards.length)%cards.length].dataset.proofTitle||''));
    next.setAttribute('aria-label','Next result, '+(cards[(current+1)%cards.length].dataset.proofTitle||''));
  }

  function open(index){
    previousFocus=document.activeElement;
    show(index);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('proof-dialog-open');
    panel.focus();
  }

  function close(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('proof-dialog-open');
    if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus();
  }

  cards.forEach((card,index)=>{
    card.addEventListener('click',()=>open(index));
    card.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();open(index);
      }
    });
  });
  modal.querySelectorAll('[data-close-proof]').forEach(el=>el.addEventListener('click',close));
  prev.addEventListener('click',()=>show(current-1));
  next.addEventListener('click',()=>show(current+1));
  document.addEventListener('keydown',event=>{
    if(!modal.classList.contains('is-open'))return;
    if(event.key==='Escape')close();
    else if(event.key==='ArrowLeft'){event.preventDefault();show(current-1)}
    else if(event.key==='ArrowRight'){event.preventDefault();show(current+1)}
    else if(event.key==='Tab'){
      const focusable=[...modal.querySelectorAll('button:not([disabled])')];
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
  });
  // Open a specific result when a visitor arrives from Home or About Me.
  const requested=new URLSearchParams(window.location.search).get('result');
  if(requested){
    const initial=cards.findIndex(card=>card.dataset.proofId===requested);
    if(initial!==-1)open(initial);
  }
})();


// Keep the floating CTA out of the way once visitors reach the footer.
(function avoidFooterObstruction(){
  const footer=document.querySelector('.social-footer');
  const floating=document.querySelector('.floating-join');
  if(!footer||!floating||typeof IntersectionObserver==='undefined')return;
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>floating.classList.toggle('is-hidden',entry.isIntersecting));
  },{threshold:0,rootMargin:'0px 0px -36px 0px'});
  observer.observe(footer);
})();
