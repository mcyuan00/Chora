$(document).ready(function() {  
  var wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#7addcd',
      progressColor: '#459cb6', 
      height: 75
  });
  wavesurfer.load('./Roses.mp3');

  var playButton = document.getElementById("play");
  playButton.onclick=function(){
    wavesurfer.playPause();
  }

  var slides = [], currentSlide = null; slideNum = 0, chosen = new Array(), x = 0, y = 0;

var selected = null, // Object of the element to be moved
    x_pos = 0, y_pos = 0, // Stores x & y coordinates of the mouse pointer
    x_elem = 0, y_elem = 0; // Stores top, left values (edge) of the element
    x_pos_original = 0, y_pos_original = 0; //position to return to if out of bounds

// Will be called when user starts dragging an element
function _drag_init(elem) {
    // Store the object of the element which needs to be moved
    selected = elem;
    x_elem = x_pos - selected.offsetLeft;
    y_elem = y_pos - selected.offsetTop;
    x_pos_original = selected.style.left;
    y_pos_original = selected.style.top;
}

// Will be called when user dragging an element
function _move_elem(e) {
    x_pos = document.all ? window.event.clientX : e.pageX;
    y_pos = document.all ? window.event.clientY : e.pageY;
    if (selected !== null) {
        selected.style.left = (x_pos - x_elem) + 'px';
        selected.style.top = (y_pos - y_elem) + 'px';
    }
}

// Destroy the object when we are done
function _destroy() {
    if( selected !== null ){
      selected_left = parseInt(selected.style.left, 10);
      selected_width = parseInt(selected.style.width, 10);
      selected_top = parseInt(selected.style.top, 10);
      if( selected_left < selected_width/2 ||
          selected_left > $('#content').width() - selected_width/2 ||
          selected_top < selected_width/2 ||
          selected_top > $('#content').height() - selected_width/2) {
        selected.style.left = x_pos_original;
        selected.style.top = y_pos_original;
      }
    }
    selected = null;
}

// Bind the functions...
document.onmousedown = function (e) {
    if(e.target.className == "placed"){
      _drag_init(e.target);
      return false;
  }
};

document.onmousemove = _move_elem;

  $(document).mouseup(function(event) {
    _destroy();
    if ((event.target.parentNode.id == "content" || event.target.parentNode.className == "transition") && document.getElementById('menu').style.display != "inline-block"){
      x = event.clientX - $('#content').offset().left; y = event.clientY - $('#content').offset().top;
      document.getElementById('menu').style.display = "inline-block";
      document.getElementById('menu').style.position = "relative";
      document.getElementById('menu').style.left = x+"px";
      document.getElementById('menu').style.top = y + "px";
      document.getElementById('menu').style.transform = "translate(-50%, -100%)";
    } else {
      document.getElementById('menu').style.display = "none";
    }
  });

  $('#menu').mouseover(function(e){
    console.log(e.target.className);
    if (e.target.className == "dance") {
      document.getElementById("menu").style.cursor = "pointer";
    } else {
      document.getElementById("menu").style.cursor = "default";

    }
  });
  $('#menu').click(function(e){
    var placeDancer = e.target;
    if (!(placeDancer.textContent in chosen) && placeDancer.textContent.length ==2) {
      chosen[e.target.textContent] = 0;
      var dancerFinal = createDancer(e.target.innerHTML);
      dancerFinal.className = "placed";
      currentSlide.appendChild(dancerFinal);
      dancerFinal.style.left = x + "px"; dancerFinal.style.top = y + "px";
      dancerFinal.style.position = "absolute";
    }
    document.getElementById("menu").style.display = "none";
  });

//initializing single slide in slides 
//var currentSlide = document.createElement("div");
//currentSlide.style.width = "100%";
//currentSlide.style.height = "100%";
//document.getElementById('content').appendChild(currentSlide);

document.getElementById('menu').appendChild(createDancer("JF"));
document.getElementById('menu').appendChild(createDancer("FU"));
document.getElementById('menu').appendChild(createDancer("SS"));
document.getElementById('menu').appendChild(createDancer("HU"));
document.getElementById('menu').appendChild(createDancer("BO"));

