$(document).ready(function() { 
    getApplicants($('#noOfApplicants').val());
    $('#noOfApplicants').on('change', function() {
        getApplicants($(this).val());
    });
}); 

function getApplicants(noOfApplicants) {
    var urlParams = new URLSearchParams(window.location.search);
    var jdId = urlParams.get('jd')
    var queryParams = `?jd=${jdId}&noOfApplicant=${noOfApplicants}`
    $.get('getApplicants' + queryParams, function( data ) {
        var table = data.map(applicant => {
            var fileLink = `<a href="/downloadResume?fileId=${applicant.resume}">${applicant.resumeName}</a>`
            var row = 
            `<tr><td>${applicant.name}</td><td>${applicant.email}</td><td>${applicant.phone}</td><td>${fileLink}</td></tr>`
            return row;
        }).join('')
        $('#applicantList').html(table);
    });
}