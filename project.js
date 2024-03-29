$(document).ready(function() {  
  var wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#7addcd',
      progressColor: '#459cb6', 
      pixelRatio: 1,
      height: 75,
      fillParent: true,
      barWidth:2
  });
  wavesurfer.load('./Roses.mp3');
  

  var playButton = document.getElementById("play");
  playButton.onclick=function(){
    wavesurfer.playPause();
  } 

  var initials = [];
  $("#form_part1").submit(function(e){
    var firstName = document.forms["form_part1"]["dancer_name_first"].value;
    var lastName = document.forms["form_part1"]["dancer_name_last"].value;
    initials = firstName.substring(0,1).toUpperCase() + lastName.substring(0,1).toUpperCase();

    document.getElementById('menu').appendChild(createDancer(initials));
    document.getElementById('menu').style.width = $('#menu').width() + 60 + "px";

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.innerHTML = firstName + " " + lastName;
    tr.appendChild(td);

    var table = document.getElementById("dancer_table");
    table.appendChild(tr);
    $("#new_dancer_modal").modal('hide');
    return false;
  });

  var slides = [], currentSlide = null; slideNum = 0, x = 0, y = 0;
  var visible = [], currentPlotted = [];

  var selected = null, // Object of the element to be moved
    x_pos = 0, y_pos = 0, // Stores x & y coordinates of the mouse pointer
    x_elem = 0, y_elem = 0; // Stores top, left values (edge) of the element
    x_pos_original = 0, y_pos_original = 0; //position to return to if out of bounds

  if(currentSlide === null){
    var div = document.getElementById("content");
    div.style.backgroundColor = "d3d3d3";
  }


