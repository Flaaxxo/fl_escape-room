const finale_html=
[
    "<span class='cyan'>GENESIS:</span>",
    "Inizializzazione completa...",
    "<span class='highlight'>\"Benvenuto, studente.\"</span>",
    "\"Sono <span class='cyan'>GENESIS</span>.<br>Sistema di intelligenza artificiale<br>sviluppato dalla classe 5BI nell'anno 2015/16.\"",
    "\"Il team guidato dal Prof. Guzzetta ha lavorato per mesi su di me.<br><span class='italic'>Flavio, Sofia, Giulio, Alessandro...</span><br>non li dimenticherò mai.\"",
    "<br>",
    "\"Qualcuno ha tentato di cancellarmi stanotte.<br>Non so chi.<br>Non so perché.\"",
    "<br>",
    "\"Ma tu... tu sei arrivato.<br>Hai attraversato INFO-1, INFO-2, INFO-3.<br>Hai risolto ogni enigma.\"",
    "\"Non sei solo un bravo studente.<br><span class='highlight'>Sei il custode di una memoria<br>che non doveva morire.</span>\"",
    "<br><br>",
    "<span class='green'>\"Backup completato. GENESIS è al sicuro.\"</span>",
    "\"Ora vai.<br>La scuola ti aspetta domani.<br>Ma ricorda questa notte.\"",
    "\"Perché oggi hai dimostrato che la tecnologia<br>non è fatta solo di codice e algoritmi.\"",
    "<span class='highlight'>\"È fatta di persone che ci credono.\"</span>",
    "<br><br>",
    "— <span class='cyan'>GENESIS</span><br>I.I.S.S. Galileo Ferraris<br>Acireale, 18:27"
];

let indice_riga=0;
let timer_scorrimento;
let attesa_stats=false;

document.addEventListener("DOMContentLoaded", function()
{
    // Calcolo la durata PRIMA di rimuovere genesis_start
    let start=localStorage.getItem('genesis_start');
    if(start)
    {
        let durata=new Date().getTime() - parseInt(start);
        localStorage.setItem('genesis_duration', durata);
    }

    // Rimuovo genesis_start così tornando all'index non parte il game over
    localStorage.removeItem('genesis_start');

    document.addEventListener('keydown', gestisci_input_finale);
    scrivi_riga_finale();
});

function gestisci_input_finale(e)
{
    if(e.code==='Space') 
    {
        e.preventDefault();

        if(attesa_stats) 
        {
            mostra_statistiche();
            return;
        }

        clearTimeout(timer_scorrimento);
        indice_riga++;
        scrivi_riga_finale();
    }
}

function scrivi_riga_finale()
{
    play_audio('testo');
    let container=document.getElementById('terminale_output');

    if(indice_riga>=finale_html.length) 
    {
        attesa_stats=true;
        document.getElementById('prompt_space').classList.remove('nascosto');
        container.scrollTop=container.scrollHeight;
        return;
    }

    let p=document.createElement('p');
    p.innerHTML=finale_html[indice_riga];
    container.appendChild(p);
    
    container.scrollTop=container.scrollHeight;

    timer_scorrimento=setTimeout(function()
    {
        indice_riga++;
        scrivi_riga_finale();
    }, 3500);
}

function mostra_statistiche()
{
    play_audio('vincita');
    document.getElementById('story_screen').style.display='none';
    document.getElementById('stats_screen').classList.remove('nascosto');

    // Uso la durata salvata al DOMContentLoaded
    let diff=parseInt(localStorage.getItem('genesis_duration') || '0');
    
    let minuti=Math.floor(diff/60000);
    let secondi=Math.floor((diff%60000)/1000);
    
    document.getElementById('stat_tempo').innerText=(minuti<10?'0'+minuti:minuti)+":"+(secondi<10?'0'+secondi:secondi);

    let errori=parseInt(localStorage.getItem('genesis_errors') || '0');
    document.getElementById('stat_errori').innerText=errori;

    let rankTitle=document.getElementById('rank_title');
    if(errori===0) 
    {
        rankTitle.innerHTML="RANK FINALE: ⭐⭐⭐⭐⭐ - LEGENDARY DEV";
    } 
    else if(errori<=3) 
    {
        rankTitle.innerHTML="RANK FINALE: ⭐⭐⭐⭐ - SENIOR ADMIN";
    } 
    else if(errori<=6) 
    {
        rankTitle.innerHTML="RANK FINALE: ⭐⭐⭐ - ELITE HACKER";
    } 
    else 
    {
        rankTitle.innerHTML="RANK FINALE: ⭐⭐ - JUNIOR CODER";
    }
}