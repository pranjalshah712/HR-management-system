// Connect to the Socket.IO server for leave notifications
var socketio = io.connect("http://127.0.0.1:9900/leave");

// Log connection status when connected
socketio.on('connect', () => {
    console.log('Connected to server');
});

// Get employee ID from the HTML element
var emp_id = document.getElementById('emp_id');
console.log(emp_id.value); // Log the employee ID

// Emit a message to the server with the employee ID and no manager ID
socketio.emit('message', {'emp_id': emp_id.value, 'mgr_id': 'none'});

// Listen for initial notifications from the server
socketio.on('initial_notifications', (notifications) => {
    notifications_json = JSON.parse(notifications); // Parse the incoming JSON
    displayNotifications(notifications_json); // Display the notifications
});

// Function to display notifications in the UI
function displayNotifications(notifications) {
    const notificationDiv = document.getElementById('notification'); // Get notification container

    // Loop through each notification and create HTML elements
    notifications.forEach(notification => {
        const statusClass = getStatusClass(notification.status); // Get CSS class for status
        const statusText = getStatusText(notification.status); // Get text for status

        // Create new notification HTML
        const notificationHTML = `
            <div class="notification-item">
                <div>
                    <h6>Leave-Start: ${notification.start}</h6>
                    <h6>Leave-End: ${notification.end}</h6>
                    <h6>Leave-Subject: ${notification.subject}</h6>
                    <h6>Leave-Reason: ${notification.reason}</h6>
                </div>
                <div>
                    <h6 class="btn ${statusClass}">${statusText}</h6>
                </div>
            </div>
        `;

        // Append new notification to the notification div
        notificationDiv.innerHTML += notificationHTML;
    });
}

// Function to get the appropriate CSS class based on leave status
function getStatusClass(status) {
    if (status === null) {
        return 'btn-warning'; // Pending status
    } else if (status === 'False') {
        return 'btn-danger'; // Rejected status
    } else {
        return 'btn-success'; // Approved status
    }
}

// Function to get the display text for the status
function getStatusText(status) {
    if (status === null) {
        return 'Pending'; // Text for pending
    } else if (status === 'False') {
        return 'Rejected'; // Text for rejected
    } else {
        return 'Approved'; // Text for approved
    }
}

// Function to handle link click and disable attendance link temporarily
function handleLinkClick() {
    var link = document.getElementById('attendance_disable');
    link.style.display = 'none'; // Hide the link

    var now = new Date().getTime(); // Get current time
    localStorage.setItem('linkClickedTime', now.toString()); // Store click time

    // Re-enable the link after 10 seconds
    setTimeout(function() {
        enableLink();
    }, 10000);
}

// Function to enable the attendance link again
function enableLink() {
    var link = document.getElementById('attendance_disable');
    link.style.display = 'block'; // Show the link again
    localStorage.removeItem('linkClickedTime'); // Clear stored click time
}

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('attendance_disable');
    var linkClickedTime = localStorage.getItem('linkClickedTime'); // Get stored click time

    // Check if the link was clicked recently
    if (linkClickedTime) {
        var clickedTimestamp = parseInt(linkClickedTime, 10);
        var now = new Date().getTime();

        // If clicked within the last 10 seconds, disable the link
        if (now - clickedTimestamp < 10000) {
            link.style.display = 'none'; // Hide link

            var timeLeft = 10000 - (now - clickedTimestamp); // Calculate time left
            // Re-enable the link after the remaining time
            setTimeout(function() {
                enableLink();
            }, timeLeft);
        } else {
            enableLink(); // If time expired, enable link
        }
    } else {
        link.style.display = 'block'; // If never clicked, show link
    }
});

// Variable to track currently displayed div
var currentDiv = null;

// Function to show/hide elements based on their IDs
function showhide(id) {
    var element = document.getElementById(id);

    // Toggle visibility of the element
    if (element.style.display == 'block') {
        element.style.display = 'none';
    } else {
        // Hide the previously displayed div if applicable
        if (currentDiv !== null) {
            currentDiv.style.display = 'none';
        }

        // Show the current element
        element.style.display = 'block';
        currentDiv = element; // Update currentDiv to the new element
    }

    // Special handling for notification display
    if (id == 'notification') {
        var icon = document.getElementById('display_number');
        icon.style.display = 'none'; // Hide notification icon when displayed
    }
}

// Run on window load
$(window).on('load', function() {
    var element = document.getElementById('emp_details');
    element.style.display = 'block'; // Show employee details on load
    currentDiv = element; // Set currentDiv to employee details
});

// Function to update the notification count displayed in the UI
function updateNotificationCount(currentCount) {
    const badgeNumberElement = document.getElementById('badge_number');
    const displayNumberElement = document.getElementById('display_number');

    // Get the previous count from local storage
    let previousCount = parseInt(localStorage.getItem('previousCountEmployee'), 10) || currentCount;

    // Calculate the difference
    const difference = currentCount - previousCount;

    // Update the displayed number for new notifications
    displayNumberElement.textContent = difference;

    // Show or hide the display number based on the difference
    if (difference !== 0) {
        displayNumberElement.style.display = 'inline-block'; // Show the badge
    } else {
        displayNumberElement.style.display = 'none'; // Hide if no new notifications
    }

    // Store the current count in local storage
    localStorage.setItem('previousCountEmployee', currentCount);
}

// Initialize notification count
const currentCount = parseInt(document.getElementById('badge_number').textContent.trim(), 10);
updateNotificationCount(currentCount); // Update notification count on page load
