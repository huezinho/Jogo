/* Guests send intents, never character stats or resolved damage. */
const DungeonNetwork=(()=>{
  'use strict';
  let peer=null,host=null,joinChoice=null,links=new Map(),tokens=new Map(),seen=new Map(),callbacks={},epoch=0;
  const waiting=new Set();
  const info={mode:'solo',id:'local',code:'',connected:false};
  const text=(x,n=60)=>typeof x==='string'?x.replace(/[\u0000-\u001f<>]/g,'').slice(0,n):'';
  const valid=x=>NetworkValidation.isMessage(x);
  function status(message){callbacks.status?.(message);}
  function close(){epoch++;try{peer?.destroy();}catch{}peer=null;host=null;joinChoice=null;links.clear();tokens.clear();seen.clear();waiting.clear();Object.assign(info,{mode:'solo',id:'local',code:'',connected:false});}
  function broadcast(s){
    if(info.mode!=='host')return;
    for(const c of links.values())if(c.open)c.send({type:'rogue_state',state:s});
    if(s.resuming)for(const c of waiting)if(c.open)c.send({type:'rogue_roster',state:s});
  }
  function requestJoin(heroId=''){
    if(!host?.open||!joinChoice)throw Error('A conexão com o anfitrião não está disponível.');
    host.send({type:'rogue_join',className:joinChoice.className,name:joinChoice.name,relicId:joinChoice.relicId,token:joinChoice.token,heroId});
  }
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
            const old=tokens.get(token);const allowed=callbacks.join?.({peerId:connection.peer,oldId:old,className:text(message.className),name:text(message.name,28),relicId:text(message.relicId),heroId:text(message.heroId,80),token});
            if(!allowed){
              const state=callbacks.state();
              if(state.resuming){waiting.add(connection);connection.send({type:'rogue_roster',state});}
              else connection.send({type:'rogue_error',message:'Sala cheia ou expedição em andamento.'});
              return;
            }
            waiting.delete(connection);tokens.set(token,connection.peer);if(old&&old!==connection.peer)links.get(old)?.close();links.get(connection.peer)?.close();links.set(connection.peer,connection);joined=true;connection.send({type:'rogue_state',state:callbacks.state()});return;
          }
          if(message.type==='rogue_intent'&&joined){
            if(!Number.isSafeInteger(message.seq)||message.seq<1||message.seq<=(seen.get(connection.peer)||0))return;
            seen.set(connection.peer,message.seq);
            try{callbacks.intent?.(connection.peer,message.intent);}catch(e){connection.send({type:'rogue_error',message:text(e.message,200)});}
          }
        });
        connection.on('close',()=>{
          waiting.delete(connection);
          if(generation!==epoch||links.get(connection.peer)!==connection)return;
          links.delete(connection.peer);callbacks.disconnect?.(connection.peer);
        });
        connection.on('error',()=>{if(generation===epoch)status('Um companheiro perdeu a conexão.');});
      });
      peer.on('error',error=>{if(generation===epoch)status('Não foi possível abrir a sala: '+text(error.type||error.message,100));});
      peer.on('disconnected',()=>{if(generation===epoch)status('A conexão de sinalização foi interrompida.');});
    },
    async join(code,choice){
      close();joinChoice=choice;Object.assign(info,{mode:'guest',code:text(code,80),id:'',connected:false});const generation=epoch;status('Conectando à sala…');peer=new Peer();
      peer.on('open',id=>{if(generation!==epoch)return;info.id=id;host=peer.connect(info.code,{reliable:true});
        host.on('open',()=>{if(generation===epoch)requestJoin();});
        host.on('data',message=>{
          if(generation!==epoch||!valid(message))return;
          if(message.type==='rogue_state'&&DungeonRogue.validState(message.state)){
            const joined=info.connected;info.connected=true;callbacks.snapshot?.(message.state);if(!joined)status('Grupo conectado.');
          }
          if(message.type==='rogue_roster'&&message.state?.resuming&&message.state.phase==='lobby'&&DungeonRogue.validState(message.state)){
            callbacks.snapshot?.(message.state);status('Escolha um aventureiro disponível para entrar.');
          }
          if(message.type==='rogue_error')status(message.message);
        });
        host.on('close',()=>{if(generation!==epoch)return;info.connected=false;status('Conexão perdida. Reentre com o mesmo navegador para recuperar o herói enquanto o anfitrião estiver na sala.');callbacks.closed?.();});
        host.on('error',()=>{if(generation===epoch)status('Falha de conexão com o anfitrião.');});
      });peer.on('error',error=>{if(generation===epoch)status('Não foi possível entrar: '+text(error.type||error.message,100));});
    },
    claimHero(heroId){requestJoin(heroId);},
    send(intent,seq){if(info.mode==='guest'&&host?.open)host.send({type:'rogue_intent',intent,seq});else throw Error('A conexão com o anfitrião não está disponível.');}
  });}
  return Object.freeze({create});
})();
