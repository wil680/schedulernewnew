window.addEventListener('DOMContentLoaded', () => {

setInterval(loadComments, 5000); // Refresh comments every 5 seconds

const openModalButtons = document.querySelectorAll('[data-modal-target]');
const closeModalButtons = document.querySelectorAll('[data-close-button]');
const overlay = document.getElementById('overlay');
let selectedDay = '';

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = document.querySelector(button.dataset.modalTarget);
        selectedDay = button.dataset.day;
        console.log("Selected day:", selectedDay); // Debugging line
        console.log("Button clicked! Data-day is:", button.dataset.day);
        openModal(modal);
    });
})

overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        closeModal(modal);
    });
}); 

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    });
})

function openModal(modal) {
    if (modal == null) return;
    modal.classList.add('active');
    overlay.classList.add('active');
}

function closeModal(modal) {
    if (modal == null) return;
    modal.classList.remove('active');
    overlay.classList.remove('active');
}

const now = new Date();
generateMonthlyCalendar(now.getMonth(), now.getFullYear()); // May 2025 (0-based month index)
setTimeout(() => {
    loadComments(); // load after DOM is updated
}, 50);
const inputElement = document.getElementById('userInput');
const submitButton = document.getElementById('submitButton');
const output = document.getElementById('output');




submitButton.addEventListener('click', () => {
    const value = inputElement.value;
    const sliderValue = document.getElementById('attendanceSlider').value;
    const attendanceOptions = ['Not Attending', 'Don’t Know', 'Attending'];
    const attendance = attendanceOptions[sliderValue];


    output.textContent = `You entered: ${value} (${attendance})`;
    const data = { 
        comment: value,
        day: selectedDay,
        attendance: attendance
    };

    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(async response => {
    if (response.redirected) {
        output.textContent = 'You are not logged in. Please log in first.';
        window.location.href = response.url;
        return;
    }
    const message = await response.text();
    output.textContent = message;
        inputElement.value = '';
        loadComments();
    })
    .catch(error => {
        output.textContent = 'Error sending data';
        console.error('Error:', error);
    });
});

function loadComments() {
    fetch('/data')
        .then(response => response.json())
        .then(comments => {
            for (const day in comments) {
                const summaryBox = document.getElementById(`summary-${day}`);
                if (summaryBox) {
                    const count = comments[day].length;
                    summaryBox.textContent = count === 0
                        ? 'No comments'
                        : `${count} comment${count > 1 ? 's' : ''}`;
                }
            }
        })
        .catch(err => {
            console.error('Error fetching data:', err);
        });
}


const clearButton = document.getElementById('clearButton');

clearButton.addEventListener('click', () => {
  fetch('/clear', {
    method: 'POST'
  })
  .then(res => res.text())
  .then(message => {
    console.log(message);
    loadComments(); // reload after clearing
  })
  .catch(err => {
    console.error('Error clearing comments:', err);
  });
});



function generateMonthlyCalendar(month, year) {
    const container = document.querySelector('.container');
    container.innerHTML = '';

    const firstDate = new Date(year, month, 1);
    const startDay = firstDate.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    const daysInMonth = new Date(year, month + 1, 0).getDate();



    // Add blank cells for days before the 1st
    for (let i = 0; i < startDay; i++) {
        const blank = document.createElement('div');
        blank.classList.add('column');
        blank.style.visibility = 'hidden';
        container.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const summary = document.createElement('div');
        summary.className = 'summaryLine';
        summary.id = `summary-${day}`;
        summary.textContent = 'No comments';

        const dayDiv = document.createElement('div');
        dayDiv.classList.add('column');
        dayDiv.dataset.day = day;

        const title = document.createElement('h3');
        title.textContent = day;

        dayDiv.appendChild(title);
        dayDiv.appendChild(summary);
        container.appendChild(dayDiv);

        dayDiv.addEventListener('click', () => {
            selectedDay = day;
            loadDayDetails(day);
            openModal(document.getElementById('modal'));
        });
    }

    loadComments();
}

function loadDayDetails(day) {
  fetch('/data')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('commentList');
      const entries = data[day] || [];
      list.innerHTML = entries.length === 0
        ? '<p>No comments yet.</p>'
        : entries.map(e => `<p>${e.comment} — <em>${e.attendance}</em></p>`).join('');
    });
}

document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    // Deactivate all buttons & tabs
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    // Activate clicked button & associated tab
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

});




