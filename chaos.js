const audio = new Audio('/sounds/pop.mp3');
document.querySelectorAll('button').forEach(btn => {
btn.addEventListener('click', () => {
audio.play();
document.body.style.transform = `rotate(${Math.random()*2-1}deg)`;
});
});


setInterval(() => {
document.body.style.filter = `hue-rotate(${Math.random()*360}deg)`;
}, 800);