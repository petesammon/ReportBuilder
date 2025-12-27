function toggle(element) {
            const content = element.nextElementSibling;
            
            if (content.style.display === 'block') {
                content.style.display = 'none';
                element.classList.remove('active');
            } else {
                content.style.display = 'block';
                element.classList.add('active');
            }
        }
