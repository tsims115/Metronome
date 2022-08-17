/*!
* Start Bootstrap - One Page Wonder v6.0.5 (https://startbootstrap.com/theme/one-page-wonder)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-one-page-wonder/blob/master/LICENSE)
*/

class Metronome
{
    constructor(tempo = 120)
    {
        this.audioContext = null;
        this.notesInQueue = [];         // notes that have been put into the web audio and may or may not have been played yet {note, time}
        this.currentBeatInBar = 0;
        this.beatsPerBar = 4;
        this.tempo = tempo;
        this.lookahead = 25;          // How frequently to call scheduling function (in milliseconds)
        this.scheduleAheadTime = 0.1;   // How far ahead to schedule audio (sec)
        this.nextNoteTime = 0.0;     // when the next note is due
        this.isRunning = false;
        this.intervalID = null;
        this.leadNote = 50;
        this.baseNote = 50;
    }

    nextNote()
    {
        // Advance current note and time by a quarter note (crotchet if you're posh)
        var secondsPerBeat = 60.0 / this.tempo; // Notice this picks up the CURRENT tempo value to calculate beat length.
        this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time
    
        this.currentBeatInBar++;    // Advance the beat number, wrap to zero
        if (this.currentBeatInBar == this.beatsPerBar) {
            this.currentBeatInBar = 0;
        }
    }

    scheduleNote(beatNumber, time)
    {
        // push the note on the queue, even if we're not playing.
        this.notesInQueue.push({ note: beatNumber, time: time });
    
        // create an oscillator
        const osc = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();
        
        osc.frequency.value = (beatNumber % this.beatsPerBar == 0) ? this.leadNote : this.baseNote;
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

        osc.connect(envelope);
        envelope.connect(this.audioContext.destination);
    
        osc.start(time);
        osc.stop(time + 0.03);
    }

    scheduler()
    {
        // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime ) {
            this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
            this.nextNote();
        }
    }

    start()
    {
        if (this.isRunning) return;

        if (this.audioContext == null)
        {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        this.isRunning = true;

        this.currentBeatInBar = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.05;

        this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
    }

    stop()
    {
        this.isRunning = false;

        clearInterval(this.intervalID);
    }

    startStop()
    {
        if (this.isRunning) {
            this.stop();
        }
        else {
            this.start();
        }
    }
}

let M = new Metronome($('.bpm-slider').val());

function start_or_stop() {
    M.tempo = $('.bpm-slider').val();
    M.startStop();
    button = document.getElementsByClassName('button-start')[0];
    button.classList.toggle('button-stop');
    if (M.isRunning) {
        button.style.backgroundColor = '#66ff33';
    } else {
        button.style.backgroundColor = '#189ff2';
    }
}

function display_bpm() {
    let bpm = $('.bpm-slider').val();
    $('.bpmd').html(bpm);
    $('.bpm-slider').on('input', function() {
        bpm = $('.bpm-slider').val();
        $('.bpmd').html(bpm);
      });
      $('.bpm-slider').on('change', function() {
        bpm = $('.bpm-slider').val();
        M.tempo = bpm;
        document.cookie = `bpm=${M.tempo}`;
      });
    $('.plus-button').on('click', function() {
        $('.bpm-slider').val(parseInt(bpm) + 1);
        bpm = $('.bpm-slider').val()
        M.tempo = bpm;
        $('.bpmd').html(bpm);
        });
    $('.minus-button').on('click', function() {
        $('.bpm-slider').val(parseInt(bpm) - 1);
        bpm = $('.bpm-slider').val()
        M.tempo = bpm;
        $('.bpmd').html(bpm);
        });
    
}

function check_and_set_cookies(name) {
    let cookieArr = document.cookie.split(";");
    let cookiePair;
    for(let i = 0; i < cookieArr.length; i++) {
        cookiePair = cookieArr[i].split("=");
        cookiePair[0] = cookiePair[0].split(' ').join("");
        console.log(cookiePair[0]);
        if(name == cookiePair[0]) {
            $(`.${name}-slider`).val(parseInt(cookiePair[1]));
            if (name === 'lead') {
                M.leadNote = cookiePair[1];
            } else if (name === 'base') {
                M.baseNote = cookiePair[1];
            }
        }
    }
}

function frequency() {
    $('.lead-slider').on('change', () => {
        M.leadNote = $('.lead-slider').val();
        document.cookie = `lead=${M.leadNote}`;
    });
    $('.base-slider').on('change', () => {
        M.baseNote = $('.base-slider').val();
        document.cookie = `base=${M.baseNote}`;
    });
}

function beatsPerBar() {
    $('.beats-per-bar').on('input', () => {
        M.beatsPerBar = $('.beats-per-bar').val();
    })
}

check_and_set_cookies('bpm');
check_and_set_cookies('lead');
check_and_set_cookies('base');
frequency();
beatsPerBar();
display_bpm();
