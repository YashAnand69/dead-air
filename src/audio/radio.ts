/** Original synthesized receiver texture. No recordings or third-party assets. */
export class RadioAudio {
 private context:AudioContext|null=null;private gain:GainNode|null=null;private source:AudioBufferSourceNode|null=null;
 async start(volume=.08){this.stop();const context=new AudioContext();this.context=context;await context.resume();if(this.context!==context){await context.close();return;}const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.25;const source=context.createBufferSource();source.buffer=buffer;source.loop=true;const filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=850;filter.Q.value=.7;const gain=context.createGain();gain.gain.value=volume;source.connect(filter).connect(gain).connect(context.destination);source.start();this.source=source;this.gain=gain;}
 setVolume(value:number){if(this.context&&this.gain)this.gain.gain.setTargetAtTime(Math.min(.2,Math.max(0,value)),this.context.currentTime,.1);}
 stop(){this.source?.stop();this.source=null;void this.context?.close();this.context=null;this.gain=null;}
}
