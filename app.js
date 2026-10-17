const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const tg=window.Telegram?.WebApp;if(tg){tg.ready();tg.expand();try{tg.setHeaderColor("#080808");tg.setBackgroundColor("#080808")}catch(e){}}
const seedNodes=[
{id:"n1",title:"PersonalAI Telegram-бот",type:"project",description:"ИИ-бот, выбор моделей и статистика использования.",x:.48,y:.47},
{id:"n2",title:"Python и AI-агент",type:"chat",description:"Разработка локального агента и интеграций.",x:.25,y:.29},
{id:"n3",title:"Mini App интерфейс",type:"chat",description:"Тёмный интерфейс, темы и меню Telegram Mini App.",x:.72,y:.29},
{id:"n4",title:"Система памяти",type:"project",description:"Сохранение контекста и поиск по прошлым разговорам.",x:.25,y:.69},
{id:"n5",title:"Spyder — граф связей",type:"idea",description:"Единая карта чатов, проектов и идей.",x:.73,y:.69},
{id:"n6",title:"Учёт токенов",type:"chat",description:"Статистика запросов и расхода токенов моделей.",x:.49,y:.16}
];
const seedEdges=[{id:"e1",from:"n1",to:"n2",manual:false},{id:"e2",from:"n1",to:"n3",manual:false},{id:"e3",from:"n1",to:"n4",manual:false},{id:"e4",from:"n3",to:"n5",manual:false},{id:"e5",from:"n2",to:"n6",manual:false},{id:"e6",from:"n1",to:"n6",manual:false}];
let nodes=[],edges=[],selected=null,linkMode=false,linkFirst=null,zoom=1,pan={x:0,y:0},drag=null,searchTerm="";
const wrap=$("#graphWrap"),nodeLayer=$("#nodes"),svg=$("#edges");
function load(){try{nodes=JSON.parse(localStorage.getItem("spyder-nodes"))||seedNodes.map(x=>({...x}));edges=JSON.parse(localStorage.getItem("spyder-edges"))||seedEdges.map(x=>({...x}))}catch(e){nodes=seedNodes.map(x=>({...x}));edges=seedEdges.map(x=>({...x}))}if(!nodes.length){nodes=seedNodes.map(x=>({...x}));edges=seedEdges.map(x=>({...x}))}}
function persist(){try{localStorage.setItem("spyder-nodes",JSON.stringify(nodes));localStorage.setItem("spyder-edges",JSON.stringify(edges))}catch(e){}}
function labelType(t){return {chat:"Чат",project:"Проект",idea:"Идея"}[t]||"Узел"}
function nodeBy(id){return nodes.find(n=>n.id===id)}
function point(n){return{x:n.x*wrap.clientWidth,y:n.y*wrap.clientHeight}}
function render(){
 nodeLayer.innerHTML="";svg.innerHTML="";const w=wrap.clientWidth,h=wrap.clientHeight;svg.setAttribute("viewBox",`0 0 ${w} ${h}`);
 edges.forEach(e=>{const a=nodeBy(e.from),b=nodeBy(e.to);if(!a||!b)return;const p=point(a),q=point(b);const line=document.createElementNS("http://www.w3.org/2000/svg","line");line.setAttribute("x1",p.x);line.setAttribute("y1",p.y);line.setAttribute("x2",q.x);line.setAttribute("y2",q.y);line.setAttribute("class","edge"+(e.manual?" manual":""));svg.appendChild(line)});
 nodes.forEach(n=>{const el=document.createElement("button");el.className=`node ${n.type}${selected===n.id?" selected":""}${linkFirst===n.id?" link-first":""}`;el.dataset.id=n.id;el.style.left=(n.x*w)+"px";el.style.top=(n.y*h)+"px";if(searchTerm&&!(`${n.title} ${n.description} ${labelType(n.type)}`.toLowerCase().includes(searchTerm)))el.classList.add("filtered-out");el.innerHTML=`<b></b><small>${labelType(n.type)}</small>`;el.querySelector("b").textContent=n.title;el.addEventListener("click",e=>{e.stopPropagation();if(drag?.moved)return;if(linkMode){handleLinkPick(n.id);return}selected=n.id;render();showDetails(n.id)});el.addEventListener("pointerdown",e=>startDrag(e,n.id,el));nodeLayer.appendChild(el)});
 $("#graphSummary").textContent=`${nodes.length} узлов · ${edges.length} связей`;$ ("#graphEmpty").hidden=nodes.length>0;$("#zoomLabel").textContent=Math.round(zoom*100)+"%";applyTransform();
}
function applyTransform(){nodeLayer.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;svg.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}
function startDrag(e,id,el){if(linkMode||e.button!==0)return;const startX=e.clientX,startY=e.clientY,old=nodeBy(id),orig={x:old.x,y:old.y};drag={id,startX,startY,orig,moved:false};el.setPointerCapture?.(e.pointerId);const move=ev=>{if(!drag||drag.id!==id)return;const dx=ev.clientX-startX,dy=ev.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;if(drag.moved){old.x=Math.min(.94,Math.max(.06,orig.x+dx/wrap.clientWidth));old.y=Math.min(.91,Math.max(.08,orig.y+dy/wrap.clientHeight));el.style.left=old.x*wrap.clientWidth+"px";el.style.top=old.y*wrap.clientHeight+"px";drawEdgesOnly()}};const end=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",end);if(drag?.moved){persist();render()}setTimeout(()=>{drag=null},0)};window.addEventListener("pointermove",move);window.addEventListener("pointerup",end,{once:true})}
function drawEdgesOnly(){const w=wrap.clientWidth,h=wrap.clientHeight;svg.innerHTML="";edges.forEach(e=>{const a=nodeBy(e.from),b=nodeBy(e.to);if(!a||!b)return;const p=point(a),q=point(b),l=document.createElementNS("http://www.w3.org/2000/svg","line");l.setAttribute("x1",p.x);l.setAttribute("y1",p.y);l.setAttribute("x2",q.x);l.setAttribute("y2",q.y);l.setAttribute("class","edge"+(e.manual?" manual":""));svg.appendChild(l)})}
function showDetails(id){const n=nodeBy(id),box=$("#details");if(!n){box.hidden=true;return}box.hidden=false;box.innerHTML=`<div class="detail-head"><div><div class="detail-type">${labelType(n.type)}</div><h3 id="detailTitle"></h3><p id="detailDescription"></p></div></div><div class="detail-actions"><button class="secondary-button" id="detailLink">⤳ Связать с…</button><button class="secondary-button" id="detailRename">Изменить</button><button class="danger-button" id="detailDelete">Удалить узел</button></div>`;$("#detailTitle").textContent=n.title;$("#detailDescription").textContent=n.description||"Описание не добавлено.";$("#detailLink").onclick=()=>{openLinksModal(id)};$("#detailRename").onclick=()=>openNodeModal(n);$("#detailDelete").onclick=()=>{if(!confirm(`Удалить «${n.title}» и все его связи?`))return;nodes=nodes.filter(x=>x.id!==id);edges=edges.filter(e=>e.from!==id&&e.to!==id);selected=null;box.hidden=true;persist();render()}}
function handleLinkPick(id){if(!linkFirst){linkFirst=id;$("#linkHint").hidden=false;$("#linkHint").textContent="Теперь выбери второй узел. Первый выбран: "+nodeBy(id)?.title;render();return}if(linkFirst===id){linkFirst=null;$("#linkHint").hidden=true;render();return}createEdge(linkFirst,id);linkFirst=null;linkMode=false;$("#linkModeButton").classList.remove("active");$("#linkHint").hidden=true;render();showDetails(id)}
function createEdge(a,b){if(a===b)return alert("Нельзя связать узел с самим собой.");if(edges.some(e=>(e.from===a&&e.to===b)||(e.from===b&&e.to===a)))return alert("Эти элементы уже связаны.");edges.push({id:"e"+Date.now(),from:a,to:b,manual:true});persist();render()}
function toggleLinkMode(){linkMode=!linkMode;linkFirst=null;$("#linkModeButton").classList.toggle("active",linkMode);$("#linkHint").hidden=!linkMode;if(linkMode)$("#linkHint").textContent="Режим связывания: выбери первый узел на карте.";else $("#linkHint").textContent="";render()}
function openNodeModal(n=null){$("#nodeForm").dataset.editId=n?.id||"";$("#nodeTitle").value=n?.title||"";$("#nodeType").value=n?.type||"chat";$("#nodeDescription").value=n?.description||"";openModal("nodeModal");setTimeout(()=>$("#nodeTitle").focus(),80)}
function fillSelects(fromId,toId){const opts=nodes.map(n=>`<option value="${n.id}">${escapeHtml(n.title)} · ${labelType(n.type)}</option>`).join("");$("#linkFrom").innerHTML=opts;$("#linkTo").innerHTML=opts;if(fromId&&nodeBy(fromId))$("#linkFrom").value=fromId;if(toId&&nodeBy(toId))$("#linkTo").value=toId;const other=nodes.find(n=>n.id!==$("#linkFrom").value);if(other&&!toId)$("#linkTo").value=other.id}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderLinksList(){const box=$("#linksList");box.innerHTML="";const manual=edges.filter(e=>e.manual);if(!manual.length){box.innerHTML='<div class="empty-links">Ручных связей пока нет.</div>';return}manual.forEach(e=>{const a=nodeBy(e.from),b=nodeBy(e.to);if(!a||!b)return;const row=document.createElement("div");row.className="link-row";const info=document.createElement("div");info.innerHTML=`<small>РУЧНАЯ СВЯЗЬ</small>`;info.append(document.createTextNode(`${a.title} ↔ ${b.title}`));const del=document.createElement("button");del.textContent="Удалить";del.onclick=()=>{edges=edges.filter(x=>x.id!==e.id);persist();render();renderLinksList()};row.append(info,del);box.append(row)})}
function openLinksModal(fromId){fillSelects(fromId);renderLinksList();openModal("linksModal")}
function openModal(id){const m=$("#"+id);m.hidden=false;requestAnimationFrame(()=>m.classList.add("open"))}
function closeModal(id){const m=$("#"+id);m.classList.remove("open");setTimeout(()=>m.hidden=true,200)}
function openAIChat(){
    $("#spyderScreen").hidden = true;
    $("#chatScreen").hidden = false;

    const details = $("#details");
    if (details) {
        details.hidden = true;
    }
}

function openSpyder(){
    $("#chatScreen").hidden = true;
    $("#spyderScreen").hidden = false;
}
$("#nodeForm").addEventListener("submit",e=>{e.preventDefault();const title=$("#nodeTitle").value.trim();if(!title)return;const editId=e.currentTarget.dataset.editId;if(editId){const n=nodeBy(editId);n.title=title;n.type=$("#nodeType").value;n.description=$("#nodeDescription").value.trim()}else{const angle=Math.random()*Math.PI*2;nodes.push({id:"n"+Date.now(),title,type:$("#nodeType").value,description:$("#nodeDescription").value.trim(),x:.5+Math.cos(angle)*(.15+Math.random()*.15),y:.5+Math.sin(angle)*(.15+Math.random()*.2)})}persist();closeModal("nodeModal");render();if(editId){selected=editId;showDetails(editId)}});
$("#createLinkButton").onclick=()=>{const a=$("#linkFrom").value,b=$("#linkTo").value;if(!a||!b)return alert("Сначала добавь минимум два узла.");const before=edges.length;createEdge(a,b);if(edges.length>before){renderLinksList();closeModal("linksModal")}};
$("#linkModeButton").onclick=toggleLinkMode;$("#addNodeButton").onclick=()=>openNodeModal();$("#emptyAddButton").onclick=()=>openNodeModal();$("#manageLinksButton").onclick=()=>openLinksModal();$("#searchInput").addEventListener("input",e=>{searchTerm=e.target.value.trim().toLowerCase();render()});
$("#zoomIn").onclick=()=>{zoom=Math.min(1.65,zoom+.1);applyTransform()};$("#zoomOut").onclick=()=>{zoom=Math.max(.65,zoom-.1);applyTransform()};$("#fitButton").onclick=()=>{zoom=1;pan={x:0,y:0};render()};
$$("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));$$(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m.id)}));
const drawer=$("#drawer"),backdrop=$("#backdrop");function openMenu(){drawer.classList.add("open");backdrop.classList.add("open")}function closeMenu(){drawer.classList.remove("open");backdrop.classList.remove("open")}$("#menuButton").onclick=openMenu;backdrop.onclick=closeMenu;

$$(".menu-item").forEach(b => {
    b.onclick = () => {
        const page = b.dataset.page;

        closeMenu();

        $$(".menu-item").forEach(x => {
            x.classList.toggle("active", x === b);
        });

        if (page === "spyder") {
            openSpyder();
            return;
        }

        if (page === "chat") {
            closeModal("genericModal");
            openAIChat();
            return;
        }

        if (page === "projects" || page === "chats") {
            const type = page === "chats" ? "chat" : "project";

            $("#genericContent").innerHTML = `
                <div class="eyebrow">WORKSPACE</div>
                <h2>${page === "chats" ? "Чаты" : "Проекты"}</h2>
                <div class="generic-list" id="genericList"></div>
                <button id="genericAdd" class="primary-button wide">＋ Добавить</button>
            `;

            const list = $("#genericList");
            const arr = nodes.filter(n => n.type === type);

            if (!arr.length) {
                list.innerHTML = '<div class="empty-links">Пока ничего нет.</div>';
            }

            arr.forEach(n => {
                const row = document.createElement("div");
                row.className = "generic-row";

                const sp = document.createElement("span");
                sp.textContent = n.title;

                const small = document.createElement("small");
                small.textContent = n.description || labelType(n.type);
                sp.append(small);

                const open = document.createElement("button");
                open.className = "secondary-button";
                open.textContent = "Открыть";

                open.onclick = () => {
                    closeModal("genericModal");
                    selected = n.id;
                    render();
                    showDetails(n.id);
                };

                row.append(sp, open);
                list.append(row);
            });

            $("#genericAdd").onclick = () => {
                closeModal("genericModal");
                openNodeModal();
                $("#nodeType").value = type;
            };

            openModal("genericModal");
            return;
        }

        if (page === "themes") {
            const themes = [
                ["Obsidian", "#080808"],
                ["Graphite", "#202020"],
                ["Forest", "#0e2920"],
                ["Peach", "#fff0e5"],
                ["Rose", "#f7dfe8"],
                ["Pure", "#fff"]
            ];

            $("#genericContent").innerHTML =
                '<div class="eyebrow">PERSONAL STYLE</div>' +
                '<h2>Оформление</h2>' +
                '<div class="theme-list">' +
                themes.map((t, i) =>
                    `<button class="theme-choice ${i === 0 ? "active" : ""}" data-theme-choice="${i}"><span style="background:${t[1]}"></span>${t[0]}</button>`
                ).join("") +
                '</div>';

            $$("[data-theme-choice]").forEach(btn => {
                btn.onclick = () => {
                    const colors = [
                        "#080808", "#202020", "#0e2920",
                        "#fff0e5", "#f7dfe8", "#fff"
                    ];

                    document.documentElement.style.setProperty(
                        "--bg",
                        colors[+btn.dataset.themeChoice]
                    );

                    $$("[data-theme-choice]").forEach(x => {
                        x.classList.toggle("active", x === btn);
                    });
                };
            });

            openModal("genericModal");
        }
    };
});
window.addEventListener("resize", render);
load();
render();

const attachFileButton = $("#attachFileButton");
const chatFileInput = $("#chatFileInput");
const chatFilePreview = $("#chatFilePreview");

if (attachFileButton && chatFileInput && chatFilePreview) {
    attachFileButton.onclick = () => chatFileInput.click();

    chatFileInput.onchange = () => {
        const files = Array.from(chatFileInput.files || []);

        if (!files.length) {
            chatFilePreview.innerHTML = "<span>Напиши что-нибудь...</span>";
            return;
        }

        chatFilePreview.innerHTML = "";

        files.forEach(file => {
            const item = document.createElement("div");
            item.className = "chat-file-item";

            if (file.type.startsWith("image/")) {
                const img = document.createElement("img");
                img.alt = file.name;
                img.src = URL.createObjectURL(file);
                item.appendChild(img);
            }

            const name = document.createElement("span");
            name.textContent = file.name;
            item.appendChild(name);

            chatFilePreview.appendChild(item);
        });
    };
}
