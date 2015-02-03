
/*
 * CONFIG
 */

var url = "api/tnt_lite.json";
var chaine = document.getElementById('chaine');
var date = document.getElementById('today');

/*
 * ON LOAD, ON CLICK
 */

$(window).load(function() {
	hashchange();
});

$('#now').on("click", function(){
    window.location.hash = '/now';
});

$('#morning').on("click", function(){
    window.location.hash = '/morning';
});

$('#afternoon').on("click", function(){
    window.location.hash = '/afternoon';
});

$('#tonight').on("click", function(){
    window.location.hash = '/tonight';
});

/*
 * BUILD URL
 */

if (("onhashchange" in window)) {
    $(window).bind( 'hashchange', function() {
        hashchange();
    });
} else {
    alert("Nivigator can't use hashchange");
}

function hashchange() {

    var hash = window.location.hash;

    if (hash == "")
    {
        $('#channel').show();
        $('#programs').hide();
        $('#logo').attr('src', 'images/bitch_tv.png');
        chaine.innerHTML = "Welcome on Bitch.Tv";
        date.innerHTML = "We are the " + currentDate();
    }
    else
    {
        hash = window.location.toString().split("#/") [1];
        hash = hash.toString().split('/') [0];

        if (hash == "chaine")
        {
            $('#channel').hide();
            $('#programs').show();
            var id_chaine = window.location.toString().split("chaine/") [1];
            date.innerHTML = "We are the " + currentDate();
            loadData(id_chaine);
        }
        else
        {
            $('#logo').attr('src', 'images/bitch_tv.png');
            $('#channel').hide();
            $('#programs').hide().html('');

            var getDate = currentDate();
            var getTime = currentTime();
            date.innerHTML = "We are the " + getDate + ". It is " + getTime;

            if (hash == "now")
            {
                chaine.innerHTML = "Now on tv";
                loadDataAtCurrentTime(getDate, getTime, hash);
            }
            else if (hash == "morning")
            {
                chaine.innerHTML = "Morning programs";
                loadDataAtCurrentTime(getDate, getTime, hash);
            }
            else if (hash == "afternoon")
            {
                chaine.innerHTML = "Afternoon programs";
                loadDataAtCurrentTime(getDate, getTime, hash);
            }
            else if (hash == "tonight")
            {
                chaine.innerHTML = "Tonight programs";
                loadDataAtCurrentTime(getDate, getTime, hash);
            }
        }
    }
}

/*
 * GET ALL CHANNEL
 */

$.getJSON(url, function(data){

	var id, name, logo;

	$.each(data.channel, function(index, channel) {

		id 	 = channel.id;
		logo = channel.icon.src;
		name = channel.displayname;

		$('<div class="col-sm-6 col-md-4 channel text-center" id="' + id + '">'
			+ '<h3>' + name + '</h3>'
			+ '<img src="' + logo + '" />'
			+ '<hr/>' +
		  '</div>').appendTo('#channel');
	});

    /* Load chanel*/
	$('.channel').on('click', function(){

		var id_contener = $(this).attr("id");
		window.location.hash = '/chaine/' + id_contener;
	});

});

/*
 * GET CHANNEL PROGRAMS BY ID
 */

function loadData(id) {
	$.getJSON(url, function(data) {

		//Channel
		$.each(data.channel, function(index, channel){
			if (channel.id == id)
            {
				var logo = channel.icon.src;
				var name = channel.displayname;

				$('#logo').attr('src', logo);
				chaine.innerHTML = name;
			}
		});

		//Programs
		$.each(data.programme, function(index, programs){
			if (programs.channel == id) {
				var title = programs.title;
				// var category = programs.category;
				var start = programs.start;
				var stop = programs.stop;
                var channel = programs.channel;

     			if (programs.desc) {
					var description = programs.desc.text;
				}
                if (programs.category) {
                var category = programs.category;
                }

                displayChannel(start, stop, title, category, description, channel);
			}
		});

		$('.programs').on("click", function(){

            var title = $(this).find('h5').text();
            var category = $(this).find('.category').text();
            var description = $(this).find('.description').text();

            displayModalOnClick(title, category, description);
        });
	});
}

/*
 * Load programs by time
 */

