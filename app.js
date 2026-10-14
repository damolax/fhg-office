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
  const text=`Hello Olalekan, my name is ${name}. I am a ${status}. I saw your opportunity website and I would like the full explanation. What I want to improve right now is: ${goal}`;
  window.open('https://wa.me/2347061427683?text='+encodeURIComponent(text),'_blank');
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
  })
},{threshold:.12});
document.querySelectorAll('.promise-card,.split-media,.split-copy,.wealth-copy,.wealth-gallery,.story-card,.video-placeholder,.lifestyle-cards article,.faq-list details,.journey-flow article,.testimonial-gallery figure').forEach(el=>{
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




document.querySelectorAll('[data-carousel]').forEach(carousel=>{
  const track=carousel.querySelector('.result-carousel-track');
  const prev=carousel.querySelector('.carousel-arrow.prev');
  const next=carousel.querySelector('.carousel-arrow.next');
  if(!track) return;

  const step=()=>Math.min(track.clientWidth*.82,420);
  const move=dir=>track.scrollBy({left:dir*step(),behavior:'smooth'});

  prev?.addEventListener('click',()=>move(-1));
  next?.addEventListener('click',()=>move(1));

  let timer;
  const startAuto=()=>{
    clearInterval(timer);
    timer=setInterval(()=>{
      const atEnd=track.scrollLeft+track.clientWidth>=track.scrollWidth-12;
      if(atEnd) track.scrollTo({left:0,behavior:'smooth'});
      else move(1);
    },4200);
  };
  const stopAuto=()=>clearInterval(timer);

  track.addEventListener('pointerdown',stopAuto,{passive:true});
  track.addEventListener('touchstart',stopAuto,{passive:true});
  track.addEventListener('pointerup',startAuto,{passive:true});
  track.addEventListener('touchend',startAuto,{passive:true});
  track.addEventListener('mouseenter',stopAuto);
  track.addEventListener('mouseleave',startAuto);

  startAuto();
});
