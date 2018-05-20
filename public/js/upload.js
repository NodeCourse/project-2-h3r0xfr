let files;

$('input[type=file]').on('change', () => {
    files = event.target.files;
});

$('#sendFile').on('submit', (e) => {
    e.preventDefault();
    $('#sendBtn').attr('disabled', true).val('Envoi en cours...');

    let data = new FormData();
    $.each(files, (key, value) => data.append(key, value));

    $.ajax({
        url: '/api/file/upload',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false
    }).done((res) => {
        if(res.error) console.log(res);
        else if(res.file) window.location.replace('/file/' + res.file.id);
        $('#sendBtn').removeAttr('disabled').val('Envoyer');
    });
});
