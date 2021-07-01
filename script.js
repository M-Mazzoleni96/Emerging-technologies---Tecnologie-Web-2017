$(document).ready(function(){
	
	//inizio lo script
	function getParameterByName( name,href ){
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( href );
		if( results == null )
			return "";
		else
			return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
	var GetParam=getParameterByName("get",window.location.href);
	if(GetParam!=""){
		getWiki(GetParam);
	}
	else{
		//creo la homepage
		$.ajax({
			crossDomain: true,
			dataType: 'jsonp',
			url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=&list=categorymembers&meta=&formatversion=1&cmtitle=Category%3Aemerging+technologies&cmnamespace=0&cmlimit=max",
			success: function(data){
				var vettore = []; //dichiaro un array per salvare i risultati che sono già usciti
				
				for(var i=0; i<20; i++){
					var caso = 0;
					var trovato  = false; //flag per sapere se l'elemento è stato messo nel vettore
					do{
						trovato=false;
						caso = (Math.floor(Math.random()*1000)+2)%(data.query.categorymembers.length);//estraiamo un numero random
						for(var j=0; j<vettore.length; j++){//scorriamo il vettore
							if(vettore[j]==caso)//se l'elemento era già nel vettore
								trovato = true;//metto il flag a true
							
						}
						if(trovato==false){//se non è un duplicato
							vettore.push(caso);//aggiungo al vettore
							
						}
					}while(trovato==true);//quando è false esce
					var PaginaCaso = data.query.categorymembers[caso];
					var FullUrl = window.location.href;
					var BaseUrl = FullUrl.split("?");
					var UrlLink = BaseUrl[0]+"?get="+PaginaCaso.title;
					
					var scheda = "<div class='col s12 m6 l3'> <div class='card teal'> <div class='valign-wrapper'> <a class='white-text' href="+UrlLink.replace(/\ /g,"_")+"> <p class='carta white-text' style='padding: 1.5em'>" + PaginaCaso.title + " </p> </a> </div> </div> </div> ";
					
					
					$("#sezioneRandom").append($(scheda));
				
				}
			}
		});
	}
	$("#bottone").click(trova);
	$("#form-ricerca").submit((e)=>{e.preventDefault(); trova()});
});

function trova(){
	var x=$("#testo").val().toLowerCase();
	var FullUrl = window.location.href;
	var BaseUrl = FullUrl.split("?");
	window.location=BaseUrl[0]+"?get="+x;
}

function getWiki(titolo){

	$.ajax({

		crossDomain: true,
		dataType: 'jsonp',
		url: "https://en.wikipedia.org/w/api.php?action=parse&format=json&page="+titolo+"&prop=text%7Ccategories",
		
		success: function(info){				
			if ('error' in info){
				document.title = "ERROR";
				var ErrMsg = "<div id='error'><h3>THE PAGE YOU REQUESTED DOES NOT EXIST, PLEASE TRY AGAIN</h3></div>";
				$("#pagina").html(ErrMsg);
			}
			else{
				//non c'è errore di titolo
				var tech="false";
				for (i in info.parse.categories){
					if (tech!="true") {
						if (info.parse.categories[i]["*"]=="Emerging_technologies"){
							tech="true";
						}
					}
				}
				var titolo=info.parse.title;
				$("title").text(titolo.replace(/\ /g,"_"));
				controlLink();
				if(tech=="true"){
					getCross(titolo);
					$("#crossref").show();
					document.title = info.parse.title+" - Emerging technology";
				}
				else{
					$("#crossref").hide();
					document.title = info.parse.title+" - Generic page";
				}
			}

			$("#titolo").html(info.parse.title);
			$("#pagina").html(info.parse.text["*"]); //carica la pagina nel div pagina	
			$( ".mw-editsection" ).hide();//nasconde gli elementi indesiderati
			//$( ".reference" ).hide();
			$( ".infobox" ).hide();
			$( ".vertical-navbox" ).hide();
			$( ".navbox" ).hide();
			$( ".noprint" ).hide();
			
			$( "a.image" ).each(function(i){
				var ModImmagine = $(this).attr("href");
				var ArgImm = ModImmagine.split("/wiki/")[1];
				var OggImm = $(this).find("img");
				
				$.ajax({
					crossDomain: true,
					dataType: 'jsonp',
					url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles="+ArgImm+"&iiprop=url",
					success: function(info2){
						var indirizzo=info2.query.pages["-1"].imageinfo[0].url;
						OggImm.attr("src",indirizzo);
						OggImm.attr("srcset",indirizzo);
					}
				});
				
			});
			$( "a.image > img" ).addClass("materialboxed");
			controlLink();
		}	
	});
}

function controlLink(){
	var internal=1;
				$('.materialboxed').materialbox();
					$('a').click(function(e){
						if ($(this).hasClass("image")) return false;
						
					
						if((($(this).attr("href")[0])!="#") && (($(this).attr("href")))!="index.html"){//se non è un link interno
							
							internal=0;
							
							e.preventDefault();
							
							var GetParam=getParameterByName("get",window.location.href);
							
							if(GetParam!=""){
								if(internal==0){
									var x=$(this).attr("title");//modifico l'url
									var FullUrl = window.location.href;
									var BaseUrl = FullUrl.split("?");
									window.location=BaseUrl[0]+"?get="+x;
								}
								
								$.ajax({
									crossDomain: true,
									dataType: 'jsonp',
									url: "https://en.wikipedia.org/w/api.php?action=parse&format=json&page="+$(this).attr("title")+"&prop=categories",
									success: function(info){
										
										var tech="false";
										for (i in info.parse.categories){
											if (tech!="true") {
												if (info.parse.categories[i]["*"]=="Emerging_technologies"){
													tech="true";
												}
											}
											var titolo=info.parse.title;
											$("title").text(titolo.replace(/\ /g,"_"));
											getWiki(titolo.replace(/\ /g,"_"));
											if(tech=="true")
													document.title = info.parse.title+" - Emerging technology";
												else
													document.title = info.parse.title+" - Generic page";
										}
									}
								});
							}
							
						}
					});					
}

function getParameterByName( name,href ){
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( href );
	if( results == null )
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getCross(query) {

    $.ajax({
        url: "https://api.crossref.org/works",
        data: {
            query: query,
            rows: 5
        },
        success: function (result) {
			console.log(result)
            var list_item = result.message.items;
            var list_cross = [];
            for (var x in list_item) {
                if (list_item[x].type === "dataset") {
                    var y = list_item[x];
                    list_cross.push([y["container-title"], list_item[x].URL, list_item[x].publisher, list_item[x].author, list_item[x].deposited, list_item[x].DOI]);
                } 
				else {
                    list_cross.push([list_item[x].title, //0
									list_item[x].URL, //1
									list_item[x].publisher, //2 
									list_item[x].author[0].given, //3 
									list_item[x].author[0].family, //4
									list_item[x].deposited, //5
									list_item[x].DOI, //6
									list_item[x].created["date-time"]]); //7
                }
            }
            setBodyCross(list_cross);
        },
    });
}

function setBodyCross(result) {
    cross = "";
	cross= "<h3>Crossref links</h3>";
    for (var link in result) {
        cross += "<div><a href='" + result[link][1] + "' target='_blank'>" + result[link][0] + " </a>, PUBLISHER: " + result[link][2] +", DOI: dx.doi.org/" + result[link][6] +", AUTHOR: " + result[link][3] +" "+ result[link][4]+" CREATED: "+ result[link][7]+ "</div>";
    }
    $("#crossref").html(cross);
}