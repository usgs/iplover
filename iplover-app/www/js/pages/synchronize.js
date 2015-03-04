
$(document).ready(function() {
    
    $('#num_to_sync').text(iplover.data.getNumberToSync());
    
    $('#sync_button').click(function(){
        iplover.sync.syncAll(function(){
            location.reload();
        });
    });
    
});
