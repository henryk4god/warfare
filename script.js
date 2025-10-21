document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const prayerContainer = document.getElementById('prayer-container');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const successElement = document.getElementById('success');
    const todayBtn = document.getElementById('today-btn');
    const shareBtn = document.getElementById('share-btn');
    const displayedDateElement = document.getElementById('displayed-date');
    
    // Calendar picker elements
    const datePickerButton = document.getElementById('date-picker-button');
    const datePicker = document.getElementById('date-picker');
    const datePickerMonthYear = document.getElementById('date-picker-month-year');
    const datePickerDays = document.getElementById('date-picker-days');
    const datePickerPrev = document.getElementById('date-picker-prev');
    const datePickerNext = document.getElementById('date-picker-next');
    
    // Current displayed date
    let currentDisplayedDate = new Date();
    let currentCalendarMonth = new Date().getMonth();
    let currentCalendarYear = new Date().getFullYear();
    
    // Format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Format date for display
    function formatDisplayDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Update displayed date
    function updateDisplayedDate() {
        displayedDateElement.textContent = formatDisplayDate(currentDisplayedDate);
    }
    
    // Initialize with today's date
    updateDisplayedDate();
    
    // Fetch prayers for specific date
    function fetchPrayers(date) {
        loadingElement.style.display = 'flex';
        errorElement.style.display = 'none';
        successElement.style.display = 'none';
        prayerContainer.innerHTML = '';
        
        const dateStr = formatDate(date);
        
        // Fetch from prayer.json file
        fetch('prayer.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (data && data[dateStr]) {
                    currentDisplayedDate = new Date(date);
                    updateDisplayedDate();
                    displayPrayers(data[dateStr]);
                    showSuccess();
                } else {
                    showNoPrayersMessage();
                }
            })
            .catch(error => {
                console.error('Error fetching prayers:', error);
                showNoPrayersMessage();
            });
    }
    
    // Display no prayers message
    function showNoPrayersMessage() {
        loadingElement.style.display = 'none';
        prayerContainer.innerHTML = `
            <div class="no-prayers">
                <p>No prayers available for this date.</p>
                <p>Please check back tomorrow or try another date.</p>
            </div>
        `;
    }
    
    // Display prayers with animation
    function displayPrayers(prayers) {
        loadingElement.style.display = 'none';
        prayerContainer.innerHTML = '';
        
        if (!prayers || prayers.length === 0) {
            showNoPrayersMessage();
            return;
        }
        
        prayers.forEach((prayer, index) => {
            const parts = prayer.split(' - ');
            const prayerText = parts[0];
            const verse = parts.length > 1 ? parts[1] : '';
            
            const card = document.createElement('div');
            card.className = 'prayer-card';
            card.innerHTML = `
                <p class="prayer-text">${prayerText}</p>
                ${verse ? `<p class="verse">${verse}</p>` : ''}
            `;
            prayerContainer.appendChild(card);
            
            // Animate cards in sequence
            setTimeout(() => {
                card.classList.add('visible');
            }, 200 * index);
        });
    }
    
    function showError(message) {
        loadingElement.style.display = 'none';
        errorElement.textContent = message || 'Failed to load prayers. Please try again.';
        errorElement.style.display = 'block';
        successElement.style.display = 'none';
    }
    
    function showSuccess() {
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
    
    // Calendar Picker Functions
    function renderCalendar(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInLastMonth = new Date(year, month, 0).getDate();
        
        datePickerMonthYear.textContent = new Date(year, month).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
        
        let daysHtml = '';
        
        // Days from previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInLastMonth - i;
            daysHtml += `<div class="date-picker-day other-month" data-day="${day}" data-month="${month - 1}" data-year="${year}">${day}</div>`;
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayClass = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() 
                ? 'date-picker-day today' 
                : 'date-picker-day';
            
            const isSelected = i === currentDisplayedDate.getDate() && 
                             month === currentDisplayedDate.getMonth() && 
                             year === currentDisplayedDate.getFullYear();
            
            daysHtml += `<div class="${dayClass} ${isSelected ? 'selected' : ''}" data-day="${i}" data-month="${month}" data-year="${year}">${i}</div>`;
        }
        
        // Days from next month
        const daysToShow = 42 - (firstDay + daysInMonth); // 6 rows of 7 days
        for (let i = 1; i <= daysToShow; i++) {
            daysHtml += `<div class="date-picker-day other-month" data-day="${i}" data-month="${month + 1}" data-year="${year}">${i}</div>`;
        }
        
        datePickerDays.innerHTML = daysHtml;
        
        // Add event listeners to days
        document.querySelectorAll('.date-picker-day').forEach(day => {
            day.addEventListener('click', function() {
                const day = parseInt(this.getAttribute('data-day'));
                let month = parseInt(this.getAttribute('data-month'));
                let year = parseInt(this.getAttribute('data-year'));
                
                // Handle month overflow/underflow
                if (month < 0) {
                    month = 11;
                    year--;
                } else if (month > 11) {
                    month = 0;
                    year++;
                }
                
                const selectedDate = new Date(year, month, day);
                currentDisplayedDate = selectedDate;
                updateDisplayedDate();
                fetchPrayers(selectedDate);
                
                // Update calendar display
                currentCalendarMonth = month;
                currentCalendarYear = year;
                renderCalendar(month, year);
                
                // Close the calendar
                datePicker.classList.remove('show');
            });
        });
    }
    
    // Toggle calendar visibility
    datePickerButton.addEventListener('click', function(e) {
        e.stopPropagation();
        datePicker.classList.toggle('show');
        
        // Ensure calendar shows current month when opened
        if (datePicker.classList.contains('show')) {
            currentCalendarMonth = currentDisplayedDate.getMonth();
            currentCalendarYear = currentDisplayedDate.getFullYear();
            renderCalendar(currentCalendarMonth, currentCalendarYear);
        }
    });
    
    // Navigate to previous month
    datePickerPrev.addEventListener('click', function(e) {
        e.stopPropagation();
        currentCalendarMonth--;
        if (currentCalendarMonth < 0) {
            currentCalendarMonth = 11;
            currentCalendarYear--;
        }
        renderCalendar(currentCalendarMonth, currentCalendarYear);
    });
    
    // Navigate to next month
    datePickerNext.addEventListener('click', function(e) {
        e.stopPropagation();
        currentCalendarMonth++;
        if (currentCalendarMonth > 11) {
            currentCalendarMonth = 0;
            currentCalendarYear++;
        }
        renderCalendar(currentCalendarMonth, currentCalendarYear);
    });
    
    // Close calendar when clicking outside
    document.addEventListener('click', function() {
        datePicker.classList.remove('show');
    });
    
    // Event listeners
    todayBtn.addEventListener('click', function() {
        const today = new Date();
        currentDisplayedDate = today;
        currentCalendarMonth = today.getMonth();
        currentCalendarYear = today.getFullYear();
        updateDisplayedDate();
        renderCalendar(currentCalendarMonth, currentCalendarYear);
        fetchPrayers(today);
    });
    
    // Share functionality
    shareBtn.addEventListener('click', async function() {
        const prayers = Array.from(document.querySelectorAll('.prayer-card'))
            .map(card => {
                const text = card.querySelector('.prayer-text').textContent;
                const verse = card.querySelector('.verse') ? card.querySelector('.verse').textContent : '';
                return `${text}${verse ? ` - ${verse}` : ''}`;
            })
            .join('\n\n');

        const shareData = {
            title: 'Divine Warfare Prayers',
            text: `🌟 Spiritual Warfare Prayers for ${formatDisplayDate(currentDisplayedDate)} 🌟\n\n${prayers}\n\nGet your daily prayers at: ${window.location.href}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text);
                showSuccess();
                successElement.textContent = 'Prayers copied to clipboard!';
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    });
    
    // Initial load - fetch today's prayers immediately
    fetchPrayers(new Date());
    
    // Initialize calendar
    renderCalendar(new Date().getMonth(), new Date().getFullYear());
});
