/* ================================================
   posts.js — m365withcopilot.*
   v3 — filtry + paginacja + IntersectionObserver
   ================================================ */

/* Posts (newest first) */
var posts=[
  {url:"ppt-2min.html",tag:"PowerPoint",title:"Prezentacja w 2 minuty — bez slajdów od zera",desc:"Dajesz temat, Copilot robi draft prezentacji. Ty poprawiasz 3 slajdy."},
  {url:"copilot-bezpieczenstwo.html",tag:"Security",title:"Czy Copilot czyta Twoje dane?",desc:"Konkretnie o prywatności i compliance w M365."},
  {url:"copilot-cena.html",tag:"Licencje",title:"Ile kosztuje Copilot? Prosto.",desc:"Cena, co zawiera, kiedy się zwraca. Konkretnie."},
  {url:"word-oferta-90s.html",tag:"Word",title:"Oferta w 90 sekund",desc:"Dajesz kontekst, dostajesz draft. Edytujesz 2 zdania."},
  {url:"excel-bez-formul.html",tag:"Excel",title:"Analiza danych bez formuł",desc:"Pytasz po polsku, dostajesz wykres. Bez VLOOKUP."},
  {url:"teams-notatki.html",tag:"Teams",title:"Koniec z notatkami ze spotkań",desc:"Automatyczne podsumowanie i action items. Zero wysiłku."},
  {url:"outlook-1h.html",tag:"Outlook",title:"3 rzeczy które oszczędzają 1h dziennie",desc:"Podsumowania, drafty, priorytetyzacja. Bez teorii."}
];

/* Config */
var PAGE_SIZE=9;

/* State */
var _filter="all";
var _page=0;
var _io=null;

/* Lazy IntersectionObserver (singleton) */
function _getIO(){
  if(!_io){
    _io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add("visible");
          _io.unobserve(e.target);
        }
      });
    },{threshold:0.15});
  }
  return _io;
}

/* Observe new .fade/.reveal elements inside a container */
function _observeNew(container){
  var obs=_getIO();
  container.querySelectorAll(".fade:not(.visible),.reveal:not(.visible)").forEach(function(el){
    obs.observe(el);
  });
}

/* Observe ALL .fade/.reveal on page (call once from inline script) */
function observeAll(){
  document.querySelectorAll(".fade,.reveal").forEach(function(el){
    _getIO().observe(el);
  });
}

/* Get filtered posts */
function _filtered(){
  if(_filter==="all") return posts;
  return posts.filter(function(p){return p.tag===_filter;});
}

/* Generate card HTML */
function _cardHTML(p){
  return '<a href="'+p.url+'" class="post-card fade">'+
    '<span class="tag">'+p.tag+'</span>'+
    '<h3>'+p.title+'</h3>'+
    '<p>'+p.desc+'</p>'+
    '<span class="read">Czytaj →</span>'+
    '</a>';
}

/* Render current page of cards into #allPosts */
function _renderPage(){
  var grid=document.getElementById("allPosts");
  var wrap=document.getElementById("loadMoreWrap");
  if(!grid) return;

  var pool=_filtered();
  var end=(_page+1)*PAGE_SIZE;
  var visible=pool.slice(0,end);

  grid.innerHTML=visible.map(_cardHTML).join("");
  _observeNew(grid);

  if(wrap){
    if(end>=pool.length){
      wrap.style.display="none";
    }else{
      wrap.style.display="block";
      var remaining=pool.length-end;
      var btn=wrap.querySelector(".load-more-btn");
      if(btn){
        btn.innerHTML='Pokaż więcej <span class="filter-count">(+'+remaining+')</span> <span class="arrow">↓</span>';
      }
    }
  }
}

/* Render filter pills */
function renderFilters(containerId){
  var el=document.getElementById(containerId);
  if(!el) return;

  var tagMap={};
  var tagOrder=[];
  posts.forEach(function(p){
    if(!tagMap[p.tag]){tagMap[p.tag]=0;tagOrder.push(p.tag);}
    tagMap[p.tag]++;
  });

  var html='<button class="filter-pill active" data-tag="all">Wszystkie<span class="filter-count"> '+posts.length+'</span></button>';
  tagOrder.forEach(function(tag){
    html+='<button class="filter-pill" data-tag="'+tag+'">'+tag+'<span class="filter-count"> '+tagMap[tag]+'</span></button>';
  });
  el.innerHTML=html;

  el.querySelectorAll(".filter-pill").forEach(function(btn){
    btn.addEventListener("click",function(){
      el.querySelectorAll(".filter-pill").forEach(function(b){b.classList.remove("active");});
      btn.classList.add("active");
      _filter=btn.getAttribute("data-tag");
      _page=0;
      _renderPage();
    });
  });
}

/* Render all posts (paginated) — for index.html */
function renderAllPosts(containerId){
  _renderPage();

  var btn=document.querySelector(".load-more-btn");
  if(btn){
    btn.addEventListener("click",function(){
      _page++;
      _renderPage();
    });
  }
}

/* Render 3 random posts (for individual post pages) */
function renderMorePosts(containerId){
  var el=document.getElementById(containerId);
  if(!el) return;

  var cur=location.pathname.split("/").pop()||"index.html";
  var pool=posts.filter(function(p){return p.url!==cur;});

  for(var i=pool.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var tmp=pool[i];pool[i]=pool[j];pool[j]=tmp;
  }

  var pick=pool.slice(0,3);
  el.innerHTML=pick.map(_cardHTML).join("");
  _observeNew(el);
}