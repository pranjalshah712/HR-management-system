var socketio = io.connect("http://127.0.0.1:9900/leave")

socketio.on('connect', () => {
            console.log('Connected to server');
        });

        var emp_id = document.getElementById('emp_id');
        console.log(emp_id.value)

        socketio.emit('message',{'emp_id':emp_id.value, 'mgr_id':'none'})

        socketio.on('initial_notifications', (notifications) => {
            notifications_json = JSON.parse(notifications)
            displayNotifications(notifications_json);
        });

        function displayNotifications(notifications) {
            const notificationDiv = document.getElementById('notification');

            notifications.forEach(notification => {
                const statusClass = getStatusClass(notification.status);
                const statusText = getStatusText(notification.status);

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

                notificationDiv.innerHTML += notificationHTML;
            });
        }

        function getStatusClass(status) {
            if (status === null) {
                return 'btn-warning';
            } else if (status === 'False') {
                return 'btn-danger';
            } else {
                return 'btn-success';
            }
        }

        function getStatusText(status) {
            if (status === null) {
                return 'Pending';
            } else if (status === 'False') {
                return 'Rejected';
            } else {
                return 'Approved';
            }
        }










function handleLinkClick() {
    var link = document.getElementById('attendance_disable');
    link.style.display = 'none';

    var now = new Date().getTime();
    localStorage.setItem('linkClickedTime', now.toString());

    setTimeout(function() {
        enableLink();
    }, 10000);
}

function enableLink() {
    var link = document.getElementById('attendance_disable');
    link.style.display = 'block';

    localStorage.removeItem('linkClickedTime');
}

document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('attendance_disable');
    var linkClickedTime = localStorage.getItem('linkClickedTime');

    if (linkClickedTime) {
        var clickedTimestamp = parseInt(linkClickedTime, 10);
        var now = new Date().getTime();

        if (now - clickedTimestamp < 10000) {
            link.style.display = 'none';

            var timeLeft = 10000 - (now - clickedTimestamp);
            setTimeout(function() {
                enableLink();
            }, timeLeft);
        } else {
            enableLink();
        }
    } else {
        link.style.display = 'block';
    }
});


    var currentDiv = null;

    function showhide(id) {
        var element = document.getElementById(id);

        if (element.style.display == 'block') {
                element.style.display = 'none';
        } else {
            if (currentDiv !== null) {
                currentDiv.style.display = 'none';
            }

            element.style.display = 'block';
            currentDiv = element;
        }
        if (id == 'notification'){
            var icon = document.getElementById('display_number');
            icon.style.display = 'none';
        }
    }

    $(window).on('load', function(){

    var element = document.getElementById('emp_details');
    element.style.display = 'block';
    currentDiv = element;
    });

       function updateNotificationCount(currentCount) {
          const badgeNumberElement = document.getElementById('badge_number');
          const displayNumberElement = document.getElementById('display_number');

          let previousCount = parseInt(localStorage.getItem('previousCountEmployee'), 10) || currentCount;

          const difference = currentCount - previousCount;

          displayNumberElement.textContent = difference;

          if (difference !== 0) {
            displayNumberElement.style.display = 'inline-block';
          } else {
            displayNumberElement.style.display = 'none';
          }

          localStorage.setItem('previousCountEmployee', currentCount);
        }

    const currentCount = parseInt(document.getElementById('badge_number').textContent.trim(), 10);

    updateNotificationCount(currentCount);
