function collectTextNodes(element, texts) {
    for (var child= element.firstChild; child!==null; child= child.nextSibling) {
        if (child.nodeType===3)
            texts.push(child);
        else if (child.nodeType===1)
            collectTextNodes(child, texts);
    }
}
function getTextWithSpaces(element) {
    var texts= [];
    collectTextNodes(element, texts);
    for (var i= texts.length; i-->0;)
        texts[i]= texts[i].data;
    return texts.join(' ');
}

var analyzing = false;
function processHtml(s) {

  if (analyzing) return;


  //location.reload(true)
  var html = $.parseHTML(s)
  var allLinks = $("li",$("ol",html));
  // var allLinks = $("ol").getElementsByTagName("li");
  // console.log('ok');
  
  for (var i=0, il=allLinks.length; i<il; i++) {
    console.log(allLinks[i].getElementsByTagName("a")[0].title);
    console.log(allLinks[i].getElementsByTagName("a")[0].href);
    $("html").append( "<p>" +allLinks[i].getElementsByTagName("a")[0].title + "</p>" );
    
  }


  analyzing = s;

  console.log("Got body length " + s.length);

  var e = $("#status");
  
  s = s.replace('&nbsp;', ' ');
  
  console.log("a");
  
  s = $("<div />").html(s);
  s.find("script,style,object,noscript,iframe").remove();
  s.appendTo("body");
  s.css({
    position: 'absolute',
    top: '-99999px',
    left: '-99999px',
    width: '1000px',
    overflow: 'visible'
  });
}

var _prevTexts;

var reloading = false;

var tOut = setInterval(function () {
  if ( analyzing ) { clearInterval(tOut); return; }
  make_call();
}, 1000);



function make_call() {
  console.log("Making call...");
  chrome.tabs.getSelected(null, function(tab) {
      console.log(tab);
      if ( tab.status != "complete" )
      {
        // $("#status span").html('This page is not completely loaded. Please wait...');
      }
      else
      {
        if ( tab.url.match(/^http/) )
        {
           // $("#status span").html(analyzing ? 'Analyzing page...' : 'Please wait...');
           if ( analyzing ) return;
           console.log("Sending request");
            chrome.tabs.sendRequest(tab.id, {method: "getText"}, function(response) {
              console.log("Received response", response);
                if (!response)
                {
                  //console.log("Error when receiving response");
                  $("#status span").html('This page needs to be reloaded. Please wait...');
                  chrome.tabs.getSelected(null, function(tab) {
                    var code = 'window.location.reload();';
                    chrome.tabs.executeScript(tab.id, {code: code});
                    //window.close();
                  });
                }
                if(response.method=="getText"){
                    alltext = response.data;
                    processHtml(alltext);
                }
            });
        }
        else 
        {
          $("#status").html('Only web pages (<b>http</b> and <b>https</b>) are supported by this extension.');
        }
      }
  });
}

make_call();
