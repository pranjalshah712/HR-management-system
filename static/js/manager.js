
var socketio = io.connect("http://127.0.0.1:9900/leave")

socketio.on('connect', () => {
            console.log('Connected to server');
        });

        var mgr_id = document.getElementById('mgr_id');
        console.log(mgr_id.value)

        socketio.emit('message',{'emp_id':'none', 'mgr_id':mgr_id.value})

        socketio.on('mgr_notifications', (notifications) => {
            const NotificationsAndCount = JSON.parse(notifications);

            updateNotificationCount(NotificationsAndCount.count)
            const notifications_json = NotificationsAndCount.notifications
            console.log("saskdjhajkshd: ", NotificationsAndCount.notifications);
            displayNotifications(notifications_json);
        });

        function displayNotifications(notifications_json) {
            const notificationDiv = document.getElementById('notification');
            notificationDiv.innerHTML = '';

            notifications_json.forEach(notification => {
                const statusClass = getStatusClass(notification.status);
                const statusText = getStatusText(notification.status);

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

                notificationDiv.innerHTML += newNotificationHTML;
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

    var element = document.getElementById('mgr_details');
    element.style.display = 'block';
    currentDiv = element;
    });

       function updateNotificationCount(currentCount) {
          const badgeNumberElement = document.getElementById('badge_number');
          const displayNumberElement = document.getElementById('display_number');

          let previousCount = parseInt(localStorage.getItem('previousCountManager'), 10) || currentCount;

          const difference = currentCount - previousCount;

          displayNumberElement.textContent = difference;

          if (difference !== 0) {
            displayNumberElement.style.display = 'inline-block';
          } else {
            displayNumberElement.style.display = 'none';
          }

          localStorage.setItem('previousCountManager', currentCount);
        }

    const currentCount = parseInt(document.getElementById('badge_number').textContent.trim(), 10);

    updateNotificationCount(currentCount);
