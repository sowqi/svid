const placesGrid = document.getElementById("placesGrid");
let placeCards = [...document.querySelectorAll(".place-card[data-place]")];
const monthLabel = document.getElementById("monthLabel");
const calendarDays = document.getElementById("calendarDays");
const scheduleList = document.getElementById("scheduleList");
const customDialog = document.getElementById("customDialog");
let selectedPlace = null;
let selectedDate = null;
let currentMonth = new Date(2026, 9, 1);
let plannedDates = [];
let confirmedDates = [];
let timerInterval = null;

const busyDays = new Set(); // Добавляй занятые даты: "2026-10-27".
const monthNames = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const weekNames = ["вс","пн","вт","ср","чт","пт","сб"];
const photoClass = {"Париж":"photo-paris","Море":"photo-sea","Горы":"photo-mountains","Санкт-Петербург":"photo-petersburg","Дома":"photo-home"};
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const parseDate = value => {const [y,m,d]=value.split("-").map(Number);return new Date(y,m-1,d);};
const isBusy = date => false;
const isPast = date => {const today=new Date();today.setHours(0,0,0,0);return date<today;};

function selectPlace(card) {
  if (card.classList.contains("selected")) {
    card.classList.remove("selected");
    selectedPlace = null;
  } else {
    placeCards.forEach(item=>item.classList.remove("selected"));
    card.classList.add("selected");
    selectedPlace={name:card.dataset.place,description:card.dataset.description||"Наш особенный день",image:card.dataset.image||""};
  }
  document.getElementById("placeCount").textContent=selectedPlace?"1 / 1 выбрано":"0 / 1 выбрано";
  updateSummary();
}
placeCards.forEach(card=>card.addEventListener("click",()=>selectPlace(card)));

document.getElementById("customPlaceBtn").addEventListener("click",()=>{
  document.getElementById("customPlaceInput").value="";
  customDialog.showModal();
});
document.getElementById("closeCustomDialog").addEventListener("click",()=>customDialog.close());
document.getElementById("cancelCustomDialog").addEventListener("click",()=>customDialog.close());
customDialog.addEventListener("click",event=>{
  if(event.target===customDialog) customDialog.close();
});
document.getElementById("customForm").addEventListener("submit",event=>{
  event.preventDefault();
  const name=document.getElementById("customPlaceInput").value.trim();
  if(!name)return;
  const card=document.createElement("button");
  card.type="button";card.className="place-card custom-added";
  card.dataset.place=name;card.dataset.description="Место, которое ты предложил";card.dataset.image="";
  const photo=document.createElement("span");photo.className="place-photo custom-photo";photo.textContent="♡";
  const mark=document.createElement("span");mark.className="radio-mark";
  const info=document.createElement("span");info.className="place-info";
  const strong=document.createElement("strong");strong.textContent=name;
  const small=document.createElement("small");small.textContent="Наш вариант ♡";
  info.append(strong,small);card.append(photo,mark,info);
  placesGrid.insertBefore(card,document.getElementById("customPlaceBtn"));
  placeCards.push(card);
  card.addEventListener("click",()=>selectPlace(card));
  customDialog.close();selectPlace(card);
});

