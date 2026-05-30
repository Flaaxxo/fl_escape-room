/* ----------------------------------------
   CORE.JS - LOGICA PRINCIPALE ESCAPE ROOM
   ---------------------------------------- */
const TEMPO_INIZIALE_MS=20*60*1000; // 20 Minuti in millisecondi

function avvia_timer()
{
    let path=window.location.pathname;

    // Il timer NON parte su index.html, intro, o terminale
    let pagine_senza_timer=['index.html', 'terminale.html', 'intro.html'];
    let su_pagina_senza_timer=false;

    for(let i=0; i<pagine_senza_timer.length; i++)
    {
        if(path.includes(pagine_senza_timer[i])) { su_pagina_senza_timer=true; break; }
    }
    // Gestisce anche il caso path='/' (index implicito)
    if(path.endsWith('/') || path==='' || path==='/') su_pagina_senza_timer=true;

    if(su_pagina_senza_timer)
    {
        // Su index o terminale, nascondo il timer e non lo avvio
        let box=document.getElementById('ui_timer_box');
        if(box) box.style.display='none';
        return;
    }

    // Avvio il timer solo su info1/info2/info3
    // genesis_start viene impostato da intro.js quando l'utente clicca GIOCA
    // Se per qualche motivo non esiste (es. accesso diretto alla pagina), lo creo ora
    if(!localStorage.getItem('genesis_start'))
    {
        localStorage.setItem('genesis_start', new Date().getTime());
    }

    let startTime=localStorage.getItem('genesis_start');

    // Aggiorno il timer ogni secondo
    let timerInterval=setInterval(function()
    {
        let now=new Date().getTime();
        let diff=now-parseInt(startTime);
        let rimanente=TEMPO_INIZIALE_MS-diff;
        
        let display=document.getElementById('timer_display');
        
        // Audio Tensione (ultimi 10 secondi)
        if(rimanente<=10000 && rimanente>0 && !audio_tensione) 
        {
             if(typeof play_audio==='function') audio_tensione=play_audio('ultimi10sec');
        }

        if(rimanente<=0) 
        {
            // === GAME OVER ===
            clearInterval(timerInterval);
            if(display) display.innerText="00:00";
            
            // Fermo la musica
            if(musica_corrente && musica_corrente.audio) musica_corrente.audio.pause();
            if(audio_tensione) audio_tensione.pause();
            if(typeof play_audio==='function') play_audio('perdita');
            
            mostra_game_over();
        } 
        else 
        {
            // Calcolo minuti e secondi
            if(display) 
            {
                let m=Math.floor(rimanente/60000);
                let s=Math.floor((rimanente%60000)/1000);
                
                // Aggiungo lo zero davanti se serve (es. 5 diventa 05)
                let m_str=m<10 ? '0'+m : m;
                let s_str=s<10 ? '0'+s : s;

                display.innerText=m_str+":"+s_str;
                
                // Diventa rosso all'ultimo minuto
                if(m<1) 
                {
                    display.style.color="red";
                    display.style.textShadow="0 0 10px red";
                }
            }
        }
    }, 1000);
}

function mostra_game_over()
{
    // Creo il div del game over via JS
    let div=document.createElement('div');
    // Stili inline per sicurezza
    div.style.position='fixed'; div.style.top='0'; div.style.left='0';
    div.style.width='100vw'; div.style.height='100vh';
    div.style.backgroundColor='rgba(50, 0, 0, 0.95)';
    div.style.zIndex='99999';
    div.style.display='flex'; div.style.flexDirection='column';
    div.style.justifyContent='center'; div.style.alignItems='center';
    div.style.color='red'; div.style.fontFamily="'Courier New', monospace";
    div.style.textAlign='center';

    div.innerHTML=`
        <h1 style="font-size: 5rem; margin: 0; text-shadow: 0 0 20px red;">SYSTEM FAILURE</h1>
        <h2 style="font-size: 2rem; color: white;">GENESIS DELETED</h2>
        <p style="font-size: 1.2rem; color: #aaa; margin-top: 20px;">Il tempo è scaduto. I dati sono stati persi.</p>
        <button onclick="ricomincia_da_capo()" 
                style="margin-top: 50px; padding: 15px 40px; font-size: 1.5rem; 
                       background: red; color: black; border: none; font-weight: bold; 
                       cursor: pointer; box-shadow: 0 0 20px red;">
            RIATTIVA SISTEMA
        </button>
    `;

    document.body.appendChild(div);
}

function ricomincia_da_capo()
{
    localStorage.clear();
    window.location.href='index.html';
}

/* -------------------
   GESTIONE INVENTARIO
   ------------------- */
function toggle_inventory()
{
    let lista=document.getElementById('inventory_list');
    if(!lista) return;
    
    if(lista.style.display==='block')   lista.style.display='none';
    else 
    {
        lista.style.display='block';
        aggiorna_vista_inventario();
    }
}

function aggiungi_inventario(item)
{
    // Recupero la stringa grezza dal localStorage
    let stringa_salvata=localStorage.getItem('genesis_inventory');
    let inventario=[];

    // Se c'è qualcosa salvato, lo trasformo in array separando col carattere '|'
    if(stringa_salvata && stringa_salvata!=="") inventario=stringa_salvata.split('|');
    
    // Controllo se l'oggetto c'è già con un ciclo classico
    let gia_presente=false;
    for(let i=0; i<inventario.length; i++)
    {
        if(inventario[i]===item) gia_presente=true;
    }

    if(!gia_presente) 
    {
        inventario.push(item);
        
        // Salvo trasformando l'array in stringa separata da pipe '|'
        // Esempio: "CODICE1|CODICE2|CODICE3"
        localStorage.setItem('genesis_inventory', inventario.join('|'));
        
        if(typeof play_audio==='function') 
        {
            setTimeout(function(){ play_audio('inventario'); }, 2000);
        }
    }
    aggiorna_vista_inventario();
}

