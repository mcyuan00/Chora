$(document).ready(function() {  
  $.justwave({ showname: 0});
  
  $(document).click(function(event) {
    if (event.target.parentNode.id == "content" || event.target.parentNode.className == "transition"){
      event.target.innerHTML = "hit";
  	};
  });
//initializing single slide in slides 
var currentSlide = document.createElement("div");
currentSlide.style.width = "100%";
currentSlide.style.height = "100%";
document.getElementById('content').appendChild(currentSlide);
var slides = [currentSlide];
var slideNum = 0;

$('#newFormation').click(makeNewSlide);

function makeNewSlide(){
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
     if (slides.length > 0) {
        for (var i = 0; i < slides.length; ++i) {
          slides[i].style.display = "none";
        }
      };
      var div = document.createElement("div");
      div.style.width = "100%";
      div.style.height = "100%";
      div.className = "transition";

      var previousFormation = currentSlide; //copy of previous formation
      var transition = previousFormation.cloneNode(true);
      transition.style.background = "red";
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
      currentSlide = div;
  });

$('#next-btn').click(function(e){
  console.log(currentSlide.childNodes);
  if (slideNum < slides.length -1){
    currentSlide.style.zIndex = '10';
    for (var i in currentSlide.childNodes){
      currentSlide.childNodes[i].style.zIndex = '10';
    }
    
    slideNum = slideNum + 1;
    currentSlide = slides[slideNum];
    currentSlide.style.zIndex = '20';
    for (var i in currentSlide.childNodes){
      currentSlide.childNodes[i].style.zIndex = '20';
    }
    console.log(slideNum);
  }
});

$('#previous-btn').click(function(e){
  if (slideNum > 0){
    currentSlide.style.zIndex = '10';
    console.log(currentSlide.childNodes);
    for (var i in currentSlide.childNodes){
      console.log(currentSlide.childNodes[i]);
      currentSlide.childNodes[i].style.zIndex = '10';
    }
    slideNum = slideNum - 1;
    currentSlide = slides[slideNum];
    currentSlide.style.zIndex = '20';
    console.log(currentSlide.childNodes);
    for (var i in currentSlide.childNodes){
      currentSlide.childNodes[i].style.zIndex = '20';
    }
    console.log(slideNum);
  }
});

function DragDrop(){
  document.onmousedown = OnMouseDown;
  document.onmouseup = OnMouseUp;
}

var startX;
var startY;
var offsetX;
var offsetY;
var oldZ;
var dragElement

function OnMouseDown(e){
  e = e || window.event;

  var target = e.target || e.srcElement;

  if (target.type == "image" && target.className == "formation"){
    startX = e.clientX;
    startY = e.clientY;
    offsetX = ExtractNumber(target.style.left);
    offsetY = ExtractNumber(target.style.top);
    dragElement = target.cloneNode(true);

    oldZ = target.style.zIndex;
    dragElement.style.zIndex = 1000;

    

    document.onmousemove = OnMouseMove;
    document.body.focus();

    document.onselectstart = function () {return false;};
    target.ondragstart = function() {return false;};

    return false;
  }

}

function OnMouseMove(e){
  e = e || window.event;

  dragElement.style.left = e.clientX + 'px';
  dragElement.style.top = e.clientY + 'px';

}

function ExtractNumber(value){
  var n = parseInt(value)
  return n == null || isNaN(n) ? 0 : n;
}

function OnMouseUp(e){
  if (dragElement != null){
    dragElement.style.zIndex = oldZ;

    if (e.target.parentNode.id == "content"){

      var formation = dragElement;

      formation.style.width = "100%";
      formation.style.height = "100%";
      formation.style.position = "absolute";
      formation.style.left = "0";
      formation.style.top = "0";
      formation.style.display = "block";
      formation.style.zIndex = "20";
      slides[slideNum].appendChild(formation);
    }

    document.onmousemove = null;
    document.onselectstart = null;
    dragElement.ondragstart = null;

    dragElement = null;
  }
}

DragDrop();

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
