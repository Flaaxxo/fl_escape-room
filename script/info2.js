let oggetto_equipaggiato=null;

window.onload=function()
{
    localStorage.setItem('visited_info2', 'true');

    // 1. STATO CASSETTO
    if(localStorage.getItem('usb_presa')==='true') 
    {
        let cassetto=document.getElementById('spot_cassetto');
        if(cassetto) cassetto.classList.add('risolto');
        
        if(localStorage.getItem('usb_usata')!=='true') 
        {
            play_audio('item_trovato');
            if(!document.getElementById('item_usb_key')) aggiungi_item_inventario("x1 CHIAVE USB", "img/special_usb.png");
        }
    }

    // 2. STATO PC E SBLOCCO LAVAGNA
    if(localStorage.getItem('pc_risolto')==='true') 
    {
        document.getElementById('spot_pc_target').classList.add('risolto');
        
        if(localStorage.getItem('lavagna_risolta')!=='true') 
        {
            let lav=document.getElementById('spot_lavagna');
            lav.classList.remove('inattivo');
            lav.classList.add('sbloccato'); 
        }
    }

    // 3. STATO LAVAGNA E SBLOCCO ARMADIO
    if(localStorage.getItem('lavagna_risolta')==='true') 
    {
        let lav=document.getElementById('spot_lavagna');
        lav.classList.remove('inattivo'); 
        lav.classList.remove('sbloccato'); 
        lav.classList.add('risolto');
        
        if(localStorage.getItem('armadio_risolto')!=='true') 
        {
            let armadio=document.getElementById('spot_armadio');
            armadio.classList.remove('inattivo'); 
        }
    }

    // Gestione Input tastiera per la lavagna
    let hoveredLetter=null;

    document.addEventListener('keydown', function(event)
    {
        if(document.getElementById('m_lavagna').classList.contains('nascosto')) return;
        if(!hoveredLetter) return;

        let key=event.key;
        if(key>='1' && key<='8') 
        {
            let slotIndex=parseInt(key)-1; 
            sposta_lettera_in_slot(hoveredLetter, slotIndex);
        }
    });

    function sposta_lettera_in_slot(lettera, slotIndex)
    {
        let slot=document.getElementById('slot_'+slotIndex);
        if(!slot) return;

        if(slot.children.length>0) 
        {
            let oldLetter=slot.firstElementChild;
            document.getElementById('bank_letters').appendChild(oldLetter);
            oldLetter.style.position='absolute'; 
            oldLetter.style.left=(Math.random()*80+5)+'%';
            oldLetter.style.top=(Math.random()*80+5)+'%';
        }

        slot.appendChild(lettera);
        lettera.style.position='static'; 
        hoveredLetter=null;
    }

    // Inizializza lettere lavagna
    function init_lavagna_game()
    {
        let bank=document.getElementById('bank_letters');
        if(!bank) return;
        bank.innerHTML='';
        
        LETTERS.sort(function(){ return Math.random()-0.5; });
        
        for(let i=0; i<LETTERS.length; i++)
        {
            let letter=LETTERS[i];
            let div=document.createElement('div');
            div.className='letter_card';
            div.innerText=letter;
            div.style.left=(Math.random()*80+5)+'%';
            div.style.top=(Math.random()*80+5)+'%';
            
            div.onmousedown=function(e){ start_letter_drag(e, div); };
            
            div.onmouseenter=function(){ hoveredLetter=div; div.style.border="2px solid red"; }; 
            div.onmouseleave=function(){ if(hoveredLetter===div) hoveredLetter=null; div.style.border="none"; };
            
            bank.appendChild(div);
        }
    }

    // 4. USCITA
    if(localStorage.getItem('armadio_risolto')==='true') 
    {
        document.getElementById('spot_armadio').classList.add('risolto');
        
        let porta=document.getElementById('spot_uscita');
        porta.classList.remove('bloccato'); 
        porta.classList.remove('inerte');
        porta.style.opacity='1';
        
        if(localStorage.getItem('visited_info3')==='true') 
        {
            porta.classList.add('porta_visitata');
        } 
        else 
        {
            porta.classList.add('porta_nuova');
        }
        porta.onclick=vai_a_info3;
    }

    init_lavagna_game();
};