function loadDataAtCurrentTime(currentDate, currentTime, hash)
{
    $.getJSON(url, function(data)
    {
        //Programs
        $.each(data.programme, function(index, programs){

            var title = programs.title;
            // var category = programs.category;
            var start = programs.start;
            var stop = programs.stop;
            var channel = programs.channel;

            if (programs.desc) {
                var description = programs.desc.text;
            }
            if (programs.category) {
                var category = programs.category;
            }

            var dateNow = getDayMonthYearByPrograms(start);
            var timeStart = getHoursMinutesByPrograms(start);
            var timeStop = getHoursMinutesByPrograms(stop);

            if (hash == 'now')
            {
                if (currentDate == dateNow && timeStart <= currentTime && timeStop >= currentTime)
                {
                    displayChannel(start, stop, title, category, description, channel);
                }
            }
            else if (hash == 'morning')
            {
                if(currentDate == dateNow && timeStart >= '08:00' && timeStop <= '12:00' && timeStart <= '12:00')
                {
                    displayChannel(start, stop, title, category, description, channel);
                }
            }
            else if (hash == 'afternoon')
            {
                if(currentDate == dateNow && timeStart >= '12:00' && timeStop <= '20:00' && timeStart <= '20:00')
                {
                    displayChannel(start, stop, title, category, description, channel);
                }
            }
            else if (hash == 'tonight')
            {
                if(currentDate == dateNow && timeStart >= '20:00')
                {
                    displayChannel(start, stop, title, category, description, channel);
                }
            }
        });

        $('.programs').on("click", function() {

           var title = $(this).find('h5').text();
           var category = $(this).find('.category').text();
           var description = $(this).find('.description').text();

           displayModalOnClick(title, category, description);
        });
    });
}

/*
 * Display channel HTML
 */

function displayChannel(start, stop, title, category, description, channel)
{

    start = getDayMonthYearByPrograms(start) + ' at ' + getHoursMinutesByPrograms(start);
    stop  = getDayMonthYearByPrograms(stop) + ' at ' + getHoursMinutesByPrograms(stop);

    $('#programs').show();

    $('<div class="col-sm-6 col-md-4 col-xs-12 programs ">'
        + '<div class="col-md-4 col-sm-4 col-xs-4 programs ">'
            + '<img src="images/logos/logo'+ channel +'.gif" />'
        + '</div>'
        + '<div class="col-md-8 col-sm-8 col-xs-8 programs ">'
            + '<h5>' + title +' </h5>'
            + '<p class="category">' + category + '</p>'
            + '<p class="text-muted"><strong>' + 'Start: </strong>' + start + '</p>'
            + '<p class="text-muted"><strong>' + 'Fin: </strong>' + stop + '</p>'
            + '<p class="description">' + description + '</p>'
            + '<button class="btn btn-success btn-xs">Plus d\'infos</button>'
        + '</div>' +
        '</div>').appendTo('#programs');

    $('.description').hide();
    $('.category').hide();
}

/*
 * Display Modal OnClick
 */

function displayModalOnClick(title, category, description)
{
    $('#myModal').modal('show');

    /* Titre */
    var myModalLabel = document.getElementById('myModalLabel');
    myModalLabel.innerHTML = title;

    /* Category */
    var myModalCategory = document.getElementById('myModalCategory');
    myModalCategory.innerHTML = category;

    /* Description */
    var myModalDescription = document.getElementById('myModalDescription');
    myModalDescription.innerHTML = description;
}

/*
 * Return Current Date
 */

function currentDate()
{
	var today   = new Date();
	var year    = today.getFullYear();
	var month   = (today.getMonth())+1;
	var day     = today.getDate();
	var current = (day<10 ? '0':'') + day + "/" + (month<10 ? '0':'') + month + "/" + year;
	return current;
}

/*
 * Return Current Time
 */

function currentTime()
{
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var current = (hours<10 ? '0':'') + hours + ':' + (minutes<10 ? '0':'') + minutes;
    return current;
}

/*
 * Return a valid date
 */

function getDayMonthYearByPrograms(jsonDate)
{
    jsonDate = jsonDate.toString();

    var dateYear = jsonDate.substring(0, 4);
    var dateMonth = jsonDate.substring(4,6);
    var dateDay = jsonDate.substring(6,8);

    var dateReturn = dateDay+'/'+dateMonth+'/'+dateYear;
    return dateReturn;
}

/*
 * Return a valid hour
 */

function getHoursMinutesByPrograms(jsonDate)
{
    jsonDate = jsonDate.toString();

    var dateHour = jsonDate.substring(8,10);
    var dateMinute = jsonDate.substring(10,12);

    var dateReturn = dateHour + ':' + dateMinute;
    return dateReturn;
}
