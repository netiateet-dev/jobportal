document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    const successModal = document.getElementById('successModal');

    // Set minimum date to today
    const eventDateInput = document.getElementById('eventDate');
    const today = new Date().toISOString().split('T')[0];
    eventDateInput.min = today;

    // Form validation and submission
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Simulate form submission
            showLoadingState();
            
            // Simulate API call delay
            setTimeout(() => {
                hideLoadingState();
                showSuccessModal();
                bookingForm.reset();
            }, 2000);
        }
    });

    // Form validation function
    function validateForm() {
        let isValid = true;
        const requiredFields = bookingForm.querySelectorAll('[required]');
        
        // Clear previous error messages
        clearErrorMessages();
        
        // Check required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showFieldError(field, 'This field is required');
                isValid = false;
            }
        });

        // Validate email
        const emailField = document.getElementById('email');
        if (emailField.value && !isValidEmail(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate phone number
        const phoneField = document.getElementById('phone');
        if (phoneField.value && !isValidPhone(phoneField.value)) {
            showFieldError(phoneField, 'Please enter a valid phone number');
            isValid = false;
        }

        // Validate event date
        const eventDate = new Date(eventDateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (eventDateInput.value && eventDate < today) {
            showFieldError(eventDateInput, 'Event date cannot be in the past');
            isValid = false;
        }

        // Validate services selection
        const servicesCheckboxes = document.querySelectorAll('input[name="services"]:checked');
        if (servicesCheckboxes.length === 0) {
            const servicesGroup = document.querySelector('.checkbox-group');
            showGroupError(servicesGroup, 'Please select at least one service');
            isValid = false;
        }

        // Validate contact time selection
        const contactTimeRadios = document.querySelectorAll('input[name="contactTime"]:checked');
        if (contactTimeRadios.length === 0) {
            const contactTimeGroup = document.querySelector('.radio-group');
            showGroupError(contactTimeGroup, 'Please select a preferred contact time');
            isValid = false;
        }

        return isValid;
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Show field error
    function showFieldError(field, message) {
        field.style.borderColor = '#e74c3c';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '0.3rem';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    // Show group error
    function showGroupError(group, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'group-error';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '0.5rem';
        errorDiv.textContent = message;
        group.parentNode.appendChild(errorDiv);
    }

    // Clear error messages
    function clearErrorMessages() {
        const errorMessages = document.querySelectorAll('.field-error, .group-error');
        errorMessages.forEach(error => error.remove());
        
        // Reset border colors
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '#e1e5e9';
        });
    }

    // Show loading state
    function showLoadingState() {
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
    }

    // Hide loading state
    function hideLoadingState() {
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Booking Request';
        submitBtn.disabled = false;
    }

    // Show success modal
    function showSuccessModal() {
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close success modal
    function closeSuccessModal() {
        successModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Close modal when clicking outside
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            closeSuccessModal();
        }
    });

    // Real-time validation
    const inputs = bookingForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(input);
        });
        
        input.addEventListener('input', function() {
            // Clear error when user starts typing
            const error = input.parentNode.querySelector('.field-error');
            if (error) {
                error.remove();
                input.style.borderColor = '#e1e5e9';
            }
        });
    });

    // Validate individual field
    function validateField(field) {
        const error = field.parentNode.querySelector('.field-error');
        if (error) error.remove();
        
        field.style.borderColor = '#e1e5e9';
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            showFieldError(field, 'This field is required');
            return false;
        }
        
        if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        if (field.type === 'tel' && field.value && !isValidPhone(field.value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
        
        return true;
    }

    // Auto-format phone number
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        e.target.value = value;
    });

    // Dynamic form behavior
    const eventTypeSelect = document.getElementById('eventType');
    const guestCountInput = document.getElementById('guestCount');
    
    eventTypeSelect.addEventListener('change', function() {
        const eventType = this.value;
        const guestCountField = guestCountInput.parentNode;
        
        // Show/hide guest count based on event type
        if (['wedding', 'birthday', 'corporate', 'graduation'].includes(eventType)) {
            guestCountField.style.display = 'block';
            guestCountInput.required = true;
        } else {
            guestCountField.style.display = 'none';
            guestCountInput.required = false;
            guestCountInput.value = '';
        }
    });

    // Initialize form state
    eventTypeSelect.dispatchEvent(new Event('change'));
});