function torna_a_info1() 
{ 
    cambia_stanza('info1.html'); 
    play_audio('passaggio_stanze');
}

function vai_a_info3() 
{ 
    localStorage.setItem('visited_info3', 'true'); 
    cambia_stanza('info3.html'); 
}

/* --- GIOCO CASSETTO --- */
function apri_cassetto()
{
    play_audio('cassetto');
    if(localStorage.getItem('usb_presa')==='true') return;
    document.getElementById('m_cassetto_aperto').classList.remove('nascosto');
}

function chiudi_cassetto() 
{ 
    play_audio('cassetto');
    document.getElementById('m_cassetto_aperto').classList.add('nascosto'); 
}

/* --- DRAG & DROP CASSETTO (usa #area_cassetto come riferimento) --- */
let dragItem=null; 
let offsetX=0; 
let offsetY=0;

function inizia_drag(e, el) 
{ 
    play_audio('carta');
    e.preventDefault(); 
    dragItem=el; 
    el.style.zIndex=100; 
    let r=el.getBoundingClientRect(); 
    offsetX=e.clientX-r.left; 
    offsetY=e.clientY-r.top; 
    document.addEventListener('mousemove', muovi_drag); 
    document.addEventListener('mouseup', ferma_drag); 
}

function muovi_drag(e) 
{ 
    if(!dragItem) return; 
    let c=document.getElementById('area_cassetto'); 
    let cr=c.getBoundingClientRect(); 
    dragItem.style.left=(e.clientX-cr.left-offsetX)+'px'; 
    dragItem.style.top=(e.clientY-cr.top-offsetY)+'px'; 
}

function ferma_drag() 
{ 
    dragItem=null; 
    document.removeEventListener('mousemove', muovi_drag); 
    document.removeEventListener('mouseup', ferma_drag); 
}

/* --- DRAG & DROP SCENA (usa #scena_gioco come riferimento, per foglio_codice e fogli) ---
   Funziona esattamente come il drag del cassetto ma relativo alla scena di gioco,
   in modo che la posizione sia sempre ancorata al background e non alla viewport.
*/
let dragItemScena=null;
let offsetXScena=0;
let offsetYScena=0;

function inizia_drag_scena(e, el)
{
    play_audio('carta');
    e.preventDefault();
    e.stopPropagation(); // Evita che il click si propaghi come onclick sull'elemento
    dragItemScena=el;
    el.style.zIndex=50;
    el.style.position='absolute'; // Assicuro che sia absolute dentro scena_gioco
    let r=el.getBoundingClientRect();
    offsetXScena=e.clientX-r.left;
    offsetYScena=e.clientY-r.top;
    document.addEventListener('mousemove', muovi_drag_scena);
    document.addEventListener('mouseup', ferma_drag_scena);
}

function muovi_drag_scena(e)
{
    if(!dragItemScena) return;
    let scena=document.getElementById('scena_gioco');
    let sr=scena.getBoundingClientRect();
    // Calcolo la posizione in % rispetto alla scena, come gli altri hotspot
    let newLeft=((e.clientX - sr.left - offsetXScena) / sr.width) * 100;
    let newTop=((e.clientY - sr.top - offsetYScena) / sr.height) * 100;
    // Clamp per non uscire dalla scena
    if(newLeft<0) newLeft=0;
    if(newTop<0) newTop=0;
    dragItemScena.style.left=newLeft+'%';
    dragItemScena.style.top=newTop+'%';
    dragItemScena.style.right=''; // Rimuovo eventuale right% se era impostato
}

function ferma_drag_scena()
{
    dragItemScena=null;
    document.removeEventListener('mousemove', muovi_drag_scena);
    document.removeEventListener('mouseup', ferma_drag_scena);
}

function prendi_usb()
{
    play_audio('item_trovato');
    alert("Hai preso la CHIAVETTA USB!");
    document.getElementById('usb_target').style.display='none';
    localStorage.setItem('usb_presa', 'true');
    chiudi_cassetto();
    document.getElementById('spot_cassetto').classList.add('risolto');
    aggiungi_item_inventario("x1 CHIAVE USB", "img/special_usb.png");
}

