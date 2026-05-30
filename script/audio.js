/* File: script/audio.js */

/*
    Gestione Audio centralizzata.
    Ho creato un oggetto che contiene tutti i percorsi dei file e i volumi,
    così se devo cambiare un suono lo faccio solo qui e non in giro per i file.
*/
const LIBRERIA_AUDIO=
{
    // Sottofondi
    'home': { src: 'sound/home.mp3', vol: 0.3 },
    'info1': { src: 'sound/info1.mp3', vol: 0.2 },
    'info2': { src: 'sound/info2.mp3', vol: 0.2 },
    'info3': { src: 'sound/info3.mp3', vol: 0.2 },
    
    // Effetti UI
    'tap': { src: 'sound/tap.mp3', vol: 0.5 },
    'tasto': { src: 'sound/tasto.mp3', vol: 0.6 },
    'carta': { src: 'sound/carta.mp3', vol: 0.5 },
    'cassetto': { src: 'sound/cassetto.mp3', vol: 0.6 },
    'suono_armadietto': { src: 'sound/suono_armadietto.mp3', vol: 0.6 },
    'testo': { src: 'sound/testo.mp3', vol: 0.4 },
    
    // Feedback Gioco
    'corretto': { src: 'sound/corretto.mp3', vol: 0.8 },
    'errore': { src: 'sound/errore.mp3', vol: 0.7 },
    'errore_codice': { src: 'sound/errore_codice.mp3', vol: 0.8 },
    'inventario': { src: 'sound/inventario.mp3', vol: 0.8 },
    'sbloccato': { src: 'sound/sbloccato.mp3', vol: 0.9 },
    'stanza_sbloccata': { src: 'sound/stanza_sbloccata.mp3', vol: 1.0 },
    'porta_disponibile': { src: 'sound/porta_disponibile.mp3', vol: 0.8 },
    'passaggio_stanze': { src: 'sound/passaggio_stanze.mp3', vol: 0.9 },
    'item_trovato': { src: 'sound/item_trovato.mp3', vol: 0.8 },
    
    // Eventi Speciali
    'perdita': { src: 'sound/perdita.mp3', vol: 1.0 },
    'vincita': { src: 'sound/vincita.mp3', vol: 1.0 },
    'ultimi10sec': { src: 'sound/ultimi10sec.mp3', vol: 0.7 },
    
    // Note Simon
    'do': { src: 'sound/do.mp3', vol: 0.8 },
    're': { src: 'sound/re.mp3', vol: 0.8 },
    'mi': { src: 'sound/mi.mp3', vol: 0.8 },
    'fa': { src: 'sound/fa.mp3', vol: 0.8 }
};

let musica_corrente=null; 
let audio_tensione=null; 

/* Funzione generica per suonare un effetto sonoro */
function play_audio(chiave)
{
    let dati_suono=LIBRERIA_AUDIO[chiave];
    if(!dati_suono) return; // Se il suono non esiste, esco

    let audio=new Audio(dati_suono.src);
    audio.volume=dati_suono.vol;
    
    // Il catch serve perché i browser bloccano l'audio se l'utente non ha ancora cliccato
    audio.play().catch(function(e){ console.log("Audio bloccato dal browser"); });
    
    return audio; 
}

/* Gestione della musica di sottofondo con dissolvenza in entrata */
function start_bgm(chiave)
{
    if(musica_corrente) 
    {
        // Se sta suonando la stessa canzone, non la riavvio
        if(musica_corrente.chiave===chiave) return; 
        musica_corrente.audio.pause();
    }

    let dati=LIBRERIA_AUDIO[chiave];
    let audio=new Audio(dati.src);
    audio.volume=0; // Parto da muto per il fade-in
    audio.loop=true;
    
    audio.play().then(function()
    {
        // Alzo il volume piano piano
        let vol=0;
        let fade_in=setInterval(function()
        {
            if(vol<dati.vol) 
            {
                vol+=0.01;
                // Controllo per non superare il volume massimo
                if(vol>dati.vol) vol=dati.vol;
                audio.volume=vol;
            } 
            else 
            {
                clearInterval(fade_in);
            }
        }, 50);
    }).catch(function(e){});

    musica_corrente={ chiave: chiave, audio: audio };
}

/* Dissolvenza in uscita quando cambio pagina */
function fade_out_bgm_and_change(url)
{
    play_audio('passaggio_stanze'); 

    if(musica_corrente && musica_corrente.audio) 
    {
        let vol=musica_corrente.audio.volume;
        let fade_out=setInterval(function()
        {
            if(vol>0) 
            {
                vol-=0.02;
                if(vol<0) vol=0;
                musica_corrente.audio.volume=vol;
            } 
            else 
            {
                clearInterval(fade_out);
                musica_corrente.audio.pause();
                window.location.href=url; // Cambio pagina solo alla fine
            }
        }, 30); 
    } 
    else 
    {
        window.location.href=url;
    }
}

/* Rilevo la pagina corrente per far partire la musica giusta */
document.addEventListener("DOMContentLoaded", function()
{
    let path=window.location.pathname;
    
    if(path.includes('index.html')||path.endsWith('/')) start_bgm('home');
    else if(path.includes('info1.html')) start_bgm('info1');
    else if(path.includes('info2.html')) start_bgm('info2');
    else if(path.includes('info3.html')) start_bgm('info3');

    // Aggiungo il suono "tap" a tutti i bottoni e gli oggetti cliccabili
    document.addEventListener('click', function(e)
    {
        let target=e.target;
        // Controllo se ho cliccato un bottone o un hotspot generico
        if((target.tagName==='BUTTON'||target.classList.contains('hotspot')||target.classList.contains('btn_action')) 
           && !target.classList.contains('key_btn') // Escludo tastierini (hanno suoni propri)
           && !target.classList.contains('simon_btn')) 
        {
            play_audio('tap');
        }
    });
});