// Will be called when user starts dragging an element
function _drag_init(elem) {
    // Store the object of the element which needs to be moved
    selected = elem;
    selected.style.zIndex = 25;
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

var wasDragged = false;

// Destroy the object when we are done
function _destroy() {
    if( selected !== null ){
      selected.style.zIndex = "initial";
      selected_left = parseInt(selected.style.left, 10);
      selected_width = parseInt(selected.style.width, 10);
      selected_top = parseInt(selected.style.top, 10);
      if( selected_left < selected_width/2 ||
          selected_left > $('#content').width() - selected_width/2 ||
          selected_top < selected_width/2 ||
          selected_top > $('#content').height() - selected_width/2) {
        selected.style.left = x_pos_original;
        selected.style.top = y_pos_original;
        wasDragged = true;
      } else if (selected.style.left !== x_pos_original || selected.style.top !== y_pos_original) {
        wasDragged = true;
      } else {
        wasDragged = false;
      }
    }
    selected = null;
}
var canvases = [];
var targetPairs = [];
var fromPlotted = [];
var doNotMove = null;
// Bind the functions...
document.onmousedown = function (e) {
    if ((e.target.className == "placed" || e.target.className == "emptyDancer") && e.target.parentNode.parentNode.className == "transition") {
      doNotMove = e.target;
      if (!(fromPlotted[slideNum-1].indexOf(e.target)>-1)){
      var currentLocation = e.target.style.left+e.target.style.top;
      var transitionDancer = createTransitionDancer();
      transitionDancer.style.left = e.target.style.left;
      transitionDancer.style.top = e.target.style.top;
      transitionDancer.style.position = e.target.style.position;
      transitionDancer.style.transform = "translate(-50%, -50%)";
      currentSlide.appendChild(transitionDancer);
      to = transitionDancer;
      from = e.target;
      targetPairs[slideNum-1][parseInt(to.className.charAt(to.className.length-1))] = from;
      fromPlotted[slideNum-1].push(from);
      _drag_init(transitionDancer);
      return false;
      } 
    } else if (e.target.className.indexOf("transitionDancer")>-1) {
      to = e.target;
      from = targetPairs[slideNum-1][parseInt(to.className.charAt(to.className.length-1))];
      _drag_init(e.target);
    }
    else if(e.target.className == "placed" || e.target.className == "emptyDancer"){
      _drag_init(e.target);
      //console.log("hit");
      return false;
  } 
};

document.onmousemove = _move_elem;

var currentDancer = null;
var menuOpen = false; 
function drawLine (target, x1, y1, x2, y2) {
  var c = document.createElement("canvas"); //for arrows
  c.width  = $('#content').width(); 
  c.height = $('#content').height();
  c.style.position = "absolute";
  c.style.left = 0; c.style.top = 0;
  c.className = target.className;
  
  target.parentNode.appendChild(c);
  canvases[slideNum-1].push(c);
  var center = 0;
  x1 += center; x2 += center;
  y1 += center; y2 += center;
  var width = center*.5;
  //line
  ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = center * .1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  //triangle
  ctx.fillStyle = "black";
  var angle = Math.atan((y2-y1)/(x2-x1));
  angle += ((x2>x1)?-90:90)*Math.PI/180*-1;
  if (x1 == x2 && y1 < y2) { // move up
      angle += Math.PI;
  } else if (x1 == x2 && y1 > y2) { // move down
      angle -= Math.PI;
  } 
  drawTriangle(ctx, x2, y2, angle);
  redo = false
} 
function redrawLine (canvas, x1, y1, x2, y2) {
  var center = 0;
  x1 += center; x2 += center;
  y1 += center; y2 += center;
  var width = center*.5;
  //line
  ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = center * .1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  //triangle
  ctx.fillStyle = "black";
  var angle = Math.atan((y2-y1)/(x2-x1));
  angle += ((x2>x1)?-90:90)*Math.PI/180*-1;
  if (x1 == x2 && y1 < y2) { // move up
      angle += Math.PI;
  } else if (x1 == x2 && y1 > y2) { // move down
      angle -= Math.PI;
  } 
  drawTriangle(ctx, x2, y2, angle);
  redo = false
} 
function drawTriangle(ctx, x, y, angle) {
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.moveTo(0,0);
  ctx.lineTo(8,12);
  ctx.lineTo(-8,12);
  ctx.closePath();
  ctx.restore();
  ctx.fill();
}

var from = null, to = null, canvas = null, redraw = new Array(), redo = false;

  $(document).mouseup(function(event) {
    _destroy();
    if (event.target.parentNode.className == "transition" && event.target.className.indexOf("transitionDancer")>-1)  {
      event.preventDefault();
      if (!redo){
        var j = 0;
        for (var i = 0; i < canvases[slideNum-1].length; ++i) {
          if (event.target.className === canvases[slideNum-1][i].className) {
            redrawLine(canvases[slideNum-1][i], parseInt(from.style.left),parseInt(from.style.top),parseInt(to.style.left),parseInt(to.style.top));
          } else {
            j += 1;
          }
        }
        if (j === canvases[slideNum-1].length) {
          drawLine(event.target, parseInt(from.style.left),parseInt(from.style.top),parseInt(to.style.left),parseInt(to.style.top));
        }
        }
      } 
      else if ((event.target.className == "emptyDancer"|| event.target.className == "placed") && !wasDragged) {
      if (!menuOpen){
        document.getElementById('colorMenu').style.display = "none";
        document.getElementById('menu').style.display = "block";
        document.getElementById('menu').style.position = "absolute";
        document.getElementById('menu').style.left = event.target.style.left;
        document.getElementById('menu').style.top = event.target.style.top;
        document.getElementById('menu').style.transform = "translate(-50%,-175%)";

        document.getElementById('trash').style.display = "initial";
        document.getElementById('trash').style.position = "absolute";
        document.getElementById('trash').style.left = event.target.style.left;
        document.getElementById('trash').style.top = event.target.style.top;
        document.getElementById('trash').style.transform = "translate(-50%, 175%)";
        currentDancer = event.target;
        menuOpen = true;
      } else {
        currentDancer = event.target;
        document.getElementById('menu').style.display = "none";
        document.getElementById('trash').style.display = "none";
        menuOpen = false;
        document.getElementById('colorMenu').style.display = "block";
        document.getElementById('colorMenu').style.position = "absolute";
        document.getElementById('colorMenu').style.left = event.target.style.left;
        document.getElementById('colorMenu').style.top = event.target.style.top;
        document.getElementById('colorMenu').style.transform = "translate(-50%, -175%)";

      }
    }
    else if ((event.target.parentNode.id == "content" || event.target.parentNode.className == "transition") &&!wasDragged && document.getElementById('colorMenu').style.display != "inline-block" && !menuOpen){
      //if (!(fromPlotted[slideNum-1].indexOf(doNotMove)>-1) ) {
      var emptyDancer = createEmptyDancer();
      x = event.clientX - $('#content').offset().left; y = event.clientY - $('#content').offset().top;
      emptyDancer.style.left = x + "px"; emptyDancer.style.top = y + "px";
      emptyDancer.style.transform = "translate(-50%, -50%)";
      emptyDancer.style.position = "absolute";
      currentSlide.appendChild(emptyDancer);
      document.getElementById('menu').style.display = "none";
      document.getElementById('trash').style.display = "none";
      document.getElementById('colorMenu').style.display = "none";
      menuOpen = false;
      
      //}
    } else {
        document.getElementById('menu').style.display = "none";
        document.getElementById('trash').style.display = "none";
        document.getElementById('colorMenu').style.display = "none";
        menuOpen = false;
        
    }
    wasDragged = false;
  });


  /*menu functionalities*/
  $('#menu').mouseover(function(e){
    if (e.target.className == "dance") {
      document.getElementById("menu").style.cursor = "pointer";
    } else {
      document.getElementById("menu").style.cursor = "default";

    }
  });
  $('#menu').click(function(e){
    var placeDancer = e.target;
    if ( placeDancer.textContent.length ==2) {
      var dancerFinal = createDancer(e.target.children[0].innerHTML);
      dancerFinal.className = "placed";
      currentSlide.appendChild(dancerFinal);
      dancerFinal.style.left = currentDancer.style.left; dancerFinal.style.top = currentDancer.style.top;
      dancerFinal.style.transform = "translate(-50%, -50%)";
      dancerFinal.style.background = currentDancer.style.background;
      currentSlide.removeChild(currentDancer);
      if(currentDancer.className == "placed"){
        var nameVisible = currentDancer.children[0].innerHTML;
        $('#menu').children().each( function() {
          if( this.children[0].innerHTML == nameVisible){
            this.style.display = "initial";
            document.getElementById('menu').style.width = $('#menu').width() + 60 + "px";
            console.log("hit");
          };
        });
        var index = currentPlotted.indexOf(nameVisible);
        if (index > -1) {
          currentPlotted.splice(index, 1);
        }
      }
      currentPlotted.push(e.target.children[0].innerHTML);
      //console.log(currentPlotted);
      currentDancer = null;
      dancerFinal.style.position = "absolute";
      document.getElementById("menu").style.display = "none";
      placeDancer.style.display = "none";
      document.getElementById('menu').style.width = $('#menu').width() - 60 + "px";
      console.log($('#menu').width());
    } 
  });

  $('#colorMenu').click(function(e){
    var selectedColor = e.target;
    if (currentDancer.className == "placed"){
      currentDancer.style.background = selectedColor.style.background;
    }
  });

  $('#trash').click( function(e){
    currentSlide.removeChild(currentDancer);
    if(currentDancer.className == "placed"){
        var nameVisible = currentDancer.children[0].innerHTML;
        $('#menu').children().each( function() {
          if( this.children[0].innerHTML == nameVisible){
            this.style.display = "initial";
            

          };
        });
        var index = currentPlotted.indexOf(nameVisible);
        if (index > -1) {
          currentPlotted.splice(index, 1);
        }
      }
  })

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

document.getElementById('colorMenu').appendChild(createColorSelection('#bff0e7'));
document.getElementById('colorMenu').appendChild(createColorSelection('#7addcd'));
document.getElementById('colorMenu').appendChild(createColorSelection('#459cb6'));
document.getElementById('colorMenu').appendChild(createColorSelection('#f99186'));
document.getElementById('colorMenu').appendChild(createColorSelection('#fec35b'));


function createDancer (dancerName) {
  var dancer = document.createElement("div");
  dancer.style.width = "50px"; dancer.style.height = "50px";
  dancer.style.position = "relative";
  dancer.style.borderRadius = "50%";
  dancer.style.background = "#7addcd";
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
};

function createEmptyDancer() {
  var emptyDancer = document.createElement("div");
  emptyDancer.style.width = "50px"; emptyDancer.style.height = "50px";
  emptyDancer.style.borderRadius = "50%";
  emptyDancer.style.background = "#7addcd";
  emptyDancer.style.opacity = "0.85";
  emptyDancer.className = "emptyDancer";
  return emptyDancer;
};
var transitionNumber = 1;
function createTransitionDancer() {
  var transitionDancer = document.createElement("div");
  transitionDancer.style.width = "50px"; transitionDancer.style.height = "50px";
  transitionDancer.style.borderRadius = "50%";
  transitionDancer.style.background = "#none";
  transitionDancer.style.borderStyle = "dashed";
  transitionDancer.style.borderColor = "black";
  transitionDancer.className = "transitionDancer" + transitionNumber;
  transitionNumber += 1;
  return transitionDancer;
};

function createColorSelection(hex) {
  var color = document.createElement("div");
  color.style.width = "50px"; color.style.height = "50px";
  color.style.borderRadius = "50%";
  color.style.background = hex;
  color.style.border = "thin solid gray";
  color.style.float = "left";
  color.style.marginRight = "10px";
  return color;
};

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

$('#newFormation').click(makeNewFormation);
$('#newTransition').click(makeNewTransition);

function redoOrderList(list, insertSlide, insertIndex) {
  var firstHalfArray = list.slice(0, insertIndex);
  var lastHalfArray = list.slice(insertIndex+1, list.length);
  var firstConcat = firstHalfArray.concat(insertSlide);
  list = firstConcat.concat(lastHalfArray);
}

function makeNewFormation(){
  if (slideNum === slides.length) {
    var background = document.getElementById("content");
    background.style.backgroundColor = "white";
    canvases.push([]);
    targetPairs.push(new Array());
    fromPlotted.push([]);
    document.getElementById('menu').style.display = "none";
    if (slides.length > 0) {
      for (var i = 0; i < slides.length; ++i) {
        slides[i].style.display = "none";
        }
    };
    var div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    //div.style.backgroundColor = "#none";
    document.getElementById('content').appendChild(div);
    slides.push(div);
    currentSlide = div;
    slideNum += 1;
    currentPlotted = [];
    visible.push(currentPlotted);
    $('#menu').children().each( function() {
      this.style.display = "initial";
    });
    document.getElementById('menu').style.width = ($('#menu').children().length -  currentPlotted.length)*60 + "px"; 
  } else if (slides.length >= 2) {
    var currentIndex = slides.indexOf(currentSlide);
    var background = document.getElementById("content");
    background.style.backgroundColor = "white";

    var firstHalfArray = canvases.slice(0, currentIndex+1);
    var lastHalfArray = canvases.slice(currentIndex+1, canvases.length);
    firstHalfArray.push([]);
    canvases = firstHalfArray.concat(lastHalfArray);

    var firstHalfArray = targetPairs.slice(0, currentIndex+1);
    var lastHalfArray = targetPairs.slice(currentIndex+1, targetPairs.length);
    var firstConcat = firstHalfArray.concat([new Array()]);
    targetPairs = firstConcat.concat(lastHalfArray);

    var firstHalfArray = fromPlotted.slice(0, currentIndex+1);
    var lastHalfArray = fromPlotted.slice(currentIndex+1, fromPlotted.length);
    firstHalfArray.push([]);
    fromPlotted = firstHalfArray.concat(lastHalfArray);

    document.getElementById('menu').style.display = "none";
    document.getElementById('menu').style.width = $('#menu').children().length * 60 + "px";
    if (slides.length > 0) {
      for (var i = 0; i < slides.length; ++i) {
        slides[i].style.display = "none";
        }
    };
    var div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    document.getElementById('content').appendChild(div);
    
    var firstHalfArray = slides.slice(0, currentIndex+1);
    var lastHalfArray = slides.slice(currentIndex+1, slides.length);
    var firstConcat = firstHalfArray.concat([div]);
    slides = firstConcat.concat(lastHalfArray);

    currentSlide = div;
    slideNum = currentIndex + 2;
    currentPlotted = [];
    visible.push(currentPlotted);
    $('#menu').children().each( function() {
      this.style.display = "initial";
    });
    document.getElementById('menu').style.width = ($('#menu').children().length -  currentPlotted.length)*60 + "px"; 
  }

  drawTimeStamps();
};

 function makeNewTransition() {
    if (slideNum === slides.length) {
      canvases.push([]);
      targetPairs.push(new Array());
      fromPlotted.push([]);
      document.getElementById('menu').style.display = "none";
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
      transition.style.display = "block";
      var children = transition.childNodes;
      for (var i = 0; i <children.length; ++i)
        children[i].style.opacity = ".4";
      div.appendChild(transition);

      document.getElementById("content").appendChild(div);
      slides.push(div);
      currentSlide = div;
      slideNum += 1;
      visible.push([]);
      $('#menu').children().each( function() {
        if(isInArray(this.children[0].innerHTML, currentPlotted )){
          this.style.display = "none";
        } else {
          this.style.display = "initial"; //makes visible
        }
      });
    } else if (slides.length >= 2) {
      var currentIndex = slides.indexOf(currentSlide);

      var firstHalfArray = canvases.slice(0, currentIndex+1);
      var lastHalfArray = canvases.slice(currentIndex+1, canvases.length);
      firstHalfArray.push([]);
      canvases = firstHalfArray.concat(lastHalfArray);

      var firstHalfArray = targetPairs.slice(0, currentIndex+1);
      var lastHalfArray = targetPairs.slice(currentIndex+1, targetPairs.length);
      var firstConcat = firstHalfArray.concat([new Array()]);
      targetPairs = firstConcat.concat(lastHalfArray);

      var firstHalfArray = fromPlotted.slice(0, currentIndex+1);
      var lastHalfArray = fromPlotted.slice(currentIndex+1, fromPlotted.length);
      firstHalfArray.push([]);
      fromPlotted = firstHalfArray.concat(lastHalfArray);

      $('#menu').children().each( function() {
        if(isInArray(this.children[0].innerHTML, currentPlotted )){
          this.style.display = "none";
        } else {
          this.style.display = "initial"; //makes visible
        }
      });

      document.getElementById('menu').style.width = ($('#menu').children().length -  currentPlotted.length)*60 + "px"; 



      document.getElementById('menu').style.display = "none";
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
      transition.style.display = "block";
      var children = transition.childNodes;
      for (var i = 0; i <children.length; ++i)
        children[i].style.opacity = ".4";
      div.appendChild(transition);
      document.getElementById("content").appendChild(div);

      var firstHalfArray = slides.slice(0, currentIndex+1);
      var lastHalfArray = slides.slice(currentIndex+1, slides.length);
      var firstConcat = firstHalfArray.concat([div]);
      slides = firstConcat.concat(lastHalfArray);

      //slides.push(div);
      currentSlide = div;
      slideNum = currentIndex + 2;

      visible.push([]);
      $('#menu').children().each( function() {
        if(isInArray(this.children[0].innerHTML, currentPlotted )){
          this.style.display = "none";
        } else {
          this.style.display = "initial"; //makes visible
        }
      });

      document.getElementById('menu').style.width = ($('#menu').children().length -  currentPlotted.length)*60 + "px"; 


    }
  };

displayPreviousGhost();
displayNextGhost();

function displayPreviousGhost(){
  document.getElementById("previous-ghost-slide").innerHTML = "";
  document.getElementById("next-ghost-slide").innerHTML = "";
  var currentIndex = slides.indexOf(currentSlide);
  var previousIndex = slides.indexOf(currentSlide) - 1;
  var nextIndex = slides.indexOf(currentSlide) + 1;
  console.log(currentIndex);
  console.log(slides.length);

  if (currentIndex <= 0){

    $("#previous-ghost-slide").css("background-color", "d3d3d3");
    //$('#next-ghost-slide').css("background-color", "d3d3d3");
    if (currentIndex >= slides.length - 1) {
      $('#next-ghost-slide').css("background-color", "d3d3d3");
    }

  } else {
    
    $("#previous-ghost-slide").css("background-color", "white");
    $("#next-ghost-slide").css("background-color", "white");

    var previousSlide = slides[previousIndex].cloneNode(true);

    previousSlide.style.display = "block";
    previousSlide.style.position = "absolute";
    previousSlide.style.height = "375px";
    previousSlide.style.width="525px"

    var nodes = previousSlide.childNodes;

    for(var i=0; i<nodes.length; i++) {

      if (nodes[i].hasChildNodes()){
        console.log("its a transition");
        var childnodes = nodes[i].childNodes;
        for(var j = 0; j<childnodes.length; j++){
          var nodeHeight = parseFloat(childnodes[j].style.height);
          var nodeWidth = parseFloat(childnodes[j].style.width);
          var nodeTop = parseFloat(childnodes[j].style.top);
          var nodeLeft = parseFloat(childnodes[j].style.left);
      
          childnodes[j].style.height = nodeHeight + "px";
          childnodes[j].style.width = nodeWidth + "px";
          childnodes[j].style.top = nodeTop + "px";
          childnodes[j].style.left = nodeLeft + "px";
        }
      }

      var nodeHeight = parseFloat(nodes[i].style.height);
      var nodeWidth = parseFloat(nodes[i].style.width);
      var nodeTop = parseFloat(nodes[i].style.top);
      var nodeLeft = parseFloat(nodes[i].style.left);
      
      nodes[i].style.height = nodeHeight + "px";
      nodes[i].style.width = nodeWidth + "px";
      nodes[i].style.top = nodeTop + "px";
      nodes[i].style.left = nodeLeft + "px";
    }
    document.getElementById("previous-ghost-slide").appendChild(previousSlide);
  } 
}

function displayNextGhost(){
  document.getElementById("next-ghost-slide").innerHTML = "";
  var currentIndex = slides.indexOf(currentSlide);
  var previousIndex = slides.indexOf(currentSlide) - 1;
  var nextIndex = slides.indexOf(currentSlide) + 1;

  if (currentIndex >= slides.length - 1) {

      $('#next-ghost-slide').css("background-color", "d3d3d3");
    } else{
    var nextSlide = slides[nextIndex].cloneNode(true);

    nextSlide.style.display = "block";
    nextSlide.style.position = "absolute";
    nextSlide.style.height = "375px";
    nextSlide.style.width="525px"
    var nextnodes = nextSlide.childNodes;

    for(var i=0; i<nextnodes.length; i++) {

      if (nextnodes[i].hasChildNodes()){
        console.log("its a transition");
        var childnextnodes = nextnodes[i].childNodes;
        for(var j = 0; j<childnextnodes.length; j++){
          var nextnodeHeight = parseFloat(childnextnodes[j].style.height);
          var nextnodeWidth = parseFloat(childnextnodes[j].style.width);
          var nextnodeTop = parseFloat(childnextnodes[j].style.top);
          var nextnodeLeft = parseFloat(childnextnodes[j].style.left);
      
          childnextnodes[j].style.height = nextnodeHeight + "px";
          childnextnodes[j].style.width = nextnodeWidth + "px";
          childnextnodes[j].style.top = nextnodeTop + "px";
          childnextnodes[j].style.left = nextnodeLeft + "px";
        }
      }

      var nextnodeHeight = parseFloat(nextnodes[i].style.height);
      var nextnodeWidth = parseFloat(nextnodes[i].style.width);
      var nextnodeTop = parseFloat(nextnodes[i].style.top);
      var nextnodeLeft = parseFloat(nextnodes[i].style.left);
      
      nextnodes[i].style.height = nextnodeHeight + "px";
      nextnodes[i].style.width = nextnodeWidth + "px";
      nextnodes[i].style.top = nextnodeTop + "px";
      nextnodes[i].style.left = nextnodeLeft + "px";
    }
    document.getElementById("next-ghost-slide").appendChild(nextSlide);
  }
}

$('body').click(function() {
  displayPreviousGhost();
  displayNextGhost();
});

window.onkeydown = function(e){
  var code = e.keyCode ? e.keyCode : e.which;
    if (code === 37) { //up key
      $('#previous-btn').click();
    } else if (code === 39) { //down key
      $("#next-btn").click();
    }
};

/*create a formation from template*/
$(".formation").click(function(e){
  currentSlide.innerHTML = "";
  currentPlotted = [];
  document.getElementById('menu').style.width = ($('#menu').children().length -  currentPlotted.length)*60 + "px"; 

  var emptyDancer1 = createEmptyDancer();
  var emptyDancer2 = createEmptyDancer();
  var emptyDancer3 = createEmptyDancer();
  var emptyDancer4 = createEmptyDancer();
  var emptyDancer5 = createEmptyDancer();
  var emptyDancer6 = createEmptyDancer();
  var emptyDancer7 = createEmptyDancer();
  var emptyDancer8 = createEmptyDancer();

  emptyDancer1.style.position = "absolute"
  emptyDancer1.style.display = "block";
  // emptyDancer1.style.zIndex = "20";

  emptyDancer2.style.position = "absolute"
  emptyDancer2.style.display = "block";
  // emptyDancer2.style.zIndex = "20";

  emptyDancer3.style.position = "absolute"
  emptyDancer3.style.display = "block";
  // emptyDancer3.style.zIndex = "20";

  emptyDancer4.style.position = "absolute"
  emptyDancer4.style.display = "block";
  // emptyDancer4.style.zIndex = "20";

  emptyDancer5.style.position = "absolute"
  emptyDancer5.style.display = "block";
  // emptyDancer5.style.zIndex = "20";

  emptyDancer6.style.position = "absolute"
  emptyDancer6.style.display = "block";
  // emptyDancer6.style.zIndex = "20";

  emptyDancer7.style.position = "absolute"
  emptyDancer7.style.display = "block";
  // emptyDancer7.style.zIndex = "20";

  emptyDancer8.style.position = "absolute"
  emptyDancer8.style.display = "block";
  // emptyDancer8.style.zIndex = "20";

  if (e.target.id === "formation1"){

    emptyDancer1.style.left = "100px";
    emptyDancer1.style.top = "100px";
    emptyDancer1.style.transform = "translate(-50%, -50%)";

    
    currentSlide.appendChild(emptyDancer1);

    emptyDancer2.style.left = "250px";
    emptyDancer2.style.top = "100px";
    emptyDancer2.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer2);

    emptyDancer3.style.left = "400px";
    emptyDancer3.style.top = "100px";
    emptyDancer3.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer3);

    emptyDancer4.style.left = "75px";
    emptyDancer4.style.top = "200px";
    emptyDancer4.style.transform = "translate(-50%, -50%)";
 
    currentSlide.appendChild(emptyDancer4);

    emptyDancer5.style.left = "125px";
    emptyDancer5.style.top = "200px";
    emptyDancer5.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer5);

    emptyDancer6.style.left = "250px";
    emptyDancer6.style.top = "200px";
    emptyDancer6.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer6);

    emptyDancer7.style.left = "375px";
    emptyDancer7.style.top = "200px";
    emptyDancer7.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer7);

    emptyDancer8.style.left = "425px";
    emptyDancer8.style.top = "200px";
    emptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer8);


  }
  if (e.target.id === "formation2"){
    emptyDancer1.style.left = "60%";
    emptyDancer1.style.top = "30%";
    mptyDancer8.style.transform = "translate(-50%, -50%)";
    
    currentSlide.appendChild(emptyDancer1);

    emptyDancer2.style.left = "calc(60% - 25px)";
    emptyDancer2.style.top = "calc(45% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer2);

    emptyDancer3.style.left = "calc(60% - 25px)";
    emptyDancer3.style.top = "calc(60% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer3);

    emptyDancer4.style.left = "calc(40% - 25px)";
    emptyDancer4.style.top = "calc(45% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";
 
    currentSlide.appendChild(emptyDancer4);

    emptyDancer5.style.left = "calc(40% - 25px)";
    emptyDancer5.style.top = "calc(60% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer5);

    emptyDancer6.style.left = "calc(40% - 25px)";
    emptyDancer6.style.top = "calc(75% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer6);

    emptyDancer7.style.left = "calc(80% - 25px)";
    emptyDancer7.style.top = "calc(45% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer7);

    emptyDancer8.style.left = "calc(20% - 25px)";
    emptyDancer8.style.top = "calc(60% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer8);
  }
  if (e.target.id === "formation3"){
    emptyDancer1.style.left = "calc(50% - 25px)";
    emptyDancer1.style.top = "calc(20% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";
    
    currentSlide.appendChild(emptyDancer1);

    emptyDancer2.style.left = "calc(40% - 25px)";
    emptyDancer2.style.top = "calc(40% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer2);

    emptyDancer3.style.left = "calc(60% - 25px)";
    emptyDancer3.style.top = "calc(40% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer3);

    emptyDancer4.style.left = "calc(50% - 25px)";
    emptyDancer4.style.top = "calc(60% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";
 
    currentSlide.appendChild(emptyDancer4);

    emptyDancer5.style.left = "calc(30% - 25px)";
    emptyDancer5.style.top = "calc(60% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer5);

    emptyDancer6.style.left = "calc(70% - 25px)";
    emptyDancer6.style.top = "calc(60% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer6);

    emptyDancer7.style.left = "calc(40% - 25px)";
    emptyDancer7.style.top = "calc(80% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer7);

    emptyDancer8.style.left = "calc(60% - 25px)";
    emptyDancer8.style.top = "calc(80% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer8);
  }
  if (e.target.id === "formation4"){
    emptyDancer1.style.left = "calc(25% - 25px)";
    emptyDancer1.style.top = "calc(30% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";
    
    currentSlide.appendChild(emptyDancer1);

    emptyDancer2.style.left = "calc(75% - 25px)";
    emptyDancer2.style.top = "calc(30% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer2);

    emptyDancer3.style.left = "calc(10% - 25px)";
    emptyDancer3.style.top = "calc(50% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer3);

    emptyDancer4.style.left = "calc(40% - 25px)";
    emptyDancer4.style.top = "calc(50% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";
 
    currentSlide.appendChild(emptyDancer4);

    emptyDancer5.style.left = "calc(60% - 25px)";
    emptyDancer5.style.top = "calc(50% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer5);

    emptyDancer6.style.left = "calc(90% - 25px)";
    emptyDancer6.style.top = "calc(50% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer6);

    emptyDancer7.style.left = "calc(25% - 25px)";
    emptyDancer7.style.top = "calc(70% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer7);

    emptyDancer8.style.left = "calc(75% - 25px)";
    emptyDancer8.style.top = "calc(70% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer8);
  }
  if (e.target.id === "formation5"){
        emptyDancer1.style.left = "calc(25% - 25px)";
    emptyDancer1.style.top = "calc(30% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";
    
    currentSlide.appendChild(emptyDancer1);

    emptyDancer2.style.left = "calc(75% - 25px)";
    emptyDancer2.style.top = "calc(30% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer2);

    emptyDancer3.style.left = "calc(10% - 25px)";
    emptyDancer3.style.top = "calc(50% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer3);

    emptyDancer4.style.left = "calc(40% - 25px)";
    emptyDancer4.style.top = "calc(50% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";
 
    currentSlide.appendChild(emptyDancer4);

    emptyDancer5.style.left = "calc(60% - 25px)";
    emptyDancer5.style.top = "calc(50% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer5);

    emptyDancer6.style.left = "calc(90% - 25px)";
    emptyDancer6.style.top = "calc(50% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer6);

    emptyDancer7.style.left = "calc(25% - 25px)";
    emptyDancer7.style.top = "calc(70% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer7);

    emptyDancer8.style.left = "calc(75% - 25px)";
    emptyDancer8.style.top = "calc(70% - 25px)";
    mptyDancer8.style.transform = "translate(-50%, -50%)";

    currentSlide.appendChild(emptyDancer8);
  }


  // var formation = e.target.cloneNode(true);

  // formation.style.width = "100%";
  // formation.style.height = "100%";
  // formation.style.position = "absolute";
  // formation.style.left = "0";
  // formation.style.top = "0";
  // formation.style.display = "block";
  // formation.style.zIndex = "20";
  // currentSlide.appendChild(formation);
})