function trova_codice_segreto() { play_audio('item_trovato'); document.getElementById('m_secret_code').classList.remove('nascosto'); }
function chiudi_segreto() { document.getElementById('m_secret_code').classList.add('nascosto'); aggiungi_inventario("SUPERUSER"); }

/* --- GESTIONE OGGETTO EQUIPAGGIATO --- */
function aggiungi_item_inventario(nome, img_src)
{
    if(document.getElementById('item_usb_key')) return;
    let lista=document.getElementById('lista_codici');
    let div=document.createElement('div');
    div.id='item_usb_key'; 
    div.className='item_code'; 
    div.innerHTML="> "+nome;
    
    div.onclick=function(){ attiva_cursore_fantasma(nome, img_src); };
    
    lista.appendChild(div); 
    lista.style.display='block';
}

function attiva_cursore_fantasma(nome, img_src)
{
    document.getElementById('inventory_list').style.display='none';
    oggetto_equipaggiato=nome;
    
    let cursore=document.getElementById('cursore_fantasma');
    cursore.src=img_src; 
    cursore.style.display='block';
    
    document.addEventListener('mousemove', segui_mouse);
    
    let pc=document.getElementById('spot_pc_target');
    pc.classList.add('attivo_per_inserimento');
    
    let hotspots=document.querySelectorAll('.hotspot');
    for(let i=0; i<hotspots.length; i++)
    {
        if(hotspots[i].id!=='spot_pc_target') hotspots[i].classList.add('hotspot_disabilitato_temp');
    }
}

function segui_mouse(e) 
{ 
    let cursore=document.getElementById('cursore_fantasma'); 
    cursore.style.left=(e.clientX+10)+'px'; 
    cursore.style.top=(e.clientY+10)+'px'; 
}

function tenta_uso_pc()
{
    if(oggetto_equipaggiato==="x1 CHIAVE USB") 
    {
        document.getElementById('cursore_fantasma').style.display='none';
        document.removeEventListener('mousemove', segui_mouse);
        oggetto_equipaggiato=null;
        
        let pc=document.getElementById('spot_pc_target');
        pc.classList.remove('attivo_per_inserimento');
        pc.style.cursor='default';
        
        let hotspots=document.querySelectorAll('.hotspot');
        for(let i=0; i<hotspots.length; i++)
        {
            hotspots[i].classList.remove('hotspot_disabilitato_temp');
        }

        let itemInv=document.getElementById('item_usb_key');
        if(itemInv) itemInv.remove();
        
        localStorage.setItem('usb_usata', 'true');
        document.getElementById('m_pc_enigma').classList.remove('nascosto');
    }
}

function verifica_usb_code()
{
    if(document.getElementById('input_usb_code').value.toUpperCase().trim()==='FBBF24') 
    {
        play_audio('corretto');
        document.getElementById('fase_usb_code').classList.add('nascosto');
        document.getElementById('fase_readme').classList.remove('nascosto');
    } 
    else 
    { 
        play_audio('errore_codice');
        alert("CODICE ERRATO.");
        registra_errore(); 
    }
}

function aggiorna_fake_input(input) 
{ 
    input.value=input.value.toUpperCase(); 
    let val=input.value; 
    let visual=""; 
    for(let i=0; i<4; i++) 
    { 
        visual+=(i<val.length ? val[i] : "_")+" "; 
    } 
    document.getElementById('display_finto').innerText=visual.trim(); 
}

function verifica_readme()
{
    let val=document.getElementById('input_vero_nascosto').value.toUpperCase().trim();
    
    if(val==='HTML') 
    {
        play_audio('corretto');
        document.getElementById('fase_readme').classList.add('nascosto');
        document.getElementById('fase_pc_successo').classList.remove('nascosto');
        
        aggiungi_inventario("H");
        
        let lav=document.getElementById('spot_lavagna');
        lav.classList.remove('inattivo');
        lav.classList.add('sbloccato'); 
        
        localStorage.setItem('pc_risolto', 'true');
    } 
    else 
    { 
        document.getElementById('pc_feedback').innerText="Errore: Linguaggio non riconosciuto.";
        registra_errore(); 
        play_audio('errore_codice');
    }
}

