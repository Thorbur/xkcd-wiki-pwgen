/***
	Generates a easy human memorizable password from random words of a random Wikipedia article.
	Currently only from the german Wikipedia.
	Idea taken from http://jsfiddle.net/HMJJg/
***/

function strip(html){
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

function generate(){
	var rndID = "000000";
	var title = "";
	var min_num_chars = parseInt(document.getElementById("chars").value);
	var sepa_char = document.getElementById("sepachar").value;

	//Get random ID and invoke next call
	$.getJSON("https://de.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&format=json&callback=?", function(data) {
	
		console.log(JSON.stringify(data));
		console.log("");
		
		for(var prop in data['query']['pages']){
			rndID = prop.toString();
			title = data['query']['pages'][prop]['title'];
			break;
		}
		console.log("ID = " + rndID);
		console.log("");


		//Get text
		$.getJSON("https://de.wikipedia.org/w/api.php?action=parse&pageid=" + rndID + "&prop=text&format=json&callback=?", function (data) {
		
			console.log(JSON.stringify(data));
			console.log("");
			
			var text;
			for (token in data.parse.text) {
				text = data.parse.text[token].split("<p>");
				break;
			}
			var pText = "";
	
			for (p in text) {
				//Remove html comment
				text[p] = text[p].split("<!--");
				if (text[p].length > 1) {
					text[p][0] = text[p][0].split(/\r\n|\r|\n/);
					text[p][0] = text[p][0][0];
					text[p][0] += "</p> ";
				}
				text[p] = text[p][0];
	
				//Construct a string from paragraphs
				var htmlStrip = strip(text[p]); // remove HTML
				var splitNewline = htmlStrip.split(/\r\n|\r|\n/); //Split on newlines
				for (newline in splitNewline) {
					if (splitNewline[newline].substring(0, 11) != "Cite error:") {
						pText += splitNewline[newline];
						pText += " ";
					}
				}	
			}
			
			pText = pText.substring(0, pText.length - 2); // Remove extra newline
			pText = pText.replace(/\[\d+\]/g, ""); // Remove reference tags (e.x. [1], [4], etc)
			pText = pText.replace("\&amp;", ""); // Remove &
			//pText = pText.replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/Ä/g,"Ae").replace(/Ö/g,"Oe").replace(/Ü/g,"Ue").replace(/ß/g,"ss");
			pText = pText.replace(/\u00e4/g, "ae").replace(/\u00c4/g, "Ae").replace(/\u00f6/g, "oe").replace(/\u00d6/g, "Oe").replace(/\u00fc/g, "ue").replace(/\u00dc/g, "Ue").replace(/\u00df/g, "ss"); // Remove Umlaute
			pText = pText.replace("-", " "); // Replace hyphen
			pText = pText.replace(/[^\w\s]/gi, ""); // Remove special characters
			
			console.log(pText);
			console.log("");
			
			if(pText.length > (min_num_chars * 2)){
				var pw = "";
				var words = pText.trim().split(/\s+/); // Split on whitespace
				var i=0;
				var pick = Math.floor((Math.random() * words.length));
				pw += words.splice(pick, 1);
				while(pw.length < min_num_chars){
					pick = Math.floor((Math.random() * words.length));
					pw += sepa_char + words.splice(pick, 1);
				}

				$("#output").text(pw);
				$("#title").text(title);
				$("#url").html("<a href='https://de.wikipedia.org/wiki/" + title.replace(" ", "_") + "'>https://de.wikipedia.org/wiki/" + title.replace(" ", "_") + "</a>");
				
			} else {
				//$("#output").text("Error: Text too short!");
				generate(); // try another time
			}
		});
	});
}