$('#next-btn').click(function(e){
  if (slideNum < slides.length){
    currentSlide.style.display = "none";
    document.getElementById('menu').style.display = "none";
    
    slideNum = slideNum + 1;
    currentSlide = slides[slideNum - 1];
    currentSlide.style.display = 'block';

    if( currentSlide.className == "transition"){
      currentPlotted = visible[slideNum - 2];
    } else {
      currentPlotted = visible[slideNum - 1];
    }

    $('#menu').children().each( function() {
      if(isInArray(this.children[0].innerHTML, currentPlotted )){
        this.style.display = "none";
      } else {
        this.style.display = "initial"; //makes visible
      }
    });

    document.getElementById('menu').style.width = ($('#menu').children().length -  currentPlotted.length)*60 + "px"; 
  }
});

$('#previous-btn').click(function(e){
  if (slideNum > 1){
    currentSlide.style.display = 'none';
    
    slideNum = slideNum - 1;
    currentSlide = slides[slideNum - 1];
    currentSlide.style.display = "block";

    if( currentSlide.className == "transition"){
      currentPlotted = visible[slideNum - 2];
    } else {
      currentPlotted = visible[slideNum - 1];
    }

    $('#menu').children().each( function() {
      if(isInArray(this.children[0].innerHTML, currentPlotted )){
        this.style.display = "none";
      } else {
        this.style.display = "initial"; //makes visible
      }
    });
    document.getElementById('menu').style.width = ($('#menu').children().length -  currentPlotted.length)*60 + "px"; 
  }
});