function chiudi_pc_completo()
{
    document.getElementById('m_pc_enigma').classList.add('nascosto');
    document.getElementById('spot_pc_target').classList.add('risolto');
}

/* --- LOGICA LAVAGNA --- */
const LETTERS=['U','V','Z','C','G','E','A','L','M','Z','T','P','T','S'];
let letterDrag=null; 
let lOffsetX=0; 
let lOffsetY=0;

function start_letter_drag(e, el) 
{ 
    play_audio('carta');
    if(localStorage.getItem('lavagna_risolta')==='true') return; 
    e.preventDefault(); 
    letterDrag=el; 
    if(el.parentElement.classList.contains('letter_slot')) document.getElementById('bank_letters').appendChild(el); 
    let r=el.getBoundingClientRect(); 
    lOffsetX=e.clientX-r.left; 
    lOffsetY=e.clientY-r.top; 
    el.style.zIndex=1000; 
    document.addEventListener('mousemove', move_letter); 
    document.addEventListener('mouseup', end_letter_drag); 
}

function move_letter(e) 
{ 
    if(!letterDrag) return; 
    letterDrag.style.position='fixed'; 
    letterDrag.style.left=(e.clientX-lOffsetX)+'px'; 
    letterDrag.style.top=(e.clientY-lOffsetY)+'px'; 
}

function end_letter_drag(e) 
{ 
    play_audio('carta');
    if(!letterDrag) return; 
    document.removeEventListener('mousemove', move_letter); 
    document.removeEventListener('mouseup', end_letter_drag); 
    
    letterDrag.style.zIndex=100; 
    letterDrag.style.position='absolute'; 
    
    let slots=document.querySelectorAll('.letter_slot'); 
    let dropped=false; 
    
    for(let i=0; i<slots.length; i++)
    {
        let slot=slots[i];
        let r=slot.getBoundingClientRect(); 
        if(e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom) 
        { 
            if(slot.children.length===0) 
            { 
                slot.appendChild(letterDrag); 
                letterDrag.style.position='static'; 
                dropped=true; 
            } 
        } 
    }
    
    if(!dropped) 
    { 
        let bank=document.getElementById('bank_letters'); 
        bank.appendChild(letterDrag); 
        let br=bank.getBoundingClientRect(); 
        let nx=e.clientX-br.left; 
        let ny=e.clientY-br.top; 
        if(nx<0) nx=0; 
        if(nx>br.width-30) nx=br.width-30; 
        if(ny<0) ny=0; 
        if(ny>br.height-30) ny=br.height-30; 
        letterDrag.style.left=nx+'px'; 
        letterDrag.style.top=ny+'px'; 
    } 
    letterDrag=null; 
}

function reset_lavagna() 
{ 
    play_audio('tap');
    init_lavagna_game(); 
    let slots=document.querySelectorAll('.letter_slot');
    for(let i=0; i<slots.length; i++)
    {
        slots[i].innerHTML='';
    }
}

function verifica_lavagna() 
{ 
    let parola=""; 
    let slots=document.querySelectorAll('.letter_slot');
    
    for(let i=0; i<8; i++) 
    { 
        let slot=slots[i]; 
        parola+=(slot.children.length>0) ? slot.children[0].innerText : "_"; 
    } 
    
    if(parola==="GUZZETTA") 
    { 
        play_audio('corretto');
        document.getElementById('m_lavagna').classList.add('nascosto'); 
        document.getElementById('m_lavagna_successo').classList.remove('nascosto'); 
        localStorage.setItem('lavagna_risolta', 'true'); 
        aggiungi_inventario("8"); 
        
        let lav=document.getElementById('spot_lavagna'); 
        lav.classList.remove('sbloccato'); 
        lav.classList.add('risolto'); 
        
        let armadio=document.getElementById('spot_armadio');
        armadio.classList.remove('inattivo');
        
        setTimeout(function(){ play_audio('sbloccato'); }, 4000);
    } 
    else 
    { 
        alert("SEQUENZA ERRATA: "+parola); 
        registra_errore();
        play_audio('errore_codice');
    } 
}

function chiudi_lavagna_completa() { document.getElementById('m_lavagna_successo').classList.add('nascosto'); }

