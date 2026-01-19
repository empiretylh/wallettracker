import { useEffect } from 'react';

const FloatingHearts = () => {
  useEffect(() => {
    const createFloatingHeart = () => {
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.className = 'heart-decoration';
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
      heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 5000);
    };

    const interval = setInterval(createFloatingHeart, 800);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default FloatingHearts;
