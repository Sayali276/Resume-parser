$(document).ready(function() { 

    var urlParams = new URLSearchParams(window.location.search);
    var jdId = urlParams.get('jd')

    $.get("/applicant/getJob?jd=" + jdId, function( data ) {
        $('#jobTitle').html("Job Title: " + data["jobTitle"])
    });
    getApplicants($('#noOfApplicants').val(), jdId);
    $("#result b").html($("#noOfApplicants").val());
    $('#noOfApplicants').on('input', function() {
        getApplicants($(this).val(), jdId);
        $("#result b").html($(this).val());
    });
}); 

function getApplicants(noOfApplicants, jdId) {
    var queryParams = `?jd=${jdId}&noOfApplicant=${noOfApplicants}`
    $.get('getApplicants' + queryParams, function( data ) {
        var table = data.map(applicant => {
            var fileLink = `<a href="/downloadResume?fileId=${applicant.resume}">${applicant.resumeName}</a>`
            var row = 
            `<tr><td>${applicant.rating.toFixed(2)}</td><td>${applicant.name}</td><td>${applicant.email}</td><td>${applicant.phone}</td><td>${fileLink}</td></tr>`
            return row;
        }).join('')
        $('#applicantList').html(table);
    });
}