var dancerEditing = false; 
$('#editButton').on('click', function(){
  //console.log('hit')
  if(!dancerEditing){
    dancerEditing = true;
    $('#danceTitle').removeAttr('readonly');
    $('#numDancers').removeAttr('disabled');
    $('#description').removeAttr('readonly');
    $('#music').removeAttr('disabled');
    document.getElementById('editButton').innerHTML = "Save";
  } else if (dancerEditing) {
    dancerEditing = false;
    $('#danceTitle').attr('readonly', true);
    $('#numDancers').attr('disabled', true);
    $('#description').attr('readonly', true);
    $('#music').attr('disabled', true);
    document.getElementById('editButton').innerHTML = "Edit";
  }
});

function addDancer(){
  //console.log("yay");
  var name = $('#DancerName').val();
  //console.log(name);
}

$('#sidebar-toggle').click(function() {
  var sidebar = document.querySelector('.sidebar');
  var body = document.querySelector('.body');
  var angle = document.querySelector('.angle');
  var progressRatio = 0;
  var classNames = document.querySelector('.sidebar').className;
  if(classNames.indexOf('maximized') > -1) {
    sidebar.className = 'sidebar';
    body.className = 'body minimized';
    angle.className = 'angle icon-double-angle-right';
    $('.tab-content').hide();
    progressRatio = wavesurfer.getCurrentTime()/wavesurfer.getDuration();
    $('#waveform').width($(window).width() - 50);
    wavesurfer.drawBuffer();
    wavesurfer.seekTo(progressRatio);
  } else {
    sidebar.className = 'sidebar maximized';
    body.className = 'body';
    angle.className = 'angle icon-double-angle-left';
    $('.tab-content').show();
    progressRatio = wavesurfer.getCurrentTime()/wavesurfer.getDuration();
    $('#waveform').width($(window).width() - 250);
    wavesurfer.drawBuffer();
    wavesurfer.seekTo(progressRatio);
  }
  return false;
});


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


  var drawTimeStamps = function(){
    console.log("timestamp");        // create a new line object
    var canvas=document.getElementById("timestamps");
    var ctx=canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (i = 1; i < slides.length+1; i++){
      yFrom = 0;
      yTo = 15;
      xFrom = 20*i+ 0.5;
      xTo = 20*i + 0.5;

      ctx.beginPath();
      ctx.moveTo(xFrom,yFrom);
      ctx.lineTo(xTo,yTo);
      ctx.stroke();

      // function Line(x1,y1,x2,y2){
      //   this.x1=x1;
      //   this.y1=y1;
      //   this.x2=x2;
      //   this.y2=y2;
      // }

      // Line.prototype.drawLine=function(ctx){
      //   // arbitrary styling
      //   ctx.strokeStyle="black";
      //   ctx.fillStyle="black";
      //   ctx.lineWidth=1;
        
      //   // draw the line
      //   ctx.beginPath();
      //   ctx.moveTo(this.x1,this.y1);
      //   ctx.lineTo(this.x2,this.y2);
      //   ctx.stroke();
      //   }
      //   // create a new line object
      //   var line=new Line(xTo,yTo,xFrom,yFrom);
      //   // draw the line
      //   line.drawLine(context);
    }
  }


}); //end of document ready 