function renderCalendar(){
  monthLabel.textContent=`${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  calendarDays.innerHTML="";scheduleList.innerHTML="";
  const first=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1);
  const offset=(first.getDay()+6)%7;
  const count=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,0).getDate();
  for(let i=0;i<offset;i++){const blank=document.createElement("span");blank.className="day blank";calendarDays.appendChild(blank);}
  for(let n=1;n<=count;n++){
    const date=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),n);
    const key=iso(date),busy=isBusy(date),past=isPast(date);
    const btn=document.createElement("button");btn.type="button";
    btn.className="day"+(!busy&&!past?" free":"")+(busy?" busy":"")+(selectedDate===key?" selected":"");
    if(key===iso(new Date()))btn.classList.add("today");
    btn.textContent=n;btn.disabled=busy||past;
    btn.setAttribute("aria-label",`${n} ${monthNames[date.getMonth()]}, ${busy?"занято":past?"прошедшая дата":"свободно"}`);
       btn.addEventListener("click",()=>{selectedDate=key;renderCalendar();updateSummary();});
    calendarDays.appendChild(btn);
  }
  let start=selectedDate?parseDate(selectedDate):new Date(Math.max(Date.now(),new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1).getTime()));
  if(start.getMonth()!==currentMonth.getMonth())start=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1);
  let shown=0,cursor=new Date(start);
  while(shown<7&&cursor.getMonth()===currentMonth.getMonth()){
    const date=new Date(cursor),busy=isBusy(date),past=isPast(date),key=iso(date);
    const row=document.createElement("button");row.type="button";
    row.className="schedule-row "+(busy||past?"busy":"free")+(selectedDate===key?" active":"");
    row.disabled=busy||past;
    row.innerHTML=`<span class="dayname">${weekNames[date.getDay()].replace(/^./,x=>x.toUpperCase())}</span><span>${String(date.getDate()).padStart(2,"0")}.${String(date.getMonth()+1).padStart(2,"0")}</span><span class="status">${busy?"Занята":past?"Прошло":"Свободна"}</span>`;
    row.addEventListener("click",()=>{selectedDate=key;renderCalendar();updateSummary();});
    scheduleList.appendChild(row);cursor.setDate(cursor.getDate()+1);shown++;
  }
}
document.getElementById("prevMonth").addEventListener("click",()=>{currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()-1,1);renderCalendar();});
document.getElementById("nextMonth").addEventListener("click",()=>{currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,1);renderCalendar();});
document.getElementById("commentInput").addEventListener("input",updateSummary);

function updateSummary(){
  document.getElementById("summaryPlace").textContent=selectedPlace?selectedPlace.name:"Пока не выбрано";
  const thumb=document.getElementById("summaryThumb");
  const className=selectedPlace&&photoClass[selectedPlace.name];
  thumb.style.backgroundImage=className?getComputedStyle(document.querySelector("."+className)).backgroundImage:"linear-gradient(135deg,#30232b,#171619)";
  if(selectedPlace&&selectedPlace.image&&!className)thumb.style.backgroundImage=`url("images/${selectedPlace.image}")`;
  if(selectedDate){const d=parseDate(selectedDate);document.getElementById("summaryDate").textContent=d.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});document.getElementById("summaryWeekday").textContent=`(${weekNames[d.getDay()]})`;}
  else{document.getElementById("summaryDate").textContent="Выбери свободный день";document.getElementById("summaryWeekday").textContent="";}
  document.getElementById("summaryComment").textContent=document.getElementById("commentInput").value.trim()||"Тут появится твоё пожелание ♡";
}
function updateWeather(){
  if(!selectedDate)return;
  const d=parseDate(selectedDate),temp=8+((d.getDate()*7)%13),icons=["🌤️","☁️","🌦️","🌥️"],descriptions=["Переменная облачность","Облачно","Небольшой дождь","Малооблачно"];
  document.getElementById("weatherTitle").textContent=`Погода на ${d.toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}`;
  document.getElementById("weatherNote").textContent="Демонстрационный прогноз. Реальная погода не подключена.";
  document.getElementById("weatherTemp").textContent=`+${temp}°`;
  document.getElementById("weatherIcon").textContent=icons[d.getDate()%icons.length];
  document.getElementById("weatherDesc").textContent=descriptions[d.getDate()%descriptions.length];
  document.getElementById("weatherWind").textContent=`${2+d.getDate()%5} м/с`;
  document.getElementById("feelsLike").textContent=`+${temp-2}°`;
  document.querySelectorAll("#forecast div").forEach((el,i)=>el.querySelector("b").textContent=`+${temp+(i===1?2:i===3?-1:0)}°`);
}
function renderPlannedDates(){
  const container=document.getElementById("plannedDates");container.innerHTML="";
  plannedDates.forEach((item,index)=>{
    const row=document.createElement("div");row.className="planned-date";
    const info=document.createElement("div");info.className="planned-date-info";
    const name=document.createElement("strong");name.textContent=item.place;
    const date=parseDate(item.date);
    const details=document.createElement("small");
    details.textContent=date.toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})+(item.comment?` · ${item.comment}`:"");
    info.append(name,details);
    const remove=document.createElement("button");remove.type="button";remove.textContent="Удалить";
    remove.addEventListener("click",()=>{plannedDates.splice(index,1);renderPlannedDates();savePlannedDates();});
    row.append(info,remove);container.appendChild(row);
  });
  document.getElementById("placeCountSmall").textContent=`Запланировано свиданий: ${plannedDates.length}`;
}
function savePlannedDates(){
  try{localStorage.setItem("nashiPlanyDates",JSON.stringify(plannedDates));}catch(e){}
}
document.getElementById("addDateBtn").addEventListener("click",()=>{
  const message=document.getElementById("formMessage");
  if(!selectedPlace||!selectedDate){message.textContent="Сначала выбери место и свободную дату ♡";return;}
  const date=parseDate(selectedDate);date.setHours(12,0,0,0);
  if(date<=new Date()){message.textContent="Выбери будущую дату для свидания.";return;}
  if(plannedDates.some(item=>item.date===selectedDate)){message.textContent="На эту дату уже есть свидание. Выбери другой день.";return;}
  plannedDates.push({place:selectedPlace.name,date:selectedDate,comment:document.getElementById("commentInput").value.trim(),image:selectedPlace.image||""});
  plannedDates.sort((a,b)=>a.date.localeCompare(b.date));
  renderPlannedDates();savePlannedDates();
  message.textContent="Свидание добавлено в ваши планы ♡";
  selectedPlace=null;selectedDate=null;placeCards.forEach(c=>c.classList.remove("selected"));
  document.getElementById("placeCount").textContent="0 / 1 выбрано";
  document.getElementById("commentInput").value="";
  currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1);
  updateSummary();renderCalendar();
});
document.getElementById("confirmBtn").addEventListener("click", async ()=>{
  const message=document.getElementById("formMessage");
  if(!plannedDates.length){message.textContent="Сначала добавь хотя бы одно свидание ♡";return;}
  const now=Date.now();
  confirmedDates=plannedDates.map(item=>({item,time:(()=>{const d=parseDate(item.date);d.setHours(12,0,0,0);return d.getTime();})()})).filter(x=>x.time>now).sort((a,b)=>a.time-b.time);
  if(!confirmedDates.length){message.textContent="Все даты уже прошли. Добавь будущую дату.";return;}
  try{localStorage.setItem("nashiPlanyConfirmed","true");savePlannedDates();}catch(e){}

  // === ОТПРАВКА В FORMSPREE ===
  message.textContent = "Отправляем...";
  
  const allDatesText = plannedDates.map(item=>{
    const d = parseDate(item.date);
    const dateStr = d.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});
    return `${item.place} — ${dateStr}${item.comment ? " ("+item.comment+")" : ""}`;
  }).join("\n");

  try {
    const res = await fetch("https://formspree.io/f/xeaaeevz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        "Место": plannedDates.map(i=>i.place).join(", "),
        "Дата": plannedDates.map(i=>i.date).join(", "),
        "Комментарий": document.getElementById("commentInput").value.trim(),
        "Все свидания": allDatesText
      })
    });
    
    if (!res.ok) throw new Error("Ошибка");
    console.log("Успешно отправлено в Formspree!");
  } catch (err) {
    console.error("Не удалось отправить в Formspree:", err);
  }
  // === КОНЕЦ ОТПРАВКИ ===

  message.textContent="Все свидания подтверждены! Осталось дождаться первого ♡";
  document.getElementById("timerMessage").textContent=`Ближайшая встреча: ${confirmedDates[0].item.place} ♡`;
  startTimer();document.getElementById("timer").scrollIntoView({behavior:"smooth",block:"center"});
});
function startTimer(){
  if(timerInterval)clearInterval(timerInterval);
  const tick=()=>{
    const now=Date.now();
    confirmedDates=plannedDates.map(item=>{const d=parseDate(item.date);d.setHours(12,0,0,0);return {item,time:d.getTime()};}).filter(x=>x.time>now).sort((a,b)=>a.time-b.time);
    if(!confirmedDates.length){
      ["days","hours","minutes","milliseconds"].forEach(id=>document.getElementById(id).textContent=id==="milliseconds"?"000":"00");
      document.getElementById("timerMessage").textContent="Время для новых планов? ♡";clearInterval(timerInterval);return;
    }
    const next=confirmedDates[0],diff=next.time-now;
    document.getElementById("days").textContent=String(Math.floor(diff/86400000)).padStart(2,"0");
    document.getElementById("hours").textContent=String(Math.floor(diff%86400000/3600000)).padStart(2,"0");
    document.getElementById("minutes").textContent=String(Math.floor(diff%3600000/60000)).padStart(2,"0");
    document.getElementById("milliseconds").textContent=String(diff%1000).padStart(3,"0");
    document.getElementById("timerMessage").textContent=`Ближайшая встреча: ${next.item.place} ♡`;
  };
  tick();timerInterval=setInterval(tick,37);
}
function restoreSaved(){
  try{
    plannedDates=JSON.parse(localStorage.getItem("nashiPlanyDates")||"[]");
    renderPlannedDates();
    const confirmed=localStorage.getItem("nashiPlanyConfirmed")==="true";
    if(confirmed&&plannedDates.length){
      confirmedDates=plannedDates.map(item=>{const d=parseDate(item.date);d.setHours(12,0,0,0);return {item,time:d.getTime()};}).filter(x=>x.time>Date.now()).sort((a,b)=>a.time-b.time);
      if(confirmedDates.length){document.getElementById("timerMessage").textContent=`Ближайшая встреча: ${confirmedDates[0].item.place} ♡`;startTimer();}
    }
  }catch(e){plannedDates=[];}
}
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}}),{threshold:.08});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
renderCalendar(); restoreSaved(); updateSummary(); updateWeather = function(){}
