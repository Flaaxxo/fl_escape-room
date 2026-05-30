let tooltipTimer=null;

window.onload=function()
{
    localStorage.setItem('visited_info3', 'true');

    if(localStorage.getItem('ip_risolto')==='true') document.getElementById('spot_calc').classList.add('risolto');
    if(localStorage.getItem('algo_risolto')==='true') document.getElementById('spot_pc3').classList.add('risolto');
    
    // Easter Egg Sfondo
    if(localStorage.getItem('tooltip_visto')==='true') 
    {
        let bg=document.getElementById('bg_room');
        if(bg) bg.src="img/info3_hint.png";
        
        let wall=document.getElementById('wallpaper_sfocato');
        if(wall) wall.style.backgroundImage="url('img/info3_hint.png')";
    }
};

function torna_a_info2() 
{
    cambia_stanza('info2.html');
    play_audio('passaggio_stanze');
}

/* --- TOOLTIP TIMER --- */
function inizia_timer_tooltip()
{
    tooltipTimer=setTimeout(function()
    {
        localStorage.setItem('tooltip_visto', 'true');
    }, 3000);
}

function ferma_timer_tooltip()
{
    if(tooltipTimer) 
    {
        clearTimeout(tooltipTimer);
        tooltipTimer=null;
    }
}

/* --- CALCOLATRICE --- */
let calc_curr="";
const MAX_CHARS=8;

function apri_desk_img()
{
    if(localStorage.getItem('ip_risolto')==='true') return;
    document.getElementById('m_calc').classList.remove('nascosto');
    
    if(calc_curr==="") 
    {
        document.getElementById('calc_disp_img').innerText="0";
    } 
    else 
    {
        document.getElementById('calc_disp_img').innerText=calc_curr;
    }
}

function calc_input(n)
{
    if(calc_curr.length>=MAX_CHARS) return;
    if(calc_curr==="ERROR" || calc_curr==="ERR") calc_curr="";
    calc_curr+=n;
    document.getElementById('calc_disp_img').innerText=calc_curr;
}

function calc_op(op)
{
    if(calc_curr.length>=MAX_CHARS) return;
    if(calc_curr==="") return;
    let lastChar=calc_curr.slice(-1);
    
    // Evito doppi operatori
    if(lastChar==='+' || lastChar==='-' || lastChar==='*' || lastChar==='/') return;
    
    calc_curr+=op;
    document.getElementById('calc_disp_img').innerText=calc_curr;
}

function calc_clear()
{
    calc_curr="";
    document.getElementById('calc_disp_img').innerText="0";
}

function calc_result()
{
    try 
    {
        let lastChar=calc_curr.slice(-1);
        if(lastChar==='+' || lastChar==='-' || lastChar==='*' || lastChar==='/') 
        {
            calc_curr=calc_curr.slice(0, -1);
        }
        
        if(calc_curr==="") return;
        
        // Uso eval perché a scuola ci hanno insegnato così per fare prima
        let res=eval(calc_curr);
        let resString=res.toString();
        
        if(resString.length>MAX_CHARS || res===Infinity || isNaN(res)) 
        {
            play_audio('errore_codice');
            document.getElementById('calc_disp_img').innerText="ERROR";
            calc_curr="";
        } 
        else 
        {
            document.getElementById('calc_disp_img').innerText=resString;
            calc_curr=resString;
        }
    } 
    catch(e) 
    {
        document.getElementById('calc_disp_img').innerText="ERROR";
        calc_curr="";
    }
}

function verifica_ip_img()
{
    let input=document.getElementById('input_ip_img');
    if(input.value.trim()==="192.168.26.47") 
    {
        document.getElementById('m_calc').classList.add('nascosto');
        document.getElementById('m_successo_ip').classList.remove('nascosto');
        localStorage.setItem('ip_risolto', 'true');
        aggiungi_inventario("2647");
        document.getElementById('spot_calc').classList.add('risolto');
        play_audio('corretto');
    } 
    else 
    { 
        play_audio('errore');
        alert("CONNESSIONE FALLITA.\nIndirizzo IP non valido."); 
    }
}

function chiudi_successo_ip() { document.getElementById('m_successo_ip').classList.add('nascosto'); }

/* --- ALGORITMO --- */
let errori_algo=0;

function verifica_algo()
{
    let input=document.getElementById('input_algo');
    let feedback=document.getElementById('feedback_algo');
    
    if(input.value.trim()==="31") 
    {
        document.getElementById('fase_algo_domanda').classList.add('nascosto');
        document.getElementById('fase_algo_successo').classList.remove('nascosto');
        localStorage.setItem('algo_risolto', 'true');
        aggiungi_inventario("31");
        
        let pc=document.getElementById('spot_pc3');
        pc.classList.add('risolto'); 
        pc.onclick=null;
        
        play_audio('corretto');
    } 
    else 
    {
        errori_algo++;
        feedback.innerText="Errore di calcolo ("+errori_algo+")";
        input.value=""; 
        input.focus();
        if(errori_algo>=5) document.getElementById('btn_soluzione_algo').classList.remove('nascosto');
        registra_errore();
        play_audio('errore');
    }
}

/* --- FINALE --- */
function tenta_apertura_finale()
{
    document.getElementById('m_finale_lock').classList.remove('nascosto');
}

function verifica_elite()
{
    let inp=document.getElementById('input_elite').value.toUpperCase().trim();
    if(inp==="5UP3RU53R") 
    {
        document.getElementById('m_finale_lock').classList.add('nascosto');
        document.getElementById('m_finale_core').classList.remove('nascosto');
        play_audio('corretto');
    } 
    else 
    {
        alert("ACCESS DENIED.\nElite authorization required.");
        play_audio('errore_codice');
    }
}

function verifica_finale()
{
    let inp=document.getElementById('input_finale').value.toUpperCase().trim();
    
    // Accetto varie combinazioni corrette
    if(inp==="RPTM16FBBF24H8S312647" || inp==="16RPTMFBBF24H8S312647" || inp==="RPTM16FBBF24H8S264731" || inp==="16RPTMFBBF24H8S264731") 
    {
        play_audio('vincita');
        window.location.href='terminale.html'; 
    } 
    else 
    {
        play_audio('errore_codice');
        registra_errore();
        alert("CODICE CORE ERRATO.\nSequenza non riconosciuta.");
    }
}

function resetta_enigma_specifico(id_modal)
{
    // La calcolatrice non si resetta
    if(id_modal==='m_calc') return;

    if(id_modal==='m_pc3') 
    {
        if(localStorage.getItem('algo_risolto')!=='true') 
        {
            document.getElementById('input_algo').value="";
            document.getElementById('feedback_algo').innerText="";
            errori_algo=0; 
        }
    }

    if(id_modal==='m_orologio') 
    {
        document.getElementById('slider_ore').value=0;
        document.getElementById('slider_min').value=0;
        aggiorna_orologio(); 
    }

    if(id_modal==='m_finale_lock') document.getElementById('input_elite').value="";
    if(id_modal==='m_finale_core') document.getElementById('input_finale').value="";
}