// EMAILJS CONTACT FORM 
emailjs.init({ publicKey: "XRkQh4EJfDfnfeUWG" });

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');

    if (!contactForm) return;   

    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Disable button & show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending...';

        const params = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
        };

        if (!params.name || !params.email || !params.subject || !params.message) {
            Swal.fire('Error', 'Please fill in all fields!', 'error');
            resetButton();
            return;
        }
        if (!valid(params.email)) {
            Swal.fire('Error', 'Please enter a valid email address!', 'error');
            resetButton();
            return;
        }

        try {
            await emailjs.send('service_bm4wl8v', 'template_7opo10p', params);
            Swal.fire('Success!', '✅ Message sent successfully!', 'success');
            contactForm.reset();
        } catch (error) {
            console.error('EmailJS error:', error);
            Swal.fire('Error!', '❌ Failed to send message.', 'error');
        } finally {
            resetButton();
        }
    });

    function resetButton() {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send message';
    }
});