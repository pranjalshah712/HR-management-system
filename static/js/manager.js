// Connect to the Socket.IO server for manager notifications
var socketio = io.connect("http://127.0.0.1:9900/leave");

// Log connection status when connected
socketio.on('connect', () => {
    console.log('Connected to server');
});

// Get manager ID from the HTML element
var mgr_id = document.getElementById('mgr_id');
console.log(mgr_id.value); // Log the manager ID

// Emit a message to the server with no employee ID and the manager ID
socketio.emit('message', {'emp_id': 'none', 'mgr_id': mgr_id.value});

// Listen for notifications specific to the manager
socketio.on('mgr_notifications', (notifications) => {
    const NotificationsAndCount = JSON.parse(notifications); // Parse the incoming JSON

    updateNotificationCount(NotificationsAndCount.count); // Update the notification count
    const notifications_json = NotificationsAndCount.notifications; // Extract notifications
    console.log("saskdjhajkshd: ", NotificationsAndCount.notifications); // Log notifications
    displayNotifications(notifications_json); // Display the notifications
});

// Function to display notifications in the UI
function displayNotifications(notifications_json) {
    const notificationDiv = document.getElementById('notification'); // Get notification container
    notificationDiv.innerHTML = ''; // Clear previous notifications

    // Loop through each notification and create HTML elements
    notifications_json.forEach(notification => {
        const statusClass = getStatusClass(notification.status); // Get CSS class for status
        const statusText = getStatusText(notification.status); // Get text for status

        // Create new notification HTML
        const newNotificationHTML = `
            <div class="notification-item">
                <div>
                    <h6>Employee-Id: ${notification.emp_id}</h6>
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
        notificationDiv.innerHTML += newNotificationHTML;
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

// Variable to track currently displayed div
var currentDiv = null;

// Function to show/hide elements based on their IDs
function showhide(id) {
    var element = document.getElementById(id);

    // Toggle visibility of the element
    if (element.style.display == 'block') {
        element.style.display = 'none'; // Hide if currently displayed
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
    var element = document.getElementById('mgr_details');
    element.style.display = 'block'; // Show manager details on load
    currentDiv = element; // Set currentDiv to manager details
});

// Function to update the notification count displayed in the UI
function updateNotificationCount(currentCount) {
    const badgeNumberElement = document.getElementById('badge_number'); // Badge for notification count
    const displayNumberElement = document.getElementById('display_number'); // Element to display new notification count

    // Get the previous count from local storage
    let previousCount = parseInt(localStorage.getItem('previousCountManager'), 10) || currentCount;

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
    localStorage.setItem('previousCountManager', currentCount);
}

// Initialize notification count
const currentCount = parseInt(document.getElementById('badge_number').textContent.trim(), 10);
updateNotificationCount(currentCount); // Update notification count on page load