function createDancer (dancerName) {
  var dancer = document.createElement("div");
  dancer.style.width = "50px"; dancer.style.height = "50px";
  dancer.style.position = "relative";
  dancer.style.borderRadius = "50%";
  dancer.style.background = "blue";
  dancer.style.float = "left";
  dancer.style.marginRight = "10px";
  var name = document.createElement("div");
  name.className = "dancer_name";
  name.innerHTML = dancerName; name.style.position = "absolute"; name.style.top = "50%"; 
  name.style.left = "50%"; name.style.transform = "translate(-50%, -50%)";
  name.style.color = "white";
  dancer.appendChild(name);
  dancer.className = "dance";
  return dancer;
}

$('#newFormation').click(makeNewSlide);
function makeNewSlide(){
  chosen = new Array()
  document.getElementById('menu').style.display = "none";
  if (slides.length > 0) {
    for (var i = 0; i < slides.length; ++i) {
      slides[i].style.display = "none";
      }
  };
  var div = document.createElement("div");
  div.style.width = "100%";
  div.style.height = "100%";
  document.getElementById('content').appendChild(div);
  slides.push(div);
  currentSlide = div;
  slideNum += 1;
}

 $('#newTransition').click(function(e){
  document.getElementById('menu').style.display = "none";
   if (slides.length > 0) {
      for (var i = 0; i < slides.length; ++i) {
        slides[i].style.display = "none";
      }
    };
    var div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    
    var elem = document.createElement("img");
    elem.setAttribute("src", "images/dummy.png");
    elem.setAttribute("width", "100%");
    div.appendChild(elem);
    console.log(div);
    document.getElementById("content").appendChild(div);
    slides.push(div);
    currentSlide = div;
    slideNum += 1;

    /*var previousFormation = currentSlide; //copy of previous formation
    var transition = previousFormation.cloneNode(true);
    transition.style.display = "block";
    div.appendChild(transition);

    var overlayTransition = document.createElement("div"); //for dragging and dropping
    overlayTransition.style.width = "100%";
    overlayTransition.style.height = "100%";
    overlayTransition.style.position = "absolute";
    overlayTransition.style.left = "0";
    overlayTransition.style.top = "0";
    overlayTransition.style.display = "block";
    div.appendChild(overlayTransition);

    var c = document.createElement("CANVAS"); //for arrows
    c.width  = "100%";
    c.height = "100%";
    c.style.zIndex   = 10;
    c.style.position = "absolute";
    div.appendChild(c);

    document.getElementById("content").appendChild(div);
    slides.push(div);
    currentSlide = div;*/
});

$(".formation").click(function(e){
  var formation = e.target.cloneNode(true);

  formation.style.width = "100%";
  formation.style.height = "100%";
  formation.style.position = "absolute";
  formation.style.left = "0";
  formation.style.top = "0";
  formation.style.display = "block";
  formation.style.zIndex = "20";
  currentSlide.appendChild(formation);
})

$('#next-btn').click(function(e){
  if (slideNum < slides.length){
    currentSlide.style.display = "none";
    
    slideNum = slideNum + 1;
    currentSlide = slides[slideNum - 1];
    currentSlide.style.display = 'block';
    
    console.log(slideNum);
  }
});

$('#previous-btn').click(function(e){
  if (slideNum > 1){
    currentSlide.style.display = 'none';
    
    slideNum = slideNum - 1;
    currentSlide = slides[slideNum - 1];
    currentSlide.style.display = "block";

    console.log(slideNum);
  }
});
});


var onClick = function () {
  var sidebar = document.querySelector('.sidebar');
  var body = document.querySelector('.body');
  var angle = document.querySelector('.angle');
  var classNames = document.querySelector('.sidebar').className;
  if(classNames.indexOf('maximized') > -1) {
    sidebar.className = 'sidebar';
    body.className = 'body minimized';
    angle.className = 'angle icon-double-angle-right';
    $('.tab-content').hide();
  } else {
    sidebar.className = 'sidebar maximized';
    body.className = 'body';
    angle.className = 'angle icon-double-angle-left';
    $('.tab-content').show();
  }
  return false;
};


var tabsFn = (function() {
  
  function init() {
    setHeight();
  }
  
  function setHeight() {
    var $tabPane = $('.tab-pane'),
        tabsHeight = $('.sidebar').height();
    
    $tabPane.css({
      height: tabsHeight,
    });
  }
    
  $(init);
})();
