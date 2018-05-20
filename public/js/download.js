$('#download').on('click', (e) => {
    $.get('/api/file/' + $('#download').data('id') + '/download', (res) => {
        if(res.status) $('#nbDownloads').text(parseInt($('#nbDownloads').text()) + 1);
    });
});
