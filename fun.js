document.querySelectorAll('button').forEach(btn => {
btn.addEventListener('mouseover', () => {
btn.style.transform = 'rotate(' + (Math.random() * 10 - 5) + 'deg)';
});
});