$(document).ready(function() { 
    getJobs();
}); 

function getJobs() {
    $.get('getJobs', function( data ) {
        var table = data.map(job => {
            var row = 
            `<tr><td>${job.id}</td><td>${job.jobTitle}</td>
            <td><a href='${job.jobPostingLink}'>View</a></td><td><a href='${job.listOfApplicants}}'>View</a></td></tr>`
            return row;
        }).join('')
        $('#jobList').html(table);
    });
}