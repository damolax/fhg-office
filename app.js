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
  window.open('https://wa.me/2347013960946?text='+encodeURIComponent(text),'_blank');
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
  })
},{threshold:.12});
document.querySelectorAll('.promise-card,.split-media,.split-copy,.wealth-copy,.wealth-gallery,.story-card,.video-placeholder,.lifestyle-cards article,.faq-list details').forEach(el=>{
  el.style.opacity='0';el.style.transform='translateY(22px)';el.style.transition='opacity .7s ease,transform .7s ease';observer.observe(el)
});
const style=document.createElement('style');
style.textContent='.visible{opacity:1!important;transform:translateY(0)!important}';
document.head.appendChild(style);
