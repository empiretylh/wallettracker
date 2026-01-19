import { useEffect, useRef } from 'react';

const FloatingHearts = () => {
  const timeoutsRef = useRef([]);

  useEffect(() => {
    const createFloatingHeart = () => {
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.className = 'heart-decoration';
      heart.style.left = Math.random() * window.innerWidth + 'px';
      heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
      heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
      document.body.appendChild(heart);

      const timeoutId = setTimeout(() => {
        if (document.body.contains(heart)) {
          heart.remove();
        }
        // Remove this timeout from the array
        const index = timeoutsRef.current.indexOf(timeoutId);
        if (index > -1) {
          timeoutsRef.current.splice(index, 1);
        }
      }, 5000);
      
      timeoutsRef.current.push(timeoutId);
    };

    const interval = setInterval(createFloatingHeart, 800);

    return () => {
      clearInterval(interval);
      // Clear all pending timeouts
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];
      // Clean up any remaining hearts
      document.querySelectorAll('.heart-decoration').forEach(heart => heart.remove());
    };
  }, []);

  return null;
};

export default FloatingHearts;
