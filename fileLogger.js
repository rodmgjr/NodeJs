const EventEmitter = require('events');
const fs = require('fs');
const dateFormat = require('dateformat');

const now = new Date();
const currentDate = dateFormat(now, "yyyy-mm-dd");

class FileLogger extends EventEmitter {
    eventLog = (message) => {   

        const fileName = `AttendanceMonitoringLogs-${currentDate}.txt`;
    
        fs.appendFile(fileName, message, (err) => {
            if (err) throw err;
           
        });
    }
}


module.exports = FileLogger;