function aggiorna_vista_inventario()
{
    let container=document.getElementById('lista_codici');
    if(!container) return;
    
    let stringa_salvata=localStorage.getItem('genesis_inventory');
    let inventario=[];

    // Controllo sicurezza prima di fare split
    if(stringa_salvata && stringa_salvata!=="")
    {
        inventario=stringa_salvata.split('|');
    }
    
    for(let i=0; i<inventario.length; i++)
    {
        let cod=inventario[i];
        // Creo un ID sicuro rimuovendo caratteri strani
        let safeId='inv_item_'+cod.replace(/[^a-zA-Z0-9]/g, '');
        
        if(!document.getElementById(safeId)) 
        {
            let div=document.createElement('div');
            div.id=safeId;
            div.className='item_code';
            div.innerText="> "+cod;
            container.appendChild(div);
        }
    }
}

/* -----------------------
   MODALI E LOGICA ENIGMI
   ----------------------- */
function apri_modale(id)
{
    let modal=document.getElementById(id);
    if(modal) modal.classList.remove('nascosto');
}

function chiudi_modale(id)
{
    let modal=document.getElementById(id);
    if(modal) modal.classList.add('nascosto');
}

/* Funzione principale per verificare i codici.
    Accetta l'input, la soluzione, il premio e gli ID degli oggetti da aggiornare.
*/
function verifica_enigma(id_input, soluzione, reward, id_hotspot, id_modal)
{
    let input=document.getElementById(id_input);
    let valore=input.value.trim().toUpperCase();

    if(valore===soluzione.toUpperCase()) 
    {
        // RISPOSTA CORRETTA
        if(typeof play_audio==='function') play_audio('corretto');

        let modal=document.getElementById(id_modal);

        // Nascondo la domanda e mostro il successo
        modal.querySelector('.fase_domanda').classList.add('nascosto');
        modal.querySelector('.fase_successo').classList.remove('nascosto');
        
        let spanCodice=modal.querySelector('.codice_sbloccato');
        if(spanCodice) spanCodice.innerText=reward;

        aggiungi_inventario(reward);
        
        let spot=document.getElementById(id_hotspot);
        if(spot) spot.classList.add('risolto');

        // Salvataggi specifici
        if(id_hotspot==='spot_pc') localStorage.setItem('pc1_risolto', 'true');
        if(id_hotspot==='spot_foglio') localStorage.setItem('foglio_risolto', 'true');
        
        // Controllo se devo sbloccare qualcosa nella stanza
        if(typeof check_info1_progress==="function")    check_info1_progress();

        if(typeof play_audio==='function')  setTimeout(function(){ play_audio('sbloccato'); }, 4000);
    } 
    else 
    {
        // RISPOSTA ERRATA
        if(typeof play_audio==='function') play_audio('errore_codice');
        
        registra_errore();
        alert("ERRORE: Dati non corrispondenti.");
        input.value=""; 
        input.focus();
    }
}

function registra_errore()
{
    let err=parseInt(localStorage.getItem('genesis_errors') || '0');
    err++;
    localStorage.setItem('genesis_errors', err);
}

// Listener per aprire l'inventario con la tastiera
document.addEventListener('keydown', function(event)
{
    let tag=document.activeElement.tagName;
    // Se non sto scrivendo in un input
    if(tag!=='INPUT' && tag!=='TEXTAREA') 
    {
        if(event.key.toLowerCase()==='i') 
        {
            toggle_inventory();
        }
    }
});

/* ------------------------
   INIZIALIZZAZIONE PAGINA
   ------------------------ */
document.addEventListener("DOMContentLoaded", function()
{
    avvia_timer();
    aggiorna_vista_inventario();
    
    // Effetto dissolvenza iniziale
    let transizione=document.getElementById('transizione_nera');
    if(transizione) setTimeout(function(){ transizione.classList.add('dissolvenza_finita'); }, 100);
});

function cambia_stanza(url)
{
    let transizione=document.getElementById('transizione_nera');
    if(transizione) transizione.classList.remove('dissolvenza_finita'); 
    
    // Uso la funzione audio se c'è, altrimenti vado diretto
    if(typeof fade_out_bgm_and_change==='function') fade_out_bgm_and_change(url);
    else setTimeout(function(){ window.location.href=url; }, 1500);
}

function reset()
{
    if(confirm("⚠ ATTENZIONE ⚠\nVuoi cancellare tutti i progressi e ricominciare?")) 
    {
        localStorage.clear();
        window.location.href='index.html'; 
    }
}

// Gestione click fuori dai modali per chiuderli
window.onclick=function(event)
{
    if(event.target.classList.contains('modal_overlay')) 
    {
        let modalId=event.target.id;
        
        // Alcuni modali non si devono chiudere cliccando fuori
        if(modalId==='m_finale_core') return; 
        if(modalId==='m_game_over') return; 

        chiudi_modale_con_reset(modalId);
    }
};

function chiudi_modale_con_reset(id)
{
    let modal=document.getElementById(id);
    if(modal) modal.classList.add('nascosto');
    
    // Se c'è una funzione per resettare l'enigma specifico, la chiamo
    if(typeof resetta_enigma_specifico==="function")    resetta_enigma_specifico(id);
}

function chiudi_successo_generico(id_modal)
{
    let modal=document.getElementById(id_modal);
    modal.classList.add('nascosto');
    // Resetta la vista per la prossima volta
    modal.querySelector('.fase_domanda').classList.remove('nascosto');
    modal.querySelector('.fase_successo').classList.add('nascosto');
}