/* --- ARMADIO --- */
let img_input="";

function apri_tastierino_img() 
{ 
    play_audio('suono_armadietto');
    if(localStorage.getItem('armadio_risolto')==='true') return; 
    document.getElementById('m_tastierino_img').classList.remove('nascosto'); 
    img_input="";
}

function img_num_press(num) 
{ 
    play_audio('tasto');
    if(img_input.length<6) { img_input+=num; document.getElementById('display_num_img').innerText=img_input; } 
}

function img_backspace() 
{ 
    play_audio('tasto');
    img_input=img_input.slice(0, -1); 
    document.getElementById('display_num_img').innerText=img_input; 
}

function img_clear()
{ 
    play_audio('tasto');
    img_input=""; 
    document.getElementById('display_num_img').innerText=""; 
}

function img_easter_egg() 
{ 
    play_audio('tap');
    alert("EASTER EGG! 🤖\nI robot conquisteranno il mondo?"); 
}

function apri_hint_carta() 
{ 
    play_audio('item_trovato');
    document.getElementById('m_hint_paper').classList.remove('nascosto'); 
}

function img_check() 
{ 
    play_audio('tasto');
    if(img_input==="868686") 
    { 
        play_audio('sbloccato');
        document.getElementById('m_tastierino_img').classList.add('nascosto'); 
        document.getElementById('m_armadio').classList.remove('nascosto'); 
    } 
    else 
    { 
        alert("PIN ERRATO"); 
        img_clear(); 
    } 
}

let armadio_input="";

function tastierino_press(char) 
{ 
    play_audio('tasto');
    if(armadio_input.length<7) { armadio_input+=char; update_armadio_display(); } 
}

function tastierino_reset() 
{ 
    play_audio('tasto');
    armadio_input=""; 
    update_armadio_display(); 
}

function update_armadio_display() 
{ 
    document.getElementById('armadio_display').innerHTML="STATUS: LOCKED<br>PASSWORD REQUIRED:<br>L _ _ B _ N _<br><br>"+(armadio_input || ""); 
}

function tastierino_check()
{
    if(armadio_input==="LISBONA") 
    {
        play_audio('corretto');
        document.getElementById('m_armadio').classList.add('nascosto');
        document.getElementById('m_armadio_successo').classList.remove('nascosto');
        
        localStorage.setItem('armadio_risolto', 'true');
        aggiungi_inventario("S");
        
        let armadio=document.getElementById('spot_armadio');
        armadio.classList.add('risolto');
        
        let porta=document.getElementById('spot_uscita');
        porta.classList.remove('bloccato');
        porta.classList.remove('inerte');
        porta.style.opacity='1';
        porta.classList.add('porta_nuova'); 
        porta.onclick=vai_a_info3;

        setTimeout(sblocca_uscita_finale, 2000);
        setTimeout(function(){ play_audio('porta_disponibile'); }, 2000);
    } 
    else 
    {
        play_audio('errore_codice');
        alert("ACCESS DENIED"); 
        tastierino_reset(); 
    }
}

function sblocca_uscita_finale() 
{ 
    document.getElementById('m_armadio_successo').classList.add('nascosto');
    alert("COMPLIMENTI!\nHai sbloccato la porta per l'ultima stanza.");
    play_audio('stanza_sbloccata');
}

/* Reset specifici */
function resetta_enigma_specifico(id_modal)
{
    if(id_modal==='m_lavagna') 
    {
        if(localStorage.getItem('lavagna_risolta')!=='true') 
        {
            reset_lavagna(); 
        }
    }

    if(id_modal==='m_pc_enigma') 
    {
        document.getElementById('input_usb_code').value="";
        document.getElementById('input_vero_nascosto').value="";
        document.getElementById('display_finto').innerText="_ _ _ _";
        document.getElementById('fase_usb_code').classList.remove('nascosto');
        document.getElementById('fase_readme').classList.add('nascosto');
        document.getElementById('fase_pc_successo').classList.add('nascosto');
    }
    
    if(id_modal==='m_tastierino_img') 
    {
        img_clear(); 
    }
    
    if(id_modal==='m_armadio') 
    {
        tastierino_reset(); 
    }
}