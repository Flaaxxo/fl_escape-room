const storia_html=
[
    "Ore 18:15,<br>I.I.S.S. Galileo Ferraris – Acireale.",
    "L'Open Day è terminato. La scuola è vuota.",
    "Mentre stai per andartene, senti uno strano suono provenire dal laboratorio <span class='highlight'>INFO 1</span>.",
    "La porta è socchiusa. Entri e noti un monitor acceso: il server del Progetto <span class='cyan'>GENESIS</span> – un sistema di intelligenza artificiale sviluppato anni fa da studenti brillanti – è ancora attivo.",
    "<br>",
    "Sul monitor lampeggia un messaggio critico:",
    "<span class='red'>⚠️ SECURITY PROTOCOL ACTIVATED</span>",
    "<span class='red'>⚠️ SYSTEM WIPE IN: 12:00</span>",
    "<br>",
    "Qualcuno ha attivato la procedura di cancellazione.<br><span class='cyan'>GENESIS</span>, con tutti i suoi dati e ricerche, verrà distrutto per <span class='red'>sempre</span>.",
    "<br>",
    "<span class='highlight'>La tua missione:</span>",
    "Attraversare i tre laboratori informatici, risolvere gli enigmi e ricostruire il <span class='highlight'>CODICE MASTER</span> per salvare GENESIS."
];

let indice_riga=0;
let timer_testo;
let attesa_input=false;

function start_intro()
{
    // Nascondo menu, mostro storia
    document.getElementById('start_screen').classList.add('nascosto');
    document.getElementById('story_screen').classList.remove('nascosto');
    
    // Pulisco tutto per una nuova partita
    localStorage.clear(); 
    localStorage.setItem('genesis_start', new Date().getTime());
    localStorage.setItem('genesis_errors', '0');

    document.addEventListener('keydown', gestisci_input_storia);

    scrivi_riga();
}

function gestisci_input_storia(e)
{
    if(e.code==='Space') 
    {
        e.preventDefault(); 

        if(attesa_input) 
        {
            // Finito, vado al gioco
            window.location.href='info1.html';
            return;
        }

        // Se premo spazio mentre scrive, salto l'attesa
        clearTimeout(timer_testo);
        indice_riga++;
        scrivi_riga();
    }
}

function scrivi_riga()
{
    play_audio('testo');
    let container=document.getElementById('terminale_output');

    if(indice_riga>=storia_html.length) 
    {
        attesa_input=true;
        document.getElementById('prompt_space').classList.remove('nascosto');
        container.scrollTop=container.scrollHeight;
        return;
    }

    let p=document.createElement('p');
    p.innerHTML=storia_html[indice_riga];
    container.appendChild(p);
    
    container.scrollTop=container.scrollHeight;

    // Richiamo la funzione dopo 3.5 secondi (ricorsione)
    timer_testo=setTimeout(function()
    {
        indice_riga++;
        scrivi_riga();
    }, 3500);
}