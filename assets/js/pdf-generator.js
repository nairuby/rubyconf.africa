$(document).ready(function () {
    // Function to print tab content as PDF
    function printTabAsPDF(tabId, filename, title) {
        var $tabContent = $(tabId);
        if ($tabContent.length === 0) {
            console.error('Tab content not found:', tabId);
            return;
        }

        // Clone the content
        var $contentClone = $tabContent.clone();

        // Remove the print button from the cloned content
        $contentClone.find('button').remove();

        // Add title to the content clone with a small font size
        var $titleElement = $('<h1>').text(title).css({
            fontSize: '20px',
            margin: '0',
            padding: '0'
        });
        $contentClone.prepend($titleElement);

        // Set options for html2pdf
        var opt = {
            margin:       0.5,
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.95 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate PDF
        html2pdf().from($contentClone[0]).set(opt).save();
    }

    // Event listeners for buttons
    $('#printTab1').on('click', function () {
        printTabAsPDF('#tab1', 'Day1_Schedule.pdf', 'Friday, July 26');
    });

    $('#printTab2').on('click', function () {
        printTabAsPDF('#tab2', 'Day2_Schedule.pdf', 'Saturday, July 27');
    });

    // Tab switching logic
    $('.tab-btn').on('click', function () {
        var targetTab = $(this).data('tab');

        // Remove active classes
        $('.tab-btn').removeClass('active-btn');
        $('.tab-content').removeClass('active');

        // Add active classes
        $(this).addClass('active-btn');
        $(targetTab).addClass('active');
    });
});