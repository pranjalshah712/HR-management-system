// Connect to the Socket.IO server for leave notifications
var socketio = io.connect("http://127.0.0.1:9900/leave");

// Log connection status
socketio.on('connect', () => {
    console.log('Connected to server');
});

// Emit a message to the server with default IDs
socketio.emit('message', {'emp_id': 'none', 'mgr_id': 'none'});

// Listen for admin notifications from the server
socketio.on('admin_notifications', (notifications) => {
    const NotificationsAndCount = JSON.parse(notifications); // Parse incoming JSON notifications

    // Update the notification count on the UI
    updateNotificationCount(NotificationsAndCount.count);
    const notifications_json = NotificationsAndCount.notifications; // Extract notifications
    console.log("Received notifications: ", NotificationsAndCount.notifications);
    displayNotifications(notifications_json); // Display notifications in the UI
});

// Function to display notifications in the UI
function displayNotifications(notifications_json) {
    const notificationDiv = document.getElementById('notification');
    notificationDiv.innerHTML = ''; // Clear existing notifications

    // Loop through each notification and create HTML elements
    notifications_json.forEach(notification => {
        const statusClass = getStatusClass(notification.status); // Get status class for styling
        const statusText = getStatusText(notification.status); // Get text for status

        // Create new notification HTML
        const newNotificationHTML = `
            <div class="notification-item">
                <div>
                    <h6>Leave-Id: ${notification.leave_id}</h6>
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

var currentDiv = null; // To keep track of the currently displayed div

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
    var element = document.getElementById('admin_details');
    element.style.display = 'block'; // Show admin details on load
    currentDiv = element; // Set currentDiv to admin details
});

// Function to update the notification count displayed in the UI
function updateNotificationCount(currentCount) {
    const badgeNumberElement = document.getElementById('badge_number');
    const displayNumberElement = document.getElementById('display_number');

    // Get the previous count from local storage
    let previousCount = parseInt(localStorage.getItem('previousCountAdmin'), 10) || currentCount;

    // Store the current count in local storage
    localStorage.setItem('previousCountAdmin', currentCount);

    const difference = currentCount - previousCount; // Calculate the difference

    // Update the displayed number for new notifications
    displayNumberElement.textContent = difference;

    // Show or hide the display number based on the difference
    if (difference !== 0) {
        displayNumberElement.style.display = 'inline-block'; // Show the badge
    } else {
        displayNumberElement.style.display = 'none'; // Hide if no new notifications
    }
}

// Initialize notification count
const currentCount = parseInt(document.getElementById('badge_number').textContent.trim(), 10);
updateNotificationCount(currentCount); // Update notification count on page load
