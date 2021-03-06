
//[START WORKING CODE CALLS]
$(function () {

//    var url = "http://localhost:8080/api/games";
    $.getJSON("http://localhost:8080/api/games", function (data) {
    console.log(data);
    console.log("JSON LOADED");
    //functions that loads ever!
    createGamesList (data.games, data.user);
    getRankingsTable(data.leader_board);
    myDataTable();

    // function that loads only if the user is authorized or not!
    if(data.user === "null"){
        unauthorized();
    }else{
        getWelcome(data.user);
       $('#newGame').show();
        $('#newGame').click(newGame);
        $('#logout').click(logout);
    }
    });
});
//[ENDS WORKING CODE CALLS]

//[START FUNCTION DESCRIPTIONS]

function unauthorized(data){
   $('#sign-in').click(function(){
       $('#btn-login').hide();
       $('#btn-signin').show().click(signIn);
       });
   $('#login').click(function(){
       $('#btn-signin').hide();
       $('#btn-login').show().click(login);
       });
}
function newGame(){
    $.post({url: '/api/games'})
    .done(function(response, status, jqXHR){
        window.location = 'game_view.html?gp='+response.gpId;
    })
    .fail(function(jqXHR, status, httpError){
        alert('you must to be logged to create new games');
    });
}
function myDataTable(){
     $('#rankings').DataTable({
        paging: false,
        searching: false,
//        scrollY: "150px",
        info: false
     });
}

function signIn(){
    var email = $('#email').val();
    var psw = $('#password').val();
    var token = "";

    if (email == ""){
     $('#error_emailMissed').show();
      token = "false";
        }else{
            $('#error_emailMissed').hide();
            token = "true";
        }
    if ( psw == ""){
         $('#error_pswMissed').show();
          token = "false";
        }else{
          $('#error_pswMissed').hide();
          token = "true";
        }
    if ( psw.length < 6){
         $('#error_pswToShort').show();
          token = "false";
        }else{
          $('#error_pswToShort').hide();
          token = "true";
         }

    if( token === "true"){
        $.post("/api/players", { username: email, password: psw})
                .done(function(){ login(email, psw); window.location.reload()})
                .fail(function(){console.log('cant sign-in')});
    }
}

function validateEmail(email) {
    var emailRegex = '^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$';
    return email.match(emailRegex);
}

function login(email, psw){
    if(email == null || psw == null){
        email = $('#email').val();
        psw = $('#password').val();
    }

    $.post("/api/login", { username: email, password: psw})
        .done(function(){window.location.reload()})
        .fail(function(){console.log('cant login')});

}
function logout(){
    $.post("/api/logout").done(function() { console.log("logged out!"); })
    $('body').css({'background-image':'url(resources/games_background3.png)'});
    window.location.reload();


}
function getWelcome(data){
    if(data.name != null){
        $('body').css({'background-image':'url(resources/login_background4.jpg)'});
        $('#sign-in').hide();
        $('#login').hide();
        $('#userActions')
        .append($('<li>',{"id": "userWelcome"}).append($('<a>').append("Welcome: " + data.name)))
        .append($('<li>').append($('<a>',{"id":"logout"}).append("Logout").append($('<span>',{"class": "glyphicon glyphicon-log-out"}))));
    }
}

function createGamesList (dataGames, loggedUser) {
    var ListID = 0;
    console.log(loggedUser);
    $(dataGames).each(function () {
        var gameInfo = "";
        var date =  new Date(this.create);
        var gamePLayerID = "#";
        var buttonClass = '';
        var buttonText = '';


        if(this.GamePlayers.length == 2 || (this.GamePlayers.length == 1 && loggedUser == "null")){
            buttonClass = 'btn btn-info';
            buttonText = 'View Game';
        }
        if(this.GamePlayers.length == 1 && loggedUser != "null"){
            buttonClass = 'btn btn-warning';
            buttonText = 'Join Game';
        }

        $(this.GamePlayers).each(function(){
            if(loggedUser.name === this.Player.name){
                buttonClass = 'btn btn-success';
                buttonText = 'Play Game';
            }
            gameInfo += this.Player['name'] + " ";
            this.Player['name'] == loggedUser.name ? gamePLayerID = "http://localhost:8080/web/game_view.html?gp=" +this.gpId+"" : "";
        });
        console.log(this);
        gameInfo = gameInfo.split(" ");
        gameInfo = gameInfo[0]+ " -vs- " + gameInfo[1];

        $('#gamesList').append($('<a>', {"id":"ListID"+ListID+"",
                                        "href": gamePLayerID,
                                        "class": "list-group-item"
                                        })
                                    .append($('<span>').append(gameInfo +" ("+ date.toDateString() +")"))
                                    .append($('<button>',{
                                                'class': buttonClass,
                                                'id': this.gameId,
                                                'text': buttonText,
                                                    click: function(){
                                                        console.log(this.id);
                                                        console.log(this);
                                                        if($(this).hasClass('btn-warning')){
                                                            var url = "/api/games/"+this.id+"/players";
                                                            $.post(url)
                                                                .done(function(response, status, jqXHR){
                                                                    console.log(response);
                                                                    window.location = 'game_view.html?gp='+response.gpId;
                                                                })
                                                                .fail(function(){
                                                                    alert('a');
                                                                })
                                                        }

                                                    }
                                                }
                                            )));
        ListID++
        });
}


function getRankingsTable(datLb){
    var thead = $('<thead>');
    var tbody = $('<tbody>');
    var trH = $('<tr>');

    var headArray = ["UserName", "WinGames", "DrawDames" , "LostGames"];
    $(headArray).each(function(){
        trH.append($('<th>').append(this));
    });
    thead.append(trH);

    $(datLb).each(function(){
        var trB = $('<tr>');
        trB.append($('<td>').append(this.name))
           .append($('<td>').append(this.WinGames))
           .append($('<td>').append(this.DrawGames))
           .append($('<td>').append(this.LostGames))
        tbody.append(trB);
    });

    $('#rankings').append(thead).append(tbody);
}
//[ENDS FUNCTION DESCRIPTIONS]

