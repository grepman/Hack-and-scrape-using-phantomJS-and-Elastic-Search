var model = require('./model.js');

var urls = model.data_embed();

function process() {
    if (urls.length == 0) {
        phantom.exit();
    } else {
        //remove the first item of an array
        url = urls.shift();
        //open a page
        page = require('webpage').create();

  
        //store the requested url in a separate variable
        var currentUrl = url


        page.open(url, onFinishedLoading);


        page.onNavigationRequested = function(url, type, willNavigate, main) {
            console.log('\n' + currentUrl + '\nredirecting to \n' + url);
        }

    }
}

function onFinishedLoading(status) {
	var post_to_es = {};
	

var data_title = page.evaluate(function() {
    return document.title;
  });

var data_es = page.evaluate(function() {
  	// document.querySelectorAll('.cb-button')[0].click();
    return window.store['model']['chartProps'].data;
  });
  // console.log('Page title is ' + title);
  // console.log('Receive ' + JSON.stringify(data_es, undefined, 4));

var user_es = page.evaluate(function() {
  	// document.querySelectorAll('.cb-button')[0].click();
    return window.store.user || {};
  });

var tags_es = page.evaluate(function() {
  	// document.querySelectorAll('.cb-button')[0].click();
    return window.store.tags || {};
  });
  
  post_to_es.title = data_title.replace('Embed: ', '');
  post_to_es.data = data_es;
  post_to_es.url = url.replace('embed', 'charts');
  post_to_es.image_url = 'https://atlas.qz.com/i/atlas_'+url.split('embed/')[1]+'@2x.png';
  post_to_es.user_info = user_es;
  post_to_es.tags = tags_es;
  //console.log(JSON.stringify(post_to_es, undefined, 4));

post_page = require('webpage').create();
post_page.customHeaders={'Authorization': 'Basic '+btoa('ankitkumar:-------PASSWORD-----')};

post_page.open('https://5905c5406e74ece67998e7fc16503962.us-east-1.aws.found.io:9243/scraped_atlas_data/technology/', 'post', JSON.stringify(post_to_es), function(status){
	console.log("-------------------------------------POSTED TO ELASTIC SEARCH -----------------------------");
	//console.log('content: '+ content);
	console.log('status: '+ status);
	post_page.release();

	page.release();

    process();
});

}

process();
