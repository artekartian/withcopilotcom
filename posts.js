/* ================================================
   posts.js – m365withcopilot.*
   v3 – filtry + paginacja + IntersectionObserver
   ================================================ */

/* Posts (newest first) */
var posts=[
  {url:"robiwszystko.html",tag:"Microsoft 365",title:"Pisanie – koniec z pustą kartką",desc:"Copilot tworzy pierwszą wersję maila, oferty lub dokumentu. Od razu w Outlook i Word. Ty podajesz temat i tylko poprawiasz."},
  {url:"odpowiada.html",tag:"Outlook",title:"Mail – podsumowanie wątku i gotowa odpowiedź w sekundę",desc:"Copilot podsumowuje rozmowę i proponuje odpowiedź. Nie czytasz wszystkiego od początku. Zna kontekst - Work IQ"},
  {url:"teamsrecap.html",tag:"Teams",title:"Spotkanie online – nie musisz już odsłuchiwać nagrań",desc:"Copilot śledzi tematy i zadania w real-time. Ty rozmawiasz – on notuje."},
  {url:"excelpytasz.html",tag:"Excel",title:"Excel – pytasz zamiast liczyć",desc:"Zamiast formuł pytasz po polsku. Copilot analizuje dane i pokazuje wnioski."},
  {url:"pamieta.html",tag:"Microsoft 365",title:"Search – koniec z szukaniem plików",desc:"Copilot znajduje dokumenty i ustalenia w całej firmie. Dostajesz kontekst, nie tylko link."},
  {url:"dokumenty.html",tag:"Word",title:"Dokumenty – powstają w kilka minut",desc:"Procedury, oferty i instrukcje tworzą się od zera. Nie odkładasz ich na później."},
  {url:"raporty.html",tag:"PowerPoint",title:"Raporty – raport, który coś mówi",desc:"Copilot zamienia dane w podsumowanie i wnioski. Nie tylko liczby – decyzje."},
  {url:"chat.html",tag:"Chat",title:"Chat – ruszasz od razu",desc:"Copilot pomaga uporządkować temat i zrobić plan. Z chaosu do konkretu."},
  {url:"agent.html",tag:"Agent 365",title:"Agent – zadanie robi się samo",desc:"Copilot przechodzi przez cały proces. Od danych do gotowego efektu."},
  {url:"ppt-2min.html",tag:"PowerPoint",title:"Prezentacja w 2 minuty – bez slajdów od zera",desc:"Dajesz temat, Copilot robi draft prezentacji. Ty poprawiasz 3 slajdy."},
  {url:"cena.html",tag:"Licencje",title:"Ile kosztuje Copilot (Premium)? w PLN.",desc:"Cena, co zawiera, kiedy się zwraca. Konkretnie."},
  {url:"newsletter.html",tag:"Newsletter",title:"Pisanie – zabiera Ci czas",desc:"Mail lub dokument powstaje w kilka sekund. Bez poprawiania, bez zaczynania od zera."},
  {url:"anthropic.html",tag:"Model AI",title:"Copilot dostał drugi mózg – Claude Opus bez dopłat",desc:"Nowy model AI Anthropic w Twoim Copilot. Lepsze rozumowanie, dokumenty i analizy – 0 zł extra."},
  {url:"frontier-firm.html",tag:"Microsoft 365",title:"Frontier Firm — firma, w której AI pracuje obok ludzi",desc:"Czym jest Frontier Firm i jak w 3 krokach zmienić firmę w organizację, gdzie AI naprawdę pracuje."},
  {url:"zaufanie.html",tag:"Bezpieczeństwo",title:"Twoje dane, Twoja kontrola – bezpieczeństwo Copilot",desc:"Copilot nie trenuje się na Twoich danych. Szanuje uprawnienia M365. Dane zostają w UE."}
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

/* Render all posts (paginated) – for index.html */
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
