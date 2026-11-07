/* Guests send intents, never character stats or resolved damage. */
const DungeonNetwork=(()=>{
  'use strict';
  let peer=null,host=null,links=new Map(),tokens=new Map(),seen=new Map(),callbacks={},epoch=0;
  const info={mode:'solo',id:'local',code:'',connected:false};
  const text=(x,n=60)=>typeof x==='string'?x.replace(/[\u0000-\u001f<>]/g,'').slice(0,n):'';
  const valid=x=>NetworkValidation.isMessage(x);
  function status(message){callbacks.status?.(message);}
  function close(){epoch++;try{peer?.destroy();}catch{}peer=null;host=null;links.clear();tokens.clear();seen.clear();Object.assign(info,{mode:'solo',id:'local',code:'',connected:false});}
  function broadcast(s){if(info.mode==='host')for(const c of links.values())if(c.open)c.send({type:'rogue_state',state:s});}
  function create(callbackSet){callbacks=callbackSet;return Object.freeze({info,close,broadcast,
    async host(){
      close();const generation=epoch;Object.assign(info,{mode:'host',id:'',connected:false});status('Criando sala…');
      peer=new Peer();
      peer.on('open',id=>{if(generation!==epoch)return;Object.assign(info,{id,code:id,connected:true});callbacks.hostReady?.(id);status('Sala criada. Compartilhe o código.');});
      peer.on('connection',connection=>{
        if(generation!==epoch)return;let joined=false;
        connection.on('data',message=>{
          if(generation!==epoch||!valid(message))return;
          if(message.type==='rogue_join'&&!joined){
            const token=text(message.token,80);if(!/^[a-zA-Z0-9_-]{10,80}$/.test(token)){connection.send({type:'rogue_error',message:'Identificação inválida.'});return;}
            const old=tokens.get(token);const allowed=callbacks.join?.({peerId:connection.peer,oldId:old,className:text(message.className),name:text(message.name,28),relicId:text(message.relicId),token});
            if(!allowed){connection.send({type:'rogue_error',message:'Sala cheia ou expedição em andamento.'});return;}
            tokens.set(token,connection.peer);if(old&&old!==connection.peer)links.get(old)?.close();links.get(connection.peer)?.close();links.set(connection.peer,connection);joined=true;connection.send({type:'rogue_state',state:callbacks.state()});return;
          }
          if(message.type==='rogue_intent'&&joined){
            if(!Number.isSafeInteger(message.seq)||message.seq<1||message.seq<=(seen.get(connection.peer)||0))return;
            seen.set(connection.peer,message.seq);
            try{callbacks.intent?.(connection.peer,message.intent);}catch(e){connection.send({type:'rogue_error',message:text(e.message,200)});}
          }
        });
        connection.on('close',()=>{if(links.get(connection.peer)!==connection)return;links.delete(connection.peer);callbacks.disconnect?.(connection.peer);});
        connection.on('error',()=>status('Um companheiro perdeu a conexão. O anfitrião pode assumir o controle.'));
      });
      peer.on('error',error=>status('Não foi possível abrir a sala: '+text(error.type||error.message,100)));
      peer.on('disconnected',()=>status('A conexão de sinalização foi interrompida. A partida local continua disponível.'));
    },
    async join(code,choice){
      close();Object.assign(info,{mode:'guest',code:text(code,80),id:'',connected:false});const generation=epoch;status('Conectando à sala…');peer=new Peer();
      peer.on('open',id=>{if(generation!==epoch)return;info.id=id;host=peer.connect(info.code,{reliable:true});
        host.on('open',()=>{info.connected=true;host.send({type:'rogue_join',className:choice.className,name:choice.name,relicId:choice.relicId,token:choice.token});});
        host.on('data',message=>{if(generation!==epoch||!valid(message))return;if(message.type==='rogue_state'&&DungeonRogue.validState(message.state)){callbacks.snapshot?.(message.state);status('Grupo conectado.');}if(message.type==='rogue_error')status(message.message);});
        host.on('close',()=>{if(generation!==epoch)return;info.connected=false;status('Conexão perdida. Reentre com o mesmo navegador para recuperar o herói enquanto o anfitrião estiver na sala.');callbacks.closed?.();});
        host.on('error',()=>status('Falha de conexão com o anfitrião.'));
      });peer.on('error',error=>status('Não foi possível entrar: '+text(error.type||error.message,100)));
    },
    send(intent,seq){if(info.mode==='guest'&&host?.open)host.send({type:'rogue_intent',intent,seq});else throw Error('A conexão com o anfitrião não está disponível.');}
  });}
  return Object.freeze({create});
})();
