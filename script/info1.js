/* --- VARIABILI SIMON --- */
const livelli_simon=
[
    ['giallo', 'verde', 'rosso'],
    ['rosso', 'giallo', 'blu', 'verde', 'giallo'],
    ['blu', 'rosso', 'giallo', 'verde', 'giallo', 'rosso', 'verde']
];

let livello_corrente=0;
let sequenza_giocatore=[];
let input_bloccato=true;

/* --- INIZIALIZZAZIONE STANZA 1 --- */
window.onload=function()
{
    // Controllo cosa è già stato risolto visivamente
    if(localStorage.getItem('pc1_risolto')==='true') segna_risolto_visivo('spot_pc');
    if(localStorage.getItem('foglio_risolto')==='true') segna_risolto_visivo('spot_foglio');
    
    check_info1_progress();

    // Logica Porta e Telo
    let porta=document.getElementById('spot_porta');
    if(localStorage.getItem('simon_risolto')==='true') 
    {
        let telo=document.getElementById('spot_telo');
        if(telo) 
        { 
            telo.classList.remove('sbloccato'); 
            telo.classList.add('risolto'); 
        }

        porta.classList.remove('inerte'); 
        porta.classList.remove('bloccato'); 

        if(localStorage.getItem('visited_info2')==='true') porta.classList.add('porta_visitata');
        else porta.classList.add('porta_nuova');
        porta.onclick=usa_porta_finale;
    } 
    else porta.classList.add('inerte');
};

function check_info1_progress()
{
    let telo=document.getElementById('spot_telo');

    // Se ho fatto gli altri due enigmi ma non il Simon, il telo si attiva
    if(localStorage.getItem('pc1_risolto')==='true' && 
       localStorage.getItem('foglio_risolto')==='true' && 
       localStorage.getItem('simon_risolto')!=='true') 
    {
        telo.classList.remove('bloccato');
        telo.classList.add('sbloccato'); 
    }
}

function segna_risolto_visivo(id)
{
    let el=document.getElementById(id);
    if(el) el.classList.add('risolto');
}

/* --- LOGICA SIMON GAME --- */
function avvia_simon_game()
{
    if(localStorage.getItem('simon_risolto')==='true') return;
    
    document.getElementById('m_telo').classList.add('nascosto');
    document.getElementById('m_simon').classList.remove('nascosto');
    
    livello_corrente=0; 
    sequenza_giocatore=[];
    setTimeout(play_sequenza, 1000);
}

function play_sequenza()
{
    input_bloccato=true; 
    sequenza_giocatore=[];
    
    let sequenza=livelli_simon[livello_corrente];
    let status=document.getElementById('simon_status');
    status.innerText="LIVELLO "+(livello_corrente+1)+": Osserva...";
    status.style.color="#e0b0ff";
    
    let i=0;
    let intervallo=setInterval(function()
    {
        illumina_bottone(sequenza[i]);
        i++;
        if(i>=sequenza.length) 
        {
            clearInterval(intervallo);
            setTimeout(function()
            {
                input_bloccato=false;
                status.innerText="RIPETI LA SEQUENZA";
                status.style.color="#fff";
            }, 500);
        }
    }, 800);
}

function illumina_bottone(colore)
{
    let btn=document.getElementById('btn_'+colore);
    btn.classList.add('active');
    
    if(colore==='rosso') play_audio('do');
    if(colore==='giallo') play_audio('re');
    if(colore==='blu') play_audio('mi');
    if(colore==='verde') play_audio('fa');

    setTimeout(function(){ btn.classList.remove('active'); }, 300);
}

function simon_input(colore)
{
    if(input_bloccato) return;
    
    illumina_bottone(colore);
    sequenza_giocatore.push(colore);
    
    let index=sequenza_giocatore.length-1;
    let sequenza_target=livelli_simon[livello_corrente];

    // Controllo se ho sbagliato tasto
    if(sequenza_giocatore[index]!==sequenza_target[index]) 
    {
        document.getElementById('simon_status').innerText="ERRORE! Reset...";
        document.getElementById('simon_status').style.color="red";
        input_bloccato=true;
        setTimeout(play_sequenza, 1500);
        return;
    }

    // Se ho finito la sequenza corrente
    if(sequenza_giocatore.length===sequenza_target.length) 
    {
        input_bloccato=true;
        if(livello_corrente<livelli_simon.length-1) 
        {
            document.getElementById('simon_status').innerText="CORRETTO!";
            document.getElementById('simon_status').style.color="#00ff00";
            livello_corrente++;
            setTimeout(play_sequenza, 1500);
        } 
        else vittoria_simon();
    }
}

function vittoria_simon()
{
    play_audio('stanza_sbloccata');
    document.getElementById('simon_status').innerText="SISTEMA COMPLETATO";
    document.getElementById('simon_grid').style.display='none';
    document.getElementById('simon_vittoria').classList.remove('nascosto');
    
    localStorage.setItem('simon_risolto', 'true');
    aggiungi_inventario('FBBF24');
    
    let telo=document.getElementById('spot_telo');
    telo.classList.remove('sbloccato'); 
    telo.classList.add('risolto');

    setTimeout(function()
    {
        play_audio('porta_disponibile');
    }, 2000);
}

function chiudi_simon_sblocca_porta()
{
    document.getElementById('m_simon').classList.add('nascosto');
    
    let porta=document.getElementById('spot_porta');
    porta.classList.remove('inerte');
    porta.classList.add('porta_nuova'); 
    porta.onclick=usa_porta_finale;
    
    alert("COMPLIMENTI!\nSerratura aperta. Clicca sulla PORTA per uscire.");
}

function usa_porta_finale()
{
    localStorage.setItem('visited_info2', 'true');
    cambia_stanza('info2.html');
}

function resetta_enigma_specifico(id_modal)
{
    if(id_modal==='m_simon') 
    {
        input_bloccato=true;
        livello_corrente=0;
        sequenza_giocatore=[];
        document.getElementById('simon_status').innerText="Inizializzazione...";
        document.getElementById('simon_status').style.color="#fff";
    }

    if(id_modal==='m_pc')   document.getElementById('input_pc').value="";
    if(id_modal==='m_foglio')   document.getElementById('input_foglio').value="";
}